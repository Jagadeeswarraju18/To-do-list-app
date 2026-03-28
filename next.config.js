/** @type {import('next').NextConfig} */
const nextConfig = {
    // Workaround for SWC binary issue on Windows
    experimental: {
        forceSwcTransforms: true,
        webpackBuildWorker: false,
        workerThreads: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

module.exports = nextConfig;
