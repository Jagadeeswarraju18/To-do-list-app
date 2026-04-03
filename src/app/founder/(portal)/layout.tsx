import { Sidebar } from "@/components/dashboard/Sidebar";
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
            <div className="min-h-screen bg-transparent flex relative overflow-hidden">

                <Sidebar />
                <main className="flex-1 md:ml-72 p-4 pt-20 md:p-8 md:pt-8 relative z-10">
                    <div className="w-full px-4 sm:px-6 md:px-0 relative z-10 transition-all duration-300">
                        {children}
                    </div>
                </main>
            </div>
        </UserProvider>
    );
}
