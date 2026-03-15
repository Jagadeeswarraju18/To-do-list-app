import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { redirect } from "next/navigation";

import { UserProvider } from "@/components/providers/UserProvider";

export default async function CreatorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // CHECK IF USER HAS A CREATOR PROFILE
    const { data: profile } = await supabase
        .from("creator_profiles")
        .select("id")
        .eq("id", user.id)
        .single();

    // If no profile found, redirect to creator onboarding
    if (!profile) {
        redirect("/creator/onboarding");
    }

    return (
        <UserProvider>
            <div className="min-h-screen bg-background flex text-white font-sans">
                <Sidebar />
                <main className="flex-1 md:ml-72 p-4 pt-18 md:p-8 md:pt-8 relative overflow-hidden">
                    {/* Background Gradients */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />

                    <div className="max-w-7xl mx-auto relative z-10">
                        {children}
                    </div>
                </main>
            </div>
        </UserProvider>
    );
}
