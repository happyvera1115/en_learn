/* Weekly book list and visible YouTube IFrame player. */
(() => {
  'use strict';
  const D = window.LIAO_DATA;
  const defaults = window.LIAO_YOUTUBE || {};
  const { parseVideoId, weeklyBooks, buildQueue, nextIndex } = window.LiaoYoutube;
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem('liao:' + key)) ?? fallback; }
    catch { return fallback; }
  };
  function save(key, value) {
    try { localStorage.setItem('liao:' + key, JSON.stringify(value)); return true; }
    catch { toast('瀏覽器無法儲存設定；本次仍可使用，關閉頁面後不會保留。'); return false; }
  }
  const record = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const state = {
    level: read('level', 1), lastWeek: read('lastWeek', '1-1'),
    ticks: record(read('ticks', {})), plays: record(read('plays', {})),
    overrides: record(read('youtube', {})), repeat: read('repeat', 'list'),
    queue: [], index: -1, ctx: '', request: 0, sleepAt: 0, sleepAfter: false,
    ended: false, ready: false, failed: false
  };
  if (!['list','one','off'].includes(state.repeat)) state.repeat = 'list';
  const books = [], weeks = {};
  D.levels.forEach(lv => {
    let pending = [], last = [];
    lv.weeks.forEach(w => {
      w.key = `${lv.level}-${w.week}`;
      weeks[w.key] = { lv, w };
      if (w.review) {
        if (pending.length) { last = pending; pending = []; }
        w.reviewOf = last;
      } else {
        (w.books || []).forEach((book, i) => {
          Object.assign(book, { key:`${w.key}-${book.originalSlot ?? i}`, lv, w });
          books.push(book);
        });
        pending.push(w);
      }
    });
  });
  const byKey = Object.fromEntries(books.map(b => [b.key, b]));
  if (!weeks[state.lastWeek]) state.lastWeek = Object.keys(weeks)[0];
  state.level = weeks[state.lastWeek].lv.level;
  const source = b => buildQueue([b], defaults, state.overrides)[0];
  const label = (lv, w) => `Year ${lv.year} · 第 ${w.week} 週`;
  const searchUrl = title => `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' book read aloud')}`;
  let toastTimer, player, apiPromise, editing;

  function toast(message) {
    $('#toast').textContent = message;
    $('#toast').style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { $('#toast').style.display = 'none'; }, 6000);
  }
  function setStatus(message) { $('#videoStatus').textContent = message; }
  function selectWeek(key) {
    $('#weekSelect').value = key;
    const link = $('#weeklyCD');
    if (link) link.href = `english_cd.html?week=${encodeURIComponent(key)}`;
  }
  function renderTabs() {
    $('#tabs').innerHTML = D.levels.map(lv => `<button data-level="${lv.level}" class="${lv.level === state.level ? 'on' : ''}">${lv.level} 階 · Year ${lv.year}</button>`).join('');
    $('#weekSelect').innerHTML = Object.entries(weeks).map(([key,{lv,w}]) => `<option value="${key}">${label(lv,w)}${w.review ? ' · 複習週' : ''}</option>`).join('');
    selectWeek(state.lastWeek);
  }
  function ticksHtml(w) {
    const ticks = Array.isArray(state.ticks[w.key]) ? state.ticks[w.key] : [];
    return `<div class="ticks"><span>本週打勾</span>${['一','二','三','四','五','六','日'].map((d,i) => `<button data-tick="${w.key}|${i}" aria-label="星期${d}完成" aria-pressed="${!!ticks[i]}" class="${ticks[i] ? 'on' : ''}">${ticks[i] ? '✔' : d}</button>`).join('')}</div>`;
  }
  function bookHtml(book) {
    const video = source(book);
    const preset = defaults[book.title];
    const custom = !!state.overrides[book.title];
    const meta = video ? custom ? '自訂影片' : `${preset?.channel || 'YouTube 朗讀'}${preset?.note ? ' · ' + preset.note : ''}` : '尚待補上影片';
    return `<div class="book ${video ? '' : 'noaudio'}" data-book="${book.key}">
      <div class="book-row"><div class="book-title">${esc(book.title)}<span class="meta">${esc(meta)}${state.plays[book.key] ? ` · 已播 ${state.plays[book.key]} 次` : ''}</span></div>
      <button class="btn primary" data-bookplay="${book.key}" ${video ? '' : 'disabled'} aria-label="播放 ${esc(book.title)}">▶ 播放</button>
      <button class="btn" data-edit="${book.key}">更換影片</button>
      <a class="btn" href="${searchUrl(book.title)}" target="_blank" rel="noopener">找影片 ↗</a>
      ${book.folder ? `<a class="btn" href="https://drive.google.com/drive/folders/${encodeURIComponent(book.folder)}" target="_blank" rel="noopener" title="在 Drive 開啟原始音檔">📁 Drive</a>` : ''}</div>
      </div>`;
  }
  function weekHtml(lv,w) {
    const list = weeklyBooks(w);
    const available = list.filter(source).length;
    return `<section class="week ${w.review ? 'review' : ''} ${w.key === state.lastWeek ? 'current' : ''}" data-week="${w.key}">
      <div class="week-top"><h3>${label(lv,w)}${w.review ? '<span class="theme">複習週</span>' : w.theme ? `<span class="theme">${esc(w.theme)}</span>` : ''}</h3>
      <button class="btn primary" data-weekplay="${w.key}" ${available ? '' : 'disabled'}>▶ ${w.review ? '複習' : '本週'}循環</button></div>
      ${ticksHtml(w)}<p class="note">${available} / ${list.length} 本已有影片</p>${w.review ? `<details><summary>查看複習書單（${list.length} 本）</summary>${list.map(bookHtml).join('')}</details>` : list.map(bookHtml).join('')}</section>`;
  }
  function renderMain() {
    const q = $('#q').value.trim().toLowerCase();
    const only = $('#onlyAudio').checked;
    if (q || only) {
      const hits = books.filter(b => (!q || b.title.toLowerCase().includes(q)) && (!only || source(b)));
      $('#main').innerHTML = `<div class="level-head"><h2>搜尋結果 · ${hits.length} 本</h2></div><div class="grid">${hits.map(b => `<section class="week"><h3>${label(b.lv,b.w)}</h3>${bookHtml(b)}</section>`).join('')}</div>`;
    } else {
      const lv = D.levels.find(l => l.level === state.level) || D.levels[0];
      $('#main').innerHTML = `<div class="level-head"><div><h2>第 ${lv.level} 階 · Year ${lv.year}</h2><span class="sub">${esc(lv.title)}</span></div></div><div class="grid">${lv.weeks.map(w => weekHtml(lv,w)).join('')}</div>`;
    }
    markPlaying();
    const unique = [...new Set(books.map(b => b.title))];
    $('#stats').textContent = `七階 · 84 週 · ${unique.filter(t => source({title:t})).length} / ${unique.length} 項已有影片`;
  }
  function markPlaying() {
    const current = state.queue[state.index];
    document.querySelectorAll('[data-book]').forEach(el => el.classList.toggle('playing', el.dataset.book === current?.book.key));
    document.querySelectorAll('[data-week]').forEach(el => el.classList.toggle('current', el.dataset.week === state.lastWeek));
  }
  function syncRepeat() {
    $('#bRepeat').textContent = {list:'🔁 整週／清單',one:'🔂 單本',off:'➡ 不循環'}[state.repeat];
    $('#bRepeat').classList.toggle('on', state.repeat !== 'off');
  }
  function ensurePlayer(videoId) {
    if (state.ready) return Promise.resolve(player);
    if (apiPromise) return apiPromise;
    apiPromise = new Promise((resolve,reject) => {
      let expired = false;
      const fail = message => {
        expired = true;
        clearTimeout(timeout);
        if (player) { player.destroy(); player = null; }
        const host = document.createElement('div');
        host.id = 'youtubePlayer';
        host.innerHTML = '<p class="video-placeholder">載入未完成，請再按播放重試</p>';
        $('.video-frame').replaceChildren(host);
        reject(new Error(message));
      };
      const timeout = setTimeout(() => fail('YouTube 載入逾時，請檢查連線後再按播放。'), 20000);
      function create() {
        if (expired) return;
        player = new YT.Player('youtubePlayer', {
          width:'100%', height:'100%',
          videoId,
          playerVars:{playsinline:1, rel:0, origin:location.origin},
          events:{
            onReady: () => { if (expired) return; clearTimeout(timeout); state.ready = true; player.getIframe().title = '每週英文書單 YouTube 播放器'; resolve(player); },
            onStateChange: event => { if (!expired) onPlayerState(event); },
            onError: event => { if (!expired) onPlayerError(event); },
            onAutoplayBlocked: () => { if (expired) return; $('#bPlay').textContent = '▶'; setStatus('瀏覽器暫停了自動播放，請點影片中央的播放鍵繼續。'); }
          }
        });
      }
      if (window.YT?.Player) create();
      else {
        window.onYouTubeIframeAPIReady = create;
        document.querySelector('script[data-youtube-api]')?.remove();
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.dataset.youtubeApi = 'true';
        script.onerror = () => fail('無法連線到 YouTube，請檢查網路後再試。');
        document.head.append(script);
      }
    }).catch(error => { apiPromise = null; throw error; });
    return apiPromise;
  }
  async function play(index) {
    if (index < 0 || index >= state.queue.length) return;
    state.index = index;
    state.ended = false;
    state.failed = false;
    const token = ++state.request;
    const current = state.queue[index];
    $('#pTrack').textContent = current.book.title;
    $('#pCtx').textContent = state.ctx;
    $('#pCnt').textContent = `${index+1} / ${state.queue.length}`;
    $('#openVideo').href = `https://www.youtube.com/watch?v=${current.id}`;
    $('#openVideo').classList.remove('hidden');
    $('#editCurrent').classList.remove('hidden');
    $('#tCur').textContent = $('#tDur').textContent = '0:00';
    $('#seek').value = 0;
    setStatus('正在載入影片…若沒有自動播放，請點影片中央的播放鍵。');
    markPlaying();
    try {
      await ensurePlayer(current.id);
      if (token !== state.request) return;
      player.loadVideoById(current.id);
      applyRate();
    } catch(error) { if (token === state.request) { state.failed = true; setStatus(error.message); } }
  }
  function startQueue(list, ctx, weekKey) {
    const queue = buildQueue(list, defaults, state.overrides);
    if (!queue.length) return toast('這份書單尚無影片，請先按「更換影片」設定。');
    state.queue = queue;
    state.ctx = ctx;
    state.lastWeek = weekKey;
    save('lastWeek', weekKey);
    selectWeek(weekKey);
    if (queue.length < list.length) toast(`已加入 ${queue.length} 本；${list.length-queue.length} 本尚無影片，可按「更換影片」補上。`);
    play(0);
    $('.video-panel').scrollIntoView({block:'start',behavior:'smooth'});
  }
  function playWeek(key) {
    const {lv,w} = weeks[key];
    state.repeat = 'list'; save('repeat',state.repeat); syncRepeat();
    startQueue(weeklyBooks(w), `${label(lv,w)}${w.review ? ' · 複習' : ' · 本週書單'}`, key);
  }
  function next(auto = false) {
    const index = nextIndex(state.index,state.queue.length,state.repeat,auto);
    if (index < 0) { $('#bPlay').textContent = '▶'; setStatus('本週書單播放完畢。'); return; }
    play(index);
  }
  function pause() { if (state.ready) player.pauseVideo(); $('#bPlay').textContent = '▶'; }
  function onPlayerState(event) {
    if (event.data === 1) {
      state.failed = false; state.ended = false;
      $('#bPlay').textContent = '⏸';
      setStatus(`播放中 · ${state.repeat === 'list' ? '整份書單循環' : state.repeat === 'one' ? '單本循環' : '播完停止'}`);
      applyRate();
    }
    if (event.data === 2) $('#bPlay').textContent = '▶';
    if (event.data === 0 && !state.ended && !state.failed) {
      state.ended = true;
      const current = state.queue[state.index];
      if (!current || player.getVideoData()?.video_id !== current.id) return;
      state.plays[current.book.key] = (Number(state.plays[current.book.key]) || 0) + 1;
      save('plays', state.plays);
      if (state.sleepAfter || (state.sleepAt && Date.now() >= state.sleepAt)) {
        state.sleepAfter = false; state.sleepAt = 0; $('#sSleep').value = '0';
        $('#bPlay').textContent = '▶'; setStatus('已依定時設定停止播放。'); return;
      }
      next(true);
    }
  }
  function onPlayerError(event) {
    state.failed = true;
    $('#bPlay').textContent = '▶';
    const reason = {2:'影片網址無效',5:'播放器無法載入影片',100:'影片已移除或不公開',101:'此影片不允許在其他網站播放',150:'此影片不允許在其他網站播放',153:'YouTube 無法確認網站來源，請從網站網址開啟此頁'}[event.data] || '此影片目前無法播放';
    setStatus(`${reason}。可按「更換影片」、在 YouTube 開啟，或按 ⏭ 跳到下一本。`);
  }
  function applyRate() {
    if (!state.ready) return;
    const rate = +$('#sRate').value;
    const rates = player.getAvailablePlaybackRates() || [];
    if (rates.includes(rate)) player.setPlaybackRate(rate);
    else if (rates.length) { $('#sRate').value = '1'; player.setPlaybackRate(1); }
  }
  function openEditor(book) {
    editing = book;
    $('#editBookTitle').textContent = book.title;
    $('#videoUrl').value = source(book) ? `https://www.youtube.com/watch?v=${source(book).id}` : '';
    $('#editError').textContent = '';
    $('#restoreVideo').disabled = !Object.hasOwn(state.overrides,book.title);
    $('#videoDialog').showModal();
    $('#videoUrl').focus();
  }
  function refreshSource(title) {
    const previous = state.queue[state.index];
    const previousIndex = state.index;
    state.queue = state.queue.map(item => item.book.title === title ? source(item.book) : item).filter(Boolean);
    const keptIndex = previous ? state.queue.findIndex(item => item.book.key === previous.book.key) : -1;
    if (keptIndex >= 0) state.index = keptIndex;
    else if (previous) state.index = Math.min(previousIndex, state.queue.length - 1);
    renderMain();
    const current = state.queue[state.index];
    if (previous && !current) {
      ++state.request; // Cancel a pending asynchronous load as well.
      state.ended = true;
      if (state.ready) player.stopVideo();
      $('#pTrack').textContent = '選擇每週書單開始播放 ▶';
      $('#pCtx').textContent = '—'; $('#pCnt').textContent = '';
      $('#bPlay').textContent = '▶';
      $('#openVideo').classList.add('hidden'); $('#editCurrent').classList.add('hidden');
      setStatus('目前書單尚無影片，請先設定影片或選擇其他週次。');
    } else if (current && previous && (keptIndex < 0 || current.book.title === title)) play(state.index);
    else if (current) $('#pCnt').textContent = `${state.index+1} / ${state.queue.length}`;
    $('#videoDialog').close();
  }
  $('#videoForm').onsubmit = event => {
    event.preventDefault();
    const id = parseVideoId($('#videoUrl').value);
    if (!id) { $('#editError').textContent = '請貼上有效的 YouTube 影片網址（不是播放清單或搜尋網址）。'; return; }
    state.overrides[editing.title] = id;
    const persisted = save('youtube',state.overrides);
    refreshSource(editing.title);
    if (persisted) toast('已儲存影片；同一本書各週會使用這個版本。');
  };
  $('#restoreVideo').onclick = () => {
    delete state.overrides[editing.title];
    save('youtube',state.overrides);
    refreshSource(editing.title);
  };
  $('#cancelEdit').onclick = () => $('#videoDialog').close();
  $('#editCurrent').onclick = () => { if (state.queue[state.index]) openEditor(state.queue[state.index].book); };
  $('#tabs').onclick = event => {
    const button = event.target.closest('[data-level]');
    if (!button) return;
    state.level = +button.dataset.level;
    save('level',state.level);
    $('#q').value = ''; $('#onlyAudio').checked = false;
    renderTabs(); renderMain();
    selectWeek(D.levels.find(lv => lv.level === state.level).weeks[0].key);
  };
  $('#weekSelect').onchange = event => {
    const {lv,w} = weeks[event.target.value];
    state.level = lv.level;
    $('#q').value = ''; $('#onlyAudio').checked = false;
    renderTabs(); renderMain(); selectWeek(w.key);
    document.querySelector(`[data-week="${w.key}"]`)?.scrollIntoView({block:'center',behavior:'smooth'});
  };
  $('#playSelected').onclick = () => playWeek($('#weekSelect').value);
  $('#q').oninput = renderMain;
  $('#onlyAudio').onchange = renderMain;
  $('#main').onclick = event => {
    const button = event.target.closest('[data-weekplay],[data-bookplay],[data-edit],[data-tick]');
    if (!button) return;
    const d = button.dataset;
    if (d.weekplay) playWeek(d.weekplay);
    else if (d.bookplay) {
      const b = byKey[d.bookplay];
      // Clicking a book inside a review card retains that review week's context.
      const key = button.closest('[data-week]')?.dataset.week || b.w.key;
      startQueue([b], `${label(weeks[key].lv,weeks[key].w)} · 單本`,key);
    } else if (d.edit) openEditor(byKey[d.edit]);
    else if (d.tick) {
      const [key,index] = d.tick.split('|');
      const ticks = Array.isArray(state.ticks[key]) ? state.ticks[key] : [];
      ticks[index] = !ticks[index]; state.ticks[key] = ticks;
      save('ticks',state.ticks); renderMain();
    }
  };
  $('#bPlay').onclick = () => {
    if (!state.queue.length) return playWeek($('#weekSelect').value);
    if (!state.ready || state.failed) return play(state.index);
    if (player.getPlayerState() === 1) pause();
    else if (player.getPlayerState() === 0) play(state.index);
    else player.playVideo();
  };
  $('#bNext').onclick = () => next();
  $('#bPrev').onclick = () => {
    if (state.ready && player.getCurrentTime() > 3) player.seekTo(0,true);
    else play(Math.max(0,state.index-1));
  };
  $('#bBack').onclick = () => { if (state.ready) player.seekTo(Math.max(0,player.getCurrentTime()-10),true); };
  $('#bFwd').onclick = () => { if (state.ready) player.seekTo(Math.min(player.getDuration(),player.getCurrentTime()+10),true); };
  $('#bRepeat').onclick = () => {
    state.repeat = {list:'one',one:'off',off:'list'}[state.repeat];
    save('repeat',state.repeat); syncRepeat();
  };
  $('#sRate').onchange = applyRate;
  $('#sSleep').onchange = event => {
    const minutes = +event.target.value;
    state.sleepAfter = minutes === -1;
    state.sleepAt = minutes > 0 ? Date.now()+minutes*60000 : 0;
    if (minutes) toast(minutes > 0 ? `${minutes} 分鐘後停止播放` : '本支影片播完後停止');
  };
  const fmt = value => Number.isFinite(value) ? `${Math.floor(value/60)}:${String(Math.floor(value%60)).padStart(2,'0')}` : '0:00';
  let seeking = false;
  $('#seek').oninput = () => { seeking = true; };
  $('#seek').onchange = event => {
    if (state.ready) player.seekTo(+event.target.value / 1000 * player.getDuration(),true);
    seeking = false;
  };
  $('#seek').setAttribute('aria-label','影片播放進度');
  setInterval(() => {
    if (state.sleepAt && Date.now() >= state.sleepAt) {
      pause(); state.sleepAt = 0; state.sleepAfter = false; $('#sSleep').value = '0';
      setStatus('⏰ 定時到，已停止播放。');
    }
    if (!state.ready) return;
    const time = player.getCurrentTime() || 0, duration = player.getDuration() || 0;
    $('#tCur').textContent = fmt(time); $('#tDur').textContent = fmt(duration);
    if (!seeking) $('#seek').value = duration ? time/duration*1000 : 0;
  },500);
  document.addEventListener('keydown', event => {
    if ($('#videoDialog').open || event.target.matches('input,select,textarea,button,a')) return;
    if (event.code === 'Space') { event.preventDefault(); $('#bPlay').click(); }
    if (event.code === 'ArrowRight') next();
    if (event.code === 'ArrowLeft') $('#bPrev').click();
  });
  $('#driveRoot').href = `https://drive.google.com/drive/folders/${encodeURIComponent(D.driveRoot)}`;
  if (window.ResizeObserver) new ResizeObserver(() => document.documentElement.style.setProperty('--player-h',`${$('#player').offsetHeight}px`)).observe($('#player'));
  syncRepeat(); renderTabs(); renderMain();
  if (location.protocol === 'file:') setStatus('請透過網站網址開啟，YouTube 內嵌播放器無法在直接開啟的本機 HTML 穩定運作。');
})();
