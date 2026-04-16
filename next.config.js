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
    async rewrites() {
        return [
            {
                source: "/ingest/static/:path*",
                destination: "https://us-assets.i.posthog.com/static/:path*",
            },
            {
                source: "/ingest/:path*",
                destination: "https://us.i.posthog.com/:path*",
            },
        ];
    },
};

module.exports = nextConfig;
