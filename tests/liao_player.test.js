const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function harness(options = {}) {
  const elements = new Map();
  const store = new Map(Object.entries({
    'liao:weeklySource': JSON.stringify(options.weeklySource || 'youtube'),
    ...options.store,
  }));
  const element = id => {
    if (!elements.has(id)) elements.set(id, {
      value: id === '#sRate' ? '1' : id === '#q' ? '' : '0',
      checked: false, textContent:'', innerHTML:'', style:{}, dataset:{},
      classList:{add(){},remove(){},toggle(){}},
      setAttribute(){}, scrollIntoView(){}, focus(){}, append(){}, remove(){}, replaceChildren(){},
      showModal(){ this.open = true; }, close(){ this.open = false; }
    });
    return elements.get(id);
  };
  let player, created = 0;
  const timeouts = [];
  const context = {
    window: {location: {}}, URL, location:{origin:'http://localhost:3000',protocol:'http:'},
    document:{querySelector:element,querySelectorAll:()=>[],addEventListener(){},head:{append(){}},createElement:()=>element('script')},
    localStorage:{getItem:k=>store.get(k) ?? null,setItem:(k,v)=>{if(options.noStorage) throw Error('blocked'); store.set(k,v);}},
    setTimeout:(fn,delay)=>{timeouts.push({fn,delay});return timeouts.length;},clearTimeout(){},setInterval(){},
    YT:{Player: function(id,config) {
      player = this;
      created++;
      this.events = config.events; this.id = ''; this.time = 0; this.status = -1; this.loads = [];
      this.getIframe = () => element('iframe');
      this.loadVideoById = id => {this.id = id; this.time=0; this.loads.push(id);};
      this.getVideoData = () => ({video_id:this.id});
      this.getAvailablePlaybackRates = () => options.ratesNotReady ? undefined : [0.75,1,1.25];
      this.setPlaybackRate = () => {};
      this.getCurrentTime = () => this.time;
      this.getDuration = () => 100;
      this.seekTo = v => {this.time = v;};
      this.getPlayerState = () => this.status;
      this.playVideo = () => {this.status=1;};
      this.pauseVideo = () => {this.status=2;};
      this.stopVideo = () => {this.status=0;};
      this.destroy = () => {this.destroyed=true;};
      this.end = () => {this.status=0;this.events.onStateChange({data:0});};
      if (!options.delayFirstReady || created > 1) queueMicrotask(() => config.events.onReady());
    }}
  };
  context.window.YT = context.YT;
  vm.createContext(context);
  for (const file of ['liao_data.js','liao_youtube_data.js','liao_youtube.js','liao_player.js']) vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
  const flush = () => new Promise(resolve=>setImmediate(resolve));
  async function clickBook(dataset,week) {
    element('#main').onclick({target:{closest:()=>({dataset,closest:()=>week ? {dataset:{week}} : null})}});
    await flush();
  }
  return {element,store,context,flush,clickBook,get player(){return player;},timeouts};
}

test('weekly loop defaults to local MP3 and opens the selected week', async () => {
  const h = harness({store: {'liao:weeklySource': null}});
  assert.equal(h.element('#weeklySource').value, 'local');
  h.element('#playSelected').onclick();
  assert.equal(h.context.window.location.href, 'english_cd.html?week=1-1&play=local');
  await h.clickBook({weekplay:'1-5'});
  assert.equal(h.context.window.location.href, 'english_cd.html?week=1-5&play=local');
  assert.equal(h.player, undefined);
  h.element('#weeklySource').value = 'youtube';
  h.element('#weeklySource').onchange();
  assert.equal(JSON.parse(h.store.get('liao:weeklySource')), 'youtube');
});

test('weekly playback advances and wraps after the final book', async () => {
  const h = harness();
  h.element('#playSelected').onclick(); await h.flush();
  const first = h.player.id;
  assert.equal(h.element('#pCnt').textContent,'1 / 2');
  h.player.end(); await h.flush();
  assert.equal(h.element('#pCnt').textContent,'2 / 2');
  assert.notEqual(h.player.id,first);
  h.player.end(); await h.flush();
  assert.equal(h.player.id,first);
  assert.equal(h.element('#pCnt').textContent,'1 / 2');
});

test('review week keeps its selected context and excludes all Mother Goose chapters', async () => {
  const h = harness();
  await h.clickBook({weekplay:'1-5'});
  assert.doesNotMatch(h.element('#main').innerHTML, /My Very First Mother Goose/i);
  assert.equal(h.element('#pCnt').textContent,'1 / 9');
  h.player.end(); await h.flush();
  assert.match(h.element('#pCtx').textContent,/第 5 週 · 複習/);
  assert.equal(JSON.parse(h.store.get('liao:lastWeek')),'1-5');
});

test('unplayable video stays on its item until explicitly skipped', async () => {
  const h = harness();
  h.element('#playSelected').onclick(); await h.flush();
  h.player.events.onError({data:150});
  h.player.end(); await h.flush();
  assert.equal(h.player.loads.length,1);
  assert.match(h.element('#videoStatus').textContent,/不允許/);
  h.element('#bNext').onclick(); await h.flush();
  assert.equal(h.element('#pCnt').textContent,'2 / 2');
});

test('restoring an unavailable current source advances and preserves queue continuity', async () => {
  const h = harness({store:{'liao:youtube':JSON.stringify({'I Am a Star':'aaaaaaaaaaa'})}});
  await h.clickBook({weekplay:'3-34'});
  h.element('#bNext').onclick(); await h.flush();
  assert.equal(h.player.id,'aaaaaaaaaaa');
  h.element('#editCurrent').onclick(); h.element('#restoreVideo').onclick(); await h.flush();
  assert.notEqual(h.player.id,'aaaaaaaaaaa');
  assert.equal(h.element('#pCnt').textContent,'2 / 2');
  h.player.end(); await h.flush();
  assert.equal(h.element('#pCnt').textContent,'1 / 2');
});

test('removing the only custom source stops playback and clears its controls', async () => {
  const h = harness({store:{'liao:youtube':JSON.stringify({'I Am a Star':'aaaaaaaaaaa'})}});
  const book = h.context.window.LIAO_DATA.levels[2].weeks.find(w=>w.week===34).books.find(b=>b.title==='I Am a Star');
  await h.clickBook({bookplay:book.key});
  h.element('#editCurrent').onclick(); h.element('#restoreVideo').onclick(); await h.flush();
  assert.equal(h.player.status,0);
  assert.equal(h.element('#pCnt').textContent,'');
  assert.match(h.element('#videoStatus').textContent,/尚無影片/);
});

test('invalid replacement is rejected and valid replacement survives a new page session', async () => {
  const h = harness();
  await h.clickBook({edit:'1-1-1'});
  h.element('#videoUrl').value = 'https://youtube.com.evil.com/watch?v=aaaaaaaaaaa';
  h.element('#videoForm').onsubmit({preventDefault(){}});
  assert.match(h.element('#editError').textContent,/有效/);
  h.element('#videoUrl').value = 'https://youtu.be/aaaaaaaaaaa';
  h.element('#videoForm').onsubmit({preventDefault(){}});
  const next = harness({store:Object.fromEntries(h.store)});
  next.element('#playSelected').onclick(); await next.flush();
  assert.equal(next.player.id,'aaaaaaaaaaa');
});

test('storage failures keep playback usable and show a persistence message', async () => {
  const h = harness({noStorage:true});
  h.element('#playSelected').onclick(); await h.flush();
  assert.equal(h.element('#pCnt').textContent,'1 / 2');
  assert.match(h.element('#toast').textContent,/無法儲存/);
});

test('transient missing playback rates do not interrupt advancing the queue', async () => {
  const h = harness({ratesNotReady:true});
  h.element('#playSelected').onclick(); await h.flush();
  assert.doesNotThrow(() => h.player.events.onStateChange({data:1}));
  h.player.end(); await h.flush();
  assert.equal(h.element('#pCnt').textContent,'2 / 2');
});

test('timed-out initialization ignores late readiness and retries with a fresh player', async () => {
  const h = harness({delayFirstReady:true});
  h.element('#playSelected').onclick(); await h.flush();
  const old = h.player;
  h.timeouts.find(t=>t.delay===20000).fn(); await h.flush();
  assert.match(h.element('#videoStatus').textContent,/逾時/);
  old.events.onReady();
  h.element('#bPlay').onclick(); await h.flush();
  assert.notEqual(h.player,old);
  assert.equal(h.player.loads.length,1);
});
