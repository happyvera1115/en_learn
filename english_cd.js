'use strict';

function isExcludedTrack(path) {
  return /my[\s_-]+very[\s_-]+first[\s_-]+mother[\s_-]+goose|\bgoose[\s_-]*ch(?:apter)?[\s_-]*\d/i.test(path);
}

function nextTrack(albums, current, mode) {
  const { album, track } = current;
  if (track + 1 < albums[album].tracks.length) return { album, track: track + 1 };
  if (mode === 'album') return { album, track: 0 };
  if (album + 1 < albums.length) return { album: album + 1, track: 0 };
  return mode === 'all' ? { album: 0, track: 0 } : null;
}

function localAlbums(files) {
  const groups = new Map();
  const order = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
  for (const file of files) {
    if (!/\.mp3$/i.test(file.name) || isExcludedTrack(file.webkitRelativePath || file.name)) continue;
    const folders = file.webkitRelativePath.split('/').slice(1, -1);
    const album = folders.shift() || '';
    if (!groups.has(album)) groups.set(album, { name: album || '根目錄音軌', tracks: [] });
    groups.get(album).tracks.push({ name: file.name.replace(/\.mp3$/i, ''), disc: folders.join(' / '), file });
  }
  const albums = [...groups.values()].sort((a, b) => order.compare(a.name, b.name));
  for (const album of albums) album.tracks.sort((a, b) => order.compare(a.disc, b.disc) || order.compare(a.name, b.name));
  return albums;
}

function cdWeeks(levels) {
  return levels.flatMap(level => {
    let pending = [];
    let review = [];
    return level.weeks.map(week => {
      if (week.review && pending.length) {
        review = pending;
        pending = [];
      }
      if (!week.review) pending.push(...(week.books || []));
      return {
        key: `${level.level}-${week.week}`,
        label: `Year ${level.year} · 第 ${week.week} 週${week.review ? ' · 複習週' : ''}`,
        books: week.review ? review : (week.books || []),
      };
    });
  });
}

const titleKey = title => title.toLowerCase().normalize('NFKC').replace(/[^a-z0-9]/g, '');
const cdAliases = {
  brownbearbrownbearwhatdoyousee: ['Brown Bear'],
  fivelittlemonkeysjumpingonthebed: ['Five Little Monkeys Jumping On The Bed Eileen Christelow'],
  fivelittlemeninaflyingsaucer: ['Five Little Men'],
  greeneggsandham: ['Green Eggs and Ham Jason Alexander'],
  apeinacapeanalphabetofoddanimals: ['Ape in A ape An Alphabet of Odd Animals'],
  sheepinajeep: ['Sheep in A Jeep Nancy Shaw'],
  rosieswalk: ['Rosie s Walk Pat Hutchins'],
  todayismonday: ['Today is Monday by Eric Carle music', 'Today is Monday by Eric Carle Read Aloud'],
  hattieandthefox: ['Hattie and the Fox Mem Fox and Paperdoll Patrol', 'Hattie and the Fox JYBOOKS'],
};

function weeklyAlbums(books, local) {
  const missing = [];
  const albums = [];
  for (const book of books) {
    if (isExcludedTrack(book.title)) continue;
    let tracks;
    if (local) {
      const key = titleKey(book.title);
      const titles = new Set([key, ...(cdAliases[key] || []).map(titleKey)]);
      for (const album of local) {
        const matches = album.tracks.filter(track => {
          const folders = [album.name, ...track.disc.split(' / ')];
          const trackTitle = titleKey(track.name.replace(/^\d+[\s._-]+/, ''));
          if (book.note?.includes('可能放錯') && ['wilt', 'longwaytoclimb'].includes(trackTitle)) return false;
          return folders.some(folder => titles.has(titleKey(folder))) ||
            titles.has(trackTitle);
        });
        if (matches.length) {
          tracks = matches;
          break;
        }
      }
    } else if (!book.note?.includes('可能放錯')) {
      tracks = (book.tracks || []).filter(track => track.id && !isExcludedTrack(track.name));
    }
    if (tracks?.length) albums.push({ name: book.title, id: local ? undefined : book.folder, tracks });
    else missing.push(book.title);
  }
  return { albums, missing };
}

// Save the parsed album structure because a stored File need not retain webkitRelativePath.
function storedAlbums(albums) {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open('english-cd-local', 1);
    open.onupgradeneeded = () => open.result.createObjectStore('library');
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction('library', albums ? 'readwrite' : 'readonly');
      const store = tx.objectStore('library');
      const request = albums ? store.put(albums, 'albums') : store.get('albums');
      tx.oncomplete = () => { db.close(); resolve(request.result); };
      tx.onabort = () => { db.close(); reject(tx.error); };
    };
  });
}

if (typeof module !== 'undefined') module.exports = { nextTrack, localAlbums, isExcludedTrack, cdWeeks, weeklyAlbums };

if (typeof window !== 'undefined') {
  let albums = window.ENGLISH_CD;
  const $ = id => document.getElementById(id);
  const audio = $('audio');
  const weeks = cdWeeks(window.LIAO_DATA.levels);
  const params = new URLSearchParams(window.location.search);
  const readSetting = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  };
  const saveSetting = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  };
  let localLibrary;
  let useLocal = params.get('play') === 'local' || readSetting('cd:source', 'local') === 'local';
  let playRequested = params.get('play') === 'local';
  let current, objectUrl, failed = 0, generation = 0;

  function populate() {
    $('album').replaceChildren(...albums.map((a, i) => new Option(`${a.name}（${a.tracks.length} 軌）`, i)));
    render();
  }

  function render() {
    const index = Number($('album').value);
    const album = albums[index];
    if (!album) {
      $('folder').hidden = true;
      $('tracks').replaceChildren();
      return;
    }
    $('folder').hidden = !album.id;
    if (album.id) $('folder').href = `https://drive.google.com/drive/folders/${encodeURIComponent(album.id)}`;
    $('tracks').replaceChildren(...album.tracks.map((track, i) => {
      const li = document.createElement('li');
      const button = document.createElement('button');
      button.textContent = track.disc ? `${track.disc} · ${track.name}` : track.name;
      if (current?.album === index && current.track === i) button.setAttribute('aria-current', 'true');
      button.onclick = () => { failed = 0; play({ album: index, track: i }); };
      li.append(button);
      return li;
    }));
  }

  function play(position, message = '') {
    const request = ++generation;
    current = position;
    const album = albums[position.album];
    const track = album.tracks[position.track];
    $('album').value = String(position.album);
    $('now').textContent = `${album.name} · ${track.name}`;
    $('position').textContent = `${track.disc ? track.disc + ' · ' : ''}第 ${position.track + 1} / ${album.tracks.length} 軌`;
    $('file').hidden = !track.id;
    if (track.id) $('file').href = `https://drive.google.com/file/d/${encodeURIComponent(track.id)}/view`;
    $('status').textContent = message;
    render();
    const previousUrl = objectUrl;
    objectUrl = track.file ? URL.createObjectURL(track.file) : undefined;
    audio.src = objectUrl || `https://drive.usercontent.google.com/download?id=${encodeURIComponent(track.id)}&export=download`;
    if (previousUrl) URL.revokeObjectURL(previousUrl);
    audio.play().catch(error => {
      if (request === generation && error.name === 'NotAllowedError') $('status').textContent = '請按播放器上的播放鍵繼續。';
    });
  }

  function advance(message = '') {
    if (!current) return;
    const next = nextTrack(albums, current, $('mode').value);
    if (next) play(next, message);
    else $('status').textContent = message || '已播完最後一個專輯。';
  }

  $('album').onchange = render;
  function refreshPlaylist() {
    generation++;
    current = undefined;
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = undefined;
    const localSource = useLocal ? localLibrary || [] : undefined;
    const week = weeks.find(entry => entry.key === $('week').value);
    const playlist = week ? weeklyAlbums(week.books, localSource) : null;
    albums = playlist ? playlist.albums : (localSource || window.ENGLISH_CD);
    $('mode').disabled = !!week;
    $('mode').options[0].textContent = week ? '當週書單循環' : '全部專輯循環';
    $('mode').value = week ? 'all' : albumMode;
    $('start').disabled = !albums.length;
    $('album').disabled = !albums.length;
    $('week-status').textContent = playlist
      ? `${week.label} · ${albums.length} 本 · ${albums.reduce((sum, album) => sum + album.tracks.length, 0)} 軌${playlist.missing.length ? '。缺少對應音檔：' + playlist.missing.join('、') : ''}`
      : '';
    $('online').textContent = useLocal ? '切到 Drive 音檔' : '切到本機 MP3';
    $('file').hidden = true;
    $('now').textContent = '尚未播放';
    $('position').textContent = $('status').textContent = '';
    $('source').textContent = useLocal
      ? (localLibrary ? `本機歌單已載入，共 ${localLibrary.reduce((n, a) => n + a.tracks.length, 0)} 軌。` : '請選擇手機上已解壓的 English_CD 資料夾。')
      : '目前使用 Drive 線上音檔。';
    populate();
  }
  $('local').onchange = async event => {
    const files = event.target.files;
    if (!files.length) return;
    const local = localAlbums(files);
    event.target.value = '';
    if (!local.length) $('source').textContent = '這個資料夾沒有可加入的 MP3，請選擇解壓後的 English_CD 資料夾。';
    else {
      localLibrary = local;
      useLocal = true;
      saveSetting('cd:source', 'local');
      refreshPlaylist();
      startRequestedPlaylist();
      $('library-status').textContent = '正在儲存本機歌單…';
      try {
        await storedAlbums(local);
        if (localLibrary === local) $('library-status').textContent = '本機歌單已儲存，下次開啟會自動載入。';
        window.navigator?.storage?.persist?.().catch(() => {});
      } catch {
        if (localLibrary === local) $('library-status').textContent = '這次可播放，但瀏覽器無法儲存歌單。請檢查可用空間後再選一次。';
      }
    }
  };
  $('online').onclick = () => {
    useLocal = !useLocal;
    playRequested = false;
    saveSetting('cd:source', useLocal ? 'local' : 'drive');
    refreshPlaylist();
  };
  $('start').onclick = () => {
    if (!albums.length) return;
    rememberWeek();
    failed = 0;
    play({ album: Number($('album').value), track: 0 });
  };
  $('next').onclick = () => { failed = 0; advance(); };
  $('prev').onclick = () => {
    if (!current) return;
    failed = 0;
    if (current.track > 0) return play({ album: current.album, track: current.track - 1 });
    if (current.album > 0 && $('mode').value !== 'album') {
      const album = current.album - 1;
      return play({ album, track: albums[album].tracks.length - 1 });
    }
    play(current);
  };
  audio.onplaying = () => { failed = 0; };
  audio.onended = () => advance();
  audio.onerror = () => {
    if (!current) return;
    const limit = $('mode').value === 'album' ? albums[current.album].tracks.length : albums.reduce((n, a) => n + a.tracks.length, 0);
    if (++failed >= Math.min(limit, 5)) {
      $('status').textContent = useLocal
        ? '連續無法讀取音軌，已停止。請重新選取本機資料夾，或選其他專輯重試。'
        : 'Drive 音軌無法在此頁播放。請選擇已下載的本機 MP3 資料夾。';
      return;
    }
    advance('上一軌無法讀取，已嘗試跳到下一軌。');
  };
  const weekSelect = $('week');
  weekSelect.replaceChildren(...weeks.map(week => new Option(week.label, week.key)), new Option('全部專輯', ''));
  const requestedWeek = params.get('week');
  const validWeek = key => weeks.some(week => week.key === key);
  const savedWeek = readSetting('liao:lastWeek', weeks[0]?.key);
  weekSelect.value = validWeek(requestedWeek) ? requestedWeek
    : readSetting('cd:allAlbums', false) ? ''
    : validWeek(savedWeek) ? savedWeek : weeks[0]?.key || '';
  let albumMode = readSetting('cd:mode', 'all');
  if (!['all', 'album', 'once'].includes(albumMode)) albumMode = 'all';
  $('mode').onchange = () => {
    albumMode = $('mode').value;
    saveSetting('cd:mode', albumMode);
  };
  function rememberWeek() {
    saveSetting('cd:allAlbums', !weekSelect.value);
    if (weekSelect.value) saveSetting('liao:lastWeek', weekSelect.value);
  }
  function startRequestedPlaylist() {
    if (!playRequested || !albums.length) return;
    playRequested = false;
    $('start').onclick();
  }
  weekSelect.onchange = () => {
    playRequested = false;
    rememberWeek();
    refreshPlaylist();
  };
  refreshPlaylist();
  storedAlbums().then(saved => {
    if (!localLibrary && saved?.length) {
      localLibrary = saved;
      if (useLocal) {
        refreshPlaylist();
        startRequestedPlaylist();
      }
    }
  }).catch(() => {});
}
