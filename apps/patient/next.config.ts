import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@nutriaxpro/shared', '@nutriaxpro/database'],
};

export default nextConfig;
