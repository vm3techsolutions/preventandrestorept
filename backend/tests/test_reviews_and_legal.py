# Reviews CMS (admin CRUD, validation, auth, activity log, public endpoint) + legal pages / sitemap / redirects
import os
import re
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')
QA_EMAIL = 'test_qa_admin@example.com'
QA_PW = 'TestQaAdmin2026x'


def get(path, **kw):
    return requests.get(f"{BASE_URL}{path}", allow_redirects=False, timeout=60, **kw)


@pytest.fixture(scope='module')
def s():
    sess = requests.Session()
    r = sess.post(f"{BASE_URL}/api/auth/login", json={'email': QA_EMAIL, 'password': QA_PW}, timeout=30)
    if r.status_code != 200:
        pytest.skip(f"login failed {r.status_code} {r.text}")
    assert 'pr_admin_session' in sess.cookies.get_dict()
    yield sess
    # cleanup TEST_ reviews
    rows = sess.get(f"{BASE_URL}/api/admin/reviews?limit=100&search=TEST_").json().get('data', [])
    for row in rows:
        if row['reviewerName'].startswith('TEST_'):
            sess.delete(f"{BASE_URL}/api/admin/reviews/{row['id']}")


BASE = {'reviewerName': 'TEST_Rev', 'text': 'TEST_ text great PT', 'rating': 5, 'reviewDate': '2025-06-01',
        'source': 'Google', 'sourceUrl': 'https://g.co/x', 'isPublished': False, 'isFeatured': False, 'displayOrder': 0}


# --- Auth ---
def test_unauth_admin_reviews_401():
    assert requests.get(f"{BASE_URL}/api/admin/reviews", timeout=30).status_code == 401
    assert requests.post(f"{BASE_URL}/api/admin/reviews", json=BASE, timeout=30).status_code == 401


# --- Validation ---
@pytest.mark.parametrize('patch', [{'reviewerName': ''}, {'reviewerName': '   '}, {'rating': 6}, {'rating': 0},
                                   {'sourceUrl': 'http://x.com'}, {'text': ''}, {'reviewDate': '2025/01/01'}])
def test_validation(s, patch):
    r = s.post(f"{BASE_URL}/api/admin/reviews", json={**BASE, **patch})
    assert r.status_code in (400, 422), r.text


def test_rating_optional(s):
    r = s.post(f"{BASE_URL}/api/admin/reviews", json={**BASE, 'reviewerName': 'TEST_NoRating', 'rating': None, 'reviewDate': ''})
    assert r.status_code == 201, r.text
    d = r.json()['data']
    assert d['rating'] is None and d['reviewDate'] is None
    s.delete(f"{BASE_URL}/api/admin/reviews/{d['id']}")


# --- CRUD + public + activity ---
class TestReviewCrud:
    ids = {}

    def test_create(self, s):
        r = s.post(f"{BASE_URL}/api/admin/reviews", json={**BASE, 'reviewerName': 'TEST_Draft'})
        assert r.status_code == 201, r.text
        d = r.json()['data']
        assert d['reviewerName'] == 'TEST_Draft' and d['rating'] == 5 and d['isPublished'] is False
        TestReviewCrud.ids['draft'] = d['id']
        lst = s.get(f"{BASE_URL}/api/admin/reviews?search=TEST_Draft").json()
        assert any(x['id'] == d['id'] for x in lst['data'])

    def test_unpublished_not_public(self):
        r = get('/api/public/reviews?limit=50')
        assert r.status_code == 200
        ids = [x['id'] for x in r.json()['data']]
        assert TestReviewCrud.ids['draft'] not in ids
        # public fields must not leak audit data
        for x in r.json()['data']:
            assert 'createdById' not in x and 'updatedBy' not in x

    def test_update_publish(self, s):
        rid = TestReviewCrud.ids['draft']
        r = s.put(f"{BASE_URL}/api/admin/reviews/{rid}", json={**BASE, 'reviewerName': 'TEST_Published', 'isPublished': True, 'rating': 4})
        assert r.status_code == 200, r.text
        assert r.json()['data']['reviewerName'] == 'TEST_Published'
        pub = get('/api/public/reviews?limit=50').json()
        row = next((x for x in pub['data'] if x['id'] == rid), None)
        assert row and row['rating'] == 4 and row['reviewerName'] == 'TEST_Published'
        assert pub['meta']['total'] >= 1

    def test_featured_filter(self, s):
        r = s.post(f"{BASE_URL}/api/admin/reviews", json={**BASE, 'reviewerName': 'TEST_Feat', 'isPublished': True, 'isFeatured': True})
        fid = r.json()['data']['id']
        TestReviewCrud.ids['feat'] = fid
        data = get('/api/public/reviews?featured=true&limit=50').json()['data']
        assert fid in [x['id'] for x in data]
        assert TestReviewCrud.ids['draft'] not in [x['id'] for x in data]

    def test_update_404(self, s):
        assert s.put(f"{BASE_URL}/api/admin/reviews/99999999", json=BASE).status_code == 404
        assert s.delete(f"{BASE_URL}/api/admin/reviews/abc").status_code == 400

    def test_delete(self, s):
        for k in ('draft', 'feat'):
            assert s.delete(f"{BASE_URL}/api/admin/reviews/{TestReviewCrud.ids[k]}").status_code == 200
        ids = [x['id'] for x in get('/api/public/reviews?limit=50').json()['data']]
        assert TestReviewCrud.ids['draft'] not in ids
        assert s.delete(f"{BASE_URL}/api/admin/reviews/{TestReviewCrud.ids['draft']}").status_code == 404

    def test_activity_log(self, s):
        r = s.get(f"{BASE_URL}/api/admin/activity?entityType=reviews&search=TEST_")
        assert r.status_code == 200, r.text
        acts = {(a['action'], a.get('entityId')) for a in r.json()['data']}
        rid = TestReviewCrud.ids['draft']
        for act in ('create', 'update', 'delete'):
            assert (act, rid) in acts, f"missing {act} in {acts}"


# --- Legal pages, sitemap, 404, redirect ---
def test_privacy_policy():
    r = get('/privacy-policy/')
    assert r.status_code == 200
    assert 'noindex' not in (re.search(r'<meta name="robots" content="([^"]*)"', r.text) or [None, ''])[1]
    assert 'preventandrestorept.com/privacy-policy/' in r.text


def test_terms_noindex():
    r = get('/terms-and-conditions/')
    assert r.status_code == 200
    assert 'legal-draft-notice' in r.text
    m = re.search(r'<meta name="robots" content="([^"]*)"', r.text)
    assert m and 'noindex' in m.group(1)


def test_sitemap():
    r = get('/sitemap.xml')
    assert r.status_code == 200
    assert '/privacy-policy/' in r.text
    assert 'terms-and-conditions' not in r.text


def test_unknown_404():
    assert get('/some-unknown/').status_code == 404


def test_legacy_redirect():
    r = get('/knee-pain/')
    assert r.status_code == 301
    assert '/what-we-treat/knee-pain' in r.headers.get('location', '')
