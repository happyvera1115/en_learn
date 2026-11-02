# Bella 每月題庫維護

目前預設題庫：2026 年 11 月，21 個上課日、107 個 Key Words 單字及片語。
來源是使用者已開啟的 HyRead《大家說英語》2026 年 11 月號生字總表與各課 Key Words。
中文釋義經整理；所有新增英文例句皆為新編練習句，並非官方逐句轉錄。
9 月原題庫未標年份，因此保留為「9 月（原有題庫）」。目前沒有 10 月完整題庫。

## 每月更新

此站為 GitHub Pages 靜態網頁，不能持續讀取使用者的 HyRead 借閱或限時試閱工作階段。
目前自動選擇最新「已匯入」題庫，不會自動取得出版社的新刊全文。

1. 使用者開啟可正常閱讀的新月份內容。
2. 核對 Key Words、課程日期及片語，新增一個月份資料物件至 `bella_months.js`；新編例句須包含完整目標詞。
3. 將月份資料加入 `BellaMonths.banks`，依年月由舊到新排列。網頁會預設選最後一筆。
4. 執行 `node --test tests/*.test.js`，實際檢查月份、Level、片語、進度，再依專案部署程序更新 GitHub Pages。

進度仍保存在原網域瀏覽器。簡單版沿用 `bella_spelling_profile_v4`，高階版使用 `bella_spelling_profile_advanced_v1`。
本機預覽和正式 GitHub Pages 的進度因來源網域不同而各自獨立。
