import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  generateBuildId: async () => {
    // 타임스탬프 기반 빌드 ID로 매번 새로운 파일명 생성
    return Date.now().toString();
  },
};

export default nextConfig;
