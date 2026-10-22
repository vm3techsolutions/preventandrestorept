# Regression tests for Prevent & Restore CMS API (Express behind FastAPI shim)
import io
import os
import struct
import zlib
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')
API = f"{BASE_URL}/api"
ADMIN_EMAIL = "test_qa_admin@example.com"
ADMIN_PW = "TestQaAdmin2026x"
UID = uuid.uuid4().hex[:6]


def png_bytes():
    def chunk(t, d):
        c = struct.pack('>I', len(d)) + t + d
        return c + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    raw = b'\x00\xff\x00\x00'
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', 1, 1, 8, 2, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw)) + chunk(b'IEND', b'')


JPEG = bytes.fromhex('ffd8ffe000104a46494600010100000100010000ffdb004300') + b'\x08' * 64 + bytes.fromhex('ffd9')


@pytest.fixture(scope="session")
def s():
    sess = requests.Session()
    r = sess.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PW})
    if r.status_code != 200:
        pytest.skip(f"login failed {r.status_code} {r.text}")
    return sess


@pytest.fixture(scope="session")
def anon():
    return requests.Session()


# ---- Health & Auth ----
class TestAuth:
    def test_health(self, anon):
        r = anon.get(f"{API}/health")
        assert r.status_code == 200 and r.json()["status"] == "ok"

    def test_login_sets_httponly_cookie(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PW})
        assert r.status_code == 200
        sc = r.headers.get('set-cookie', '')
        assert 'pr_admin_session=' in sc and 'HttpOnly' in sc
        assert r.json()["data"]["admin"]["email"] == ADMIN_EMAIL
        assert "passwordHash" not in r.json()["data"]["admin"]

    def test_me(self, s):
        r = s.get(f"{API}/auth/me")
        assert r.status_code == 200 and r.json()["data"]["admin"]["email"] == ADMIN_EMAIL

    def test_wrong_password_and_lockout_fake_email(self, anon):
        email = f"test_fake_{UID}@example.com"
        codes = [anon.post(f"{API}/auth/login", json={"email": email, "password": "wrongpass1"}).status_code for _ in range(6)]
        assert codes[:5] == [401] * 5
        assert codes[5] == 429

    def test_protected_requires_auth(self, anon):
        for p in ["/admin/dashboard", "/admin/blogs", "/admin/redirects", "/admin/settings", "/auth/me"]:
            assert anon.get(f"{API}{p}").status_code == 401, p

    def test_setup_forbidden(self, anon):
        r = anon.post(f"{API}/auth/setup", json={"token": "x" * 20, "email": "a@b.com", "password": "abcdefghij1"})
        assert r.status_code == 403
        assert anon.get(f"{API}/auth/setup/status").json()["data"]["setupRequired"] is False

    def test_foreign_origin_rejected(self, anon):
        r = anon.post(f"{API}/auth/logout", headers={"Origin": "https://evil.example.com"})
        assert r.status_code == 403

    def test_logout_clears(self):
        sess = requests.Session()
        sess.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PW})
        r = sess.post(f"{API}/auth/logout")
        assert r.status_code == 200
        assert sess.get(f"{API}/auth/me").status_code == 401


# ---- Dashboard ----
def test_dashboard_counts(s):
    d = s.get(f"{API}/admin/dashboard").json()["data"]
    assert d["blogs"]["published"] >= 2
    assert d["services"]["published"] == 7
    assert d["treatments"]["total"] == 13 and d["treatments"]["published"] == 5
    assert d["redirects"] >= 9


# ---- Blogs CRUD & lifecycle ----
class TestBlogs:
    def test_lifecycle(self, s):
        title = f"TEST_Blog {UID}"
        r = s.post(f"{API}/admin/blogs", json={"title": title, "blocks": [
            {"type": "heading", "data": {"level": 2, "text": "Intro"}},
            {"type": "paragraph", "data": {"html": "<strong>Hi</strong><script>alert(1)</script>"}},
        ]})
        assert r.status_code == 201, r.text
        b = r.json()["data"]
        bid = b["id"]
        assert b["slug"] == f"test-blog-{UID}" and b["status"] == "DRAFT"
        # update
        r = s.put(f"{API}/admin/blogs/{bid}", json={"title": title + " upd", "excerpt": "ex", "blocks": b.get("blocks", [])})
        assert r.status_code == 200 and r.json()["data"]["excerpt"] == "ex"
        got = s.get(f"{API}/admin/blogs/{bid}").json()["data"]
        assert got["title"] == title + " upd" and got["slug"] == f"test-blog-{UID}"
        assert "<script>" not in str(got)
        # publish
        r = s.post(f"{API}/admin/blogs/{bid}/publish")
        assert r.status_code == 200 and r.json()["data"]["status"] == "PUBLISHED" and r.json()["data"]["publishedAt"]
        assert s.get(f"{API}/public/blogs/test-blog-{UID}").status_code == 200
        # slug change -> 301
        r = s.put(f"{API}/admin/blogs/{bid}", json={"title": title, "slug": f"test-blog-{UID}-b"})
        assert r.status_code == 200
        res = s.get(f"{API}/public/redirects/resolve", params={"path": f"/blog/test-blog-{UID}"}).json()["data"]
        assert res["toPath"] == f"/blog/test-blog-{UID}-b" and res["statusCode"] == 301
        r = s.put(f"{API}/admin/blogs/{bid}", json={"title": title, "slug": f"test-blog-{UID}-c"})
        assert r.status_code == 200
        res = s.get(f"{API}/public/redirects/resolve", params={"path": f"/blog/test-blog-{UID}"}).json()["data"]
        assert res["toPath"] == f"/blog/test-blog-{UID}-c", "chain not flattened"
        res2 = s.get(f"{API}/public/redirects/resolve", params={"path": f"/blog/test-blog-{UID}-b"}).json()["data"]
        assert res2["toPath"] == f"/blog/test-blog-{UID}-c"
        # unpublish
        r = s.post(f"{API}/admin/blogs/{bid}/unpublish")
        assert r.json()["data"]["status"] == "DRAFT"
        assert s.get(f"{API}/public/blogs/test-blog-{UID}-c").status_code == 404
        # archive
        r = s.post(f"{API}/admin/blogs/{bid}/archive")
        assert r.json()["data"]["status"] == "ARCHIVED"
        lst = s.get(f"{API}/admin/blogs", params={"status": "ARCHIVED"}).json()["data"]
        assert any(x["id"] == bid for x in lst)
        # delete -> trash
        assert s.delete(f"{API}/admin/blogs/{bid}").status_code == 200
        assert not any(x["id"] == bid for x in s.get(f"{API}/admin/blogs").json()["data"])
        assert any(x["id"] == bid for x in s.get(f"{API}/admin/blogs", params={"status": "TRASHED"}).json()["data"])
        assert s.put(f"{API}/admin/blogs/{bid}", json={"title": "x"}).status_code == 409
        # restore
        r = s.post(f"{API}/admin/blogs/{bid}/restore")
        assert r.status_code == 200 and r.json()["data"]["deletedAt"] is None
        # cleanup
        s.delete(f"{API}/admin/blogs/{bid}")
        for rd in s.get(f"{API}/admin/redirects", params={"search": f"test-blog-{UID}"}).json()["data"]:
            s.delete(f"{API}/admin/redirects/{rd['id']}")

    def test_duplicate_slug_409(self, s):
        seeded = s.get(f"{API}/admin/blogs").json()["data"][0]["slug"]
        r = s.post(f"{API}/admin/blogs", json={"title": "TEST_dup", "slug": seeded})
        assert r.status_code == 409

    def test_auto_slug_unique(self, s):
        a = s.post(f"{API}/admin/blogs", json={"title": f"TEST_Same {UID}"}).json()["data"]
        b = s.post(f"{API}/admin/blogs", json={"title": f"TEST_Same {UID}"}).json()["data"]
        assert a["slug"] != b["slug"] and b["slug"].endswith("-2")
        s.delete(f"{API}/admin/blogs/{a['id']}")
        s.delete(f"{API}/admin/blogs/{b['id']}")

    def test_filters_pagination(self, s):
        r = s.get(f"{API}/admin/blogs", params={"search": "shoulder"}).json()
        assert r["pagination"]["total"] == 1 and "Shoulder" in r["data"][0]["title"]
        assert s.get(f"{API}/admin/blogs", params={"status": "PUBLISHED"}).json()["pagination"]["total"] >= 2
        assert s.get(f"{API}/admin/blogs", params={"category": "uncategorized"}).json()["pagination"]["total"] >= 2
        r = s.get(f"{API}/admin/blogs", params={"limit": 1, "page": 2}).json()
        assert len(r["data"]) == 1 and r["pagination"]["page"] == 2
        tag = s.post(f"{API}/admin/tags", json={"name": f"TEST_tagf {UID}"}).json()["data"]
        assert s.get(f"{API}/admin/blogs", params={"tag": tag["slug"]}).json()["pagination"]["total"] == 0
        s.delete(f"{API}/admin/tags/{tag['id']}")


# ---- Redirects ----
class TestRedirects:
    def test_validation(self, s):
        a, b, c = f"/test-a-{UID}", f"/test-b-{UID}", f"/test-c-{UID}"
        r1 = s.post(f"{API}/admin/redirects", json={"fromPath": a, "toPath": b})
        assert r1.status_code == 201, r1.text
        rid = r1.json()["data"]["id"]
        loop = s.post(f"{API}/admin/redirects", json={"fromPath": b, "toPath": a})
        assert loop.status_code == 422 and "loop" in loop.json()["error"]["message"].lower()
        chain = s.post(f"{API}/admin/redirects", json={"fromPath": c, "toPath": a})
        assert chain.status_code == 422 and "chain" in chain.json()["error"]["message"].lower()
        chain2 = s.post(f"{API}/admin/redirects", json={"fromPath": b, "toPath": c})
        assert chain2.status_code == 422
        same = s.post(f"{API}/admin/redirects", json={"fromPath": c, "toPath": c + "/"})
        assert same.status_code == 422
        dup = s.post(f"{API}/admin/redirects", json={"fromPath": a.upper() + "/", "toPath": "/services"})
        assert dup.status_code == 409
        assert s.post(f"{API}/admin/redirects", json={"fromPath": "/admin/x", "toPath": "/"}).status_code == 422
        upd = s.put(f"{API}/admin/redirects/{rid}", json={"fromPath": a, "toPath": "/services", "statusCode": 302})
        assert upd.status_code == 200 and upd.json()["data"]["statusCode"] == 302
        assert s.delete(f"{API}/admin/redirects/{rid}").status_code == 200
        assert s.delete(f"{API}/admin/redirects/{rid}").status_code == 404

    def test_resolve_seeded(self, anon):
        r = anon.get(f"{API}/public/redirects/resolve", params={"path": "/knee-pain/"})
        assert r.status_code == 200 and r.json()["data"]["toPath"] == "/what-we-treat/knee-pain"
        assert anon.get(f"{API}/public/redirects/resolve", params={"path": "/nope-xyz"}).status_code == 404


# ---- Pages ----
class TestPages:
    @pytest.mark.parametrize("slug", ["about-us", "blog", "services", "admin"])
    def test_reserved(self, s, slug):
        r = s.post(f"{API}/admin/pages", json={"title": "TEST_res", "slug": slug})
        assert r.status_code == 422

    def test_reserved_from_title(self, s):
        r = s.post(f"{API}/admin/pages", json={"title": "About Us"})
        assert r.status_code == 422

    def test_redirect_collision(self, s):
        r = s.post(f"{API}/admin/pages", json={"title": "TEST_kp", "slug": "knee-pain"})
        assert r.status_code == 409

    def test_page_crud(self, s):
        r = s.post(f"{API}/admin/pages", json={"title": f"TEST_Page {UID}", "content": [{"type": "disclaimer", "data": {"text": "d"}}]})
        assert r.status_code == 201, r.text
        p = r.json()["data"]
        assert s.post(f"{API}/admin/pages/{p['id']}/publish").json()["data"]["status"] == "PUBLISHED"
        assert s.get(f"{API}/public/pages/{p['slug']}").status_code == 200
        s.delete(f"{API}/admin/pages/{p['id']}")
        assert s.get(f"{API}/public/pages/{p['slug']}").status_code == 404


# ---- Taxonomies ----
class TestTaxonomy:
    def test_categories_tags_crud(self, s):
        for kind in ["categories", "tags", "authors"]:
            r = s.post(f"{API}/admin/{kind}", json={"name": f"TEST_{kind} {UID}"})
            assert r.status_code == 201, r.text
            tid = r.json()["data"]["id"]
            assert s.post(f"{API}/admin/{kind}", json={"name": f"TEST_{kind} {UID}"}).status_code == 409
            u = s.put(f"{API}/admin/{kind}/{tid}", json={"name": f"TEST_{kind} {UID} edited"})
            assert u.status_code == 200 and u.json()["data"]["name"].endswith("edited")
            assert s.delete(f"{API}/admin/{kind}/{tid}").status_code == 200
            assert not any(x["id"] == tid for x in s.get(f"{API}/admin/{kind}", params={"limit": 200}).json()["data"])

    def test_delete_used_category_409(self, s):
        cat = next(c for c in s.get(f"{API}/admin/categories").json()["data"] if c["slug"] == "uncategorized")
        assert s.delete(f"{API}/admin/categories/{cat['id']}").status_code == 409


# ---- Reorder ----
def test_reorder_services(s, anon):
    orig = [x["id"] for x in s.get(f"{API}/admin/services", params={"limit": 50}).json()["data"]]
    new = list(reversed(orig))
    try:
        r = s.put(f"{API}/admin/services/reorder", json={"ids": new})
        assert r.status_code == 200
        assert [x["id"] for x in s.get(f"{API}/admin/services", params={"limit": 50}).json()["data"]] == new
        pub = anon.get(f"{API}/public/services", params={"_": UID}).json()["data"]
        assert [x["id"] for x in pub] == new
    finally:
        s.put(f"{API}/admin/services/reorder", json={"ids": orig})
    assert [x["id"] for x in s.get(f"{API}/admin/services", params={"limit": 50}).json()["data"]] == orig


# ---- Public ----
class TestPublic:
    def test_conditions(self, anon):
        r = anon.get(f"{API}/public/conditions").json()
        assert r["pagination"]["total"] == 5
        assert anon.get(f"{API}/public/conditions/tennis-elbow").status_code == 404

    def test_lists(self, anon):
        assert anon.get(f"{API}/public/services").json()["pagination"]["total"] == 7
        assert anon.get(f"{API}/public/blogs").json()["pagination"]["total"] == 2

    def test_sitemap(self, anon):
        r = anon.get(f"{API}/public/sitemap.xml")
        assert r.status_code == 200 and "xml" in r.headers["content-type"]
        assert "tennis-elbow" not in r.text
        assert r.text.count("<url>") == 4 + 2 + 7 + 5

    def test_public_settings(self, anon):
        assert anon.get(f"{API}/public/settings").status_code == 200


# ---- Media ----
class TestMedia:
    def test_upload_png_jpeg(self, s, anon):
        for name, data, mime in [("t.png", png_bytes(), "image/png"), ("t.jpg", JPEG, "image/jpeg")]:
            r = s.post(f"{API}/admin/media", files={"file": (name, io.BytesIO(data), mime)}, data={"folder": "blogs", "alt": "TEST_alt"})
            assert r.status_code == 201, r.text
            m = r.json()["data"]
            assert m["url"].startswith("/api/uploads/") or "/uploads/" in m["url"]
            url = m["url"] if m["url"].startswith("http") else f"{BASE_URL}{m['url']}"
            g = anon.get(url)
            assert g.status_code == 200 and g.content == data
            assert s.delete(f"{API}/admin/media/{m['id']}").status_code == 200

    def test_reject_non_image(self, s):
        r = s.post(f"{API}/admin/media", files={"file": ("a.txt", io.BytesIO(b"hello"), "text/plain")}, data={"folder": "blogs"})
        assert r.status_code == 415

    def test_reject_fake_png(self, s):
        r = s.post(f"{API}/admin/media", files={"file": ("a.png", io.BytesIO(b"not really a png"), "image/png")}, data={"folder": "blogs"})
        assert r.status_code == 415

    def test_storage_status(self, s):
        d = s.get(f"{API}/admin/media/status").json()["data"]
        assert d["s3Configured"] is False
