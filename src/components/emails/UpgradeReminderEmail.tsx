import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
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
    usageCount,
    currentPlanName,
    nextPlanName,
    nextPlanFeatures,
}: UpgradeReminderEmailProps) => (
    <Html>
        <Head />
        <Preview>Your current Mardis plan is close to its limit</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>You are close to your plan limit</Heading>
                <Text style={text}>Hi {userName || "there"},</Text>
                <Text style={text}>
                    You are getting close to the limits on your current Mardis plan. If you need more room, the next plan gives you more capacity and access.
                </Text>

                <Section style={infoSection}>
                    <Text style={infoText}>Current Plan: {currentPlanName}</Text>
                    <Text style={infoText}>Usage Type: {limitType}</Text>
                    <Text style={infoText}>Current Usage: {usageCount}</Text>
                </Section>

                <Text style={text}>Moving to {nextPlanName} gives you access to:</Text>

                <Section style={featureSection}>
                    {nextPlanFeatures.map((feature, idx) => (
                        <Text key={idx} style={featureText}>
                            • {feature}
                        </Text>
                    ))}
                </Section>

                <Button
                    style={button}
                    href={process.env.NEXT_PUBLIC_APP_URL + "/founder/settings"}
                >
                    View Plans
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

const featureSection = {
    marginTop: "8px",
};

const featureText = {
    color: "#666666",
    fontSize: "14px",
    lineHeight: "22px",
    margin: "6px 0",
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
