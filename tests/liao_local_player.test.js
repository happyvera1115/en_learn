const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('the weekly page restores local files, loops in place and records completed books', async () => {
  const elements = new Map();
  const stored = new Map([['liao:plays', '{"1-1-1":2}']]);
  const selected = [];
  const element = id => {
    if (!elements.has(id)) elements.set(id, {
      value: id === 'rate' ? '1' : '', checked: false, innerHTML: '',
      replaceChildren() {}, scrollIntoView() {}, pause() {}, removeAttribute() {}, load() {},
      play() { selected.push(this.src); return Promise.resolve(); },
    });
    return elements.get(id);
  };
  const mp3 = (name, folder) => ({
    name, webkitRelativePath: `English_CD/ww1/${folder}/${name}`,
  });
  const context = vm.createContext({
    window: {}, location: {search: ''}, URLSearchParams,
    URL: {createObjectURL: file => file.name, revokeObjectURL() {}},
    document: {getElementById: element, querySelectorAll: () => []},
    localStorage: {getItem: k => stored.get(k), setItem: (k, v) => stored.set(k, v)},
    Option: function (label, value) { this.value = value; },
    files: [
      mp3('01 Story Song.mp3', 'Brown Bear'),
      mp3('02 Story Reading.mp3', 'Brown Bear'),
      mp3('01 Sing-Along.mp3', 'The Wheels on the Bus'),
    ],
  });
  for (const file of ['liao_data.js', 'english_cd.js', 'liao_local_player.js']) {
    vm.runInContext(fs.readFileSync(require.resolve('../' + file), 'utf8'), context, {filename: file});
    if (file === 'english_cd.js') vm.runInContext('storedAlbums = async () => localAlbums(files)', context);
  }
  await new Promise(resolve => setImmediate(resolve));
  assert.match(element('source').textContent, /已載入上次儲存/);
  assert.match(element('main').innerHTML, /已聽 <span data-count="1-1-1">2<\/span>/);
  element('playSelected').onclick();
  assert.equal(selected[0], '01 Story Song.mp3');
  const end = () => element('localAudio').onended();
  end();
  assert.equal(JSON.parse(stored.get('liao:plays'))['1-1-1'], 2);
  end();
  assert.equal(JSON.parse(stored.get('liao:plays'))['1-1-1'], 3);
  end();
  assert.deepEqual(selected, ['01 Story Song.mp3', '02 Story Reading.mp3', '01 Sing-Along.mp3', '01 Story Song.mp3']);
  const click = dataset => element('main').onclick({
    target: {closest: () => ({dataset, closest: () => null})},
  });
  click({play: '1-1-2'});
  end();
  assert.deepEqual(selected.slice(-2), ['01 Sing-Along.mp3', '01 Sing-Along.mp3']);
  click({countBook: '1-1-2'});
  assert.equal(JSON.parse(stored.get('liao:plays'))['1-1-2'], 3);
});
