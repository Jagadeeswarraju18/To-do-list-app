import { Sidebar } from "@/components/dashboard/Sidebar";
import { AIChatBubble } from "@/components/dashboard/AIChatBubble";
import { UserProvider } from "@/components/providers/UserProvider";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // We remove the async blocking DB check here.
    // The middleware already protects these routes.
    // User/Product data will be handled by the UserProvider for a snappy UI.

    return (
        <UserProvider>
            <div className="min-h-screen bg-background flex">
                <Sidebar />
                <main className="flex-1 md:ml-72 p-4 pt-20 md:p-8 md:pt-8 relative overflow-hidden">
                    {/* Background Gradients */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

                    <div className="w-full px-4 sm:px-6 md:px-0 relative z-10 transition-all duration-300">
                        {children}
                    </div>
                </main>
                <AIChatBubble />
            </div>
        </UserProvider>
    );
}
