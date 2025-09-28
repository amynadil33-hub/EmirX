/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['d64gsuwffb70l.cloudfront.net'],
  },
  i18n: {
    locales: ['en', 'dv'],
    defaultLocale: 'en',
  },
}

module.exports = nextConfig