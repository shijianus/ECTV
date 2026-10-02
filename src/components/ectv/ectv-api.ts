/**
 * ECTV 前端 API 助手
 * 只讀後端路由（src/app/api/**）確認回傳格式，不修改任何後端程式碼。
 */

export interface SearchResultItem {
  id: string;
  source: string;
  source_name: string;
  title: string;
  poster: string;
  year: string;
  desc: string;
  type_name: string;
  douban_id: number;
  episodes: string[];
  episodes_titles: string[];
  weight?: number;
}

export interface DetailData {
  source: string;
  source_name: string;
  id: string;
  title: string;
  poster: string;
  year: string;
  douban_id: number;
  desc: string;
  type_name: string;
  episodes: string[];
  episodes_titles: string[];
  proxyMode?: boolean;
  category?: string;
}

export interface DoubanDetail {
  id: string;
  title: string;
  year: string;
  type: 'movie' | 'tv';
  pic?: { large: string; normal: string };
  rating?: { value: number; count: number };
  intro?: string;
  genres?: string[];
  directors?: Array<{ name: string }>;
  actors?: Array<{ name: string }>;
}

export interface FavoriteDto {
  source_name: string;
  total_episodes: number;
  title: string;
  year: string;
  cover: string;
  save_time: number;
  search_title: string;
  origin?: 'vod' | 'live';
}

export interface PlayRecordDto {
  title: string;
  source_name: string;
  cover: string;
  year: string;
  index: number;
  total_episodes: number;
  play_time: number;
  total_time: number;
  save_time: number;
  search_title: string;
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...init });
  if (!res.ok) {
    let msg = `請求失敗（${res.status}）`;
    try {
      const data = await res.json();
      if (data?.error) msg = String(data.error);
    } catch {
      /* 忽略解析錯誤 */
    }
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

/** 解析 "source+id" 形式的 key（source key 本身不含 +，按第一個 + 切分） */
export function splitKey(key: string): { source: string; id: string } {
  const i = key.indexOf('+');
  if (i < 0) return { source: '', id: key };
  return { source: key.slice(0, i), id: key.slice(i + 1) };
}

export function makeKey(source: string, id: string): string {
  return `${source}+${id}`;
}

export function detailHref(id: string, source: string, title?: string): string {
  const t = title ? `&title=${encodeURIComponent(title)}` : '';
  return `/detail?id=${encodeURIComponent(id)}&source=${encodeURIComponent(source)}${t}`;
}

export function playHref(id: string, source: string, ep = 1, title?: string): string {
  const t = title ? `&title=${encodeURIComponent(title)}` : '';
  return `/play?id=${encodeURIComponent(id)}&source=${encodeURIComponent(source)}&ep=${ep}${t}`;
}

/**
 * 播放地址處理：m3u8 走後端代理（過廣告＋防盜鏈），其餘格式直連。
 * 注意代理後的 URL 不再以 .m3u8 結尾，播放器需用 type: 'm3u8' 強制指定。
 */
export function toPlayableUrl(rawUrl: string, source: string): { url: string; isM3u8: boolean } {
  const isM3u8 = /\.m3u8(\?|$)/i.test(rawUrl);
  if (isM3u8 && /^https?:\/\//i.test(rawUrl)) {
    return {
      url: `/api/proxy-m3u8?url=${encodeURIComponent(rawUrl)}&source=${encodeURIComponent(source)}&adblock=true`,
      isM3u8: true,
    };
  }
  return { url: rawUrl, isM3u8 };
}

export interface ResolvedDetail {
  detail: DetailData;
  /** 同標題的其他線路候選（去重後，每個 source 一條） */
  candidates: SearchResultItem[];
  /** 是否經由標題搜尋自動匹配到可播放線路（例如首頁豆瓣卡片） */
  autoResolved: boolean;
}

/**
 * 解析詳情目標：
 * 1. 直接用 id+source 取詳情；
 * 2. 失敗（例如 source=douban 這種非播放源）時，用 title 搜尋並自動選第一條可播放結果。
 */
export async function resolveDetail(
  id: string,
  source: string,
  title?: string
): Promise<ResolvedDetail> {
  try {
    const detail = await fetchJson<DetailData>(
      `/api/detail?id=${encodeURIComponent(id)}&source=${encodeURIComponent(source)}`
    );
    if (detail && Array.isArray(detail.episodes)) {
      return { detail, candidates: [], autoResolved: false };
    }
    throw new Error('詳情資料格式異常');
  } catch (err) {
    if (!title) throw err;
    // 降級：用標題搜尋可播放線路
    const data = await fetchJson<{ results: SearchResultItem[] }>(
      `/api/search?q=${encodeURIComponent(title)}`
    );
    const results = data.results ?? [];
    if (results.length === 0) throw new Error(`找不到「${title}」的可播放片源`);
    // 每個 source 只留第一條
    const seen = new Set<string>();
    const candidates = results.filter((r) => {
      if (seen.has(r.source)) return false;
      seen.add(r.source);
      return true;
    });
    const first = candidates[0];
    const detail = await fetchJson<DetailData>(
      `/api/detail?id=${encodeURIComponent(first.id)}&source=${encodeURIComponent(first.source)}`
    );
    return { detail, candidates, autoResolved: true };
  }
}
