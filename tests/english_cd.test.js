const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const { test } = require('node:test');
const { localAlbums, nextTrack, cdWeeks, weeklyAlbums } = require('../english_cd.js');

test('local import excludes Mother Goose folders and tracks but keeps the other CDs', () => {
  const paths = [
    'English_CD/My Very First Mother Goose(信誼)/chapter1/01.mp3',
    'English_CD/ww1/Goose_chapter1/01.mp3',
    'English_CD/ww2/goose_ch2/02.mp3',
    'English_CD/ww3/goose_ch3/03.mp3',
    'English_CD/ww3/My Very First Mother Goose.mp3',
    'English_CD/ww3/CD 10/01.mp3',
    'English_CD/ww3/CD 2/01.mp3',
    'English_CD/ww4/CD 1/01.mp3',
  ];
  const albums = localAlbums(paths.map(path => ({ name: path.split('/').at(-1), webkitRelativePath: path })));
  assert.deepEqual(albums.map(a => [a.name, a.tracks.map(t => t.disc)]), [['ww3', ['CD 2', 'CD 10']], ['ww4', ['CD 1']]]);
  assert.deepEqual(nextTrack(albums, {album:0, track:1}, 'all'), {album:1, track:0});
  assert.deepEqual(nextTrack(albums, {album:1, track:0}, 'all'), {album:0, track:0});
});

test('the bundled Drive playlist excludes the album and abbreviated chapter paths', () => {
  const window = {};
  runInNewContext(readFileSync(require.resolve('../english_cd_data.js'), 'utf8'), { window });
  const albums = window.ENGLISH_CD;
  assert.ok(albums.length > 1);
  assert.ok(albums.every(a => a.tracks.length && !/my very first mother goose/i.test(a.name)));
  assert.ok(albums.every(a => a.tracks.every(t => !/goose_ch(?:apter)?\d|my very first mother goose/i.test(`${t.disc}/${t.name}`))));
});

test('weekly CD playback follows the book list and repeats its review block', () => {
  const window = {};
  runInNewContext(readFileSync(require.resolve('../liao_data.js'), 'utf8'), { window });
  const weeks = cdWeeks(window.LIAO_DATA.levels);
  const week = weeks.find(w => w.key === '1-1');
  const review = weeks.find(w => w.key === '1-5');
  assert.equal(weeks.length, 84);
  assert.deepEqual(Array.from(review.books, b => b.title),
    Array.from(weeks.slice(0, 4).flatMap(w => w.books), b => b.title));
  const paths = [
    'English_CD/ww1/The Wheels on the Bus/01 Sing-along.mp3',
    'English_CD/ww1/Brown Bear/03 Story Reading.mp3',
    'English_CD/ww1/Brown Bear/02 Story Song.mp3',
    'English_CD/ww2/Go Away Mr Wolf/01 Story Song.mp3',
  ];
  const local = localAlbums(paths.map(p => ({name: p.split('/').at(-1), webkitRelativePath: p})));
  const { albums, missing } = weeklyAlbums(week.books, local);
  assert.deepEqual(albums.map(a => a.name), Array.from(week.books, b => b.title));
  assert.deepEqual(albums[0].tracks.map(t => t.name), ['02 Story Song', '03 Story Reading']);
  assert.deepEqual(missing, []);
  assert.deepEqual(nextTrack(albums, {album: 0, track: 1}, 'all'), {album: 1, track: 0});
  assert.deepEqual(nextTrack(albums, {album: 1, track: 0}, 'all'), {album: 0, track: 0});
  assert.equal(weeklyAlbums(weeks[2].books, local).missing.length, 2);
});

test('local files survive a page refresh and start the requested weekly loop', async () => {
  let savedLibrary;
  const settings = new Map();
  const indexedDB = {
    open() {
      const open = {result: {
        close() {},
        transaction() {
          const tx = {
            objectStore: () => ({
              get: () => ({result: structuredClone(savedLibrary)}),
              put: albums => { savedLibrary = structuredClone(albums); return {}; },
            }),
          };
          queueMicrotask(() => tx.oncomplete());
          return tx;
        },
      }};
      queueMicrotask(() => open.onsuccess());
      return open;
    },
  };
  function page(search) {
    const nodes = new Map();
    const played = [];
    const get = id => {
      if (!nodes.has(id)) nodes.set(id, {
        options: [{}],
        replaceChildren(...items) { this.value = items[0]?.value ?? ''; },
        append() {}, setAttribute() {}, pause() {}, load() {}, removeAttribute() {},
        play() { played.push(this.src); return Promise.resolve(); },
      });
      return nodes.get(id);
    };
    const context = {
      window: {location: {search}}, URLSearchParams, indexedDB,
      URL: {createObjectURL: blob => URL.createObjectURL(blob), revokeObjectURL: url => URL.revokeObjectURL(url)},
      localStorage: {getItem: k => settings.get(k), setItem: (k, v) => settings.set(k, v)},
      document: {getElementById: get, createElement: () => get('element')},
      Option: function (text, value) { this.value = value; },
    };
    runInNewContext(['liao_data.js', 'english_cd_data.js', 'english_cd.js']
      .map(name => readFileSync(require.resolve('../' + name), 'utf8')).join('\n;\n'), context);
    return {get, played};
  }
  const file = new Blob(['MP3 bytes'], {type: 'audio/mpeg'});
  file.name = '01 Story Song.mp3';
  file.webkitRelativePath = 'English_CD/ww1/Brown Bear/' + file.name;
  const first = page('');
  await first.get('local').onchange({target: {files: [file]}});
  assert.match(first.get('library-status').textContent, /已儲存/);
  first.get('week').value = '';
  first.get('week').onchange();
  const refreshed = page('');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(refreshed.get('week').value, '');
  assert.equal(refreshed.get('start').disabled, false);
  const weekly = page('?week=1-1&play=local');
  await new Promise(resolve => setImmediate(resolve));
  assert.match(weekly.get('now').textContent, /Brown Bear/);
  assert.equal(weekly.played.length, 1);
  assert.match(weekly.played[0], /^blob:/);
  weekly.get('audio').onended();
  assert.equal(weekly.played.length, 2);
  assert.match(weekly.get('now').textContent, /Brown Bear/);
  URL.revokeObjectURL(weekly.played[1]);
});
