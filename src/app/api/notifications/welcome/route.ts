import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";
import WelcomeEmail from "@/components/emails/WelcomeEmail";

export async function POST(req: Request) {
    try {
        const { email, userName, role } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const result = await sendEmail({
            to: email,
            subject: "Welcome to Mardis 🚀",
            react: WelcomeEmail({ userName, role: role || "founder" }),
        });

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: result.data });
    } catch (error) {
        console.error("Welcome Notification Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
