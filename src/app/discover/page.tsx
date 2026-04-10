import { getPublicProducts } from "@/app/actions/public-actions";
import { DiscoverClientPage } from "./DiscoverClientPage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
const socialImageUrl = "https://www.mardishub.com/x-og-card.png";

export const metadata: Metadata = {
    title: "Discover | Mardis Apps",
    description: "Browse the best tools and apps built by the Mardis founder community.",
    alternates: {
        canonical: "/discover"
    },
    openGraph: {
        title: "Discover | Mardis Apps",
        description: "Browse the best tools and apps built by the Mardis founder community.",
        url: "/discover",
        type: "website",
        images: [
            {
                url: socialImageUrl,
                width: 1352,
                height: 827,
                alt: "Mardis apps directory preview"
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "Discover | Mardis Apps",
        description: "Browse the best tools and apps built by the Mardis founder community.",
        images: [socialImageUrl]
    },
    other: {
        "og:image:secure_url": socialImageUrl,
        "twitter:image:src": socialImageUrl,
        "twitter:image:alt": "Mardis apps directory preview",
        "twitter:url": "https://www.mardishub.com/discover"
    }
};

export default async function DiscoverPage() {
    const { data: products } = await getPublicProducts();

    return <DiscoverClientPage products={products || []} />;
}
