declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI: string;
      JWT_SECRET: string;
      NEXTAUTH_SECRET: string;
      NEXTAUTH_URL: string;
      NEXT_PUBLIC_BASE_URL: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

export {};
