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

if (typeof module !== 'undefined') module.exports = { nextTrack, localAlbums, isExcludedTrack };

if (typeof window !== 'undefined') {
  let albums = window.ENGLISH_CD;
  const $ = id => document.getElementById(id);
  const audio = $('audio');
  let current, objectUrl, failed = 0, generation = 0;

  function populate() {
    $('album').replaceChildren(...albums.map((a, i) => new Option(`${a.name}（${a.tracks.length} 軌）`, i)));
    render();
  }

  function render() {
    const index = Number($('album').value);
    const album = albums[index];
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
  function switchSource(next, local) {
    generation++;
    current = undefined;
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = undefined;
    albums = next;
    $('online').hidden = !local;
    $('file').hidden = true;
    $('now').textContent = '尚未播放';
    $('position').textContent = $('status').textContent = '';
    $('source').textContent = local ? `已載入本機資料夾，共 ${albums.reduce((n, a) => n + a.tracks.length, 0)} 軌。` : '目前使用 Drive 線上音檔。若瀏覽器無法播放，請選擇本機資料夾。';
    populate();
  }
  $('local').onchange = event => {
    const files = event.target.files;
    if (!files.length) return;
    const local = localAlbums(files);
    event.target.value = '';
    if (!local.length) $('source').textContent = '這個資料夾沒有可加入的 MP3，請選擇解壓後的 English_CD 資料夾。';
    else switchSource(local, true);
  };
  $('online').onclick = () => switchSource(window.ENGLISH_CD, false);
  $('start').onclick = () => { failed = 0; play({ album: Number($('album').value), track: 0 }); };
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
    if (albums[current.album].id) {
      $('status').textContent = 'Drive 無法在此頁播放。請從上方開啟 Drive 資料夾，下載並解壓後選擇本機資料夾。';
      return;
    }
    const limit = $('mode').value === 'album' ? albums[current.album].tracks.length : albums.reduce((n, a) => n + a.tracks.length, 0);
    if (++failed >= Math.min(limit, 5)) {
      $('status').textContent = '連續無法讀取音軌，已停止。可在 Drive 開啟音軌，或選其他專輯重試。';
      return;
    }
    advance('上一軌無法讀取，已嘗試跳到下一軌。');
  };
  populate();
}
