# ECTV 影城

ECTV 是 Kevin 的自有品牌影城前端：**後端能力沿用 MoonTVPlus，前端 UI 全部重新設計**，
深海軍藍深色主題、電光藍品牌色，不做簡單換膚。

## 授權與來源（必讀）

- 本專案衍生自 [MoonTVPlus](https://github.com/mtvpls/MoonTVPlus)（基於 MoonTV v100 二次開發），
  上游授權為 **CC BY-NC-SA 4.0 International**（創用 CC 姓名標示-非商業性-相同方式分享）。
- 因此本專案同樣以 **CC BY-NC-SA 4.0** 釋出，並遵守：
  - **BY 署名**：頁腳 / 關於頁必須保留「基於 MoonTVPlus」署名及授權連結，並標示修改過。
  - **NC 非商業**：僅限非商業用途，不可用於商業影城運營。
  - **SA 相同方式分享**：衍生作品必須以相同或相容授權釋出。
- 上游 `LICENSE` 全文見 `~/workspace/moontvplus-upstream/LICENSE`（未複製進本倉庫）。

## 骨架結構

```
ectv/
├── package.json / next.config.js / tsconfig.json / postcss.config.js / server.js
│   └─ 與上游一致（依賴版本鎖定：Next.js 14.2 / Tailwind 3.4 / ArtPlayer 5.4 / hls.js 1.6）
├── tailwind.config.ts          ← ECTV 品牌色板（深海軍藍 + 電光藍→青漸層，預設暗色）
├── src/
│   ├── app/
│   │   ├── layout.tsx          ← 根 layout：<html class="dark">，metadata 標題 ECTV
│   │   ├── globals.css         ← 深色基底樣式
│   │   └── api/**              ← 251 個 API 路由（自上游原樣複製，含搜尋/詳情/代理/豆瓣/TMDB/收藏/記錄/認證）
│   ├── lib/                    ← 134 個核心模組（原樣複製：config / downstream / db / auth / douban / tmdb …）
│   ├── types/                  ← 類型定義（原樣複製）
│   ├── styles/themes.ts        ← 內建主題定義（僅供 /api/theme/css 使用，原樣複製）
│   ├── middleware.ts           ← 認證攔截（原樣複製）
│   └── components/ectv/        ← ★ ECTV 全新 UI 元件庫（空，待開發）
└── public/brand/               ← ★ 品牌資產（logo 待放入，見 README）
```

**刻意沒有複製的上游目錄**：`components/`（90+ 舊 UI 元件）、`contexts/`、`hooks/`、
`app/**/page.tsx`（所有舊頁面）、`styles/globals.css` — 這些是 ECTV 要重寫的部分。
例外：保留了 `/admin` 的後端 API，前端管理頁之後可做極簡版（否則無法可視化管理片源）。

## 核心 API 鏈路（新 UI 直接調用）

| 用途 | 路由 |
|---|---|
| 聚合搜尋 | `GET /api/search?q=` |
| 影片詳情（含集數 m3u8） | `GET /api/detail?id=&source=` |
| m3u8 / 分片代理 | `GET /api/proxy/m3u8`、`proxy/segment`、`proxy/vod/*` |
| 海報代理 | `GET /api/image-proxy` |
| 豆瓣 / TMDB 元數據 | `/api/douban*`、`/api/tmdb*` |
| 收藏 / 播放記錄 | `/api/favorites`、`/api/playrecords` |
| 站點配置（站名/公告） | `/api/server-config` |
| 登入 / 認證 | `/api/login`、`/api/auth/*` |

## 快速開始

```bash
cd ~/workspace/ectv
npm install          # 或 pnpm install（上游用 pnpm；此環境磁碟較小，npm 亦可）
cp ~/workspace/moontvplus-upstream/.env.example .env  # 上游無 .env.example，參考其 README 的環境變數自行建立
npm run dev
```

常用環境變數（沿用上游命名）：`NEXT_PUBLIC_SITE_NAME=ECTV`、`USERNAME`、`PASSWORD`、
`TMDB_API_KEY`、`NEXT_PUBLIC_STORAGE_TYPE`。片源配置走 `config.json`（格式見架構報告
`~/workspace/moontvplus-arch-report.md` §4）或 `/admin` 後台。

## 品牌規範速覽

- 背景：`#050B18`（abyss）/ `#0A1428`（deep）
- 品牌主色：電光藍 `#2E7CF6` → 輔色青 `#22D3EE`（漸層 `bg-brand-gradient`）
- 文字：`#EAF2FF`（mist）/ `#9DB4D4`（fog）
- 播放器主題色請用品牌藍，不要用上游預設綠 `#22c55e`

## 下一步（UI 開發順序建議）

1. `EctvLogo` + `TopNav`/`BottomNav` 導航骨架
2. 首頁：`Hero` 大橫幅 + 海報橫滑排（調 `/api/douban*` / `/api/tmdb*` 拿榜單）
3. 搜尋頁（調 `/api/search`）
4. 詳情頁（調 `/api/detail`）+ `EpisodeGrid` 選集
5. 播放頁（ArtPlayer + hls.js，theme 換品牌藍；參考架構報告 §5 最簡參數）
6. 收藏 / 繼續觀看（調 `/api/favorites`、`/api/playrecords`）
