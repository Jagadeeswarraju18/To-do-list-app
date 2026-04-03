import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login",
    description: "Log in to your Mardis account and continue managing demand capture workflows.",
    alternates: {
        canonical: "/login"
    }
};

export default function LoginLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return children;
}
