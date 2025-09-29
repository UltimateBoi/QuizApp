/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: process.env.NODE_ENV === 'production' ? '/QuizApp' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/QuizApp/' : '',
}

module.exports = nextConfig