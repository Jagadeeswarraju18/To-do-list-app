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
} from "@react-email/components";
import * as React from "react";
import { MailFooter } from "./MailFooter";

interface UpgradeReminderEmailProps {
    userName?: string;
    limitType: string;
    usageCount: number;
    currentPlanName: string;
    nextPlanName: string;
    nextPlanFeatures: string[];
}

export const UpgradeReminderEmail = ({ 
    userName, 
    limitType, 
    currentPlanName, 
    nextPlanName, 
    nextPlanFeatures 
}: UpgradeReminderEmailProps) => (
    <Html>
        <Head />
        <Preview>Helpful stats regarding your Mardis account usage</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>Insights for Your Growth</Heading>
                <Text style={text}>
                    Hi {userName || "there"},
                </Text>
                <Text style={text}>
                    We've noticed you're making great progress with Mardis. To ensure you continue detecting high-intent signals without interruption, we wanted to share some account insights.
                </Text>

                <Section style={infoSection}>
                    <Text style={infoText}>
                        Current Plan: {currentPlanName}
                    </Text>
                    <Text style={infoText}>
                        Scanning Status: {limitType === 'leads' ? 'High-Volume Detected' : 'Active'}
                    </Text>
                </Section>

                <Text style={text}>
                    To unlock even more powerful capabilities like these, consider exploring our **{nextPlanName}** features:
                    {nextPlanFeatures.map((feature, idx) => (
                        <div key={idx} style={{ marginTop: '6px', color: '#666' }}>
                            • {feature}
                        </div>
                    ))}
                </Text>

                <Button
                    style={button}
                    href={process.env.NEXT_PUBLIC_APP_URL + "/founder/dashboard"}
                >
                    Expand Your Strategy
                </Button>

                <MailFooter />
            </Container>
        </Body>
    </Html>
);

export default UpgradeReminderEmail;

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
    padding: "10px",
    lineHeight: "42px",
    textAlign: "center" as const,
};

const text = {
    color: "#484848",
    fontSize: "14px",
    lineHeight: "24px",
    margin: "16px 0",
};

const infoSection = {
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    padding: "16px",
    border: "1px solid #e2e8f0",
    textAlign: "center" as const,
};

const infoText = {
    color: "#475569",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.05em",
    margin: "5px 0",
    textTransform: "uppercase" as const,
};

const button = {
    backgroundColor: "#10b981",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "800",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    padding: "16px",
    marginTop: "24px",
};
