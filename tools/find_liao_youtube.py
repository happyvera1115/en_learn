"""Discover title-matched public YouTube readings; retain provenance for review.

Run from repository root. This only reads public search/watch metadata.
It never downloads video or audio.
"""
import concurrent.futures
import json
from pathlib import Path
import re
import urllib.parse
import urllib.request
import unicodedata


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'en-US,en;q=0.9'})
    return urllib.request.urlopen(req, timeout=30).read().decode('utf-8')


def text_of(obj):
    return obj.get('simpleText') or ''.join(r.get('text', '') for r in obj.get('runs', []))


def walk(obj):
    if isinstance(obj, dict):
        if 'videoRenderer' in obj:
            yield obj['videoRenderer']
        for val in obj.values():
            yield from walk(val)
    elif isinstance(obj, list):
        for val in obj:
            yield from walk(val)


def norm(s):
    s = unicodedata.normalize('NFKD', s).lower().replace('’', "'")
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()


def find(title):
    try:
        query = title + ' book read aloud'
        raw = fetch('https://www.youtube.com/results?hl=en&search_query=' + urllib.parse.quote(query))
        match = re.search(r'var ytInitialData = (.*?);</script>', raw)
        data = json.loads(match.group(1))
        candidates = []
        for v in walk(data):
            name = text_of(v.get('title', {}))
            nt = norm(title)
            nn = norm(name)
            words = set(nt.split()) - {'a', 'the', 'of', 'in', 'on', 'and', 'to', 'i', 'am', 'is'}
            coverage = len(words & set(nn.split())) / max(1, len(words))
            score = coverage * 10 + (8 if nt in nn else 0)
            score += 3 if any(x in nn for x in ['read aloud', 'read along', 'readaloud', 'storytime']) else 0
            score -= 12 if any(x in nn for x in ['review', 'unboxing', 'summary', 'trailer']) else 0
            candidates.append({'id': v['videoId'], 'title': name, 'channel': text_of(v.get('ownerText', {})), 'duration': text_of(v.get('lengthText', {})), 'score': round(score, 2), 'coverage': coverage})
        candidates.sort(key=lambda v: v['score'], reverse=True)
        return title, candidates[:4]
    except Exception as exc:
        return title, {'error': str(exc)}


if __name__ == '__main__':
    source = Path('liao_data.js').read_text(encoding='utf-8')
    data = json.loads(source[source.index('=') + 1:].strip().rstrip(';'))
    titles = list(dict.fromkeys(b['title'] for lv in data['levels'] for w in lv['weeks'] for b in w.get('books', [])))
    out = Path('tools/liao_youtube_candidates.json')
    result = json.loads(out.read_text(encoding='utf-8')) if out.exists() else {}
    pending = [t for t in titles if not result.get(t) or isinstance(result.get(t), dict)]
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for title, candidates in pool.map(find, pending):
            result[title] = candidates
            out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
            top = candidates[0]['title'] if isinstance(candidates, list) and candidates else str(candidates)
            print(title + ' => ' + top, flush=True)
