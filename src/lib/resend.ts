import { Resend } from "resend";
import { render } from "@react-email/components";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailProps {
    to: string | string[];
    subject: string;
    react?: React.ReactElement | React.ReactNode;
    text?: string;
    from?: string;
}

/**
 * Sends an email using Resend.
 * Defaults to 'Mardis <onboarding@mardishub.com>' if no from address is provided.
 * Once the user verifies their domain, they should update the default 'from' address.
 */
export async function sendEmail({ to, subject, react, text, from }: SendEmailProps) {
    try {
        const fromAddress = from || process.env.MAIL_FROM || "Mardis <onboarding@mardishub.com>";
        
        // Prepare the email payload
        const payload: any = {
            from: fromAddress,
            to: Array.isArray(to) ? to : [to],
            subject,
        };

        // Handle React element rendering manually if provided
        if (react) {
            try {
                // 1. Try the official react-email render
                const html = await render(react as React.ReactElement);
                if (!html) throw new Error("Official render returned empty HTML");
                payload.html = html;
            } catch (renderError: any) {
                console.error("React manual rendering failed, trying fallback:", renderError);
                
                try {
                    // 2. Fallback to standard react-dom/server if react-email is broken
                    const { renderToStaticMarkup } = await import("react-dom/server");
                    const html = renderToStaticMarkup(react as React.ReactElement);
                    payload.html = html;
                } catch (fallbackError) {
                    console.error("Standard react-dom/server rendering also failed:", fallbackError);
                    // 3. Last resort: pass react directly to resend
                    payload.react = react;
                    if (text) payload.text = text;
                }
            }
        } else if (text) {
            payload.text = text;
        }

        const { data, error } = await resend.emails.send(payload);

        if (error) {
            console.error("Resend API Error:", JSON.stringify(error, null, 2));
            return { success: false, error: error.message || error };
        }

        return { success: true, data };
    } catch (error: any) {
        console.error("Unexpected Email Error:", error);
        return { success: false, error: error.message || "Unknown error" };
    }
}
