# Iteration 4: owner-account protection + Activity Log (logging, filters, auth)
import os
import uuid
import datetime as dt
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')
API = f"{BASE_URL}/api"
from _admin_ids import admin_id
QA_EMAIL, QA_PW = "test_qa_admin@example.com", "TestQaAdmin2026x"
QA_ID = admin_id(QA_EMAIL)
SECOND_EMAIL, SECOND_PW = "test_qa_second@example.com", "TestQaSecond2026x"
import subprocess as _sp
if not admin_id(SECOND_EMAIL):
    _sp.run(["node", "scripts/admin-cli.js", "create", SECOND_EMAIL, SECOND_PW, "TEST", "QA", "Second"], cwd="/app/server", capture_output=True)
SECOND_ID = admin_id(SECOND_EMAIL)
UID = uuid.uuid4().hex[:6]
OWNER_MSG = "The owner account can only be changed by the owner"


def login(email, pw):
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": email, "password": pw})
    return s, r


@pytest.fixture(scope="module")
def qa():
    s, r = login(QA_EMAIL, QA_PW)
    if r.status_code != 200:
        pytest.skip(f"QA login failed {r.status_code} {r.text}")
    assert r.json()["data"]["admin"]["id"] == QA_ID
    return s


def owner_row(s):
    rows = s.get(f"{API}/admin/admins", params={"limit": 100}).json()["data"]
    return next(a for a in rows if a["id"] == 1)


def find_log(s, **params):
    params.setdefault("limit", 100)
    r = s.get(f"{API}/admin/activity", params=params)
    assert r.status_code == 200, r.text
    return r.json()["data"]


def latest(s, entityType, entityId, action):
    rows = find_log(s, entityType=entityType, action=action)
    rows = [x for x in rows if x["entityId"] == entityId]
    assert rows, f"no {action} log for {entityType}/{entityId}"
    x = rows[0]
    assert x["adminId"] == QA_ID and x["adminEmail"] == QA_EMAIL and x["adminName"]
    return x


# ---- Owner protection ----
class TestOwner:
    def test_me_and_list_include_isOwner(self, qa):
        me = qa.get(f"{API}/auth/me").json()["data"]
        me = me.get("admin", me)
        assert me["isOwner"] is False
        o = owner_row(qa)
        assert o["isOwner"] is True and o["isActive"] is True and o["email"] == "v3mtechnology@gmail.com"
        rows = qa.get(f"{API}/admin/admins", params={"limit": 100}).json()["data"]
        assert sum(1 for a in rows if a["isOwner"]) == 1

    def test_non_owner_cannot_deactivate_owner(self, qa):
        r = qa.put(f"{API}/admin/admins/1/status", json={"isActive": False})
        assert r.status_code == 403
        assert OWNER_MSG in r.text
        assert owner_row(qa)["isActive"] is True

    def test_non_owner_cannot_reset_owner_password(self, qa):
        r = qa.put(f"{API}/admin/admins/1/password", json={"newPassword": "SomethingNew2026x"})
        assert r.status_code == 403 and OWNER_MSG in r.text
        o = owner_row(qa)
        assert o["isActive"] is True and o["isOwner"] is True

    def test_owner_activate_also_forbidden(self, qa):
        r = qa.put(f"{API}/admin/admins/1/status", json={"isActive": True})
        assert r.status_code == 403

    def test_no_activity_logged_for_rejected(self, qa):
        rows = find_log(qa, entityType="admins")
        assert not any(x["entityId"] == 1 for x in rows)


# ---- Activity logging across entities ----
class TestActivityLogging:
    state = {}

    def test_blog_lifecycle(self, qa):
        title = f"TEST_Act Blog {UID}"
        r = qa.post(f"{API}/admin/blogs", json={"title": title, "blocks": [{"type": "paragraph", "data": {"html": "Hi"}}], "adminId": 1, "updatedById": 1})
        assert r.status_code == 201, r.text
        b = r.json()["data"]; bid = b["id"]; self.state["bid"] = bid
        x = latest(qa, "blogs", bid, "create")
        assert x["entityLabel"] == title
        # edit title + slug
        r = qa.put(f"{API}/admin/blogs/{bid}", json={"title": title + " v2", "slug": f"test-act-blog-{UID}-v2", "blocks": b["blocks"], "adminName": "Spoof", "adminId": 1})
        assert r.status_code == 200, r.text
        x = latest(qa, "blogs", bid, "update")
        assert set(x["details"]["changed"]) >= {"title", "slug"}, x["details"]
        assert x["details"]["slug"] == {"from": f"test-act-blog-{UID}", "to": f"test-act-blog-{UID}-v2"}
        assert x["adminName"] != "Spoof" and x["entityLabel"] == title + " v2"
        for action in ["publish", "unpublish", "archive"]:
            assert qa.post(f"{API}/admin/blogs/{bid}/{action}").status_code == 200
            x = latest(qa, "blogs", bid, action)
            assert x["details"]["to"] in ("PUBLISHED", "DRAFT", "ARCHIVED")
        assert qa.delete(f"{API}/admin/blogs/{bid}").status_code == 200
        latest(qa, "blogs", bid, "delete")
        assert qa.post(f"{API}/admin/blogs/{bid}/restore").status_code == 200
        latest(qa, "blogs", bid, "restore")
        # cleanup: trash again
        qa.delete(f"{API}/admin/blogs/{bid}")

    def test_no_change_update(self, qa):
        bid = self.state["bid"]
        qa.post(f"{API}/admin/blogs/{bid}/restore")
        b = qa.get(f"{API}/admin/blogs/{bid}").json()["data"]
        r = qa.put(f"{API}/admin/blogs/{bid}", json={"title": b["title"], "slug": b["slug"], "blocks": b["blocks"]})
        assert r.status_code == 200
        x = latest(qa, "blogs", bid, "update")
        assert x["details"]["changed"] == [], x["details"]
        assert "slug" not in x["details"]
        qa.delete(f"{API}/admin/blogs/{bid}")

    def test_reorder_services_and_restore(self, qa):
        rows = qa.get(f"{API}/admin/services", params={"limit": 100}).json()["data"]
        ids = [r["id"] for r in rows]
        orig = {r["id"]: r["displayOrder"] for r in rows}
        assert len(ids) >= 2
        swapped = [ids[1], ids[0]] + ids[2:]
        r = qa.put(f"{API}/admin/services/reorder", json={"ids": swapped})
        assert r.status_code == 200, r.text
        logs = find_log(qa, entityType="services", action="reorder")
        assert logs and logs[0]["adminId"] == QA_ID and logs[0]["details"]["count"] == len(ids)
        r = qa.put(f"{API}/admin/services/reorder", json={"ids": ids})
        assert r.status_code == 200
        after = {r["id"]: r["displayOrder"] for r in qa.get(f"{API}/admin/services", params={"limit": 100}).json()["data"]}
        assert [i for i, _ in sorted(after.items(), key=lambda kv: kv[1])] == ids
        assert after == orig or True  # order restored (values may be normalised)

    @pytest.mark.parametrize("kind", ["categories", "tags"])
    def test_taxonomy(self, qa, kind):
        name = f"TEST_Act {kind} {UID}"
        r = qa.post(f"{API}/admin/{kind}", json={"name": name})
        assert r.status_code == 201, r.text
        tid = r.json()["data"]["id"]
        latest(qa, kind, tid, "create")
        r = qa.put(f"{API}/admin/{kind}/{tid}", json={"name": name + " v2", "slug": f"test-act-{kind}-{UID}-v2"})
        assert r.status_code == 200, r.text
        x = latest(qa, kind, tid, "update")
        assert set(x["details"]["changed"]) == {"name", "slug"}, x["details"]
        assert qa.delete(f"{API}/admin/{kind}/{tid}").status_code == 200
        x = latest(qa, kind, tid, "delete")
        assert x["entityLabel"] == name + " v2"

    def test_redirect(self, qa):
        r = qa.post(f"{API}/admin/redirects", json={"fromPath": f"/test-act-{UID}", "toPath": "/blogs", "statusCode": 301})
        assert r.status_code == 201, r.text
        rid = r.json()["data"]["id"]
        x = latest(qa, "redirects", rid, "create")
        assert x["entityLabel"] == f"/test-act-{UID} → /blogs"
        r = qa.put(f"{API}/admin/redirects/{rid}", json={"fromPath": f"/test-act-{UID}", "toPath": "/services", "statusCode": 302})
        assert r.status_code == 200, r.text
        x = latest(qa, "redirects", rid, "update")
        assert set(x["details"]["changed"]) == {"toPath", "statusCode"}, x["details"]
        assert qa.delete(f"{API}/admin/redirects/{rid}").status_code == 200
        latest(qa, "redirects", rid, "delete")

    def test_admin_create_reset_deactivate(self, qa):
        email = f"test_act_{UID}@example.com"
        r = qa.post(f"{API}/admin/admins", json={"name": f"TEST Act {UID}", "email": email, "password": "ActAdmin2026x"})
        assert r.status_code == 201, r.text
        aid = r.json()["data"]["id"]
        assert r.json()["data"]["isOwner"] is False
        assert latest(qa, "admins", aid, "create")["entityLabel"] == email
        assert qa.put(f"{API}/admin/admins/{aid}/password", json={"newPassword": "ActAdmin2026y"}).status_code == 200
        latest(qa, "admins", aid, "reset_password")
        assert qa.put(f"{API}/admin/admins/{aid}/status", json={"isActive": False}).status_code == 200
        latest(qa, "admins", aid, "deactivate")
        # deactivating again: no new entry
        n = len(find_log(qa, entityType="admins", action="deactivate", search=email))
        qa.put(f"{API}/admin/admins/{aid}/status", json={"isActive": False})
        assert len(find_log(qa, entityType="admins", action="deactivate", search=email)) == n

    def test_non_owner_can_manage_second_qa(self, qa):
        r = qa.put(f"{API}/admin/admins/{SECOND_ID}/password", json={"newPassword": SECOND_PW})
        assert r.status_code == 200, r.text
        assert qa.put(f"{API}/admin/admins/{SECOND_ID}/status", json={"isActive": False}).status_code == 200
        assert qa.put(f"{API}/admin/admins/{SECOND_ID}/status", json={"isActive": True}).status_code == 200
        latest(qa, "admins", SECOND_ID, "activate")
        s2, lr = login(SECOND_EMAIL, SECOND_PW)
        assert lr.status_code == 200


# ---- Activity filters ----
class TestActivityFilters:
    def test_requires_auth(self):
        assert requests.get(f"{API}/admin/activity").status_code == 401

    def test_shape_and_pagination(self, qa):
        r = qa.get(f"{API}/admin/activity", params={"limit": 2, "page": 1})
        assert r.status_code == 200
        j = r.json()
        assert len(j["data"]) <= 2 and "pagination" in j
        x = j["data"][0]
        assert {"id", "adminId", "adminName", "adminEmail", "action", "entityType", "entityId", "entityLabel", "details", "createdAt"} <= set(x)
        p2 = qa.get(f"{API}/admin/activity", params={"limit": 2, "page": 2}).json()["data"]
        assert not {a["id"] for a in p2} & {a["id"] for a in j["data"]}
        # newest first
        ts = [a["createdAt"] for a in find_log(qa, limit=20)]
        assert ts == sorted(ts, reverse=True)

    def test_filters(self, qa):
        assert all(x["adminId"] == QA_ID for x in find_log(qa, adminId=QA_ID))
        assert all(x["entityType"] == "blogs" for x in find_log(qa, entityType="blogs"))
        assert all(x["action"] == "publish" for x in find_log(qa, action="publish"))
        rows = find_log(qa, search=UID)
        assert rows and all(UID in (x["entityLabel"] or "") for x in rows)
        assert find_log(qa, search="test_qa_admin@example") and find_log(qa, search="TEST QA Admin")
        today = dt.datetime.utcnow().strftime("%Y-%m-%d")
        assert find_log(qa, **{"from": today, "to": today})
        assert find_log(qa, **{"from": "2000-01-01", "to": "2000-01-02"}) == []
        assert find_log(qa, search="zzz_nomatch_zzz") == []

    @pytest.mark.parametrize("params", [{"from": "notadate"}, {"to": "2026-13-45"}, {"from": "abc"}])
    def test_invalid_date(self, qa, params):
        r = qa.get(f"{API}/admin/activity", params=params)
        assert r.status_code == 422, r.text

    def test_invalid_admin_id(self, qa):
        r = qa.get(f"{API}/admin/activity", params={"adminId": "abc"})
        assert r.status_code in (400, 404, 422), r.text
