/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
    reactStrictMode: false, // fix for react-spring not triggering in dev mode
}

module.exports = (phase, { defaultConfig }) => {
    return withBundleAnalyzer(nextConfig)
}