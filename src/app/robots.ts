import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = "https://www.mardishub.com";

    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: [
                "/api/",
                "/founder/",
                "/creator/",
                "/auth/",
                "/login",
                "/test",
                "/test-gen",
                "/demo"
            ]
        },
        sitemap: `${baseUrl}/sitemap.xml`
    };
}
