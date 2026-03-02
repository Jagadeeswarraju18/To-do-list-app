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
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Profile & Settings</h1>
                <p className="text-muted-foreground">Update your profile, avatar, and account settings.</p>
            </div>

            {loading ? (
                <div className="p-12 text-center"><Loader2 className="animate-spin w-8 h-8 text-zinc-500 mx-auto" /></div>
            ) : (
                <div className="glass-card p-8 max-w-2xl">
                    {profile && (
                        <CreatorProfile
                            profile={profile}
                            onProfileUpdate={(updated) => setProfile(updated)}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
