/* Shared, dependency-free playlist helpers. */
window.LiaoYoutube = (() => {
  function parseVideoId(value) {
    const text = String(value || '').trim();
    if (/^[A-Za-z0-9_-]{11}$/.test(text)) return text;
    try {
      const url = new URL(text);
      if (!['https:', 'http:'].includes(url.protocol)) return null;
      const host = url.hostname.toLowerCase();
      let id;
      if (host === 'youtu.be') {
        if (!/^\/[A-Za-z0-9_-]{11}\/?$/.test(url.pathname)) return null;
        id = url.pathname.split('/')[1];
      } else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host)) {
        if (url.pathname === '/watch') id = url.searchParams.get('v');
        else if (/^\/(embed|shorts|live)\/[A-Za-z0-9_-]{11}\/?$/.test(url.pathname)) id = url.pathname.split('/')[2];
      }
      return /^[A-Za-z0-9_-]{11}$/.test(id || '') ? id : null;
    } catch { return null; }
  }
  function weeklyBooks(week) {
    return week.review ? (week.reviewOf || []).flatMap(w => w.books || []) : (week.books || []);
  }
  function buildQueue(books, defaults, overrides) {
    return books.flatMap(book => {
      const id = parseVideoId(overrides[book.title] || defaults[book.title]?.id);
      return id ? [{ book, id }] : [];
    });
  }
  function nextIndex(index, length, repeat, auto) {
    if (!length) return -1;
    if (auto && repeat === 'one') return index;
    if (index + 1 < length) return index + 1;
    return auto && repeat === 'off' ? -1 : 0;
  }
  return { parseVideoId, weeklyBooks, buildQueue, nextIndex };
})();
