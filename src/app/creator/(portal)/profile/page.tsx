"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import CreatorProfile from "@/components/creator/CreatorProfile";

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (!session?.user) { setLoading(false); return; }

            const { data } = await supabase
                .from("creator_profiles")
                .select("*")
                .eq("id", session.user.id)
                .single();

            if (data) setProfile(data);
            setLoading(false);
        });
    }, []);

    return (
        <div>
            <div className="mb-10 space-y-2">
                <h1 className="text-2xl font-black text-white uppercase tracking-tight">PROFILE & SETTINGS</h1>
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Manage your creator identity and security protocols</p>
            </div>

            {loading ? (
                <div className="p-12 text-center">
                    <Loader2 className="animate-spin w-8 h-8 text-zinc-500 mx-auto" />
                </div>
            ) : profile ? (
                <CreatorProfile
                    profile={profile}
                    onProfileUpdate={(updated) => setProfile(updated)}
                />
            ) : (
                <div className="text-center p-12 bg-white/5 rounded-3xl border border-white/10">
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Profile Data Retrieval Failure</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 px-6 py-2 bg-white text-black rounded-xl font-bold text-sm"
                    >
                        Retry Connection
                    </button>
                </div>
            )}
        </div>
    );
}
