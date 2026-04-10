import { getPublicProductDetails } from "@/app/actions/public-actions";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, Target, ArrowLeft, ArrowUpRight, CheckCircle2, Twitter, Linkedin, Heart } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { SignalButton } from "@/components/ui/SignalButton";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
const socialImageUrl = "https://mardishub.com/og.png?v=2";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const { data: product } = await getPublicProductDetails(params.id);
    if (!product) return { title: "App Not Found | Mardis" };
    
    return {
        title: `${product.name} | Mardis Apps`,
        description: product.description || product.pain_solved,
        alternates: {
            canonical: `/discover/${params.id}`
        },
        openGraph: {
            title: `${product.name} | Mardis Apps`,
            description: product.description || product.pain_solved,
            url: `/discover/${params.id}`,
            images: [
                {
                    url: socialImageUrl,
                    width: 1352,
                    height: 827,
                    alt: `Preview of ${product.name}`
                }
            ]
        },
        twitter: {
            card: "summary_large_image",
            title: `${product.name} | Mardis Apps`,
            description: product.description || product.pain_solved,
            images: [socialImageUrl]
        }
    };
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
    const { data: product, success } = await getPublicProductDetails(params.id);

    if (!success || !product) {
        redirect("/discover");
    }

    const { profiles: rawProfiles } = product;
    const profile = Array.isArray(rawProfiles) ? rawProfiles[0] : rawProfiles;

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://mardishub.com/"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Discover",
                "item": "https://mardishub.com/discover"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": product.name,
                "item": `https://mardishub.com/discover/${params.id}`
            }
        ]
    };

    return (
        <div className="min-h-screen flex flex-col bg-black text-gray-100 font-sans selection:bg-white/20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <div className="absolute inset-0 z-0 pointer-events-none bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
            <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

            {/* Header */}
            <header className="w-full max-w-5xl mx-auto px-6 py-8 flex items-center justify-between relative z-50">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                        <BrandLogo size="xs" className="opacity-40 scale-125" />
                    </div>
                    <span className="text-xl brand-title uppercase leading-none">Mardis</span>
                </Link>
                <Link href="/discover" className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 hover:bg-white/5">
                    <ArrowLeft className="w-3.5 h-3.5" /> Directory
                </Link>
            </header>

            <main className="w-full flex-grow pt-6 pb-24 px-6 mx-auto max-w-5xl relative z-10 flex flex-col">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    {/* Left Column: Product Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Main Product Card */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 md:p-12 backdrop-blur-sm relative overflow-hidden">

                            <h1 className="heading-serif text-4xl md:text-6xl font-black tracking-tight text-white mb-8 relative z-10 italic">
                                {product.name}
                            </h1>

                            <p className="text-lg text-gray-500 leading-relaxed mb-12 relative z-10 font-medium tracking-tight">
                                {product.description || product.pain_solved}
                            </p>

                            {product.website_url && (
                                <div className="flex items-center gap-6 relative z-10">
                                    <a
                                        href={product.website_url.startsWith('http') ? product.website_url : `https://${product.website_url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full bg-white text-black font-black uppercase tracking-[0.2em] text-[12px] shadow-2xl transition-all hover:bg-gray-200 active:scale-95"
                                    >
                                        Visit Website
                                        <ArrowUpRight className="w-4 h-4 ml-1" />
                                    </a>

                                    <SignalButton
                                        productId={product.id}
                                        initialUpvotes={product.upvotes_count || 0}
                                        size="lg"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Demographics & Specifics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {product.target_audience && (
                                <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 flex flex-col items-start backdrop-blur-sm">
                                    <div className="p-3 bg-white/5 rounded-xl text-white opacity-40 mb-6 border border-white/10">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-2">Target Audience</h3>
                                    <p className="text-white font-medium tracking-tight">{product.target_audience}</p>
                                </div>
                            )}

                            {product.business_model && (
                                <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 flex flex-col items-start backdrop-blur-sm">
                                    <div className="p-3 bg-white/5 rounded-xl text-white opacity-40 mb-6 border border-white/10">
                                        <Target className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-2">Business Model</h3>
                                    <p className="text-white font-medium tracking-tight">{product.business_model}</p>
                                </div>
                            )}
                        </div>

                        {/* The Problem / Solution */}
                        {product.pain_solved && (
                            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 md:p-12 backdrop-blur-sm">
                                <h2 className="text-xl font-black text-white/40 uppercase tracking-widest mb-8 flex items-center gap-4">
                                    <CheckCircle2 className="w-6 h-6 opacity-40" />
                                    The Core Thesis
                                </h2>
                                <p className="text-gray-500 text-[16px] leading-relaxed whitespace-pre-wrap font-medium tracking-tight">
                                    {product.pain_solved}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Founder Profile Card */}
                    <div className="space-y-6">
                        <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 sticky top-12 backdrop-blur-sm">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-8 border-b border-white/5 pb-6 text-center">
                                The Maker
                            </h3>

                            <div className="flex flex-col items-center justify-center text-center">
                                {profile?.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt={profile.full_name || "Founder"}
                                        className="w-24 h-24 rounded-[32px] object-cover mb-6 border border-white/10 shadow-xl opacity-80"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-[32px] bg-white/5 flex items-center justify-center text-white/40 font-black text-3xl mb-6 border border-white/10 shadow-lg italic">
                                        {(profile?.full_name || "F")[0].toUpperCase()}
                                    </div>
                                )}

                                <h2 className="text-xl font-black text-white tracking-tight">{profile?.full_name || "Anonymous Maker"}</h2>

                                {/* Social Links */}
                                <div className="flex items-center justify-center gap-4 w-full mt-8 pt-8 border-t border-white/5">
                                    {profile?.social_links?.x && (
                                        <a
                                            href={profile.social_links.x}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white text-gray-500 hover:text-black rounded-full transition-all border border-white/5"
                                            title="X (Twitter)"
                                        >
                                            <Twitter className="w-4 h-4" />
                                        </a>
                                    )}
                                    {profile?.social_links?.linkedin && (
                                        <a
                                            href={profile.social_links.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white text-gray-500 hover:text-black rounded-full transition-all border border-white/5"
                                            title="LinkedIn"
                                        >
                                            <Linkedin className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
