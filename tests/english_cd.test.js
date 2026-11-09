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
