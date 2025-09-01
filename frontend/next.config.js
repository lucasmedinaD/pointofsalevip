/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // This proxies requests to the backend server during development
    // to avoid CORS issues. In production, you would configure your
    // hosting provider (e.g., Vercel) to handle this.
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/:path*', // Proxy to Backend
      },
    ]
  },
}

export default nextConfig;
