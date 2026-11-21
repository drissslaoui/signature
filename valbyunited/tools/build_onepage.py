#!/usr/bin/env python3
"""Build a single, self-contained HTML file of the Valby United site.

    python3 tools/build_onepage.py            # writes valby-united-onepage.html

What it does
  * merges the e-sport page (session plan, waiting list, FAQ) into the homepage
  * stores the English text next to the Danish text (data-en / data-en-* attributes),
    so the DA/EN button switches language instantly, without a reload
  * inlines CSS, JavaScript, the font and every image (as WebP data URIs; the crest
    and partner logos losslessly), so the result is one file that works offline

Requires: Python 3.9+, beautifulsoup4, Pillow (with WebP support).
Source of truth stays the regular pages: index.html, esport.html, en/index.html, en/esport.html.
"""
import base64
import io
import os
import re
import sys

from bs4 import BeautifulSoup, Comment, NavigableString, Tag
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "valby-united-onepage.html")

GAMES_FAQ = {
    "da": '<details><summary>Hvilke spil spiller I? <svg class="i"><use href="#i-plus"></use></svg></summary>'
          '<p>Vi starter med EA SPORTS FC og Rocket League — og udvider efter alder og interesse, altid inden for PEGI-aldersgrænserne.</p></details>',
    "en": '<details><summary>Which games do you play? <svg class="i"><use href="#i-plus"></use></svg></summary>'
          '<p>We’re starting with EA SPORTS FC and Rocket League — and will expand based on age and interest, always within PEGI age ratings.</p></details>',
}
LANG_BUTTON = ('<button class="nav-lang" type="button" data-lang-toggle aria-label="Switch to English" title="Switch to English">'
               '<svg class="i i--sm"><use href="#i-globe"></use></svg><span data-lang-label>EN</span></button>')
LANG_GROUP = ('<div class="mobile-menu__lang" role="group" aria-label="Sprog / Language">'
              '<button type="button" data-set-lang="da" aria-pressed="true">Dansk</button>'
              '<button type="button" data-set-lang="en" aria-pressed="false">English</button></div>')
TRANSLATABLE_ATTRS = ["alt", "aria-label", "title", "placeholder", "data-label", "href"]


def read(rel):
    with open(os.path.join(ROOT, rel), encoding="utf-8") as fh:
        return fh.read()


def frag(html):
    return BeautifulSoup(html, "html.parser")


def merged_page(index_rel, esport_rel, lang):
    """Homepage + e-sport content as one page, links turned into in-page anchors."""
    idx_src = read(index_rel).replace('"../assets/', '"assets/')
    es_src = read(esport_rel).replace('"../assets/', '"assets/')
    idx, es = frag(idx_src), frag(es_src)

    session = es.find("section", attrs={"aria-labelledby": "session-title"}).find("div", class_="session")
    signup = es.find("section", id="venteliste")
    faq = es.find("div", class_="faq-layout")
    esec = idx.find("section", id="esport")

    # the "read more" button pointed to the separate e-sport page; everything is on this page now
    for a in esec.find_all("a", href=re.compile(r"^esport\.html$")):
        a.decompose()
    session["class"] = session.get("class", []) + ["esport-session"]
    session["id"] = "esport-traening"
    esec.append(session)
    esec.insert_after(signup)
    faq["class"] = faq.get("class", []) + ["faq-block"]
    signup.append(faq)
    faq.find("div", class_="faq").find_all("details")[1].insert_after(frag(GAMES_FAQ[lang]))

    # language switch: one toggle, identical in both language trees
    idx.find("a", class_="nav-lang").replace_with(frag(LANG_BUTTON))
    idx.find("div", class_="mobile-menu__lang").replace_with(frag(LANG_GROUP))

    for tag in idx.find_all(href=True):
        h = tag["href"]
        if h.startswith(("esport.html#", "index.html#")):
            tag["href"] = "#" + h.split("#", 1)[1]
        elif h == "esport.html":
            tag["href"] = "#esport"
        elif h == "index.html":
            tag["href"] = "#"
    return idx


def direct_text(tag):
    return [str(c).strip() for c in tag.children if isinstance(c, NavigableString) and not isinstance(c, Comment)]


def child_tags(tag):
    return [c for c in tag.children if isinstance(c, Tag)]


def attach_english(da, en, path="body"):
    """Walk the Danish and English trees together and store the English text on the Danish nodes."""
    if da.name != en.name:
        raise SystemExit(f"structure mismatch at {path}: <{da.name}> vs <{en.name}>")
    changed = []
    for attr in TRANSLATABLE_ATTRS:
        a, b = da.get(attr), en.get(attr)
        if isinstance(a, list):
            a = " ".join(a)
        if isinstance(b, list):
            b = " ".join(b)
        if a != b and b is not None:
            da["data-en-" + attr] = b
            changed.append(attr)
    if changed:
        da["data-en-attrs"] = ",".join(changed)
    if da.name in ("script", "style", "svg"):
        return 0
    if direct_text(da) != direct_text(en):
        inner = en.decode_contents()
        if "<img" in inner or "<image" in inner:
            raise SystemExit(f"text swap at {path} would duplicate an image; restructure that element")
        da["data-en"] = inner
        return 1
    ca, cb = child_tags(da), child_tags(en)
    if len(ca) != len(cb):
        raise SystemExit(f"child count mismatch at {path}: {len(ca)} vs {len(cb)}")
    n = 0
    for i, (x, y) in enumerate(zip(ca, cb)):
        n += attach_english(x, y, f"{path} > {x.name}[{i}]")
    return n


_cache = {}


def data_uri(rel):
    if rel in _cache:
        return _cache[rel]
    path = os.path.join(ROOT, rel)
    ext = os.path.splitext(rel)[1].lower()
    if ext in (".jpg", ".jpeg"):
        buf = io.BytesIO()
        Image.open(path).convert("RGB").save(buf, "WEBP", quality=72, method=6)
        uri = "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()
    elif ext == ".png" and "favicon" not in rel:
        buf = io.BytesIO()
        Image.open(path).convert("RGBA").save(buf, "WEBP", lossless=True, method=6)
        uri = "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()
    else:
        mime = {".png": "image/png", ".woff2": "font/woff2"}[ext]
        with open(path, "rb") as fh:
            uri = f"data:{mime};base64," + base64.b64encode(fh.read()).decode()
    _cache[rel] = uri
    return uri


def main():
    da = merged_page("index.html", "esport.html", "da")
    en = merged_page("en/index.html", "en/esport.html", "en")
    swaps = attach_english(da.body, en.body)

    head = da.head
    for sel in ['link[rel="alternate"]', 'link[rel="preload"]', 'link[rel="apple-touch-icon"]',
                'meta[property="og:image"]', 'link[rel="stylesheet"]']:
        for t in head.select(sel):
            t.decompose()

    css = read("assets/css/main.css").replace('url("../fonts/archivo-latin.woff2")',
                                              f'url("{data_uri("assets/fonts/archivo-latin.woff2")}")')
    style = da.new_tag("style")
    style.string = css
    head.append(style)
    boot = da.new_tag("script")
    boot.string = ("try{var q=new URLSearchParams(location.search).get('lang')||localStorage.getItem('vu-lang');"
                   "if(q==='en')document.documentElement.classList.add('lang-pending')}catch(e){}")
    head.append(boot)

    for s in da.body.find_all("script", src=True):
        src = s["src"]
        code = read(src)
        new = da.new_tag("script")
        if src.endswith("data.js"):
            code = "window.VU_CREST=document.querySelector('.brand__crest').src;\n" + code
        new.string = code
        s.replace_with(new)

    html = str(da)
    html = re.sub(r'(src|href)="(assets/img/[^"]+)"', lambda m: f'{m.group(1)}="{data_uri(m.group(2))}"', html)
    html = html.replace('    "logo": "assets/img/brand/crest-512.png",\n', "")
    leftovers = re.findall(r'(?:src|href)="(?:\.\./)?assets/[^"]+"', html)
    if leftovers:
        raise SystemExit(f"un-inlined asset references: {sorted(set(leftovers))[:5]}")
    if not html.lstrip().lower().startswith("<!doctype"):
        html = "<!DOCTYPE html>\n" + html
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write(html)
    print(f"wrote {os.path.relpath(OUT, os.getcwd())}: {len(html.encode()) / 1e6:.2f} MB, "
          f"{swaps} translated text blocks, {len(_cache)} embedded files")


if __name__ == "__main__":
    sys.exit(main())
