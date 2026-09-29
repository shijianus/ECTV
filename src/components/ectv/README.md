# src/components/ectv — ECTV 全新 UI 元件庫

⚠️ 此目錄是 ECTV 自主設計的 UI 層，與 MoonTVPlus 的 `components/` 完全無關，
未引用上游任何 UI 元件。

## 已完成（2026-09-29，首頁）

- `types.ts` — 共用型別 `MediaItem` / `HeroItem`
- `EctvLogo.tsx` — 膠片 E 主圖標 + 藝術字標組合（sm/md/lg）
- `TopNav.tsx` — 桌面頂欄：logo、中導航（首頁/電影/劇集/動漫/直播）、搜尋框、使用者入口；滾動後毛玻璃
- `BottomNav.tsx` — 移動端底部導航（首頁/搜尋/收藏/我的）
- `Hero.tsx` — 全幅電影感輪播：backdrop + 深藍漸層壓暗、大標題/簡介/評分、立即播放/更多資訊、底部膠片齒孔裝飾、自動輪播
- `PosterCard.tsx` — 2:3 海報卡：hover 上浮＋藍輝光＋播放鍵浮現、評分徽章
- `PosterRail.tsx` — 橫滑排：標題＋查看全部＋左右箭頭、scroll-snap、齒孔小標記
- `ContinueWatching.tsx` — 繼續觀看：讀 `/api/playrecords`（401 靜默隱藏）、藍色進度條、可移除
- `Footer.tsx` — 品牌列 + MoonTVPlus 署名（CC BY-NC-SA 4.0 BY 要求）
- `EmptyState.tsx` — 優雅空狀態（無資料時提示去 /admin 或 config.json，加片源）

## 待開發

- `SearchBar.tsx` — 獨立搜尋框（目前內嵌於 TopNav）
- `DetailView.tsx` — 影片詳情頁
- `PlayerView.tsx` — 播放器封裝（ArtPlayer + hls.js，theme 用品牌藍 `#2E7CF6`）
- `EpisodeGrid.tsx` — 選集
- `FavoritesPanel.tsx` / `HistoryPanel.tsx` — 收藏 / 觀看記錄頁

設計語言：深海軍藍深色主題、電光藍→青漸層、圓角卡片、微光動效、
標誌性 motif「膠片齒孔」（repeating-linear-gradient）。
詳見 `tailwind.config.ts` 頂部的「ECTV 品牌色板」註釋。
