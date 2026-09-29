import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

/**
 * ============================================================
 * ECTV 品牌色板（ECTV Brand Palette）
 * ------------------------------------------------------------
 * 深海軍藍系深色主題，預設暗色。品牌主色為「電光藍 #2E7CF6」
 * 向「青 #22D3EE」過渡的漸層，呼應影城銀幕的光感。
 *
 * 背景層級：abyss（最深）→ deep → surface → card（最淺）
 * 用法範例：
 *   bg-abyss / bg-deep / bg-surface / bg-card
 *   text-mist / text-fog
 *   bg-brand-500 / text-accent-400
 *   bg-gradient-to-r from-brand-500 to-accent-400  ← 品牌漸層
 * ============================================================
 */
const config: Config = {
  darkMode: 'class', // ECTV 預設暗色：layout.tsx 直接在 <html> 掛載 dark
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'mobile-landscape': {
          raw: '(orientation: landscape) and (max-height: 700px)',
        },
      },
      fontFamily: {
        primary: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // —— ECTV 背景層級（深海軍藍）——
        abyss: '#050B18', // 頁面最底層：深海之淵
        deep: '#0A1428', // 區塊背景：深海軍藍
        surface: '#0E1A33', // 浮層 / 導航列
        card: '#111F3A', // 卡片底
        edge: '#1E2F55', // 邊框 / 分隔線

        // —— ECTV 文字層級 ——
        mist: '#EAF2FF', // 主文字：霧白
        fog: '#9DB4D4', // 次文字：霧藍灰
        dim: '#5B739E', // 弱文字 / 佔位

        // —— ECTV 品牌主色：電光藍 ——
        brand: {
          50: '#EEF5FF',
          100: '#D9E9FF',
          200: '#B3D2FF',
          300: '#80B3FF',
          400: '#4D8DFF',
          500: '#2E7CF6', // ← 品牌主色
          600: '#1F63D8',
          700: '#1A4FAE',
          800: '#18428A',
          900: '#163A72',
          950: '#0D2347',
        },
        // —— ECTV 品牌輔色：青（漸層終點）——
        accent: {
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE', // ← 品牌輔色
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInFromRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-700px 0' },
          '100%': { backgroundPosition: '700px 0' },
        },
        // ECTV 品牌呼吸光：用於 logo / 主按鈕的微光動效
        brandGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.75' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-in-out',
        'slide-down': 'slideDown 0.3s ease-in-out',
        'slide-in-from-right': 'slideInFromRight 0.3s ease-out',
        shimmer: 'shimmer 1.3s linear infinite',
        'brand-glow': 'brandGlow 3s ease-in-out infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        // ECTV 品牌漸層：電光藍 → 青（按鈕、標題高光、海報描邊）
        'brand-gradient': 'linear-gradient(135deg, #2E7CF6 0%, #22D3EE 100%)',
        // 深海氛圍底：首頁 hero 區的大面積背景
        'abyss-glow':
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(46,124,246,0.18), transparent), radial-gradient(ellipse 60% 50% at 80% 110%, rgba(34,211,238,0.08), transparent)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
} satisfies Config;

export default config;
