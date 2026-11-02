# 每週英文書單

首頁 `index.html` 的「每週英文書單」連到 `liao_168.html`。純靜態檔案，沿用原本 GitHub Pages 部署方式。

1. 選擇階段或「跳到週次」，按「本週循環」。
2. 影片會依序播放，最後一本結束回到第一本。底部循環按鈕可改為「單本」或「不循環」。
3. 每本「更換影片」可貼上 YouTube 網址；「還原預設」移除自訂版本。同書跨週共用自訂設定。
4. 複習週會使用前一區塊的書單，點「查看複習書單」可展開。
5. 影片被禁止嵌入時，頁面會停止並提供更換、外開及下一本；瀏覽器阻擋自動播放時，點影片上的播放鍵。

設定與打勾儲存在目前瀏覽器的 localStorage，換裝置不會同步。首次開啟不自動播放。手機鎖屏、切換背景或 YouTube 廣告會受瀏覽器／YouTube 限制。

## 影片來源

`liao_data.js` 保存原本書單，173 個書籍／章節條目對應原標示的 168 本。`liao_youtube_data.js` 保存預設影片 ID、標題、頻道與版本備註，不修改原始 Drive 資料。

截至 2026-11-03，已設定 168 個條目。下列五項未找到可信的對應影片，頁面會標示待補，不使用同名不同作者的影片代替：

- I Am a Star（Jean Marzollo）
- A Child's Treasury of Nursery Rhymes，Ch 1–4（四項）

My Very First Mother Goose Ch 3 使用同書選讀，頁面已標示非指定章節錄音。公開朗讀的版本與原書附贈錄音可能不同。

來源候選記錄位於 `tools/liao_youtube_candidates.json` 與後續 refined / extra / final_search / replacements 檔案；`tools/liao_youtube_verification.json` 保存 YouTube 公開 metadata、嵌入旗標與檢查狀態。初次 168 項檢查有三支影片禁止嵌入，已替換；另修正一筆同名不同作者的影片。後續檢查遇到 HTTP 429，因此替代影片另以瀏覽器實際播放確認，未繞過限流。這些檢查不表示完整觀看所有影片，也不保證不同地區或日後仍可播放。

## 維護與驗證

- 執行 `npm test` 驗證佇列、循環、影片更換、錯誤與保存行為。
- `python -m http.server 3000 --bind 127.0.0.1` 後開啟 `http://localhost:3000/liao_168.html`；不要直接用 file:// 開啟。
- `python tools/find_liao_youtube.py` 產生候選，仍需核對書名、作者、語言、版本，不能直接當成已審閱影片。
- `python tools/verify_liao_youtube.py` 檢查選定影片的公開 metadata。遇到限流時停止，不持續重試。
- 發佈時一併提交 `index.html`、`liao_168.html`、`liao_data.js`、`liao_youtube_data.js`、`liao_youtube.js`、`liao_player.js`。
