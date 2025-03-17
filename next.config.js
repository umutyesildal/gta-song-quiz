/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure Content Security Policy for YouTube embeds
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com https://s.ytimg.com; frame-src https://www.youtube.com; img-src 'self' data: https: blob:;"
          }
        ]
      }
    ];
  }
}

module.exports = nextConfig
