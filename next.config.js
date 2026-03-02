/** @type {import('next').NextConfig} */
const nextConfig = {
    // Workaround for SWC binary issue on Windows
    experimental: {
        forceSwcTransforms: true,
    },
};

module.exports = nextConfig;
