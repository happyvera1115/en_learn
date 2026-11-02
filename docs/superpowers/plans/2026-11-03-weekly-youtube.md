# Weekly YouTube Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 每週英文書單可在頁內循環播放，首頁可直接進入。

**Architecture:** 保留書單資料與既有紀錄，獨立 YouTube 資料、URL/佇列工具與 UI 播放控制。純靜態頁，可由 GitHub Pages 提供。

**Tech Stack:** HTML, CSS, JavaScript, YouTube IFrame API, node:test.

**Spec:** docs/superpowers/specs/2026-11-03-weekly-youtube-design.md

## Global Constraints
- 無後端、API key 或新產品依賴。
- 保留七階、84 週與打勾紀錄。
- 本機影片覆寫可還原預設。

## Review Focus
- 非 YouTube 網域或無效 ID 必須拒絕。
- 複習週必須對應原有區塊。
- 全部影片失效不可無限跳轉。
- 重整後保留使用者設定，儲存不可用時需提示。
- 手機播放器可見且控制不遮住書單。

### Task 1: 影片來源與佇列工具
**Files:** liao_youtube_data.js, liao_youtube.js, tests/liao_youtube.test.js, tools/find_liao_youtube.py
**Interfaces:** parseVideoId(value), weeklyBooks(week), buildQueue(books, defaults, overrides), nextIndex(index, length, repeat, auto).
- [x] 先寫 URL、複習週、覆寫與循環測試並確認失敗。
- [x] 實作工具並使 node --test 通過。
- [x] 搜尋各書影片，檢查標題與 metadata，記錄來源。

### Task 2: 播放與編輯介面
**Files:** liao_168.html, liao_player.js, index.html.
**Interfaces:** 使用 Task 1 工具與 window.LIAO_DATA / window.LIAO_YOUTUBE。
- [x] 加入週選擇、循環控制、編輯對話框與可見 YouTube 播放器。
- [x] 以 API ended 驅動佇列；錯誤顯示恢復操作、自動播放被阻擋提示點擊。
- [x] 首頁加入口，保留既有紀錄。
- [x] 跑完整測試、語法檢查與瀏覽器桌機/手機操作驗證。

## Execution decisions
使用者已授權新增功能與影片搜尋；本次直接在現有工作目錄完成可審查修改，不移動既有未追蹤來源、不推送部署。獨立審查完成後記錄驗證結果。

## Verification result

2026-11-03: npm test 13 tests passed; JS syntax checks passed. Chrome desktop/mobile (375 × 812) playback, actual ended → next → last → first loop, persisted replacement URL, and replacement sources confirmed. Independent reviewer found source-removal index bug; fixed with regression tests. Browser-discovered transient rate and timeout retry bugs fixed with regression tests. Five chapter/book entries explicitly remain without presets; user can supply URLs. No deployment or unrelated untracked files committed.
