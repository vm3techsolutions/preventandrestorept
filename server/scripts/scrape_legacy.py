"""Pulls verified legacy content from preventandrestorept.com (WordPress REST API) into prisma/seed-data/legacy.json."""
import json
import os
import re
import urllib.request
from bs4 import BeautifulSoup, NavigableString, Tag

BASE = "https://www.preventandrestorept.com"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "prisma", "seed-data", "legacy.json")
IMG_DIR = os.path.join(ROOT, "uploads", "legacy")
UA = {"User-Agent": "Mozilla/5.0 (seed-script)"}
ALLOWED_INLINE = {"strong", "b", "em", "i", "a", "br", "u"}
STOP_PATTERNS = [re.compile(r"what other people", re.I), re.compile(r"see more 5-star", re.I)]
DISCLAIMER = re.compile(r"^disclaimer|not a substitute for professional medical advice", re.I)


def get_json(path):
    req = urllib.request.Request(BASE + path, headers=UA)
    with urllib.request.urlopen(req, timeout=40) as r:
        return json.loads(r.read().decode("utf-8"))


def download(url):
    os.makedirs(IMG_DIR, exist_ok=True)
    name = re.sub(r"[^a-zA-Z0-9._-]", "-", url.split("/")[-1].split("?")[0])
    dest = os.path.join(IMG_DIR, name)
    if not os.path.exists(dest):
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=40) as r, open(dest, "wb") as f:
            f.write(r.read())
    return f"/api/uploads/legacy/{name}"


def clean_inline(el):
    soup = BeautifulSoup(str(el), "html.parser")
    for t in soup.find_all(True):
        if t.name not in ALLOWED_INLINE:
            t.unwrap()
        else:
            href = t.get("href") if t.name == "a" else None
            t.attrs = {"href": href} if href else {}
    html = re.sub(r"\s+", " ", soup.decode_contents()).replace("\xa0", " ").strip()
    return html


def text_of(el):
    return re.sub(r"\s+", " ", el.get_text(" ", strip=True)).replace("\xa0", " ").strip()


def para_block(html, txt):
    if DISCLAIMER.search(txt):
        return {"type": "disclaimer", "data": {"text": txt}}
    return {"type": "paragraph", "data": {"html": html}}


def flow_blocks(container):
    """Classic WP HTML (blog posts / text-editor widgets)."""
    blocks = []
    for el in container.children:
        if isinstance(el, NavigableString):
            t = str(el).strip()
            if t:
                blocks.append(para_block(t, t))
            continue
        if not isinstance(el, Tag):
            continue
        txt = text_of(el)
        if el.name in ("h1",):
            continue
        if re.match(r"h[2-6]", el.name or ""):
            if txt:
                blocks.append({"type": "heading", "data": {"level": 2 if el.name == "h2" else 3, "text": txt}})
        elif el.name == "p":
            for img in el.find_all("img"):
                blocks.append(image_block(img))
            html = clean_inline(el)
            if txt and txt != "&nbsp;":
                blocks.append(para_block(html, txt))
        elif el.name in ("ul", "ol"):
            items = [clean_inline(li) for li in el.find_all("li", recursive=False) if text_of(li)]
            if items:
                blocks.append({"type": "list", "data": {"style": "ordered" if el.name == "ol" else "unordered", "items": items}})
        elif el.name == "blockquote":
            blocks.append({"type": "quote", "data": {"text": txt, "cite": ""}})
        elif el.name == "img":
            blocks.append(image_block(el))
        elif el.name in ("div", "section", "figure"):
            blocks.extend(flow_blocks(el))
    return blocks


def image_block(img):
    src = img.get("data-src") or img.get("src")
    return {"type": "image", "data": {"url": download(src), "alt": img.get("alt", "").strip(), "caption": "", "sourceUrl": src}}


def elementor_blocks(html):
    soup = BeautifulSoup(html, "html.parser")
    blocks = []
    for w in soup.select("div.elementor-widget"):
        kind = (w.get("data-widget_type") or "").split(".")[0]
        if kind == "heading":
            h = w.find(re.compile(r"h[1-6]"))
            if not h:
                continue
            txt = text_of(h)
            if any(p.search(txt) for p in STOP_PATTERNS):
                break
            if h.name == "h1":
                continue
            blocks.append({"type": "heading", "data": {"level": 2 if h.name == "h2" else 3, "text": txt}})
        elif kind == "text-editor":
            inner = w.select_one(".elementor-widget-container") or w
            blocks.extend(flow_blocks(inner))
        elif kind == "image":
            img = w.find("img")
            if img:
                blocks.append(image_block(img))
        elif kind == "button":
            a = w.find("a")
            if a and text_of(a):
                href = a.get("href", "")
                if href.startswith(BASE):
                    href = href[len(BASE):] or "/"
                blocks.append({"type": "cta", "data": {"heading": "", "text": "", "buttonLabel": text_of(a), "buttonUrl": href}})
        elif kind == "icon-list":
            items = [text_of(li) for li in w.select("li") if text_of(li)]
            if items:
                blocks.append({"type": "list", "data": {"style": "unordered", "items": items}})
    return blocks


def scrape_blogs():
    slugs = [
        "shoulder-impingement-causes-symptoms-and-how-expert-physical-therapy-can-help-you-move-freely-again",
        "your-it-band-may-not-be-the-actual-problem-uncovering-the-real-cause-of-your-knee-or-thigh-pain",
    ]
    out = []
    for s in slugs:
        p = get_json(f"/wp-json/wp/v2/posts?slug={s}&_embed")[0]
        soup = BeautifulSoup(p["content"]["rendered"], "html.parser")
        blocks = flow_blocks(soup)
        intro = None
        if blocks and blocks[0]["type"] == "paragraph":
            intro = BeautifulSoup(blocks.pop(0)["data"]["html"], "html.parser").get_text()
        terms = [t for g in p["_embedded"].get("wp:term", []) for t in g]
        media = p["_embedded"].get("wp:featuredmedia") or []
        featured = None
        if media and media[0].get("source_url"):
            featured = {"url": download(media[0]["source_url"]), "alt": media[0].get("alt_text", "")}
        out.append({
            "title": BeautifulSoup(p["title"]["rendered"], "html.parser").get_text(),
            "slug": p["slug"],
            "publishedAt": p["date"],
            "author": p["_embedded"]["author"][0]["name"],
            "excerpt": BeautifulSoup(p["excerpt"]["rendered"], "html.parser").get_text().strip(),
            "introduction": intro,
            "featuredImage": featured,
            "categories": [t["name"] for t in terms if t.get("taxonomy") == "category"],
            "tags": [t["name"] for t in terms if t.get("taxonomy") == "post_tag"],
            "legacyPath": f"/{p['slug']}/",
            "blocks": blocks,
        })
    return out


def scrape_services():
    p = get_json("/wp-json/wp/v2/pages?slug=physical-therapy-services")[0]
    blocks = elementor_blocks(p["content"]["rendered"])
    names = ["Manual Therapy", "Functional Dry Needling", "Blood Flow Restriction Therapy", "Cupping",
             "Functional Movement Screening", "Exercise Performance and Programming", "Pain Prevention Seminars"]
    services = []
    for i, b in enumerate(blocks):
        if b["type"] == "heading" and b["data"]["text"] in names:
            body = []
            for nb in blocks[i + 1:]:
                if nb["type"] != "paragraph":
                    break
                body.append(nb)
            short = BeautifulSoup(body[0]["data"]["html"], "html.parser").get_text() if body else ""
            services.append({"title": b["data"]["text"], "shortDescription": short, "blocks": body})
    return services


CONDITIONS = [
    ("Back & Sciatica Pain", "back-sciatica-pain", True), ("Shoulder & Neck Pain", "shoulder-neck-pain", True),
    ("Knee Pain", "knee-pain", True), ("Foot & Ankle Pain", "foot-ankle-pain", True),
    ("Sports Injuries", "sports-injuries", True), ("Tennis Elbow", "tennis-elbow", False),
    ("Golfer's Elbow", "golfers-elbow", False), ("Tendinopathy", "tendinopathy", False),
    ("Numbness and Tingling", "numbness-and-tingling", False), ("Headaches", "headaches", False),
    ("Jaw Pain", "jaw-pain", False), ("Plantar Fasciitis", "plantar-fasciitis", False),
    ("Posterior Tibialis Dysfunction", "posterior-tibialis-dysfunction", False),
]


def scrape_conditions():
    other = get_json("/wp-json/wp/v2/pages?slug=other-conditions")[0]
    other_blocks = [b for b in elementor_blocks(other["content"]["rendered"]) if b["type"] in ("heading", "paragraph", "cta")]
    cut = next((i for i, b in enumerate(other_blocks) if b["type"] == "heading" and b["data"]["text"] == "What We Treat"), len(other_blocks))
    other_blocks = other_blocks[:cut]
    out = []
    for title, slug, has_page in CONDITIONS:
        if has_page:
            p = get_json(f"/wp-json/wp/v2/pages?slug={slug}")[0]
            blocks = elementor_blocks(p["content"]["rendered"])
            featured = None
            if blocks and blocks[0]["type"] == "image":
                img = blocks.pop(0)["data"]
                featured = {"url": img["url"], "alt": img["alt"] or title}
            first_p = next((b for b in blocks if b["type"] == "paragraph"), None)
            short = BeautifulSoup(first_p["data"]["html"], "html.parser").get_text() if first_p else ""
            out.append({"title": title, "slug": slug, "legacyPath": f"/{slug}/", "hasDedicatedPage": True,
                        "featuredImage": featured, "shortDescription": short, "blocks": blocks})
        else:
            out.append({"title": title, "slug": slug, "legacyPath": None, "hasDedicatedPage": False,
                        "featuredImage": None, "shortDescription": "",
                        "blocks": [{"type": "heading", "data": {"level": 2, "text": title}}] + other_blocks})
    return out


if __name__ == "__main__":
    data = {"source": BASE, "blogs": scrape_blogs(), "services": scrape_services(), "conditions": scrape_conditions()}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("blogs", len(data["blogs"]), "services", len(data["services"]), "conditions", len(data["conditions"]))
    for c in data["conditions"]:
        print(c["slug"], len(c["blocks"]), bool(c["featuredImage"]))
    for b in data["blogs"]:
        print(b["slug"][:40], len(b["blocks"]), b["categories"], b["tags"])
