import { defineConfig } from 'vitepress'

const repositoryUrl = 'https://github.com/mattmy/laravel-dwg-converter'
const pages = [
  ['Getting started', 'getting-started'],
  ['External tools', 'external-tools'],
  ['Extracting thumbnails', 'thumbnails'],
  ['Converting to DXF', 'dxf-conversion'],
  ['Creating image previews', 'image-previews'],
  ['Exporting structural JSON', 'structural-json'],
  ['Inputs and outputs', 'inputs-and-outputs'],
  ['Configuration', 'configuration'],
  ['Errors and troubleshooting', 'errors-and-troubleshooting'],
  ['Performance and security', 'performance-and-security'],
  ['API reference', 'api-reference'],
]
const pagesZh = [
  ['開始使用', 'getting-started'],
  ['外部工具', 'external-tools'],
  ['擷取縮圖', 'thumbnails'],
  ['轉換為 DXF', 'dxf-conversion'],
  ['建立圖片預覽', 'image-previews'],
  ['輸出結構 JSON', 'structural-json'],
  ['輸入與輸出', 'inputs-and-outputs'],
  ['設定參考', 'configuration'],
  ['錯誤與疑難排解', 'errors-and-troubleshooting'],
  ['效能與安全', 'performance-and-security'],
  ['API 參考', 'api-reference'],
]

export default defineConfig({
  title: 'Laravel DWG Converter',
  description: 'Convert and inspect DWG files in Laravel',
  base: '/laravel-dwg-converter-doc/',
  cleanUrls: true,
  lastUpdated: true,
  sitemap: { hostname: 'https://mattmy.github.io/laravel-dwg-converter-doc/' },
  locales: {
    root: {
      label: 'English', lang: 'en', title: 'Laravel DWG Converter',
      description: 'Convert and inspect DWG files in Laravel',
      themeConfig: {
        nav: [{ text: 'Home', link: '/' }, { text: 'Documentation', link: '/guide/getting-started' }, { text: 'GitHub', link: repositoryUrl }],
        sidebar: { '/guide/': [{ text: 'Documentation', items: pages.map(([text, slug]) => ({ text, link: `/guide/${slug}` })) }] },
        outline: { level: [2, 3], label: 'On this page' },
        docFooter: { prev: false, next: false },
        footer: { message: 'Released under the MIT License.', copyright: 'Copyright © mattmy' },
      },
    },
    'zh-TW': {
      label: '繁體中文', lang: 'zh-TW', link: '/zh-TW/', title: 'Laravel DWG Converter',
      description: '在 Laravel 轉換及檢查 DWG',
      themeConfig: {
        nav: [{ text: '首頁', link: '/zh-TW/' }, { text: '文件', link: '/zh-TW/guide/getting-started' }, { text: 'GitHub', link: repositoryUrl }],
        sidebar: { '/zh-TW/guide/': [{ text: '文件', items: pagesZh.map(([text, slug]) => ({ text, link: `/zh-TW/guide/${slug}` })) }] },
        outline: { level: [2, 3], label: '本頁內容' },
        docFooter: { prev: false, next: false },
        footer: { message: '使用 MIT License 發布。', copyright: 'Copyright © mattmy' },
      },
    },
  },
  themeConfig: {
    logo: '/logo.svg',
    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: repositoryUrl }],
  },
})
