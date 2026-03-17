import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Button,
    Hr,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
    userName?: string;
    role: "founder" | "creator";
}

export const WelcomeEmail = ({ userName, role }: WelcomeEmailProps) => (
    <Html>
        <Head />
        <Preview>Welcome to MarketingX - Your Strategy Alpha</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>Welcome to MarketingX</Heading>
                <Text style={text}>
                    Hi {userName || "there"},
                </Text>
                <Text style={text}>
                    We're thrilled to have you join us as a {role}! MarketingX is designed to give you the "Strategy Alpha" you need to dominate your niche.
                </Text>

                {role === "founder" ? (
                    <Section>
                        <Text style={text}>
                            As a Founder, you can now:
                            <br />• Discover high-intent signals across social platforms.
                            <br />• Connect with elite creators to amplify your message.
                            <br />• Automate your lead generation workflow.
                        </Text>
                        <Button
                            style={button}
                            href={`${process.env.NEXT_PUBLIC_APP_URL}/founder/dashboard`}
                        >
                            Explore Your Dashboard
                        </Button>
                    </Section>
                ) : (
                    <Section>
                        <Text style={text}>
                            As a Creator, you can now:
                            <br />• Find high-paying lead bounties.
                            <br />• Analyze market heatmap for content ideas.
                            <br />• Manage your collaborations and media kit.
                        </Text>
                        <Button
                            style={button}
                            href={`${process.env.NEXT_PUBLIC_APP_URL}/creator/dashboard`}
                        >
                            Check Your Bounties
                        </Button>
                    </Section>
                )}

                <Hr style={hr} />
                <Text style={footer}>
                    If you have any questions, just reply to this email. We're here to help!
                </Text>
                <Text style={footer}>
                    &copy; 2026 MarketingX. All rights reserved.
                </Text>
            </Container>
        </Body>
    </Html>
);

export default WelcomeEmail;

const main = {
    backgroundColor: "#ffffff",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: "0 auto",
    padding: "20px 0 48px",
};

const h1 = {
    color: "#1d1c1d",
    fontSize: "24px",
    fontWeight: "700",
    margin: "30px 0",
    padding: "0",
    lineHeight: "42px",
};

const text = {
    color: "#484848",
    fontSize: "14px",
    lineHeight: "24px",
    margin: "24px 0",
};

const button = {
    backgroundColor: "#10b981",
    borderRadius: "8px",
    color: "#000",
    fontSize: "14px",
    fontWeight: "800",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    padding: "12px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
};

const hr = {
    borderColor: "#e6ebf1",
    margin: "20px 0",
};

const footer = {
    color: "#8898aa",
    fontSize: "12px",
    lineHeight: "16px",
};
