# Iteration 3: admin password reset API, list "updatedBy" audit column, admin CLI
import os
import uuid
import subprocess
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')
API = f"{BASE_URL}/api"
QA_EMAIL = "test_qa_admin@example.com"
QA_PW = "TestQaAdmin2026x"
UID = uuid.uuid4().hex[:6]
T_EMAIL = f"test_reset_{UID}@example.com"
T_PW = "ResetOrig2026x"
T_NEW = "ResetNew2026xy"


def login(email, pw):
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": email, "password": pw})
    return s, r


def cli(*args):
    p = subprocess.run(["node", "scripts/admin-cli.js", *args], cwd="/app/server", capture_output=True, text=True, timeout=60)
    return p.returncode, p.stdout + p.stderr


@pytest.fixture(scope="module")
def qa():
    s, r = login(QA_EMAIL, QA_PW)
    if r.status_code != 200:
        pytest.skip(f"QA login failed {r.status_code} {r.text}")
    return s


@pytest.fixture(scope="module")
def target(qa):
    r = qa.post(f"{API}/admin/admins", json={"name": "TEST Reset Target", "email": T_EMAIL, "password": T_PW})
    assert r.status_code == 201, r.text
    return r.json()["data"]


# --- Reset password API ---
class TestResetPasswordAPI:
    def test_unauth_401(self, target):
        r = requests.put(f"{API}/admin/admins/{target['id']}/password", json={"newPassword": T_NEW})
        assert r.status_code == 401

    def test_self_422(self, qa):
        me = qa.get(f"{API}/auth/me").json()["data"]
        me = me.get("admin", me)
        r = qa.put(f"{API}/admin/admins/{me['id']}/password", json={"newPassword": T_NEW})
        assert r.status_code == 422
        assert "Settings" in r.text and "Change password" in r.text

    def test_weak_422(self, qa, target):
        for pw in ["short1", "onlyletterslong", "1234567890123"]:
            r = qa.put(f"{API}/admin/admins/{target['id']}/password", json={"newPassword": pw})
            assert r.status_code == 422, (pw, r.text)

    def test_missing_body_422(self, qa, target):
        r = qa.put(f"{API}/admin/admins/{target['id']}/password", json={})
        assert r.status_code == 422

    def test_unknown_404(self, qa):
        r = qa.put(f"{API}/admin/admins/999999/password", json={"newPassword": T_NEW})
        assert r.status_code == 404

    def test_invalid_id(self, qa):
        r = qa.put(f"{API}/admin/admins/abc/password", json={"newPassword": T_NEW})
        assert r.status_code in (400, 404, 422)

    def test_reset_success_flow(self, qa, target):
        old_sess, r = login(T_EMAIL, T_PW)
        assert r.status_code == 200
        assert old_sess.get(f"{API}/auth/me").status_code == 200
        r = qa.put(f"{API}/admin/admins/{target['id']}/password", json={"newPassword": T_NEW})
        assert r.status_code == 200, r.text
        assert "passwordHash" not in r.text and "sessionVersion" not in r.text
        assert r.json()["data"]["email"] == T_EMAIL
        # old session revoked
        assert old_sess.get(f"{API}/auth/me").status_code == 401
        # old pw fails, new works
        _, r1 = login(T_EMAIL, T_PW)
        assert r1.status_code == 401
        _, r2 = login(T_EMAIL, T_NEW)
        assert r2.status_code == 200


# --- Lists include updatedBy ---
class TestListUpdatedBy:
    @pytest.mark.parametrize("key", ["blogs", "services", "conditions"])
    def test_list_has_updated_by(self, qa, key):
        r = qa.get(f"{API}/admin/{key}?limit=50")
        assert r.status_code == 200, r.text
        rows = r.json()["data"]
        assert rows, f"no {key}"
        for row in rows:
            assert "updatedBy" in row, row.keys()
            if row["updatedBy"]:
                assert set(row["updatedBy"].keys()) <= {"id", "name", "email"}
        assert "passwordHash" not in r.text

    def test_pages_list_no_updated_by(self, qa):
        r = qa.get(f"{API}/admin/pages")
        assert r.status_code == 200
        assert "updatedBy" not in r.text


# --- CLI ---
class TestCLI:
    def test_list(self, target):
        code, out = cli("list")
        assert code == 0
        assert T_EMAIL in out and "ACTIVE" in out

    def test_deactivate_then_activate(self, qa, target):
        r = qa.put(f"{API}/admin/admins/{target['id']}/status", json={"isActive": False})
        assert r.status_code == 200
        code, out = cli("list")
        line = [l for l in out.splitlines() if T_EMAIL in l][0]
        assert "DEACTIVATED" in line
        _, r = login(T_EMAIL, T_NEW)
        assert r.status_code == 403
        code, out = cli("activate", T_EMAIL.upper())
        assert code == 0 and "Activated" in out, out
        _, r = login(T_EMAIL, T_NEW)
        assert r.status_code == 200

    def test_reset_password_activates(self, qa, target):
        qa.put(f"{API}/admin/admins/{target['id']}/status", json={"isActive": False})
        code, out = cli("reset-password", T_EMAIL, "NewPass2026x")
        assert code == 0, out
        _, r = login(T_EMAIL, "NewPass2026x")
        assert r.status_code == 200
        _, r = login(T_EMAIL, T_NEW)
        assert r.status_code == 401

    def test_weak_and_unknown(self):
        code, out = cli("reset-password", T_EMAIL, "weak")
        assert code != 0 and "at least 10" in out
        code, out = cli("reset-password", "test_nobody_zz@example.com", "NewPass2026x")
        assert code != 0 and "No admin with that email" in out
        code, out = cli("activate", "test_nobody_zz@example.com")
        assert code != 0 and "No admin with that email" in out
        # NOTE: unknown cmd without valid pw falls into password check first (minor UX issue reported)
        code, out = cli("bogus", "x@example.com", "Abcdefgh1234")
        assert code != 0 and "Unknown command" in out

    def test_cleanup_deactivate(self, qa, target):
        r = qa.put(f"{API}/admin/admins/{target['id']}/status", json={"isActive": False})
        assert r.status_code == 200
