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
                url: "/og-new.png",
                width: 1200,
                height: 630,
                alt: "Mardis apps directory preview"
            }
        ]
    },
    twitter: {
        card: "summary_large_image",
        title: "Discover | Mardis Apps",
        description: "Browse the best tools and apps built by the Mardis founder community.",
        images: ["/og-new.png"]
    }
};

export default async function DiscoverPage() {
    const { data: products } = await getPublicProducts();

    return <DiscoverClientPage products={products || []} />;
}
