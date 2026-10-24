# Seed / cleanup TEST_ reviews for UI testing: python seed_test_reviews.py seed|clean
import os, sys, requests
B = os.environ['REACT_APP_BACKEND_URL'].rstrip('/')
s = requests.Session()
assert s.post(f"{B}/api/auth/login", json={'email': 'test_qa_admin@example.com', 'password': 'TestQaAdmin2026x'}).status_code == 200
if sys.argv[1] == 'seed':
    for name, pub, feat, o in [('TEST_FeatA', True, True, 0), ('TEST_FeatB', True, True, 1), ('TEST_NormC', True, False, 2),
                               ('TEST_NormD', True, False, 3), ('TEST_Hidden', False, True, 4)]:
        r = s.post(f"{B}/api/admin/reviews", json={'reviewerName': name, 'text': f'{name} review text, excellent care.', 'rating': 5,
                                                   'reviewDate': '2025-05-01', 'source': 'Google', 'isPublished': pub, 'isFeatured': feat, 'displayOrder': o})
        print(r.status_code, r.json()['data']['id'], name)
else:
    for row in s.get(f"{B}/api/admin/reviews?limit=100&search=TEST_").json()['data']:
        if row['reviewerName'].startswith('TEST_'):
            print('del', row['id'], s.delete(f"{B}/api/admin/reviews/{row['id']}").status_code)
