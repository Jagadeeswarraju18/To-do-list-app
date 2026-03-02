import { getPublicProducts } from "@/app/actions/public-actions";
import { DiscoverClientPage } from "./DiscoverClientPage";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Discover Apps | DemandRadar",
    description: "Browse the best tools and apps built by DemandRadar founders.",
};

export default async function DiscoverPage() {
    const { data: products } = await getPublicProducts();

    return <DiscoverClientPage products={products || []} />;
}
