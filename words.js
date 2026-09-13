// 依據課本內容建立的完整單字題庫與分類
export const categories = [
  { id: "all", name: "全部單字", icon: "🌈" },
  { id: "phonics", name: "Phonics 發音拼讀", icon: "🔤" },
  { id: "weather", name: "天氣單元", icon: "⛅" },
  { id: "numbers", name: "數字 11-20", icon: "🔢" },
  { id: "life", name: "動物與人物", icon: "🐾" }
];

export const initialWords = [
  // ======================
  // 1. Phonics 拼讀 (課本 p.6 & p.12)
  // ======================
  {
    id: "cap",
    word: "CAP",
    category: "phonics",
    translation: "鴨舌帽 / 便帽",
    phonics: "/kæp/",
    hint: "戴在頭上遮陽的帽子",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M15 65 Q50 30 85 65 Z" fill="%232563eb"/><path d="M50 65 Q75 60 95 68 Q75 75 50 65 Z" fill="%231d4ed8"/><circle cx="50" cy="46" r="4" fill="%231e40af"/><circle cx="50" cy="38" r="3" fill="%23fbbf24"/></svg>`
  },
  {
    id: "cape",
    word: "CAPE",
    category: "phonics",
    translation: "披風",
    phonics: "/keɪp/",
    hint: "超級英雄身後帥氣的斗篷",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M40 25 L60 25 L80 85 L50 78 L20 85 Z" fill="%23ef4444"/><circle cx="50" cy="22" r="6" fill="%23fbbf24"/><path d="M35 25 Q50 30 65 25" stroke="%23b91c1c" stroke-width="3" fill="none"/></svg>`
  },
  {
    id: "mat",
    word: "MAT",
    category: "phonics",
    translation: "地墊 / 腳踏墊",
    phonics: "/mæt/",
    hint: "鋪在門口或地板上的小墊子",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="15" y="35" width="70" height="40" rx="6" fill="%238b5cf6"/><line x1="20" y1="45" x2="80" y2="45" stroke="%23c4b5fd" stroke-width="3"/><line x1="20" y1="55" x2="80" y2="55" stroke="%23c4b5fd" stroke-width="3"/><line x1="20" y1="65" x2="80" y2="65" stroke="%23c4b5fd" stroke-width="3"/></svg>`
  },
  {
    id: "mate",
    word: "MATE",
    category: "phonics",
    translation: "好朋友 / 同伴",
    phonics: "/meɪt/",
    hint: "一起玩耍的好同伴",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="35" cy="40" r="14" fill="%23f59e0b"/><path d="M20 75 Q35 55 50 75 Z" fill="%233b82f6"/><circle cx="65" cy="40" r="14" fill="%23ec4899"/><path d="M50 75 Q65 55 80 75 Z" fill="%2310b981"/><path d="M35 60 L65 60" stroke="%23fcd34d" stroke-width="4" stroke-linecap="round"/></svg>`
  },
  {
    id: "tap",
    word: "TAP",
    category: "phonics",
    translation: "水龍頭",
    phonics: "/tæp/",
    hint: "打開會有乾淨的水流出來",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M30 65 L45 65 L45 35 Q45 20 60 20 L70 20 L70 35 L60 35 L60 65" fill="%2394a3b8"/><rect x="55" y="10" width="20" height="6" rx="2" fill="%2364748b"/><path d="M65 42 Q65 52 65 60" stroke="%2338bdf8" stroke-width="4" stroke-linecap="round"/><circle cx="65" cy="72" r="4" fill="%2338bdf8"/></svg>`
  },
  {
    id: "tape",
    word: "TAPE",
    category: "phonics",
    translation: "膠帶",
    phonics: "/teɪp/",
    hint: "黏紙張或箱子用的黏黏帶子",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="32" fill="%23fbbf24"/><circle cx="50" cy="50" r="16" fill="%23f8fafc"/><path d="M50 82 L78 82 L78 72 L50 72 Z" fill="%23f59e0b"/></svg>`
  },
  {
    id: "cat",
    word: "CAT",
    category: "phonics",
    translation: "貓咪",
    phonics: "/kæt/",
    hint: "會喵喵叫的小動物",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="55" r="35" fill="%23fb923c"/><polygon points="20,40 30,12 45,30" fill="%23f97316"/><polygon points="80,40 70,12 55,30" fill="%23f97316"/><circle cx="37" cy="50" r="5" fill="%231e293b"/><circle cx="63" cy="50" r="5" fill="%231e293b"/><polygon points="50,58 46,63 54,63" fill="%23f43f5e"/><path d="M46 64 Q50 68 54 64" stroke="%231e293b" stroke-width="2" fill="none"/></svg>`
  },
  {
    id: "bat",
    word: "BAT",
    category: "phonics",
    translation: "蝙蝠",
    phonics: "/bæt/",
    hint: "夜晚在空中倒掛飛翔的動物",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><ellipse cx="50" cy="55" rx="14" ry="20" fill="%23475569"/><path d="M38 50 Q10 20 15 65 Q25 55 38 60 Z" fill="%23334155"/><path d="M62 50 Q90 20 85 65 Q75 55 62 60 Z" fill="%23334155"/><polygon points="43,38 41,28 47,36" fill="%23475569"/><polygon points="57,38 59,28 53,36" fill="%23475569"/><circle cx="45" cy="48" r="2" fill="%23facc15"/><circle cx="55" cy="48" r="2" fill="%23facc15"/></svg>`
  },
  {
    id: "fox",
    word: "FOX",
    category: "phonics",
    translation: "狐狸",
    phonics: "/fɑːks/",
    hint: "橘紅色蓬鬆尾巴的聰明動物",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,75 25,40 75,40" fill="%23ea580c"/><polygon points="25,40 30,18 45,35" fill="%23c2410c"/><polygon points="75,40 70,18 55,35" fill="%23c2410c"/><polygon points="50,75 35,50 65,50" fill="%23f8fafc"/><circle cx="40" cy="48" r="3" fill="%230f172a"/><circle cx="60" cy="48" r="3" fill="%230f172a"/><circle cx="50" cy="72" r="3.5" fill="%230f172a"/></svg>`
  },
  {
    id: "pig",
    word: "PIG",
    category: "phonics",
    translation: "小豬",
    phonics: "/pɪɡ/",
    hint: "粉紅色有大圓鼻孔的小動物",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="34" fill="%23f472b6"/><circle cx="36" cy="40" r="4" fill="%231e293b"/><circle cx="64" cy="40" r="4" fill="%231e293b"/><ellipse cx="50" cy="58" rx="16" ry="11" fill="%23fbcfe8"/><circle cx="44" cy="58" r="3.5" fill="%23db2777"/><circle cx="56" cy="58" r="3.5" fill="%23db2777"/><polygon points="20,32 30,16 38,28" fill="%23ec4899"/><polygon points="80,32 70,16 62,28" fill="%23ec4899"/></svg>`
  },
  {
    id: "box",
    word: "BOX",
    category: "phonics",
    translation: "盒子 / 箱子",
    phonics: "/bɑːks/",
    hint: "可以裝玩具或禮物的箱子",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="25" y="38" width="50" height="42" rx="4" fill="%23d97706"/><rect x="20" y="30" width="60" height="12" rx="3" fill="%23f59e0b"/><rect x="46" y="30" width="8" height="50" fill="%23ef4444"/><circle cx="50" cy="25" r="5" fill="%23ef4444"/></svg>`
  },
  {
    id: "pen",
    word: "PEN",
    category: "phonics",
    translation: "原子筆",
    phonics: "/pen/",
    hint: "寫字與畫畫的筆",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="42" y="20" width="16" height="50" rx="3" fill="%233b82f6"/><polygon points="42,70 58,70 50,88" fill="%2394a3b8"/><circle cx="50" cy="88" r="1.5" fill="%231e293b"/><rect x="45" y="12" width="10" height="8" rx="2" fill="%231d4ed8"/></svg>`
  },
  {
    id: "bug",
    word: "BUG",
    category: "phonics",
    translation: "小蟲蟲 / 瓢蟲",
    phonics: "/bʌɡ/",
    hint: "草地上爬行的小昆蟲",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="30" r="12" fill="%231e293b"/><ellipse cx="50" cy="62" rx="26" ry="24" fill="%23ef4444"/><line x1="50" y1="38" x2="50" y2="86" stroke="%231e293b" stroke-width="3"/><circle cx="36" cy="54" r="4" fill="%231e293b"/><circle cx="64" cy="54" r="4" fill="%231e293b"/><circle cx="40" cy="72" r="4" fill="%231e293b"/><circle cx="60" cy="72" r="4" fill="%231e293b"/><line x1="44" y1="20" x2="36" y2="10" stroke="%231e293b" stroke-width="3"/><line x1="56" y1="20" x2="64" y2="10" stroke="%231e293b" stroke-width="3"/></svg>`
  },
  {
    id: "run",
    word: "RUN",
    category: "phonics",
    translation: "跑步",
    phonics: "/rʌn/",
    hint: "邁開大步快快向前跑",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="60" cy="22" r="8" fill="%23f59e0b"/><path d="M56 30 L46 50 L64 56" stroke="%233b82f6" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M46 50 L34 70 L20 66" stroke="%231e293b" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M50 42 L66 38 L80 48" stroke="%231e293b" stroke-width="6" stroke-linecap="round" fill="none"/></svg>`
  },

  // ======================
  // 2. Weather 天氣 (課本 p.20)
  // ======================
  {
    id: "sunny",
    word: "SUNNY",
    category: "weather",
    translation: "晴天 / 艷陽天",
    phonics: "/ˈsʌn.i/",
    hint: "大太陽高高掛，天氣很好",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g stroke="%23f59e0b" stroke-width="6" stroke-linecap="round"><line x1="50" y1="10" x2="50" y2="20"/><line x1="50" y1="80" x2="50" y2="90"/><line x1="10" y1="50" x2="20" y2="50"/><line x1="80" y1="50" x2="90" y2="50"/><line x1="22" y1="22" x2="29" y2="29"/><line x1="71" y1="71" x2="78" y2="78"/><line x1="22" y1="78" x2="29" y2="71"/><line x1="71" y1="29" x2="78" y2="22"/></g><circle cx="50" cy="50" r="24" fill="%23fbbf24"/></svg>`
  },
  {
    id: "rainy",
    word: "RAINY",
    category: "weather",
    translation: "下雨天",
    phonics: "/ˈreɪ.ni/",
    hint: "天空下著小雨，出門要撐傘",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M25 55 Q20 40 35 35 Q40 20 60 25 Q75 18 80 35 Q90 40 85 55 Z" fill="%2394a3b8"/><line x1="30" y1="65" x2="25" y2="80" stroke="%2338bdf8" stroke-width="4" stroke-linecap="round"/><line x1="45" y1="65" x2="40" y2="80" stroke="%2338bdf8" stroke-width="4" stroke-linecap="round"/><line x1="60" y1="65" x2="55" y2="80" stroke="%2338bdf8" stroke-width="4" stroke-linecap="round"/><line x1="75" y1="65" x2="70" y2="80" stroke="%2338bdf8" stroke-width="4" stroke-linecap="round"/></svg>`
  },
  {
    id: "cloudy",
    word: "CLOUDY",
    category: "weather",
    translation: "多雲 / 陰天",
    phonics: "/ˈklaʊ.di/",
    hint: "天上好多白雲灰雲把太陽遮住了",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="40" cy="40" r="14" fill="%23fcd34d"/><path d="M25 65 Q18 50 32 46 Q38 32 58 36 Q72 30 78 44 Q88 48 82 65 Z" fill="%23cbd5e1"/></svg>`
  },
  {
    id: "windy",
    word: "WINDY",
    category: "weather",
    translation: "風大 / 起風",
    phonics: "/ˈwɪn.di/",
    hint: "吹起大風，樹木都跟著搖擺",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M15 35 L60 35 Q75 35 75 25 Q75 15 65 15 Q55 15 55 22" stroke="%2338bdf8" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M10 50 L70 50 Q85 50 85 60 Q85 70 75 70 Q65 70 65 62" stroke="%2338bdf8" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M20 65 L50 65" stroke="%2338bdf8" stroke-width="5" stroke-linecap="round" fill="none"/></svg>`
  },
  {
    id: "cold",
    word: "COLD",
    category: "weather",
    translation: "寒冷 / 好冷",
    phonics: "/koʊld/",
    hint: "天氣冷颼颼，要穿厚外套圍巾",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="40" r="14" fill="%23fbcfe8"/><circle cx="50" cy="72" r="22" fill="%2338bdf8"/><path d="M36 30 Q50 18 64 30 Z" fill="%230284c7"/><circle cx="50" cy="18" r="5" fill="%23fff"/><circle cx="44" cy="40" r="2.5" fill="%231e293b"/><circle cx="56" cy="40" r="2.5" fill="%231e293b"/><rect x="36" y="50" width="28" height="8" rx="4" fill="%23ef4444"/><circle cx="20" cy="25" r="3" fill="%237dd3fc"/><circle cx="80" cy="30" r="2" fill="%237dd3fc"/></svg>`
  },
  {
    id: "hot",
    word: "HOT",
    category: "weather",
    translation: "炎熱 / 好熱",
    phonics: "/hɑːt/",
    hint: "太陽好大滿頭大汗，想吃冰淇淋",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="42" y="15" width="16" height="50" rx="8" fill="%23f1f5f9" stroke="%23cbd5e1" stroke-width="3"/><circle cx="50" cy="72" r="18" fill="%23ef4444"/><rect x="46" y="35" width="8" height="30" fill="%23ef4444"/><line x1="66" y1="25" x2="74" y2="25" stroke="%23ef4444" stroke-width="2"/><line x1="66" y1="35" x2="74" y2="35" stroke="%23ef4444" stroke-width="2"/><line x1="66" y1="45" x2="74" y2="45" stroke="%23ef4444" stroke-width="2"/></svg>`
  },

  // ======================
  // 3. Numbers 數字 11-20 (課本 p.10)
  // ======================
  {
    id: "eleven",
    word: "ELEVEN",
    category: "numbers",
    translation: "十一 (11)",
    phonics: "/ɪˈlev.ən/",
    hint: "數字 11",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23fef08a"/><text x="50" y="62" font-size="38" font-weight="bold" fill="%23854d0e" text-anchor="middle" font-family="sans-serif">11</text></svg>`
  },
  {
    id: "twelve",
    word: "TWELVE",
    category: "numbers",
    translation: "十二 (12)",
    phonics: "/twelv/",
    hint: "數字 12",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23bbf7d0"/><text x="50" y="62" font-size="38" font-weight="bold" fill="%23166534" text-anchor="middle" font-family="sans-serif">12</text></svg>`
  },
  {
    id: "thirteen",
    word: "THIRTEEN",
    category: "numbers",
    translation: "十三 (13)",
    phonics: "/ˌθɝːˈtiːn/",
    hint: "數字 13",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23fed7aa"/><text x="50" y="62" font-size="38" font-weight="bold" fill="%239a3412" text-anchor="middle" font-family="sans-serif">13</text></svg>`
  },
  {
    id: "fourteen",
    word: "FOURTEEN",
    category: "numbers",
    translation: "十四 (14)",
    phonics: "/ˌfɔːrˈtiːn/",
    hint: "數字 14",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23bae6fd"/><text x="50" y="62" font-size="38" font-weight="bold" fill="%23075985" text-anchor="middle" font-family="sans-serif">14</text></svg>`
  },
  {
    id: "fifteen",
    word: "FIFTEEN",
    category: "numbers",
    translation: "十五 (15)",
    phonics: "/ˌfɪfˈtiːn/",
    hint: "數字 15",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23fbcfe8"/><text x="50" y="62" font-size="38" font-weight="bold" fill="%239d174d" text-anchor="middle" font-family="sans-serif">15</text></svg>`
  },
  {
    id: "twenty",
    word: "TWENTY",
    category: "numbers",
    translation: "二十 (20)",
    phonics: "/ˈtwen.ti/",
    hint: "數字 20",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23ddd6fe"/><text x="50" y="62" font-size="38" font-weight="bold" fill="%235b21b6" text-anchor="middle" font-family="sans-serif">20</text></svg>`
  },

  // ======================
  // 4. Animals & Life 動物與人物 (課本 p.4-5)
  // ======================
  {
    id: "dog",
    word: "DOG",
    category: "life",
    translation: "小狗",
    phonics: "/dɔːɡ/",
    hint: "會汪汪叫的忠實好夥伴",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="52" r="34" fill="%23fcd34d"/><ellipse cx="22" cy="52" rx="10" ry="20" fill="%23b45309"/><ellipse cx="78" cy="52" rx="10" ry="20" fill="%23b45309"/><circle cx="38" cy="48" r="5" fill="%231e293b"/><circle cx="62" cy="48" r="5" fill="%231e293b"/><ellipse cx="50" cy="58" rx="7" ry="5" fill="%231e293b"/><ellipse cx="50" cy="69" rx="4" ry="6" fill="%23f43f5e"/></svg>`
  },
  {
    id: "bird",
    word: "BIRD",
    category: "life",
    translation: "小鳥",
    phonics: "/bɝːd/",
    hint: "有翅膀可以在天空中飛翔",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="45" cy="50" r="26" fill="%2338bdf8"/><polygon points="68,48 88,54 68,60" fill="%23f59e0b"/><circle cx="54" cy="42" r="4" fill="%230f172a"/><path d="M22 55 Q35 70 20 75 Z" fill="%230284c7"/></svg>`
  },
  {
    id: "frog",
    word: "FROG",
    category: "life",
    translation: "青蛙",
    phonics: "/frɑːɡ/",
    hint: "綠色皮膚、跳很高、呱呱叫",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><ellipse cx="50" cy="58" rx="34" ry="26" fill="%234ade80"/><circle cx="35" cy="35" r="14" fill="%2322c55e"/><circle cx="65" cy="35" r="14" fill="%2322c55e"/><circle cx="35" cy="35" r="7" fill="%230f172a"/><circle cx="65" cy="35" r="7" fill="%230f172a"/><path d="M38 65 Q50 75 62 65" stroke="%2314532d" stroke-width="3" stroke-linecap="round" fill="none"/></svg>`
  },
  {
    id: "rabbit",
    word: "RABBIT",
    category: "life",
    translation: "兔子",
    phonics: "/ˈræb.ɪt/",
    hint: "長長耳朵、愛吃胡蘿蔔的小動物",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><ellipse cx="38" cy="24" rx="8" ry="22" fill="%23f1f5f9"/><ellipse cx="62" cy="24" rx="8" ry="22" fill="%23f1f5f9"/><ellipse cx="38" cy="24" rx="4" ry="16" fill="%23fbcfe8"/><ellipse cx="62" cy="24" rx="4" ry="16" fill="%23fbcfe8"/><circle cx="50" cy="58" r="30" fill="%23f8fafc"/><circle cx="40" cy="52" r="4" fill="%230f172a"/><circle cx="60" cy="52" r="4" fill="%230f172a"/><polygon points="50,60 46,65 54,65" fill="%23f43f5e"/></svg>`
  },
  {
    id: "cook",
    word: "COOK",
    category: "life",
    translation: "廚師",
    phonics: "/kʊk/",
    hint: "戴著白色大帽子做美味料理的人",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="56" r="22" fill="%23fed7aa"/><circle cx="50" cy="28" r="16" fill="%23fff"/><circle cx="36" cy="34" r="12" fill="%23fff"/><circle cx="64" cy="34" r="12" fill="%23fff"/><rect x="36" y="38" width="28" height="8" fill="%23fff"/><circle cx="42" cy="54" r="3" fill="%230f172a"/><circle cx="58" cy="54" r="3" fill="%230f172a"/><path d="M44 65 Q50 70 56 65" stroke="%23ea580c" stroke-width="2.5" stroke-linecap="round" fill="none"/></svg>`
  },
  {
    id: "doctor",
    word: "DOCTOR",
    category: "life",
    translation: "醫生",
    phonics: "/ˈdɑːk.tɚ/",
    hint: "戴聽診器照顧大家健康的人",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="45" r="24" fill="%23fed7aa"/><path d="M25 88 Q50 65 75 88 Z" fill="%230284c7"/><circle cx="42" cy="44" r="3" fill="%230f172a"/><circle cx="58" cy="44" r="3" fill="%230f172a"/><path d="M46 54 Q50 58 54 54" stroke="%23ea580c" stroke-width="2" fill="none"/><rect x="46" y="16" width="8" height="18" fill="%23ef4444"/><rect x="41" y="21" width="18" height="8" fill="%23ef4444"/></svg>`
  },
  {
    id: "dance",
    word: "DANCE",
    category: "life",
    translation: "跳舞",
    phonics: "/dæns/",
    hint: "跟著音樂開心地擺動身體",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="22" r="10" fill="%23fbbf24"/><path d="M50 32 L50 60 L35 85" stroke="%23ec4899" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M50 60 L68 82" stroke="%23ec4899" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M28 42 L50 48 L72 36" stroke="%23ec4899" stroke-width="6" stroke-linecap="round" fill="none"/></svg>`
  },
  {
    id: "swim",
    word: "SWIM",
    category: "life",
    translation: "游泳",
    phonics: "/swɪm/",
    hint: "在清涼的水池裡划水前進",
    image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="68" cy="38" r="10" fill="%23fed7aa"/><ellipse cx="45" cy="50" rx="20" ry="8" fill="%233b82f6"/><path d="M10 70 Q30 60 50 70 T90 70" stroke="%230284c7" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M15 82 Q35 72 55 82 T95 82" stroke="%2338bdf8" stroke-width="5" stroke-linecap="round" fill="none"/></svg>`
  }
];
