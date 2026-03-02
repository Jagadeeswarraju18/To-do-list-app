"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import MediaKit from "@/components/creator/MediaKit";

export default function MediaPage() {
    const [userId, setUserId] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) setUserId(session.user.id);
        });
    }, []);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Media Kit</h1>
                <p className="text-muted-foreground">Showcase your best stats and past collaborations.</p>
            </div>

            {userId ? <MediaKit userId={userId} /> : (
                <div className="p-12 text-center"><Loader2 className="animate-spin w-8 h-8 text-zinc-500 mx-auto" /></div>
            )}
        </div>
    );
}
