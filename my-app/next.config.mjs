/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    experimental: {
        buildCache: true, // ビルドキャッシュを有効にする設定
    },
};

// ESモジュール形式でエクスポート
export default nextConfig;