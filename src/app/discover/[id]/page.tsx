import { getPublicProductDetails } from "@/app/actions/public-actions";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, Target, ArrowLeft, ArrowUpRight, CheckCircle2, Radar, Twitter, Linkedin } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
    const { data: product } = await getPublicProductDetails(params.id);
    if (!product) return { title: "App Not Found | DemandRadar" };
    return {
        title: `${product.name} | DemandRadar Apps`,
        description: product.description || product.pain_solved,
    };
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
    const { data: product, success } = await getPublicProductDetails(params.id);

    if (!success || !product) {
        redirect("/discover");
    }

    const { profiles: rawProfiles } = product;
    const profile = Array.isArray(rawProfiles) ? rawProfiles[0] : rawProfiles;

    return (
        <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100 font-sans selection:bg-blue-500/30">
            {/* Minimalist Grid Background */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
            <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

            {/* Header */}
            <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between relative z-50">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                        <Radar className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white">DemandRadar</span>
                </Link>
                <Link href="/discover" className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-800/50">
                    <ArrowLeft className="w-4 h-4" /> Directory
                </Link>
            </header>

            <main className="w-full flex-grow pt-6 pb-24 px-6 mx-auto max-w-5xl relative z-10 flex flex-col">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Left Column: Product Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Main Product Card */}
                        <div className="bg-slate-900/40 border border-slate-800 rounded-[24px] p-8 md:p-10 backdrop-blur-sm relative overflow-hidden">
                            
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6 relative z-10">
                                {product.name}
                            </h1>
                            
                            <p className="text-lg text-slate-400 leading-relaxed mb-10 relative z-10 font-medium">
                                {product.description || product.pain_solved}
                            </p>

                            {product.website_url && (
                                <a 
                                    href={product.website_url.startsWith('http') ? product.website_url : `https://${product.website_url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 group relative px-6 py-3 w-fit overflow-hidden rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all hover:scale-105 shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]"
                                >
                                    <span className="relative z-10 font-bold text-sm">Visit Website</span>
                                    <ArrowUpRight className="relative z-10 w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </a>
                            )}
                        </div>

                        {/* Demographics & Specifics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {product.target_audience && (
                                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col items-start backdrop-blur-sm">
                                    <div className="p-3 bg-slate-800/80 rounded-xl text-blue-400 mb-4 border border-slate-700/50">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Target Audience</h3>
                                    <p className="text-slate-200 font-medium">{product.target_audience}</p>
                                </div>
                            )}

                            {product.business_model && (
                                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col items-start backdrop-blur-sm">
                                    <div className="p-3 bg-slate-800/80 rounded-xl text-indigo-400 mb-4 border border-slate-700/50">
                                        <Target className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Business Model</h3>
                                    <p className="text-slate-200 font-medium">{product.business_model}</p>
                                </div>
                            )}
                        </div>

                        {/* The Problem / Solution */}
                        {product.pain_solved && (
                            <div className="bg-slate-900/40 border border-slate-800 rounded-[24px] p-8 md:p-10 backdrop-blur-sm">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-blue-400" />
                                    The Problem Solved
                                </h2>
                                <p className="text-slate-400 text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                                    {product.pain_solved}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Founder Profile Card */}
                    <div className="space-y-6">
                        <div className="bg-slate-900/40 border border-slate-800 rounded-[24px] p-8 sticky top-8 backdrop-blur-sm">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 border-b border-slate-800/80 pb-4 text-center">
                                The Maker
                            </h3>

                            <div className="flex flex-col items-center justify-center text-center">
                                {profile?.avatar_url ? (
                                    <img 
                                        src={profile.avatar_url} 
                                        alt={profile.full_name || "Founder"} 
                                        className="w-24 h-24 rounded-[20px] object-cover mb-5 border border-slate-700 shadow-xl bg-slate-800"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-[20px] bg-slate-800 flex items-center justify-center text-white font-bold text-3xl mb-5 border border-slate-700 shadow-lg">
                                        {(profile?.full_name || "F")[0].toUpperCase()}
                                    </div>
                                )}

                                <h2 className="text-xl font-bold text-white/90">{profile?.full_name || "Anonymous Maker"}</h2>
                                
                                {/* Social Links */}
                                <div className="flex items-center justify-center gap-3 w-full mt-6 pt-6 border-t border-slate-800/80">
                                    {profile?.social_links?.x && (
                                        <a 
                                            href={profile.social_links.x}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 flex items-center justify-center bg-slate-800/80 hover:bg-blue-600 hover:border-blue-500 text-slate-300 hover:text-white rounded-full transition-all border border-slate-700"
                                            title="X (Twitter)"
                                        >
                                            <Twitter className="w-4 h-4 fill-current" />
                                        </a>
                                    )}
                                    {profile?.social_links?.linkedin && (
                                        <a 
                                            href={profile.social_links.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 flex items-center justify-center bg-slate-800/80 hover:bg-blue-600 hover:border-blue-500 text-slate-300 hover:text-white rounded-full transition-all border border-slate-700"
                                            title="LinkedIn"
                                        >
                                            <Linkedin className="w-4 h-4 fill-current" />
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
