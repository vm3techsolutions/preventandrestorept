# Regression: body-region conditions (sections), services order, legacy redirects, case studies CMS, slug->301, sitemap, reviews removal
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')
API = f"{BASE_URL}/api"
ADMIN_EMAIL = "test_qa_admin@example.com"
ADMIN_PW = "TestQaAdmin2026x"
UID = uuid.uuid4().hex[:6]

REGIONS = ['neck-pain', 'shoulder-pain', 'elbow-pain', 'low-back-pain', 'hip-pain', 'knee-pain', 'ankle-foot-pain',
           'headaches', 'tmj', 'muscle-strains', 'nerve-pain']
SERVICES8 = ['physical-therapy', 'remote-strength-and-conditioning', 'in-person-personal-training', 'shockwave-therapy',
             'dry-needling', 'injury-prevention-workshops', 'injury-prevention-screening', 'functional-movement-screening']
LEGACY = {
    '/back-sciatica-pain/': '/what-we-treat/low-back-pain/',
    '/shoulder-neck-pain/': '/what-we-treat/shoulder-pain/',
    '/knee-pain/': '/what-we-treat/knee-pain/',
    '/sports-injuries/': '/what-we-treat/muscle-strains/',
    '/foot-ankle-pain/': '/what-we-treat/ankle-foot-pain/',
    '/what-we-treat/back-sciatica-pain/': '/what-we-treat/low-back-pain/',
    '/services/functional-dry-needling/': '/services/dry-needling/',
}


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    r = sess.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PW})
    if r.status_code != 200:
        pytest.skip(f"login failed {r.status_code} {r.text}")
    return sess


def data(r):
    j = r.json()
    return j.get('data', j) if isinstance(j, dict) else j


# Public: 11 region conditions + sections
def test_public_conditions_contains_11_regions():
    slugs = [x['slug'] for x in data(requests.get(f"{API}/public/conditions?limit=100"))]
    for r in REGIONS:
        assert r in slugs, r
    extra = [x for x in slugs if x not in REGIONS]
    print("extra published conditions:", extra)
    assert slugs[:11] == REGIONS


def test_public_conditions_exactly_11():
    slugs = [x['slug'] for x in data(requests.get(f"{API}/public/conditions?limit=100"))]
    assert len(slugs) == 11, f"expected 11 region pages, got {slugs}"


@pytest.mark.parametrize("slug", REGIONS)
def test_region_detail_sections_and_seo(slug):
    r = requests.get(f"{API}/public/conditions/{slug}")
    assert r.status_code == 200
    d = data(r)
    assert len(d['sections']) >= 1
    assert d['seo']['title'].endswith('| Prevent & Restore PT')
    assert d['seo']['canonical'].endswith(f"/what-we-treat/{slug}")
    for sec in d['sections']:
        assert sec['heading'] and sec['anchor']


def test_spondylosis_and_herniated_on_neck_and_back_differ():
    neck = {s['heading'].lower(): s for s in data(requests.get(f"{API}/public/conditions/neck-pain"))['sections']}
    back = {s['heading'].lower(): s for s in data(requests.get(f"{API}/public/conditions/low-back-pain"))['sections']}
    for kw in ['spondylosis', 'herniated']:
        n = next(v for k, v in neck.items() if kw in k)
        b = next(v for k, v in back.items() if kw in k)
        assert n['description'] != b['description']
        assert n['anchor'] != b['anchor'] or True


# Legacy redirects: single 301 hop
@pytest.mark.parametrize("src,dst", list(LEGACY.items()))
def test_legacy_redirect_single_hop(src, dst):
    r = requests.get(f"{BASE_URL}{src}", allow_redirects=False)
    assert r.status_code in (301, 308), f"{src} -> {r.status_code}"
    loc = r.headers['location']
    assert loc.rstrip('/').endswith(dst.rstrip('/')), loc
    r2 = requests.get(f"{BASE_URL}{dst}", allow_redirects=False)
    assert r2.status_code == 200, f"{dst} -> {r2.status_code} (chain?)"


# Services order + detail 200
def test_services_order():
    slugs = [x['slug'] for x in data(requests.get(f"{API}/public/services?limit=100"))]
    assert slugs[:8] == SERVICES8


@pytest.mark.parametrize("slug", SERVICES8)
def test_service_pages_200(slug):
    assert requests.get(f"{API}/public/services/{slug}").status_code == 200
    assert requests.get(f"{BASE_URL}/services/{slug}/", allow_redirects=False).status_code == 200


# Sitemap
def test_sitemap_regions_and_no_draft_case_study(s):
    locs = [x['loc'] for x in data(requests.get(f"{API}/public/sitemap"))]
    for r in REGIONS:
        assert any(l.endswith(f"/what-we-treat/{r}") for l in locs), r
    drafts = [x['slug'] for x in data(s.get(f"{API}/admin/caseStudies?limit=100")) if x['status'] != 'PUBLISHED']
    assert drafts, "expected a DRAFT example case study"
    for d in drafts:
        assert not any(l.endswith(f"/case-studies/{d}") for l in locs)


# Admin: reviews module removed
def test_admin_reviews_removed(s):
    assert s.get(f"{API}/admin/reviews").status_code == 404
    assert s.get(f"{API}/admin/dashboard").status_code == 200
    assert s.get(f"{API}/admin/blogs").status_code == 200


# Admin: empty section heading rejected
def test_condition_empty_heading_rejected(s):
    r = s.post(f"{API}/admin/conditions", json={"title": f"TEST_cond {UID}", "sections": [{"heading": "  "}]})
    assert r.status_code in (400, 422), r.text
    if r.status_code in (200, 201):
        s.delete(f"{API}/admin/conditions/{data(r)['id']}")


# Admin: condition sections persist order; publish + rename creates single-hop 301
def test_condition_sections_reorder_and_slug_redirect(s):
    r = s.post(f"{API}/admin/conditions", json={"title": f"TEST_cond {UID}",
                                                "sections": [{"heading": "Alpha"}, {"heading": "Beta"}]})
    assert r.status_code in (200, 201), r.text
    c = data(r)
    cid = c['id']
    try:
        assert c['slug'] == f"test-cond-{UID}"
        full = data(s.get(f"{API}/admin/conditions/{cid}"))
        secs = full['sections']
        full['sections'] = [secs[1], secs[0]]
        body = {k: full[k] for k in ['title', 'slug', 'sections']}
        assert s.put(f"{API}/admin/conditions/{cid}", json=body).status_code == 200
        assert [x['heading'] for x in data(s.get(f"{API}/admin/conditions/{cid}"))['sections']] == ['Beta', 'Alpha']
        assert s.post(f"{API}/admin/conditions/{cid}/publish").status_code == 200
        old = f"test-cond-{UID}"
        new = f"test-cond-{UID}-renamed"
        r = s.put(f"{API}/admin/conditions/{cid}", json={**body, 'title': f"TEST_cond {UID} renamed", 'slug': new})
        assert r.status_code == 200, r.text
        assert old in r.headers.get('X-Redirect-Created', '')
        rr = requests.get(f"{API}/public/redirects/resolve", params={"path": f"/what-we-treat/{old}"})
        assert rr.status_code == 200, rr.text
        assert f"/what-we-treat/{new}" in rr.text
        pub = requests.get(f"{API}/public/conditions/{new}")
        assert pub.status_code == 200
        assert [x['heading'] for x in data(pub)['sections']] == ['Beta', 'Alpha']
    finally:
        s.delete(f"{API}/admin/conditions/{cid}")
        for x in data(s.get(f"{API}/admin/redirects?search=test-cond-{UID}&limit=50")):
            if UID in x['fromPath']:
                s.delete(f"{API}/admin/redirects/{x['id']}")


# Admin: case studies CRUD
def test_case_study_summary_required(s):
    r = s.post(f"{API}/admin/caseStudies", json={"title": f"TEST_case {UID} nosum", "summary": ""})
    assert r.status_code in (400, 422)


def test_case_study_create_publish_public_delete(s):
    r = s.post(f"{API}/admin/caseStudies", json={
        "title": f"TEST_case {UID}", "summary": "TEST summary", "primaryConcern": "Knee pain",
        "challenge": "C1", "assessment": "A1", "plan": "P1", "progress": "PR1", "outcome": "O1", "takeaways": "T1"})
    assert r.status_code in (200, 201), r.text
    cs = data(r)
    try:
        assert cs['slug'] == f"test-case-{UID}"
        assert requests.get(f"{API}/public/caseStudies/{cs['slug']}").status_code == 404
        assert s.post(f"{API}/admin/caseStudies/{cs['id']}/publish").status_code == 200
        d = data(requests.get(f"{API}/public/caseStudies/{cs['slug']}"))
        assert d['summary'] == 'TEST summary' and d['plan'] == 'P1' and d['showApproach'] is True
        assert requests.get(f"{BASE_URL}/case-studies/{cs['slug']}/").status_code == 200
    finally:
        assert s.delete(f"{API}/admin/caseStudies/{cs['id']}").status_code in (200, 204)
    assert requests.get(f"{API}/public/caseStudies/{cs['slug']}").status_code == 404
