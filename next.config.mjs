/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: process.cwd(),

images: {
remotePatterns: [
{
protocol: "https",
hostname: "image.tmdb.org",
},
],
},
};

export default nextConfig;
