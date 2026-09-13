import { initialWords, categories } from './words.js';

// 音效系統 (使用 Web Audio API，無需外掛音效檔)
class SoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPop() {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playRemove() {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(260, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playSuccess() {
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const startTime = this.ctx.currentTime + idx * 0.1;
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  }

  playTryAgain() {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(240, this.ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }
}

const sfx = new SoundFX();

// 鼓勵語料庫
const PRAISES = [
  { en: "Awesome job, {name}! You are a superstar!", zh: "太厲害了，{name}！你是超級大明星！🌟" },
  { en: "Bingo! Fantastic spelling, {name}!", zh: "答對了！{name} 拼得太棒了！🎉" },
  { en: "Brilliant! You did it, {name}!", zh: "太聰明了！{name} 成功了！🚀" },
  { en: "High five, {name}! That was perfect!", zh: "來擊掌，{name}！太完美了！🙌" },
  { en: "You're getting so good at this, {name}!", zh: "{name} 越來越厲害囉！✨" }
];

const ENCOURAGEMENTS = [
  { en: "Good try! Don't give up, let's try again!", zh: "差一點點就對了！別氣餒，我們再試一次！💪" },
  { en: "Almost there! Take your time, you can do it!", zh: "就快成功了！慢慢來，你一定可以的！✨" },
  { en: "That's okay! Practice makes perfect!", zh: "沒關係的！多練習就會越來越厲害喔！🌱" },
  { en: "Keep going! Listen to the sound again!", zh: "再加油！聽聽發音再排一次看看！🎧" }
];

// 主程式控制器
class SpellingApp {
  constructor() {
    this.allWords = [...initialWords];
    this.currentCategory = 'phonics'; // 預設 Phonics 單元
    this.words = this.getWordsByCategory(this.currentCategory);
    this.currentIndex = 0;
    this.currentUser = 'Tim'; // 'Tim' or 'Bella'
    this.profiles = this.loadProfiles();
    
    // 當前拼字槽狀態: [ { char: 'A', poolId: 0 } or null ]
    this.slots = [];
    // 當前字母庫狀態: [ { id: 0, char: 'P', used: false } ]
    this.letterPool = [];
    this.isSolved = false;

    this.cacheDom();
    this.renderCategoryTabs();
    this.bindEvents();
    this.renderProfile();
    this.loadWord(0);
  }

  getWordsByCategory(catId) {
    if (catId === 'all') return this.allWords;
    return this.allWords.filter(w => w.category === catId);
  }

  // 資料持久化
  loadProfiles() {
    const saved = localStorage.getItem('kids_spelling_profiles_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("載入紀錄失敗", e);
      }
    }
    return {
      Tim: { name: 'Tim', avatar: '👦', stars: 0, completed: {}, history: [] },
      Bella: { name: 'Bella', avatar: '👧', stars: 0, completed: {}, history: [] }
    };
  }

  saveProfiles() {
    localStorage.setItem('kids_spelling_profiles_v1', JSON.stringify(this.profiles));
  }

  cacheDom() {
    this.dom = {
      // 學生切換與統計
      userTimBtn: document.getElementById('user-tim'),
      userBellaBtn: document.getElementById('user-bella'),
      userStarsEl: document.getElementById('user-stars'),
      currentUserNameEl: document.getElementById('current-user-name'),
      statsModalBtn: document.getElementById('open-stats-btn'),
      statsModal: document.getElementById('stats-modal'),
      closeStatsBtn: document.getElementById('close-stats-btn'),
      statsList: document.getElementById('stats-list'),
      categoryTabs: document.getElementById('category-tabs'),
      
      // 單字展示區
      wordImg: document.getElementById('word-image'),
      wordTranslation: document.getElementById('word-translation'),
      wordPhonics: document.getElementById('word-phonics'),
      wordHint: document.getElementById('word-hint'),
      speakBtn: document.getElementById('speak-btn'),
      speakSlowBtn: document.getElementById('speak-slow-btn'),

      // 拼字與字母操作區
      slotsContainer: document.getElementById('slots-container'),
      lettersPoolContainer: document.getElementById('letters-pool'),
      resetLettersBtn: document.getElementById('reset-letters-btn'),
      hintBtn: document.getElementById('hint-btn'),
      prevWordBtn: document.getElementById('prev-word-btn'),
      nextWordBtn: document.getElementById('next-word-btn'),
      wordCounter: document.getElementById('word-counter'),

      // 回饋提示區
      feedbackCard: document.getElementById('feedback-card'),
      feedbackEmoji: document.getElementById('feedback-emoji'),
      feedbackTitle: document.getElementById('feedback-title'),
      feedbackSubtitle: document.getElementById('feedback-subtitle'),
      feedbackActionBtn: document.getElementById('feedback-action-btn')
    };
  }

  renderCategoryTabs() {
    if (!this.dom.categoryTabs) return;
    this.dom.categoryTabs.innerHTML = '';

    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isActive = this.currentCategory === cat.id;
      btn.className = `flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-200 ${
        isActive 
          ? 'bg-indigo-600 text-white shadow-md scale-105' 
          : 'bg-white/80 hover:bg-white text-slate-600 shadow-sm border border-slate-200'
      }`;
      btn.innerHTML = `<span>${cat.icon}</span><span>${cat.name}</span>`;
      btn.addEventListener('click', () => {
        if (this.currentCategory === cat.id) return;
        sfx.playPop();
        this.currentCategory = cat.id;
        this.words = this.getWordsByCategory(this.currentCategory);
        this.renderCategoryTabs();
        this.loadWord(0);
      });
      this.dom.categoryTabs.appendChild(btn);
    });
  }

  bindEvents() {
    // 使用者切換
    this.dom.userTimBtn.addEventListener('click', () => this.switchUser('Tim'));
    this.dom.userBellaBtn.addEventListener('click', () => this.switchUser('Bella'));

    // 發音
    this.dom.speakBtn.addEventListener('click', () => this.speak(this.getCurrentWord().word, 0.9));
    this.dom.speakSlowBtn.addEventListener('click', () => this.speak(this.getCurrentWord().word, 0.55));

    // 按鈕
    this.dom.resetLettersBtn.addEventListener('click', () => this.resetCurrentBoard());
    this.dom.hintBtn.addEventListener('click', () => this.giveHint());
    this.dom.prevWordBtn.addEventListener('click', () => this.prevWord());
    this.dom.nextWordBtn.addEventListener('click', () => this.nextWord());

    // 統計彈窗
    this.dom.statsModalBtn.addEventListener('click', () => this.showStats());
    this.dom.closeStatsBtn.addEventListener('click', () => this.hideStats());
    this.dom.statsModal.addEventListener('click', (e) => {
      if (e.target === this.dom.statsModal) this.hideStats();
    });

    // 回饋彈窗按鈕
    this.dom.feedbackActionBtn.addEventListener('click', () => {
      this.dom.feedbackCard.classList.add('hidden');
      if (this.isSolved) {
        this.nextWord();
      }
    });
  }

  switchUser(user) {
    sfx.playPop();
    this.currentUser = user;
    this.renderProfile();
    this.loadWord(this.currentIndex);
  }

  renderProfile() {
    const profile = this.profiles[this.currentUser];
    this.dom.currentUserNameEl.textContent = profile.name;
    this.dom.userStarsEl.textContent = profile.stars;

    if (this.currentUser === 'Tim') {
      this.dom.userTimBtn.classList.add('ring-4', 'ring-amber-400', 'bg-blue-100', 'scale-105');
      this.dom.userTimBtn.classList.remove('opacity-70');
      this.dom.userBellaBtn.classList.remove('ring-4', 'ring-amber-400', 'bg-pink-100', 'scale-105');
      this.dom.userBellaBtn.classList.add('opacity-70');
    } else {
      this.dom.userBellaBtn.classList.add('ring-4', 'ring-amber-400', 'bg-pink-100', 'scale-105');
      this.dom.userBellaBtn.classList.remove('opacity-70');
      this.dom.userTimBtn.classList.remove('ring-4', 'ring-amber-400', 'bg-blue-100', 'scale-105');
      this.dom.userTimBtn.classList.add('opacity-70');
    }
  }

  getCurrentWord() {
    return this.words[this.currentIndex] || this.words[0];
  }

  loadWord(index) {
    if (this.words.length === 0) return;
    if (index < 0) index = this.words.length - 1;
    if (index >= this.words.length) index = 0;
    this.currentIndex = index;
    this.isSolved = false;

    const wordData = this.getCurrentWord();
    const wordClean = wordData.word.toUpperCase();

    // 更新介面
    this.dom.wordImg.src = wordData.image;
    this.dom.wordImg.alt = wordData.translation;
    this.dom.wordTranslation.textContent = wordData.translation;
    this.dom.wordPhonics.textContent = wordData.phonics || '';
    this.dom.wordHint.textContent = wordData.hint || '';
    this.dom.wordCounter.textContent = `${this.currentIndex + 1} / ${this.words.length}`;
    this.dom.feedbackCard.classList.add('hidden');

    // 檢查目前使用者是否已經過關過這個單字
    const isCompleted = !!this.profiles[this.currentUser].completed[wordData.id];
    const completedBadge = document.getElementById('word-completed-badge');
    if (completedBadge) {
      completedBadge.classList.toggle('hidden', !isCompleted);
    }

    // 初始化格子與字母池
    this.slots = new Array(wordClean.length).fill(null);

    // 將字母打亂
    const chars = wordClean.split('');
    const lettersWithId = chars.map((ch, idx) => ({ id: idx, char: ch, used: false }));
    
    // 隨機打亂 (洗牌演算法，確保不跟原本單字完全一致，除非只有1個字母)
    let shuffled;
    let attempts = 0;
    do {
      shuffled = [...lettersWithId].sort(() => Math.random() - 0.5);
      attempts++;
    } while (shuffled.map(l => l.char).join('') === wordClean && chars.length > 2 && attempts < 10);

    this.letterPool = shuffled;

    this.renderBoard();
    // 自動播放一次發音吸引小孩注意
    setTimeout(() => {
      this.speak(wordData.word, 0.9);
    }, 300);
  }

  renderBoard() {
    this.renderSlots();
    this.renderPool();
  }

  renderSlots() {
    this.dom.slotsContainer.innerHTML = '';
    this.slots.forEach((slotItem, slotIndex) => {
      const slotEl = document.createElement('div');
      slotEl.className = `w-13 h-15 sm:w-16 sm:h-18 md:w-18 md:h-22 rounded-2xl flex items-center justify-center font-bold text-2xl sm:text-3xl md:text-4xl shadow-inner transition-all duration-200 cursor-pointer select-none ${
        slotItem 
          ? 'bg-amber-300 text-amber-950 border-3 border-amber-400 shadow-md transform active:scale-95' 
          : 'bg-white/80 border-3 border-dashed border-sky-300 text-transparent hover:border-sky-400'
      }`;
      slotEl.dataset.slotIndex = slotIndex;

      if (slotItem) {
        slotEl.textContent = slotItem.char;
        // 點擊已填入的格子 -> 退回字母池
        slotEl.addEventListener('click', () => {
          if (this.isSolved) return;
          this.removeLetterFromSlot(slotIndex);
        });
      } else {
        slotEl.innerHTML = `<span class="text-sky-200 text-lg font-normal">${slotIndex + 1}</span>`;
      }

      // Drag & Drop 目標槽支援
      slotEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        slotEl.classList.add('bg-amber-100', 'border-amber-400');
      });
      slotEl.addEventListener('dragleave', () => {
        slotEl.classList.remove('bg-amber-100', 'border-amber-400');
      });
      slotEl.addEventListener('drop', (e) => {
        e.preventDefault();
        slotEl.classList.remove('bg-amber-100', 'border-amber-400');
        const poolId = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (!isNaN(poolId)) {
          this.placeLetterInSlot(poolId, slotIndex);
        }
      });

      this.dom.slotsContainer.appendChild(slotEl);
    });
  }

  renderPool() {
    this.dom.lettersPoolContainer.innerHTML = '';
    this.letterPool.forEach((item) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `w-13 h-15 sm:w-16 sm:h-18 md:w-18 md:h-22 rounded-2xl flex items-center justify-center font-extrabold text-2xl sm:text-3xl md:text-4xl shadow-lg transition-all duration-200 select-none ${
        item.used 
          ? 'opacity-20 pointer-events-none bg-slate-200 border-2 border-slate-300 text-slate-400 scale-90' 
          : 'bg-gradient-to-b from-sky-400 to-blue-500 text-white border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 hover:scale-105 active:scale-95 cursor-grab'
      }`;
      card.textContent = item.char;
      card.dataset.poolId = item.id;
      card.draggable = !item.used && !this.isSolved;

      // 支援點擊直接填入第一個空位 (對 iPad / 幼童手指極度友善)
      card.addEventListener('click', () => {
        if (item.used || this.isSolved) return;
        const emptySlotIndex = this.slots.findIndex(s => s === null);
        if (emptySlotIndex !== -1) {
          this.placeLetterInSlot(item.id, emptySlotIndex);
        } else {
          // 格子都滿了，播放小提示
          sfx.playTryAgain();
        }
      });

      // 支援桌面與觸控 Drag
      card.addEventListener('dragstart', (e) => {
        if (item.used || this.isSolved) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.setData('text/plain', item.id.toString());
        card.classList.add('opacity-50');
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('opacity-50');
      });

      this.dom.lettersPoolContainer.appendChild(card);
    });
  }

  placeLetterInSlot(poolId, slotIndex) {
    const poolItem = this.letterPool.find(l => l.id === poolId);
    if (!poolItem || poolItem.used) return;

    // 如果該 slot 原本就有字母，先退回原本的
    if (this.slots[slotIndex]) {
      const oldPoolId = this.slots[slotIndex].poolId;
      const oldPoolItem = this.letterPool.find(l => l.id === oldPoolId);
      if (oldPoolItem) oldPoolItem.used = false;
    }

    poolItem.used = true;
    this.slots[slotIndex] = { char: poolItem.char, poolId: poolItem.id };
    sfx.playPop();

    this.renderBoard();
    this.checkIfComplete();
  }

  removeLetterFromSlot(slotIndex) {
    const slotItem = this.slots[slotIndex];
    if (!slotItem) return;

    const poolItem = this.letterPool.find(l => l.id === slotItem.poolId);
    if (poolItem) poolItem.used = false;

    this.slots[slotIndex] = null;
    sfx.playRemove();
    this.renderBoard();
  }

  resetCurrentBoard() {
    sfx.playRemove();
    this.letterPool.forEach(l => l.used = false);
    this.slots = new Array(this.getCurrentWord().word.length).fill(null);
    this.renderBoard();
  }

  giveHint() {
    if (this.isSolved) return;
    const currentWord = this.getCurrentWord().word.toUpperCase();
    
    // 找出第一個還沒放對的格子
    for (let i = 0; i < currentWord.length; i++) {
      const targetChar = currentWord[i];
      const currentSlot = this.slots[i];

      if (!currentSlot || currentSlot.char !== targetChar) {
        // 如果該格子放了錯的字母，退回去
        if (currentSlot) {
          this.removeLetterFromSlot(i);
        }

        // 從 pool 找到尚未使用的正確字母 (或者把被錯放到別格的搶過來)
        let availablePoolItem = this.letterPool.find(l => l.char === targetChar && !l.used);
        if (!availablePoolItem) {
          // 如果被放到了其他格子，先從其他格子拿出來
          const otherSlotIdx = this.slots.findIndex(s => s && s.char === targetChar);
          if (otherSlotIdx !== -1) {
            const borrowedPoolId = this.slots[otherSlotIdx].poolId;
            this.slots[otherSlotIdx] = null;
            availablePoolItem = this.letterPool.find(l => l.id === borrowedPoolId);
            availablePoolItem.used = false;
          }
        }

        if (availablePoolItem) {
          this.placeLetterInSlot(availablePoolItem.id, i);
          // 提示格閃爍特效
          const slotElements = this.dom.slotsContainer.children;
          if (slotElements[i]) {
            slotElements[i].classList.add('ring-4', 'ring-emerald-400');
            setTimeout(() => slotElements[i]?.classList.remove('ring-4', 'ring-emerald-400'), 800);
          }
        }
        break;
      }
    }
  }

  checkIfComplete() {
    // 檢查是否所有格子都已填入
    const isAllFilled = this.slots.every(s => s !== null);
    if (!isAllFilled) return;

    const currentWord = this.getCurrentWord().word.toUpperCase();
    const assembledWord = this.slots.map(s => s.char).join('');

    if (assembledWord === currentWord) {
      this.handleSuccess();
    } else {
      this.handleFailure();
    }
  }

  handleSuccess() {
    this.isSolved = true;
    sfx.playSuccess();
    this.triggerConfetti();

    // 更新紀錄
    const profile = this.profiles[this.currentUser];
    const word = this.getCurrentWord();
    const isFirstTime = !profile.completed[word.id];

    if (isFirstTime) {
      profile.stars += 1;
      profile.completed[word.id] = {
        date: new Date().toISOString(),
        times: 1
      };
    } else {
      profile.completed[word.id].times = (profile.completed[word.id].times || 1) + 1;
    }
    profile.history.push({
      word: word.word,
      success: true,
      time: new Date().toLocaleTimeString()
    });
    this.saveProfiles();
    this.renderProfile();

    // 隨機選一句正向鼓勵
    const praiseTemplate = PRAISES[Math.floor(Math.random() * PRAISES.length)];
    const praiseEn = praiseTemplate.en.replace('{name}', this.currentUser);
    const praiseZh = praiseTemplate.zh.replace('{name}', this.currentUser);

    // 顯示回饋卡片
    this.dom.feedbackEmoji.textContent = '🌟 🎉 🏆';
    this.dom.feedbackTitle.textContent = praiseZh;
    this.dom.feedbackSubtitle.textContent = praiseEn;
    this.dom.feedbackActionBtn.textContent = '挑戰下一個單字 ➡️';
    this.dom.feedbackCard.classList.remove('hidden');

    // 語音讚美
    setTimeout(() => {
      this.speak(praiseEn, 0.95);
    }, 400);
  }

  handleFailure() {
    sfx.playTryAgain();

    // 讓格子震動動畫
    this.dom.slotsContainer.classList.add('animate-shake');
    setTimeout(() => {
      this.dom.slotsContainer.classList.remove('animate-shake');
    }, 600);

    const profile = this.profiles[this.currentUser];
    const word = this.getCurrentWord();
    profile.history.push({
      word: word.word,
      success: false,
      time: new Date().toLocaleTimeString()
    });
    this.saveProfiles();

    // 溫和鼓勵
    const enc = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
    this.dom.feedbackEmoji.textContent = '💪 ✨ 🌱';
    this.dom.feedbackTitle.textContent = enc.zh;
    this.dom.feedbackSubtitle.textContent = enc.en;
    this.dom.feedbackActionBtn.textContent = '好，我再試一次！🔁';
    this.dom.feedbackCard.classList.remove('hidden');

    // 語音鼓勵
    setTimeout(() => {
      this.speak(enc.en, 0.9);
    }, 300);
  }

  triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    }
  }

  speak(text, rate = 0.9) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // 停止先前的朗讀

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = rate;
    utter.pitch = 1.1; // 稍微童趣高一點點的音調
    utter.lang = 'en-US';

    // 嘗試挑選自然清晰的英文語音庫
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google')));
    if (naturalVoice) utter.voice = naturalVoice;

    window.speechSynthesis.speak(utter);
  }

  prevWord() {
    sfx.playPop();
    this.loadWord(this.currentIndex - 1);
  }

  nextWord() {
    sfx.playPop();
    this.loadWord(this.currentIndex + 1);
  }

  showStats() {
    sfx.playPop();
    const profile = this.profiles[this.currentUser];
    const completedKeys = Object.keys(profile.completed);

    let html = `
      <div class="flex items-center gap-4 bg-amber-50 p-4 rounded-2xl mb-4 border border-amber-200">
        <div class="text-5xl">${profile.avatar}</div>
        <div>
          <h3 class="text-2xl font-black text-slate-800">${profile.name} 的成就單</h3>
          <p class="text-amber-600 font-bold text-lg">累積獲得 ⭐ ${profile.stars} 顆星星</p>
        </div>
      </div>

      <div class="mb-4">
        <h4 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">已掌握單字 (${completedKeys.length} / ${this.allWords.length})</h4>
        <div class="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
    `;

    this.allWords.forEach(w => {
      const isDone = !!profile.completed[w.id];
      const count = isDone ? profile.completed[w.id].times || 1 : 0;
      html += `
        <div class="flex items-center gap-2 p-2 rounded-xl border ${isDone ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'}">
          <span class="text-lg">${isDone ? '✅' : '⚪'}</span>
          <span class="font-extrabold text-base">${w.word}</span>
          <span class="text-xs text-slate-500">(${w.translation})</span>
          ${isDone ? `<span class="ml-auto text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-bold">x${count}</span>` : ''}
        </div>
      `;
    });

    html += `
        </div>
      </div>
      <div class="text-center pt-2">
        <button id="reset-user-progress-btn" class="text-xs text-red-400 hover:text-red-600 underline">重設 ${profile.name} 的歷史紀錄</button>
      </div>
    `;

    this.dom.statsList.innerHTML = html;

    document.getElementById('reset-user-progress-btn')?.addEventListener('click', () => {
      if (confirm(`確定要將 ${profile.name} 的紀錄歸零重新開始嗎？`)) {
        this.profiles[this.currentUser] = {
          name: profile.name,
          avatar: profile.avatar,
          stars: 0,
          completed: {},
          history: []
        };
        this.saveProfiles();
        this.renderProfile();
        this.showStats();
      }
    });

    this.dom.statsModal.classList.remove('hidden');
  }

  hideStats() {
    this.dom.statsModal.classList.add('hidden');
  }
}

// 啟動程式
window.addEventListener('DOMContentLoaded', () => {
  new SpellingApp();
});
