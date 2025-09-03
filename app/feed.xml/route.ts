import { NextResponse } from 'next/server';

// Define an interface for blog post or content item
interface FeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

// Function to generate RSS feed
async function generateRssFeed(): Promise<string> {
  // TODO: Replace with actual content fetching logic
  const items: FeedItem[] = [
    {
      title: 'Welcome to Digiverse Story!',
      link: 'https://www.digiversestory.com',
      description:
        'Unleash your creativity with Digiverse Story – the AI-powered creative writing platform for kids, mentors, and families.',
      pubDate: new Date().toUTCString(),
    },
    {
      title: 'Digiverse Story Launches Story Creation Tools',
      link: 'https://www.digiversestory.com',
      description:
        'Discover our new story builder, AI mentor feedback, and a safe, fun community for young writers.',
      pubDate: new Date(Date.now() - 86400000).toUTCString(), // 24 hours ago
    },
  ];

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Digiverse Story - Creative Writing for Kids</title>
    <link>https://www.digiversestory.com</link>
    <description>AI-powered creative writing platform for kids, mentors, and families. Write, learn, and grow with Digiverse Story!</description>
    <atom:link href="https://www.digiversestory.com/feed.xml" rel="self" type="application/rss+xml" />
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Digiverse Story RSS Generator</generator>
    <contact>
      <address>Dallas, TX, USA</address>
      <email>support@Digiverse Story.com</email>
    </contact>
    
    ${items
      .map(
        (item) => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <description><![CDATA[${item.description}]]></description>
      <pubDate>${item.pubDate}</pubDate>
      <guid isPermaLink="false">${item.link}</guid>
    </item>
    `
      )
      .join('')}
  </channel>
</rss>`;

  return xml;
}

export async function GET() {
  try {
    const xml = await generateRssFeed();

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('RSS Feed Generation Error:', error);
    return new NextResponse('Error generating RSS feed', { status: 500 });
  }
}
