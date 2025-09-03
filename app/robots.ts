// robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about-us',
          '/careers',
          '/contact-us',
          '/solutions/ai',
          '/solutions/machine-learning',
          '/solutions/digital-transformation',
          '/solutions/devops',
          '/solutions/data-analytics',
          '/solutions/cloud',
          '/solutions/iot',
          '/solutions/blockchain',
          '/services/technology-consulting',
          '/services/application-development',
          '/services/usability',
          '/services/qa-testing',
          '/services/product-development',
          '/services/it-staffing',
        ],
        disallow: [
          '/api/*',
          '/admin/*',
          '/*.json',
          '/*?*',
          '/tmp/*',
          '/*.php$',
          '/*.sql$',
          '/node_modules',
          '/.env',
          '/.git',
          '/private/',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
    ],
    sitemap: 'https://www.digiversestory.com/sitemap.xml',
    host: 'https://www.digiversestory.com',
  };
}
