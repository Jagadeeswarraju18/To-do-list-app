import { getPublicProducts } from "@/app/actions/public-actions";
import { DiscoverClientPage } from "./DiscoverClientPage";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

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
                url: "https://www.mardishub.com/og-new.png",
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
        images: ["https://www.mardishub.com/og-new.png"]
    }
};

export default async function DiscoverPage() {
    const { data: products } = await getPublicProducts();

    return <DiscoverClientPage products={products || []} />;
}
