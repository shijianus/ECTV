import BottomNav from '@/components/ectv/BottomNav';
import ContinueWatching from '@/components/ectv/ContinueWatching';
import EmptyState from '@/components/ectv/EmptyState';
import Footer from '@/components/ectv/Footer';
import Hero from '@/components/ectv/Hero';
import PosterRail from '@/components/ectv/PosterRail';
import TopNav from '@/components/ectv/TopNav';
import type { HeroItem, MediaItem } from '@/components/ectv/types';

/* ---------- 資料形狀（對應後端 API 回傳） ---------- */

interface DoubanItemDto {
  id: string;
  title: string;
  poster: string;
  rate: string;
  year: string;
}

interface BannerDto {
  id: string;
  title: string;
  backdrop_path: string;
  poster_path: string;
  release_date: string;
  overview: string;
  vote_average: number;
  genres?: string[];
}

/* ---------- 服務端抓取（容錯：單路失敗不拖垮整頁） ---------- */

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(path, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function toMediaItem(d: DoubanItemDto): MediaItem {
  return { id: d.id, title: d.title, poster: d.poster, rate: d.rate, year: d.year };
}

function toHeroItem(b: BannerDto): HeroItem {
  return {
    id: String(b.id),
    title: b.title,
    backdrop: b.backdrop_path || '',
    poster: b.poster_path || '',
    overview: b.overview || '',
    rating: typeof b.vote_average === 'number' ? b.vote_average : 0,
    year: b.release_date || '',
    genres: b.genres ?? [],
  };
}

async function getHomeData() {
  const [trending, hotMovies, hotTv, newMovies, top250] = await Promise.all([
    fetchJson<{ code: number; list: BannerDto[] }>('/api/tmdb/trending'),
    fetchJson<{ code: number; list: DoubanItemDto[] }>('/api/douban?type=movie&tag=熱門&pageSize=18'),
    fetchJson<{ code: number; list: DoubanItemDto[] }>('/api/douban?type=tv&tag=熱門&pageSize=18'),
    fetchJson<{ code: number; list: DoubanItemDto[] }>('/api/douban?type=movie&tag=最新&pageSize=18'),
    fetchJson<{ code: number; list: DoubanItemDto[] }>('/api/douban?type=movie&tag=top250&pageSize=18'),
  ]);

  return {
    hero: (trending?.list ?? []).slice(0, 5).map(toHeroItem),
    rails: [
      { title: '熱門電影', tagline: '豆瓣熱門 · 本週大家都在看', items: (hotMovies?.list ?? []).map(toMediaItem), href: '/douban?type=movie&tag=熱門' },
      { title: '熱門劇集', tagline: '豆瓣熱門劇集榜', items: (hotTv?.list ?? []).map(toMediaItem), href: '/douban?type=tv&tag=熱門' },
      { title: '最新上映', tagline: '院線與串流新片速遞', items: (newMovies?.list ?? []).map(toMediaItem), href: '/douban?type=movie&tag=最新' },
      { title: '豆瓣 Top 250', tagline: '影史經典，一生必看', items: (top250?.list ?? []).map(toMediaItem), href: '/douban?type=movie&tag=top250' },
    ],
  };
}

/* ---------- 首頁 ---------- */

export default async function HomePage() {
  const { hero, rails } = await getHomeData();
  const hasContent = hero.length > 0 || rails.some((r) => r.items.length > 0);

  return (
    <div className="min-h-screen bg-abyss text-mist">
      <TopNav />

      <main className="pb-24 md:pb-0">
        {hasContent ? (
          <>
            <Hero items={hero} />
            <div className="relative z-10 -mt-10 space-y-10 sm:space-y-12">
              <ContinueWatching />
              {rails.map((rail) => (
                <PosterRail
                  key={rail.title}
                  title={rail.title}
                  tagline={rail.tagline}
                  items={rail.items}
                  href={rail.href}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="pt-24">
            <EmptyState
              title="深海影院尚未開幕"
              hint="沒有拉取到任何影片資料。請先前往管理後台配置片源（或編輯 config.json 添加 API 站點），再回來開場。"
            />
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
