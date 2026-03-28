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
import { MailFooter } from "./MailFooter";

interface Lead {
    id: string;
    content: string;
    author: string;
    url: string;
    source: string;
}

interface DailyDigestEmailProps {
    userName?: string;
    leads: Lead[];
}

const getPlatformLabel = (source: string) => {
    if (source === 'reddit_post') return 'Reddit';
    if (source === 'linkedin_post') return 'LinkedIn';
    return 'X';
};

const getPlatformColor = (source: string) => {
    if (source === 'reddit_post') return '#ff4500'; // Reddit Orange
    if (source === 'linkedin_post') return '#0077b5'; // LinkedIn Blue
    return '#1DA1F2'; // X Blue
};

export const DailyDigestEmail = ({ userName, leads }: DailyDigestEmailProps) => {
    const leadCount = leads.length;
    return (
    <Html>
        <Head />
        <Preview>Your Mardis Intel: {leadCount.toString()} High-Intent Leads Found 🚀</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>Daily Strategy Digest</Heading>
                <Text style={text}>
                    Hi {userName || "there"},
                </Text>
                <Text style={text}>
                    Your Mardis scouts have been busy! We've identified **{leadCount} new intent signals** that align with your growth strategy. Here are the top opportunities waiting for you:
                </Text>
 
                <Section style={leadSection}>
                    {leads.slice(0, 5).map((lead, index) => (
                        <div key={lead.id} style={leadItem}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <span style={{
                                    fontSize: '9px',
                                    fontWeight: '900',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    color: '#ffffff',
                                    backgroundColor: getPlatformColor(lead.source),
                                    textTransform: 'uppercase'
                                }}>
                                    {getPlatformLabel(lead.source)}
                                </span>
                                <Text style={leadAuthor}>@{lead.author}</Text>
                            </div>
                            <Text style={leadContent}>"{lead.content}"</Text>
                            <Button style={smallButton} href={lead.url}>
                                View Source
                            </Button>
                            {index < Math.min(leads.length, 5) - 1 && <Hr style={smallHr} />}
                        </div>
                    ))}
                </Section>

                {leads.length > 5 && (
                    <Text style={text}>
                        ...and {leads.length - 5} more signals are waiting for you.
                    </Text>
                )}

                <Button
                    style={button}
                    href={`${process.env.NEXT_PUBLIC_APP_URL}/founder/dashboard`}
                >
                    View All Leads in Dashboard
                </Button>
                <MailFooter />
            </Container>
        </Body>
    </Html>
    );
};

export default DailyDigestEmail;

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

const leadSection = {
    backgroundColor: "#f9f9f9",
    borderRadius: "12px",
    padding: "20px",
    margin: "20px 0",
    border: "1px solid #e6ebf1",
};

const leadItem = {
    marginBottom: "16px",
};

const leadAuthor = {
    fontSize: "12px",
    fontWeight: "700",
    color: "#10b981",
    margin: "0 0 4px",
};

const leadContent = {
    fontSize: "13px",
    color: "#1d1c1d",
    fontStyle: "italic",
    margin: "0 0 8px",
    lineHeight: "1.4",
};

const smallButton = {
    fontSize: "10px",
    fontWeight: "700",
    color: "#6b7280",
    textDecoration: "underline",
};

const smallHr = {
    borderColor: "#e6ebf1",
    margin: "12px 0",
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

const link = {
    color: "#10b981",
    textDecoration: "underline",
};
