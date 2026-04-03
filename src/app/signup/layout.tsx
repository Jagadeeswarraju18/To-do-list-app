import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign Up",
    description: "Create your Mardis account to start capturing demand across Reddit, X, and LinkedIn.",
    alternates: {
        canonical: "/signup"
    }
};

export default function SignupLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return children;
}
