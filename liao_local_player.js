'use strict';

(() => {
  const $ = id => document.getElementById(id);
  const audio = $('localAudio');
  const levels = window.LIAO_DATA.levels;
  const weeks = cdWeeks(levels);
  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem('liao:' + key)) ?? fallback; }
    catch { return fallback; }
  };
  const save = (key, value) => {
    try { localStorage.setItem('liao:' + key, JSON.stringify(value)); }
    catch { $('source').textContent = '瀏覽器無法儲存設定，本次仍可使用。'; }
  };
  const esc = value => String(value).replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;',
  })[c]);
  const ticks = read('ticks', {});
  const plays = read('plays', {});
  const books = new Map();
  levels.forEach(level => level.weeks.forEach(week => {
    (week.books || []).forEach((book, index) => {
      book.key = `${level.level}-${week.week}-${book.originalSlot ?? index}`;
      books.set(book.key, book);
    });
  }));
  const lookup = key => weeks.find(week => week.key === key);
  const requested = new URLSearchParams(location.search).get('week');
  let selected = lookup(requested) || lookup(read('lastWeek', '')) || weeks[0];
  let library, single, active = -1, url, sleepTimer;
  let queue = [];
  let matches = new Map();

  $('weekSelect').replaceChildren(...weeks.map(week => new Option(week.label, week.key)));
  $('weekSelect').value = selected.key;

  function bookCard(book) {
    const count = Number(plays[book.key]) || 0;
    const tracks = matches.get(book.key) || [];
    return `<div class="book" data-book="${esc(book.key)}">
      <strong>${esc(book.title)}</strong>
      <div class="meta">${tracks.length ? `${tracks.length} 軌本機 MP3` : library ? '缺少對應 MP3' : '等待載入本機歌單'} · 已聽 <span data-count="${esc(book.key)}">${count}</span> 次</div>
      <div class="row"><button class="primary" data-play="${esc(book.key)}" ${tracks.length ? '' : 'disabled'}>▶ 播放</button>
      <button data-count-book="${esc(book.key)}" aria-label="為 ${esc(book.title)} 登記一次">＋ 記一次</button></div>
    </div>`;
  }

  function weekCard(week) {
    const days = ticks[week.key] || [];
    const playable = week.books.filter(book => matches.get(book.key)?.length).length;
    const list = $('onlyAudio').checked ? week.books.filter(book => matches.get(book.key)?.length) : week.books;
    const buttons = Array.from('一二三四五六日', (day, i) =>
      `<button data-tick="${week.key}|${i}" aria-label="星期${day}完成" aria-pressed="${!!days[i]}">${days[i] ? '✓' : day}</button>`).join('');
    return `<section class="week${selected.key === week.key ? ' current' : ''}" data-week="${week.key}">
      <div class="row"><h3>${esc(week.label)}</h3><button class="primary" data-weekplay="${week.key}">▶ 本週循環</button></div>
      <div class="row ticks"><small>本週打勾</small>${buttons}</div>
      <p class="meta">${playable} / ${week.books.length} 本有本機音檔</p>
      ${list.map(bookCard).join('')}</section>`;
  }

  function renderBooks() {
    const level = levels.find(item => item.level === Number(selected.key.split('-')[0]));
    const query = $('q').value.trim().toLowerCase();
    $('tabs').innerHTML = levels.map(item =>
      `<button data-level="${item.level}" aria-pressed="${item === level}">${item.level} 階 · Year ${item.year}</button>`).join('');
    if (query) {
      const results = [...books.values()].filter(book => book.title.toLowerCase().includes(query) &&
        (!$('onlyAudio').checked || matches.get(book.key)?.length));
      $('main').innerHTML = `<h2>搜尋結果 · ${results.length} 本</h2><div class="grid">${results.map(book =>
        `<section class="week">${bookCard(book)}</section>`).join('')}</div>`;
    } else {
      $('main').innerHTML = `<h2>第 ${level.level} 階 · Year ${level.year}</h2><p class="muted">${esc(level.title)}</p>
        <div class="grid">${weeks.filter(week => week.key.startsWith(level.level + '-')).map(weekCard).join('')}</div>`;
    }
    markPlaying();
  }

  function markPlaying() {
    document.querySelectorAll('[data-book]').forEach(node =>
      node.classList.toggle('playing', node.dataset.book === queue[active]?.book.key));
  }

  function renderTracks() {
    $('tracks').innerHTML = queue.map(({book, track}, i) =>
      `<li><button data-track="${i}" aria-current="${i === active}">${esc(book.title)} · ${esc(track.name)}</button></li>`).join('');
    $('prev').disabled = $('next').disabled = !queue.length;
    markPlaying();
  }

  function stop() {
    active = -1;
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    if (url) URL.revokeObjectURL(url);
    url = undefined;
    $('now').textContent = '';
  }

  function updateQueue() {
    stop();
    const list = single ? [single] : selected.books;
    queue = list.flatMap(book => (matches.get(book.key) || []).map(track => ({book, track})));
    $('playlistTitle').textContent = single?.title || selected.label;
    const missing = list.filter(book => !matches.get(book.key)?.length);
    $('status').textContent = !library ? '請先選擇手機上的 MP3 資料夾。'
      : missing.length ? '缺少對應音檔：' + missing.map(book => book.title).join('、')
      : `${queue.length} 軌 · 播完從第一軌循環`;
    renderTracks();
  }

  function useLibrary(albums) {
    library = albums;
    matches = new Map([...books.values()].map(book => [book.key, weeklyAlbums([book], albums).albums[0]?.tracks || []]));
    renderBooks();
    updateQueue();
  }

  function play(index) {
    if (!queue.length) return;
    active = (index + queue.length) % queue.length;
    const item = queue[active];
    if (url) URL.revokeObjectURL(url);
    const currentUrl = URL.createObjectURL(item.track.file);
    url = audio.src = currentUrl;
    audio.playbackRate = Number($('rate').value) || 1;
    $('now').textContent = `播放第 ${active + 1} / ${queue.length} 軌 · ${item.track.name}`;
    renderTracks();
    audio.play().catch(error => {
      if (url === currentUrl && error.name === 'NotAllowedError') $('now').textContent = '請按音訊播放器的播放鍵。';
    });
  }

  function select(week, book, auto = false) {
    if (!week) return;
    selected = week;
    single = book;
    $('weekSelect').value = week.key;
    save('lastWeek', week.key);
    renderBooks();
    updateQueue();
    if (auto) {
      play(0);
      $('playlist').scrollIntoView({block: 'nearest'});
    }
  }

  function count(book) {
    plays[book.key] = (Number(plays[book.key]) || 0) + 1;
    save('plays', plays);
    document.querySelectorAll(`[data-count="${book.key}"]`).forEach(node => { node.textContent = plays[book.key]; });
  }

  $('local').onchange = async ({target}) => {
    if (!target.files.length) return;
    const albums = localAlbums(target.files);
    target.value = '';
    if (!albums.length) { $('source').textContent = '找不到可用 MP3，請選擇解壓後的 English_CD。'; return; }
    useLibrary(albums);
    $('source').textContent = '已載入，正在儲存歌單…';
    try {
      await storedAlbums(albums);
      if (library === albums) $('source').textContent = '本機歌單已儲存，下次開啟會自動載入。';
    } catch {
      if (library === albums) $('source').textContent = '本次可播放，但瀏覽器無法儲存歌單。';
    }
  };
  $('tabs').onclick = event => {
    const button = event.target.closest('[data-level]');
    if (button) { $('q').value = ''; select(weeks.find(week => week.key.startsWith(button.dataset.level + '-'))); }
  };
  $('main').onclick = event => {
    const button = event.target.closest('button');
    if (!button) return;
    const {weekplay, play: bookKey, tick, countBook} = button.dataset;
    if (weekplay) select(lookup(weekplay), undefined, true);
    if (bookKey) select(lookup(button.closest('[data-week]')?.dataset.week || bookKey.split('-').slice(0, 2).join('-')), books.get(bookKey), true);
    if (countBook) count(books.get(countBook));
    if (tick) {
      const [key, day] = tick.split('|');
      const days = ticks[key] ||= [];
      days[day] = !days[day];
      save('ticks', ticks);
      button.setAttribute('aria-pressed', String(days[day]));
      button.textContent = days[day] ? '✓' : '一二三四五六日'[day];
    }
  };
  $('weekSelect').onchange = event => select(lookup(event.target.value));
  $('playSelected').onclick = () => select(lookup($('weekSelect').value), undefined, true);
  $('q').oninput = $('onlyAudio').onchange = renderBooks;
  $('tracks').onclick = event => {
    const button = event.target.closest('[data-track]');
    if (button) play(Number(button.dataset.track));
  };
  $('prev').onclick = () => play(active < 0 ? 0 : active - 1);
  $('next').onclick = () => play(active + 1);
  $('rate').onchange = () => { audio.playbackRate = Number($('rate').value); };
  $('sleep').onchange = () => {
    clearTimeout(sleepTimer);
    const minutes = Number($('sleep').value);
    if (minutes > 0) sleepTimer = setTimeout(() => {
      audio.pause();
      $('sleep').value = '0';
      $('now').textContent = '時間到，已暫停。';
    }, minutes * 60_000);
  };
  audio.onended = () => {
    const item = queue[active];
    if (!item) return;
    if (queue[active + 1]?.book !== item.book) count(item.book);
    if ($('sleep').value === '-1') {
      $('sleep').value = '0';
      $('now').textContent = '本軌播完，已暫停。';
      return;
    }
    play(active + 1);
  };
  audio.onerror = () => {
    if (active >= 0) $('now').textContent = '這軌無法播放，可選下一軌或重新選取資料夾。';
  };

  renderBooks();
  updateQueue();
  storedAlbums().then(saved => {
    if (library) return;
    if (saved?.length) {
      useLibrary(saved);
      $('source').textContent = '已載入上次儲存的本機歌單。';
    } else $('source').textContent = '選一次資料夾，之後會自動載入。';
  }).catch(() => {
    if (!library) $('source').textContent = '請選擇本機資料夾，開始播放。';
  });
})();
