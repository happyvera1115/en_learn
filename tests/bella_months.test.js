const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
let data;
try { data = require('../bella_months.js'); } catch { data = {}; }

test('November bank covers all 21 teaching dates with unique questions and original blanks', () => {
  assert.ok(data.november, 'November bank must exist');
  const words = data.november.words;
  assert.equal(new Set(words.map(w => w.date)).size, 21);
  assert.equal(new Set(words.map(w => w.id)).size, words.length);
  assert.equal(words.find(w => w.word === 'kitten').date, '11/2');
  assert.equal(words.find(w => w.word === 'scooter').date, '11/30');
  for (const w of words) {
    assert.ok(w.sentenceComplete.toLowerCase().includes(w.word.toLowerCase()), w.word);
    assert.ok(w.sentence.includes(w.clue), w.word);
    assert.equal(w.sentence.includes(w.word), false, w.word);
  }
});

test('free spelling accepts case and spacing but rejects wrong or empty answers', () => {
  assert.equal(typeof data.answersMatch, 'function');
  assert.equal(data.answersMatch('  TAKE   care of ', 'take care of'), true);
  assert.equal(data.answersMatch('takecareof', 'take care of'), false);
  assert.equal(data.answersMatch('', 'kitten'), false);
  assert.equal(data.answersMatch('kiten', 'kitten'), false);
});

test('only explicitly verified pictures appear; abstract and placeholder images stay hidden', () => {
  assert.equal(typeof data.hasVerifiedImage, 'function');
  assert.equal(data.hasVerifiedImage({word:'reason', image:'images/reason.jpg'}), false);
  assert.equal(data.hasVerifiedImage({word:'kitten', image:'images/kitten.jpg', imageVerified:true}), true);
  assert.equal(data.hasVerifiedImage({word:'get around', image:'<svg>📖</svg>'}), false);
  assert.equal(data.hasVerifiedImage({word:'kitten', imageVerified:true}), false);
});

test('initial lesson uses Taiwan today or nearest earlier teaching day', () => {
  assert.equal(typeof data.selectInitialLesson, 'function');
  const banks = [{id:'legacy-september', words:[{date:'9/1',week:'week1',day:'day1'}]}, data.november];
  const pick = iso => data.selectInitialLesson(banks, new Date(iso));
  assert.equal(pick('2026-11-03T02:00:00Z').word.date, '11/3');
  assert.equal(pick('2026-11-07T02:00:00Z').word.date, '11/6');
  assert.equal(pick('2026-11-08T16:30:00Z').word.date, '11/9');
  assert.equal(pick('2026-12-02T02:00:00Z').word.date, '11/30');
  assert.equal(pick('2026-11-01T02:00:00Z').word.date, '11/2');
});

function appPrototype(storage = new Map()) {
  const html = fs.readFileSync(require.resolve('../bella_en_learn.html'), 'utf8');
  const script = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].at(-1)[1];
  const context = { BellaMonths: data, window: { addEventListener() {} },
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
    document: { getElementById() { return { getContext() { return {}; } }; } } };
  vm.createContext(context);
  vm.runInContext(script + '\nthis.App = SpellingApp;', context);
  return context.App.prototype;
}

test('advanced free answers route to success or failure without tile completion', () => {
  const proto = appPrototype();
  assert.equal(typeof proto.checkTypedAnswer, 'function');
  const app = Object.create(proto);
  app.currentLevel = 'advanced';
  app.isSolved = false;
  app.getCurrentWord = () => ({word: 'take care of'});
  let result;
  app.handleSuccess = () => { result = 'success'; };
  app.handleFailure = () => { result = 'failure'; };
  app.dom = { typedAnswer: {value: ' TAKE  CARE OF '}, answerMessage: {textContent: ''} };
  app.checkTypedAnswer();
  assert.equal(result, 'success');
  app.dom.typedAnswer.value = 'takecareof';
  app.checkTypedAnswer();
  assert.equal(result, 'failure');
});

test('advanced progress cannot overwrite existing easy September progress', () => {
  const old = { Bella: {stars: 8, completed: {sep_01_bill: {times: 1}}, history: []} };
  const storage = new Map([['bella_spelling_profile_v4', JSON.stringify(old)]]);
  const app = Object.create(appPrototype(storage));
  app.currentLevel = 'advanced';
  app.profiles = app.loadProfiles();
  assert.equal(app.profiles.Bella.stars, 0);
  app.profiles.Bella.stars = 1;
  app.saveProfiles();
  app.currentLevel = 'easy';
  assert.equal(app.loadProfiles().Bella.stars, 8);
  assert.equal(app.loadProfiles().Bella.completed.sep_01_bill.times, 1);
  app.currentLevel = 'advanced';
  assert.equal(app.loadProfiles().Bella.stars, 1);
});
