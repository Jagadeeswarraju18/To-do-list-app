import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailProps {
    to: string | string[];
    subject: string;
    react: React.ReactElement | React.ReactNode;
    from?: string;
}

/**
 * Sends an email using Resend.
 * Defaults to 'MarketingX <onboarding@resend.dev>' if no from address is provided.
 * Once the user verifies their domain, they should update the default 'from' address.
 */
export async function sendEmail({ to, subject, react, from }: SendEmailProps) {
    try {
        const { data, error } = await resend.emails.send({
            from: from || process.env.MAIL_FROM || "MarketingX <onboarding@resend.dev>",
            to: Array.isArray(to) ? to : [to],
            subject,
            react: react as React.ReactElement,
        });

        if (error) {
            console.error("Resend Error:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Unexpected Email Error:", error);
        return { success: false, error };
    }
}
