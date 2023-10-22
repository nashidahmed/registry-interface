/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding")
    config.resolve.alias.canvas = false
    return config
  },
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig
