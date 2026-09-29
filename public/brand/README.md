# ECTV 品牌資產規範（Kevin 2026-09-29 定稿）

## 分工：標識 ≠ Logo

| 角色 | 定義 | 掛哪裡 | 檔案 |
|---|---|---|---|
| **標識（Wordmark）** | **ECTV 純藝術字**——四個字母統一的專屬立體藝術字體，**不含膠卷 E** | 主頁、導航列、品牌展示 | `wordmark.webp`（主頁大圖） / `wordmark-lockup.webp`（導航裁切版，EctvLogo 元件引用） |
| **Logo（Mark）** | 膠片 E——電影膠片彎摺成 E 的精簡圖形 | 瀏覽器 Tab（favicon）、App icon、小尺寸 | `logo.webp`（主圖形） / `app-icon.webp`（圓角應用圖示） / `favicon.ico` / `apple-touch-icon.png` |
| **品牌動畫** | 以膠片 E Logo 為主體的 Netflix 式片頭：黑場 → 藍色光束掃過 → 膠片 E 發光定格 → 淡出進首頁 | 每次新會話進站播放一次（`BootSplash.tsx`，sessionStorage 去重） | `logo-intro.mp4` |

## 原則
1. 標識永遠是純藝術字，不得把膠卷 E 拼進「ECTV」字樣裡。
2. Logo 永遠是膠片 E 本體，不帶文字。
3. 動畫主體是 Logo（膠片 E），不是標識；切換動畫走 ECTV 自己的藍色光束＋膠片語言，不抄 Netflix 紅 N。

## 歷史版本（備用）
- `wordmark-art.webp`：膠卷 E + CTV 混排版（已廢棄，不再作為標識使用）
- 舊 `wordmark.webp` 扁平版已由純藝術字版取代

## 色彩
- 主色：電光藍 `#2E7CF6` → 青 `#22D3EE` 漸層
- 背景：深海軍藍 `#050B18` / `#0A1428`
- 標誌性 motif：**膠片齒孔**（UI 中以 repeating-linear-gradient 呈現）
