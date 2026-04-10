import { getPublicProducts } from "@/app/actions/public-actions";
import { DiscoverClientPage } from "./DiscoverClientPage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
const socialImageUrl = "https://mardishub.com/og.png?v=2";
const discoverUrl = "https://mardishub.com/discover";

export const metadata: Metadata = {
    title: "Discover | Mardis Apps",
    description: "Browse the best tools and apps built by the Mardis founder community.",
    alternates: {
        canonical: discoverUrl
    },
    openGraph: {
        title: "Discover | Mardis Apps",
        description: "Browse the best tools and apps built by the Mardis founder community.",
        url: discoverUrl,
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
    }
};

export default async function DiscoverPage() {
    const { data: products } = await getPublicProducts();

    return <DiscoverClientPage products={products || []} />;
}
