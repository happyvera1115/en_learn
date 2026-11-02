"""Check selected videos' public watch metadata and embed flag; no media download."""
import concurrent.futures
import json
from pathlib import Path
import re
from find_liao_youtube import fetch


def verify(entry):
    title, video = entry
    try:
        raw = fetch('https://www.youtube.com/watch?v=' + video['id'])
        match = re.search(r'var ytInitialPlayerResponse\s*=\s*', raw)
        player = json.JSONDecoder().raw_decode(raw[match.end():])[0]
        status = player.get('playabilityStatus', {})
        details = player.get('videoDetails', {})
        return title, {**video, 'title': details.get('title', video['title']),
                       'channel': details.get('author', video['channel']),
                       'status': status.get('status'), 'embeddable': status.get('playableInEmbed', False),
                       'description': details.get('shortDescription', '')[:1000],
                       'checkedOn': '2026-11-03'}
    except Exception as exc:
        return title, {**video, 'status': 'CHECK_FAILED', 'error': str(exc)}


if __name__ == '__main__':
    path = Path('liao_youtube_data.js')
    text = path.read_text(encoding='utf-8')
    selected = json.loads(text[text.index('=')+1:].strip().rstrip(';'))
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        checked = dict(pool.map(verify, selected.items()))
    Path('tools/liao_youtube_verification.json').write_text(json.dumps(checked,ensure_ascii=False,indent=2),encoding='utf-8')
    problems = {t:v.get('status') for t,v in checked.items() if v.get('status') != 'OK' or not v.get('embeddable')}
    print(json.dumps({'total':len(checked), 'problems':problems},ensure_ascii=False))
