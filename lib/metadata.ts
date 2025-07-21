export const commonMetadata = {
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
    nocache: true,
  },
  verification: {
    google:
      'google-site-verification=zVk1-z5DECuXfqqfXK949e6ijHF2wTiHptNTtVUpN8g',
  },
  formatDetection: {
    telephone: true,
    date: false,
    address: true,
    email: true,
  },
  authors: [
    { name: 'a3techsolutions', url: 'https://www.a3techsolutions.com' },
  ],
  creator: 'a3techsolutions',
  publisher: 'a3techsolutions Inc.',
  metadataBase: new URL('https://www.a3techsolutions.com'),
};
