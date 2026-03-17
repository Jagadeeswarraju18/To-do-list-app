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

interface UpgradeReminderEmailProps {
    userName?: string;
    limitType: "leads" | "scanning" | "exports" | "products";
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
    nextPlanFeatures 
}: UpgradeReminderEmailProps) => (
    <Html>
        <Head />
        <Preview>Action Required: You've reached your {limitType} limit on {currentPlanName} ⚡</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>Upgrade Your Strategy Alpha</Heading>
                <Text style={text}>
                    Hi {userName || "there"},
                </Text>
                <Text style={text}>
                    You've reached your **{currentPlanName}** limit for **{limitType}** ({usageCount} used). To continue scaling your outreach and unlocking premium signals, it's time to level up.
                </Text>

                <Section style={alertSection}>
                    <Text style={alertText}>
                        **Status**: {currentPlanName.toUpperCase()} {limitType.toUpperCase()} LIMIT REACHED
                    </Text>
                </Section>

                <Text style={text}>
                    Upgrade to **MarketingX {nextPlanName}** to unlock:
                    {nextPlanFeatures.map((feature, idx) => (
                        <React.Fragment key={idx}>
                            <br />• {feature}
                        </React.Fragment>
                    ))}
                </Text>

                <Button
                    style={button}
                    href={`${process.env.NEXT_PUBLIC_APP_URL}/#pricing`}
                >
                    Upgrade to {nextPlanName} Now
                </Button>

                <Hr style={hr} />
                <Text style={footer}>
                    Need more time? You can still access your existing data, but new discoveries will be paused until the next billing cycle or upgrade.
                </Text>
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
    margin: "24px 0",
};

const alertSection = {
    backgroundColor: "#fff1f2",
    borderRadius: "8px",
    padding: "16px",
    border: "1px solid #fecaca",
    textAlign: "center" as const,
};

const alertText = {
    color: "#b91c1c",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "0.1em",
    margin: "0",
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
    padding: "16px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    marginTop: "24px",
};

const hr = {
    borderColor: "#e6ebf1",
    margin: "30px 0",
};

const footer = {
    color: "#8898aa",
    fontSize: "12px",
    lineHeight: "16px",
    textAlign: "center" as const,
};
