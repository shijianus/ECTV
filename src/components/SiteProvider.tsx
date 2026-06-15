'use client';

import { createContext, ReactNode, useContext } from 'react';

const SiteContext = createContext<{
  siteName: string;
  announcement?: string;
  tmdbApiKey?: string;
}>({
  // 默认值
  siteName: 'ECTV',
  announcement:
    '免责声明：本网站仅作为影视信息聚合工具，所有视频内容均由互联网第三方接口自动抓取或由用户自行配置，本站不存储、不制作任何视频资源。用户使用本站即代表同意自行承担因观看、传播相关内容而可能引起的任何法律风险。本站不对内容的准确性、合法性负责，如有侵权请联系第三方数据源删除。',
  tmdbApiKey: '',
});

export const useSite = () => useContext(SiteContext);

export function SiteProvider({
  children,
  siteName,
  announcement,
  tmdbApiKey,
}: {
  children: ReactNode;
  siteName: string;
  announcement?: string;
  tmdbApiKey?: string;
}) {
  return (
    <SiteContext.Provider value={{ siteName, announcement, tmdbApiKey }}>
      {children}
    </SiteContext.Provider>
  );
}
