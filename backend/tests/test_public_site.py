# Public Next.js site (Part 2): status codes, redirects, SEO metadata, sitemap/robots, CMS dynamic pages
import os
import re
import subprocess
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')
SITE = 'https://www.preventandrestorept.com'
QA_EMAIL = 'test_qa_admin@example.com'
QA_PW = 'TestQaAdmin2026x'


def get(path, **kw):
    return requests.get(f"{BASE_URL}{path}", allow_redirects=False, timeout=60, **kw)


# --- Static pages + SEO ---
STATIC = ['/', '/about-us/', '/services/', '/what-we-treat/', '/blogs/', '/contact/',
          '/services/functional-dry-needling/', '/what-we-treat/knee-pain/']


def head_meta(html):
    title = re.search(r'<title>(.*?)</title>', html, re.S)
    desc = re.search(r'<meta name="description" content="([^"]*)"', html)
    canon = re.search(r'<link rel="canonical" href="([^"]*)"', html)
    og_title = re.search(r'<meta property="og:title" content="([^"]*)"', html)
    og_url = re.search(r'<meta property="og:url" content="([^"]*)"', html)
    return {k: (v.group(1) if v else None) for k, v in
            dict(title=title, desc=desc, canon=canon, og_title=og_title, og_url=og_url).items()}


class TestStaticSeo:
    titles = {}

    @pytest.mark.parametrize('path', STATIC)
    def test_page_seo(self, path):
        r = get(path)
        assert r.status_code == 200
        m = head_meta(r.text)
        assert m['title'], f"no title on {path}"
        assert m['desc'], f"no description on {path}"
        assert m['canon'] == f"{SITE}{path}", f"canonical {m['canon']} on {path}"
        assert m['og_title'] and m['og_url'] == f"{SITE}{path}"
        assert m['title'] not in TestStaticSeo.titles.values(), f"duplicate title {m['title']}"
        TestStaticSeo.titles[path] = m['title']

    def test_no_reviews_in_nav(self):
        r = get('/')
        assert 'href="/reviews' not in r.text


# --- 404s ---
@pytest.mark.parametrize('path', ['/services/does-not-exist/', '/what-we-treat/nope/', '/blogs/nope/',
                                  '/some-random-slug/'])
def test_404(path):
    r = get(path)
    assert r.status_code == 404
    assert 'not-found-page' in r.text


# --- Redirects ---
@pytest.mark.parametrize('src,dst', [
    ('/back-sciatica-pain/', '/what-we-treat/back-sciatica-pain/'),
    ('/shoulder-neck-pain/', '/what-we-treat/shoulder-neck-pain/'),
    ('/knee-pain/', '/what-we-treat/knee-pain/'),
    ('/sports-injuries/', '/what-we-treat/sports-injuries/'),
    ('/foot-ankle-pain/', '/what-we-treat/foot-ankle-pain/'),
    ('/request-appointment/', '/contact/'),
    ('/blog/some-post/', '/blogs/some-post/'),
])
def test_redirect(src, dst):
    r = get(src)
    assert r.status_code == 301, f"{src} -> {r.status_code}"
    assert r.headers['location'].endswith(dst), r.headers['location']


# --- sitemap / robots ---
def test_sitemap():
    r = get('/sitemap.xml')
    assert r.status_code == 200
    locs = re.findall(r'<loc>(.*?)</loc>', r.text)
    for p in ['/', '/about-us/', '/services/', '/what-we-treat/', '/blogs/', '/contact/']:
        assert f"{SITE}{p}" in locs, p
    pub_blogs = requests.get(f"{BASE_URL}/api/public/blogs").json()['data']
    for b in pub_blogs:
        assert f"{SITE}/blogs/{b['slug']}/" in locs
    pub_srv = requests.get(f"{BASE_URL}/api/public/services").json()['data']
    for s in pub_srv:
        assert f"{SITE}/services/{s['slug']}/" in locs
    assert all(l.startswith(SITE) for l in locs)
    # only published blogs
    assert len([l for l in locs if '/blogs/' in l and l != f"{SITE}/blogs/"]) == len(pub_blogs)


def test_robots():
    r = get('/robots.txt')
    assert r.status_code == 200
    assert 'Disallow: /admin/' in r.text and 'Disallow: /api/' in r.text
    assert f"{SITE}/sitemap.xml" in r.text


# --- CMS dynamic page create/publish/render/delete ---
@pytest.fixture(scope='module')
def admin():
    subprocess.run(['node', 'scripts/admin-cli.js', 'create', QA_EMAIL, QA_PW, 'TEST', 'QA', 'Admin'],
                   cwd='/app/server', capture_output=True)
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={'email': QA_EMAIL, 'password': QA_PW})
    if r.status_code != 200:
        pytest.skip(f"login failed {r.status_code} {r.text}")
    yield s


def test_cms_page_lifecycle(admin):
    slug = f"test-page-{uuid.uuid4().hex[:6]}"
    r = admin.post(f"{BASE_URL}/api/admin/pages", json={
        'title': 'TEST_ Dynamic Page', 'slug': slug, 'excerpt': 'TEST excerpt',
        'content': [{'type': 'heading', 'data': {'level': 2, 'text': 'TEST heading'}},
                    {'type': 'paragraph', 'data': {'html': 'TEST paragraph body'}}],
        'seoTitle': 'TEST_ Dynamic Page SEO', 'seoDescription': 'TEST desc'})
    assert r.status_code in (200, 201), r.text
    pid = (r.json().get('data') or r.json())['id']
    try:
        assert get(f"/{slug}/").status_code == 404  # draft not public
        p = admin.post(f"{BASE_URL}/api/admin/pages/{pid}/publish")
        assert p.status_code == 200, p.text
        import time
        ok = None
        for _ in range(8):
            ok = get(f"/{slug}/")
            if ok.status_code == 200:
                break
            time.sleep(5)
        assert ok.status_code == 200, f"published page status {ok.status_code}"
        assert 'cms-page' in ok.text and 'TEST paragraph body' in ok.text
        assert f'<link rel="canonical" href="{SITE}/{slug}/"' in ok.text
    finally:
        admin.delete(f"{BASE_URL}/api/admin/pages/{pid}")


def test_reserved_slug_rejected_or_not_overriding(admin):
    r = admin.post(f"{BASE_URL}/api/admin/pages", json={'title': 'TEST_ reserved', 'slug': 'contact',
                                                       'content': []})
    if r.status_code in (200, 201):
        pid = (r.json().get('data') or r.json())['id']
        admin.post(f"{BASE_URL}/api/admin/pages/{pid}/publish")
        html = get('/contact/').text
        admin.delete(f"{BASE_URL}/api/admin/pages/{pid}")
        assert 'ghl-form-iframe' in html
    else:
        assert r.status_code in (400, 409, 422)


# --- Blog filters (category/tag chips) with TEST_ taxonomy, then cleanup ---
def test_blog_filters(admin):
    import time
    uid = uuid.uuid4().hex[:5]
    cat = admin.post(f"{BASE_URL}/api/admin/categories", json={'name': f'TEST Cat {uid}'})
    tag = admin.post(f"{BASE_URL}/api/admin/tags", json={'name': f'TEST Tag {uid}'})
    assert cat.status_code in (200, 201) and tag.status_code in (200, 201), cat.text + tag.text
    cat, tag = cat.json()['data'], tag.json()['data']
    b = admin.post(f"{BASE_URL}/api/admin/blogs", json={'title': f'TEST_Filter Blog {uid}', 'categoryIds': [cat['id']],
                                                       'tagIds': [tag['id']], 'blocks': [
                                                           {'type': 'paragraph', 'data': {'html': 'TEST filter body'}}]})
    assert b.status_code == 201, b.text
    bid = b.json()['data']['id']
    try:
        assert admin.post(f"{BASE_URL}/api/admin/blogs/{bid}/publish").status_code == 200
        html = ''
        for _ in range(14):
            html = get('/blogs/').text
            if f"blog-filter-category-{cat['slug']}" in html:
                break
            time.sleep(5)
        assert f"blog-filter-category-{cat['slug']}" in html, 'category chip not shown'
        assert f"blog-filter-tag-{tag['slug']}" in html, 'tag chip not shown'
        h = get(f"/blogs/?category={cat['slug']}").text
        assert h.count('data-testid="blog-card-') == 1 and f'TEST_Filter Blog {uid}' in h
        h = get(f"/blogs/?tag={tag['slug']}").text
        assert h.count('data-testid="blog-card-') == 1
    finally:
        admin.put(f"{BASE_URL}/api/admin/blogs/{bid}", json={'title': f'TEST_Filter Blog {uid}', 'categoryIds': [], 'tagIds': []})
        admin.delete(f"{BASE_URL}/api/admin/blogs/{bid}")
        admin.delete(f"{BASE_URL}/api/admin/categories/{cat['id']}")
        admin.delete(f"{BASE_URL}/api/admin/tags/{tag['id']}")
