/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
    dest: 'public'
})

const nextConfig = withPWA({
    register: true
    // next.js config
})

module.exports = nextConfig
