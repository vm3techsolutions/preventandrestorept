# Tests for admin management (list/create/status) and content audit trail (blogs/services/conditions)
import os
import uuid
import subprocess
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')
API = f"{BASE_URL}/api"
QA_EMAIL = "test_qa_admin@example.com"
QA_PW = "TestQaAdmin2026x"
from _admin_ids import admin_id
QA_ID = admin_id('test_qa_admin@example.com')
UID = uuid.uuid4().hex[:6]
SECOND_EMAIL = f"test_second_{UID}@example.com"
SECOND_PW = "SecondAdmin2026x"


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


@pytest.fixture(scope="module")
def second(qa):
    r = qa.post(f"{API}/admin/admins", json={"name": f"TEST Second {UID}", "email": SECOND_EMAIL, "password": SECOND_PW})
    assert r.status_code == 201, r.text
    admin = r.json()["data"]
    s, lr = login(SECOND_EMAIL, SECOND_PW)
    assert lr.status_code == 200
    return {"admin": admin, "session": s}


# ---- Admin management ----
class TestAdmins:
    def test_requires_auth(self):
        assert requests.get(f"{API}/admin/admins").status_code == 401
        assert requests.post(f"{API}/admin/admins", json={"name": "TEST x", "email": "test_x@example.com", "password": "abcdefg1234"}).status_code == 401

    def test_list(self, qa):
        r = qa.get(f"{API}/admin/admins")
        assert r.status_code == 200
        rows = r.json()["data"]
        ids = [a["id"] for a in rows]
        assert 1 in ids and QA_ID in ids
        for a in rows:
            assert "passwordHash" not in a and "sessionVersion" not in a
            assert {"id", "name", "email", "isActive", "createdAt"} <= set(a)

    @pytest.mark.parametrize("payload", [
        {"name": "", "email": "test_v@example.com", "password": "abcdefg1234"},
        {"name": "TEST v", "email": "bad-email", "password": "abcdefg1234"},
        {"name": "TEST v", "email": "test_v@example.com", "password": "short1"},
        {"name": "TEST v", "email": "test_v@example.com", "password": "nodigitsatall"},
        {"name": "TEST v", "email": "test_v@example.com"},
    ])
    def test_create_validation(self, qa, payload):
        r = qa.post(f"{API}/admin/admins", json=payload)
        assert r.status_code == 422, r.text

    def test_create_and_duplicate(self, qa, second):
        a = second["admin"]
        assert a["email"] == SECOND_EMAIL and a["isActive"] is True and a["createdById"] == QA_ID
        assert "passwordHash" not in a
        r = qa.post(f"{API}/admin/admins", json={"name": "TEST dup", "email": SECOND_EMAIL.upper(), "password": SECOND_PW})
        assert r.status_code == 409
        assert "already exists" in r.json().get("message", r.text)

    def test_bcrypt_hash(self, second):
        out = subprocess.run(["psql", "postgresql://prpt:prpt_local_pw@127.0.0.1:5433/prpt", "-tAc",
                              f"select \"passwordHash\" from \"Admin\" where email='{SECOND_EMAIL}'"], capture_output=True, text=True)
        if out.returncode != 0:
            pytest.skip(f"psql unavailable: {out.stderr}")
        assert out.stdout.strip().startswith("$2b$12$")

    def test_self_status_422(self, qa):
        r = qa.put(f"{API}/admin/admins/{QA_ID}/status", json={"isActive": False})
        assert r.status_code == 422

    def test_status_404_and_validation(self, qa):
        assert qa.put(f"{API}/admin/admins/999999/status", json={"isActive": False}).status_code == 404
        assert qa.put(f"{API}/admin/admins/{QA_ID}/status", json={"isActive": "no"}).status_code == 422

    def test_deactivate_flow(self, qa, second):
        aid = second["admin"]["id"]
        sess = second["session"]
        assert sess.get(f"{API}/auth/me").status_code == 200
        r = qa.put(f"{API}/admin/admins/{aid}/status", json={"isActive": False})
        assert r.status_code == 200 and r.json()["data"]["isActive"] is False
        me = sess.get(f"{API}/auth/me")
        assert me.status_code == 401
        _, lr = login(SECOND_EMAIL, SECOND_PW)
        assert lr.status_code == 403 and "deactivated" in lr.text
        # wrong password for deactivated should still be 401 (no account-state leak)
        _, lr2 = login(SECOND_EMAIL, "WrongPass12345")
        assert lr2.status_code == 401
        r = qa.put(f"{API}/admin/admins/{aid}/status", json={"isActive": True})
        assert r.status_code == 200 and r.json()["data"]["isActive"] is True
        s2, lr = login(SECOND_EMAIL, SECOND_PW)
        assert lr.status_code == 200
        second["session"] = s2


# ---- Audit trail ----
TYPES = {
    "blogs": {"title": f"TEST audit blog {UID}"},
    "services": {"title": f"TEST audit service {UID}"},
    "conditions": {"title": f"TEST audit condition {UID}"},
}


class TestAudit:
    created = {}

    @pytest.mark.parametrize("kind", list(TYPES))
    def test_create_ignores_override(self, qa, kind):
        body = dict(TYPES[kind], createdById=1, updatedById=1, createdBy={"id": 1}, updatedBy={"id": 1})
        r = qa.post(f"{API}/admin/{kind}", json=body)
        assert r.status_code == 201, r.text
        d = r.json()["data"]
        assert d["createdById"] == QA_ID and d["updatedById"] == QA_ID
        assert d["createdBy"]["id"] == QA_ID and d["createdBy"]["name"] == "TEST QA Admin"
        assert "passwordHash" not in d["createdBy"]
        TestAudit.created[kind] = d

    @pytest.mark.parametrize("kind", list(TYPES))
    def test_update_by_second(self, qa, second, kind):
        item = TestAudit.created[kind]
        body = dict(TYPES[kind], title=TYPES[kind]["title"] + " edited", createdById=1, updatedById=1)
        r = second["session"].put(f"{API}/admin/{kind}/{item['id']}", json=body)
        assert r.status_code == 200, r.text
        g = qa.get(f"{API}/admin/{kind}/{item['id']}").json()["data"]
        assert g["createdBy"]["id"] == QA_ID
        assert g["updatedBy"]["id"] == second["admin"]["id"]

    @pytest.mark.parametrize("kind", list(TYPES))
    def test_publish_unpublish_updates(self, qa, second, kind):
        item = TestAudit.created[kind]
        r = qa.post(f"{API}/admin/{kind}/{item['id']}/publish")
        assert r.status_code == 200, r.text
        assert r.json()["data"]["updatedBy"]["id"] == QA_ID
        r = second["session"].post(f"{API}/admin/{kind}/{item['id']}/unpublish")
        assert r.status_code == 200 and r.json()["data"]["updatedBy"]["id"] == second["admin"]["id"]
        r = qa.post(f"{API}/admin/{kind}/{item['id']}/publish")
        assert r.status_code == 200

    @pytest.mark.parametrize("kind", list(TYPES))
    def test_public_no_audit_leak(self, kind):
        item = TestAudit.created[kind]
        slug = requests.get(f"{API}/public/{kind}").json()
        r = requests.get(f"{API}/public/{kind}/{item['slug'] if 'slug' in item else ''}")
        # slug may have changed on edit; fetch current
        lst = requests.get(f"{API}/public/{kind}", params={"limit": 100}).text
        for txt in (r.text, lst):
            for bad in ("createdBy", "updatedBy", "test_qa_admin@example.com", SECOND_EMAIL, "passwordHash"):
                assert bad not in txt

    def test_list_includes_audit(self, qa):
        r = qa.get(f"{API}/admin/blogs", params={"limit": 5})
        assert r.status_code == 200
        assert all("createdBy" in b for b in r.json()["data"])

    def test_seeded_not_recorded(self, qa):
        rows = qa.get(f"{API}/admin/services", params={"limit": 100}).json()["data"]
        seeded = [x for x in rows if not x["title"].startswith("TEST")]
        if not seeded:
            pytest.skip("no seeded services")
        assert seeded[0]["createdBy"] is None

    def test_pages_save_no_audit(self, qa):
        r = qa.post(f"{API}/admin/pages", json={"title": f"TEST page {UID}", "slug": f"test-page-{UID}"})
        assert r.status_code == 201, r.text
        d = r.json()["data"]
        assert "createdBy" not in d
        r2 = qa.put(f"{API}/admin/pages/{d['id']}", json={"title": f"TEST page {UID} b", "slug": f"test-page-{UID}"})
        assert r2.status_code == 200
        qa.delete(f"{API}/admin/pages/{d['id']}")

    def test_cleanup(self, qa, second):
        for kind, d in TestAudit.created.items():
            qa.delete(f"{API}/admin/{kind}/{d['id']}")
        # leave the second admin deactivated (no delete endpoint exists)
        qa.put(f"{API}/admin/admins/{second['admin']['id']}/status", json={"isActive": False})
