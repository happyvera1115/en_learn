/* November words transcribed from the user-opened HyRead November 2026 issue.
 * Example sentences below are independently authored practice material.
 * No reader sessions, access tokens, scans, or publisher audio are stored here.
 */
(function (root) {
  'use strict';
  const lessons = {
    2: [
      ['kitten','小貓','A kitten is hiding under my chair.'],
      ['lap','大腿膝上處','The baby fell asleep on her lap.'],
      ['playful','愛玩的','Our playful puppy loves this ball.'],
      ['bath','洗澡','The muddy puppy needs a bath.'],
      ['feed','餵食','Please feed the rabbit before school.']
    ],
    3: [
      ['building','建築物','There is a bakery in that building.'],
      ['excited','興奮的','Bella is excited about the class trip.'],
      ['fur','毛皮','The rabbit has soft white fur.'],
      ['lower','降低','Please lower your voice in the library.'],
      ['noisy','吵鬧的','The noisy bus woke the baby.']
    ],
    4: [
      ['coworker','同事','My new coworker brings lunch from home.'],
      ['worry','擔心','I worry about our lost puppy.'],
      ['sick','生病的','The sick child stayed home today.'],
      ['cross','交叉','You can cross your legs on this mat.'],
      ['arm','手臂','The nurse put a bandage on my arm.']
    ],
    5: [
      ['state','州','Texas is a large state in America.'],
      ['vacation','假期','Our summer vacation starts next week.'],
      ['kilometer','公里','The pool is one kilometer from here.'],
      ['gentle','溫和的','A gentle wind moved the curtains.'],
      ['wave','海浪','A big wave reached our sandcastle.']
    ],
    6: [
      ['rule','統治','Who will rule the kingdom after the queen?'],
      ['explore','探索','We can explore the island by bicycle.'],
      ['capital','首都','Paris is the capital of France.'],
      ['spice','香料','This spice makes the soup taste warm.'],
      ['garden','花園','We grow tomatoes in our garden.']
    ],
    9: [
      ['bench','長椅','We shared a bench near the playground.'],
      ['change','改變','Please change your shoes before the game.'],
      ['instead of','代替；而不是','We took the stairs instead of the elevator.'],
      ['on time','準時','Our train arrived on time this morning.'],
      ['hurry','趕快','Please hurry or we will miss the bus.']
    ],
    10: [
      ['king','國王','The king wore a purple coat.'],
      ['straw','稻草','The farmer covered the ground with straw.'],
      ['gold','黃金','This small coin is made of gold.'],
      ['cry','哭泣','Sad movies sometimes make me cry.'],
      ['surprised','驚訝的','I was surprised to find a gift in my bag.'],
      ['ring','戒指','Grandma keeps her ring in a little box.']
    ],
    11: [
      ['promise','承諾','I promise to bring your book tomorrow.'],
      ['queen','皇后；女王','The queen visited the village school.'],
      ['beg','懇求','Do not beg your sister for her toys.'],
      ['succeed','成功','Practice can help you succeed at school.'],
      ['scream','尖叫','Please do not scream beside the sleeping baby.']
    ],
    12: [
      ['museum','博物館','The museum has a room full of old clocks.'],
      ['painting','畫作','This painting shows a snowy mountain.'],
      ['paint','畫；塗顏料','We will paint a picture of our school.'],
      ['draw','畫','Can you draw a dinosaur for Tim?'],
      ['bridge','橋','A wooden bridge crosses the little river.']
    ],
    13: [
      ['painter','畫家','The painter uses many bright colors.'],
      ['drawing','圖畫；素描','Your drawing of the puppy is lovely.'],
      ['moment','片刻','Please wait a moment while I find my keys.'],
      ['style','風格','I like the simple style of this room.'],
      ['pond','池塘','Three ducks are swimming in the pond.'],
      ['especially','尤其','I enjoy fruit, especially sweet mangoes.']
    ],
    16: [
      ['hungry','飢餓的','I feel hungry after swimming.'],
      ['quick','快速的','Let us have a quick breakfast before school.'],
      ['snack','點心','An apple is a healthy afternoon snack.'],
      ['national','全國的；國家的','The national team won the final game.'],
      ['Coke','可口可樂','Dad ordered a Coke with his lunch.']
    ],
    17: [
      ['eye','眼睛','A little dust got into my eye.'],
      ['take care of','照顧','I can take care of the plants this week.'],
      ['tired','疲倦的','The tired runner sat down to rest.'],
      ['computer','電腦','My computer is on the desk upstairs.'],
      ['turn on','打開電源','Please turn on the light beside the sofa.']
    ],
    18: [
      ['dry','乾燥的','My shoes are dry after a day in the sun.'],
      ['rub','揉；擦','Do not rub your eyes with dirty hands.'],
      ['germ','細菌','A tiny germ can make a person ill.'],
      ['carrot','胡蘿蔔','The rabbit is eating a fresh carrot.'],
      ['sunglasses','太陽眼鏡','I wear sunglasses on bright summer days.']
    ],
    19: [
      ['fact','事實','Tell me one interesting fact about whales.'],
      ['wild','野生的','We saw a wild rabbit near the river.'],
      ['world','世界','People around the world enjoy music.'],
      ['drama','戲劇','This drama is about a family of doctors.'],
      ['part','部分；集','I missed the first part of the movie.']
    ],
    20: [
      ['challenge','挑戰','Learning this song is a fun challenge.'],
      ['race','比賽','The bicycle race begins at the park.'],
      ['win','贏得','Our team hopes to win the next game.'],
      ['cartoon','卡通','Tim watches a cartoon about brave dogs.'],
      ['adult','成人','An adult must go with children on this ride.']
    ],
    23: [
      ['party','派對','We are planning a party for Grandma.'],
      ['celebrate','慶祝','Let us celebrate your first swimming medal.'],
      ['reason','原因','What is the reason for the long delay?'],
      ['cake','蛋糕','Bella made a lemon cake for her friend.'],
      ['fill','裝滿','Please fill this bottle with cold water.']
    ],
    24: [
      ['host','主辦','Our class will host a game night on Friday.'],
      ['character','角色','My favorite character in the book is a fox.'],
      ['involve','涉及；包含','This project will involve three classes.'],
      ['quite','相當','The water in this pool is quite cold.'],
      ['pizza','披薩','We shared a cheese pizza after the game.']
    ],
    25: [
      ['thankful','感激的','We are thankful for the help from our neighbors.'],
      ['helpful','有幫助的','The helpful guide showed us the way.'],
      ['favor','幫忙','Could you do me a favor and close the door?'],
      ['value','珍惜；重視','I value the time we spend together.'],
      ['in return','作為回報','She gave me a cookie in return for my help.']
    ],
    26: [
      ['joy','喜悅','Music brings joy to our family.'],
      ['positive','正面的；積極的','A positive attitude can make hard days easier.'],
      ['stranger','陌生人','Never share your address with a stranger.'],
      ['happen','發生','What will happen if we miss the train?'],
      ['lady','女士','The lady in the blue coat is our teacher.']
    ],
    27: [
      ['America','美國','My uncle lives in America with his family.'],
      ['turkey','火雞','We saw a turkey walking across the farm.'],
      ['God','上帝','They thank God before their evening meal.'],
      ['prepare','準備','We will prepare sandwiches for the picnic.'],
      ['filling','餡料','This pie has a sweet apple filling.']
    ],
    30: [
      ['get around','四處移動','Bicycles help us get around this small town.'],
      ['train','火車','The train to the city leaves at noon.'],
      ['taxi','計程車','We took a taxi home in the rain.'],
      ['motorcycle','摩托車','A red motorcycle stopped beside our car.'],
      ['scooter','機車；速克達','She wears a helmet when she rides her scooter.']
    ]
  };
  const weeks = [];
  const words = [];
  for (const [date, entries] of Object.entries(lessons)) {
    const dayNumber = Number(date);
    const weekIndex = Math.floor((dayNumber - 2) / 7);
    const week = weeks[weekIndex] ||= { id: `week${weekIndex + 1}`, name: '', icon: '📖', days: [], dateRange: '' };
    const day = `day${week.days.length + 1}`;
    week.days.push(day);
    const weekday = '日一二三四五六'[new Date(Date.UTC(2026, 10, dayNumber)).getUTCDay()];
    for (const [word, translation, sentenceComplete] of entries) {
      const clue = word.replace(/[a-z]/gi, '_');
      words.push({ id: `2026_11_${date}_${word.replaceAll(' ', '_')}`, word, translation,
        sentenceComplete, sentence: sentenceComplete.replace(new RegExp(`\\b${word}\\b`, 'i'), clue), clue,
        week: week.id, day, date: `11/${date}`, dayLabel: `11/${date} (${weekday})`,
        note: `【2026 年 11 月 ${date} 日・新編練習句】`, hint: '依中文意思與例句，拼出單字或片語',
        isProperNoun: ['Coke','America','God'].includes(word),
        image: '' });
    }
  }
  for (const week of weeks) {
    const dates = [...new Set(words.filter(w => w.week === week.id).map(w => w.date))];
    week.dateRange = `${dates[0]} ~ ${dates.at(-1)} (共 ${dates.length} 天)`;
    week.name = `第 ${week.id.slice(4)} 週 (${dates[0]}~${dates.at(-1)})`;
  }
  function answersMatch(answer, target) {
    const normalize = s => String(s).trim().replace(/\s+/g, ' ').toLowerCase();
    return normalize(answer) !== '' && normalize(answer) === normalize(target);
  }
  function hasVerifiedImage(word) {
    return !!(word && word.imageVerified === true && typeof word.image === 'string' && word.image.trim());
  }
  function selectInitialLesson(banks, now = new Date()) {
    const parts = new Intl.DateTimeFormat('en-US', {timeZone:'Asia/Taipei', year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(now);
    const part = type => parts.find(p => p.type === type).value;
    const today = Number(`${part('year')}${part('month')}${part('day')}`);
    const lessons = [];
    for (const bank of banks) {
      if (!/^\d{4}-\d{2}$/.test(bank.id)) continue;
      for (const word of bank.words) {
        const [month, day] = word.date.split('/');
        const date = Number(`${bank.id.slice(0,4)}${month.padStart(2,'0')}${day.padStart(2,'0')}`);
        lessons.push({bank, word, date});
      }
    }
    lessons.sort((a,b) => a.date - b.date);
    const available = lessons.filter(lesson => lesson.date <= today);
    return available.at(-1) || lessons[0] || {bank:banks.at(-1), word:banks.at(-1)?.words[0]};
  }
  const november = { id: '2026-11', label: '2026 年 11 月', words, weeks,
    source: '《大家說英語》2026 年 11 月號 Key Words；例句為新編練習句' };
  const api = { november, banks: [november], answersMatch, hasVerifiedImage, selectInitialLesson };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BellaMonths = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
