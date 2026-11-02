const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const sandbox = { window: {}, URL };
if (fs.existsSync('liao_youtube.js')) vm.runInNewContext(fs.readFileSync('liao_youtube.js', 'utf8'), sandbox);
const lib = sandbox.window.LiaoYoutube || {};

test('accepts watch, short, embed and shorts URLs while rejecting lookalike domains', () => {
  assert.equal(typeof lib.parseVideoId, 'function');
  for (const url of ['https://www.youtube.com/watch?v=abcdefghijk&list=hello', 'https://youtu.be/abcdefghijk?t=5', 'https://www.youtube.com/embed/abcdefghijk', 'https://youtube.com/shorts/abcdefghijk', 'abcdefghijk']) {
    assert.equal(lib.parseVideoId(url), 'abcdefghijk');
  }
  for (const url of ['javascript:alert(1)', 'https://youtube.com.evil.com/watch?v=abcdefghijk', 'https://evil.com/abcdefghijk', 'https://youtube.com/playlist?list=abcdefghijk', 'bad', 'https://youtu.be/abcdefghijk/extra']) assert.equal(lib.parseVideoId(url), null);
});

test('review weeks resolve their assigned block in original order', () => {
  assert.equal(typeof lib.weeklyBooks, 'function');
  const a = { title: 'A' }, b = { title: 'B' };
  const week = { review: true, reviewOf: [{ books: [a] }, { books: [b] }] };
  assert.deepEqual(Array.from(lib.weeklyBooks(week)), [a, b]);
});

test('queue applies per-title overrides and omits missing sources', () => {
  assert.equal(typeof lib.buildQueue, 'function');
  const books = [{title:'A'}, {title:'B'}, {title:'C'}];
  const queue = lib.buildQueue(books, {A:{id:'aaaaaaaaaaa'}, B:{id:'bbbbbbbbbbb'}}, {A:'ccccccccccc'});
  assert.deepEqual(Array.from(queue, x => x.id), ['ccccccccccc','bbbbbbbbbbb']);
  assert.equal(queue[0].book, books[0]);
});

test('weekly loop wraps, single repeats only on end, and no-loop stops', () => {
  assert.equal(typeof lib.nextIndex, 'function');
  assert.equal(lib.nextIndex(2, 3, 'list', true), 0);
  assert.equal(lib.nextIndex(2, 3, 'one', true), 2);
  assert.equal(lib.nextIndex(2, 3, 'off', true), -1);
  assert.equal(lib.nextIndex(0, 3, 'one', false), 1);
  assert.equal(lib.nextIndex(0, 0, 'list', true), -1);
});
