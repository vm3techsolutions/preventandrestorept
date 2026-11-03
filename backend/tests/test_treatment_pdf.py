# Regression: treatment PDF upload/replace/open/remove, public lead capture + tokenised download, admin pdf-leads
# NOTE: public lead POST is rate limited (10 / 15 min / IP). This file uses at most 3 lead POSTs.
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')
API = f"{BASE_URL}/api"
ADMIN_EMAIL = "test_qa_admin@example.com"
ADMIN_PW = "TestQaAdmin2026x"
COND_ID = 26
SLUG = "neck-pain"
PDF_BYTES = b"%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n"


@pytest.fixture(scope="module")
def admin():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PW})
    if r.status_code != 200:
        pytest.skip(f"login failed {r.status_code} {r.text}")
    return s


# --- Auth / security
def test_upload_requires_auth():
    r = requests.post(f"{API}/admin/conditions/{COND_ID}/pdf", files={"file": ("a.pdf", PDF_BYTES, "application/pdf")})
    assert r.status_code == 401


def test_open_and_leads_require_auth():
    assert requests.get(f"{API}/admin/conditions/{COND_ID}/pdf").status_code == 401
    assert requests.get(f"{API}/admin/pdf-leads").status_code == 401
    assert requests.delete(f"{API}/admin/conditions/{COND_ID}/pdf").status_code == 401


def test_fake_pdf_rejected_415(admin):
    r = admin.post(f"{API}/admin/conditions/{COND_ID}/pdf", files={"file": ("fake.pdf", b"hello not a pdf at all", "application/pdf")})
    assert r.status_code == 415, r.text


def test_non_pdf_mime_rejected_415(admin):
    r = admin.post(f"{API}/admin/conditions/{COND_ID}/pdf", files={"file": ("x.png", b"\x89PNG\r\n\x1a\n0000", "image/png")})
    assert r.status_code == 415, r.text


def test_upload_unknown_condition_404(admin):
    r = admin.post(f"{API}/admin/conditions/999999/pdf", files={"file": ("a.pdf", PDF_BYTES, "application/pdf")})
    assert r.status_code == 404


def test_invalid_token_410():
    r = requests.get(f"{API}/public/treatment-pdf/abc")
    assert r.status_code == 410


def test_private_dir_not_served():
    r = requests.get(f"{API}/uploads/../private_uploads/")
    assert r.status_code in (400, 403, 404)


# --- Core flow
class TestPdfFlow:
    state = {}

    def test_public_detail_no_key_leak(self):
        r = requests.get(f"{API}/public/conditions/{SLUG}")
        assert r.status_code == 200
        txt = r.text
        assert "pdfKey" not in txt and "pdfStorage" not in txt and "private_uploads" not in txt and "treatment-pdfs/" not in txt
        pdf = r.json()["data"].get("pdf")
        assert pdf and pdf["label"]

    def test_admin_open_inline(self, admin):
        r = admin.get(f"{API}/admin/conditions/{COND_ID}/pdf")
        assert r.status_code == 200
        assert r.headers["content-type"].startswith("application/pdf")
        assert r.headers["content-disposition"].startswith("inline")
        assert r.content[:5] == b"%PDF-"

    def test_lead_validation_400(self):
        r = requests.post(f"{API}/public/conditions/{SLUG}/pdf-leads", json={"fullName": "", "email": "bad", "phone": "12"})
        assert r.status_code in (400, 422), r.text
        paths = {d["path"] for d in r.json()["error"]["details"]}
        assert {"fullName", "email", "phone"} <= paths

    def test_lead_submit_and_download(self, admin):
        r = requests.post(f"{API}/public/conditions/{SLUG}/pdf-leads",
                          json={"fullName": "TEST_Lead API", "email": "test_lead_api@example.com", "phone": "(404) 555-0100", "location": ""})
        assert r.status_code == 201, r.text
        d = r.json()["data"]
        assert d["downloadUrl"].startswith("/public/treatment-pdf/")
        assert "treatment-pdfs/" not in d["downloadUrl"]
        dl = requests.get(f"{API}{d['downloadUrl']}")
        assert dl.status_code == 200
        assert dl.headers["content-disposition"].startswith("attachment")
        assert dl.content[:5] == b"%PDF-"
        TestPdfFlow.state["url"] = d["downloadUrl"]
        leads = admin.get(f"{API}/admin/pdf-leads", params={"search": "test_lead_api@example.com"}).json()["data"]
        assert leads and leads[0]["treatmentName"] == "Neck Pain"
        assert leads[0]["location"] is None
        assert leads[0]["downloadedAt"] is not None
        assert "pdfKey" not in leads[0]


def test_lead_unknown_slug_404():
    r = requests.post(f"{API}/public/conditions/knee-pain/pdf-leads",
                      json={"fullName": "TEST_Lead Knee", "email": "test_lead_knee@example.com", "phone": "(404) 555-0101"})
    assert r.status_code == 404, r.text
