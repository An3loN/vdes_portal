/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'community.steamstatic.com',
        port: '',
        pathname: '/public/images/signinthroughsteam/**',
      },
      {
        protocol: 'https',
        hostname: 'static.tildacdn.com',
        port: '',
        pathname: '/tild3337-3339-4261-b536-656238613365/**',
      },
    ],
  },
};

export default nextConfig;
