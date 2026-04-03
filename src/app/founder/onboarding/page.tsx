import { redirect } from "next/navigation";

export default function FounderOnboardingRedirect() {
    redirect("/founder/products?setup=1");
}
