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

interface CalibrationEmailProps {
    userName?: string;
    productName: string;
    suggestedKeywords: string[];
}

export const CalibrationEmail = ({ userName, productName, suggestedKeywords }: CalibrationEmailProps) => (
    <Html>
        <Head />
        <Preview>We're struggling to find leads for ${productName} — Let's fix that! 🛠️</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>Calibrating Your Strategy</Heading>
                <Text style={text}>
                    Hi {userName || "there"},
                </Text>
                <Text style={text}>
                    Our AI scouts have been scanning X, Reddit, and LinkedIn for the last 6 months, but we haven't found any high-intent leads matching your current keywords for **{productName}**.
                </Text>
                <Text style={text}>
                    This usually means your keywords are a bit too narrow. To get the engine moving, we've generated some broader "Look-alike" keywords for you to try:
                </Text>

                <Section style={suggestionBox}>
                    <Text style={suggestionTitle}>💡 Suggested Keywords</Text>
                    {suggestedKeywords.map((kw, i) => (
                        <Text key={i} style={keywordItem}>• {kw}</Text>
                    ))}
                </Section>

                <Text style={text}>
                    Adding these to your product profile will help our scouts cast a wider net and find people who are experiencing the pain points your product solves, even if they aren't using your exact phrasing.
                </Text>

                <Button
                    style={button}
                    href={`${process.env.NEXT_PUBLIC_APP_URL}/founder/settings`}
                >
                    Update My Keywords
                </Button>

                <Hr style={hr} />
                <Text style={footer}>
                    Need help fine-tuning? Just reply to this email, and our strategy team will take a look.
                </Text>
            </Container>
        </Body>
    </Html>
);

export default CalibrationEmail;

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

const suggestionBox = {
    backgroundColor: "#f0fdf4",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #bbf7d0",
};

const suggestionTitle = {
    fontSize: "16px",
    fontWeight: "800",
    color: "#166534",
    margin: "0 0 12px",
};

const keywordItem = {
    fontSize: "14px",
    color: "#166534",
    fontWeight: "500",
    margin: "4px 0",
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
    marginTop: "20px",
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
