import {
    Section,
    Text,
    Hr,
    Link,
} from "@react-email/components";
import * as React from "react";

export const MailFooter = () => (
    <Section style={footerSection}>
        <Hr style={hr} />
        <Text style={footerText}>
            Mardis — Strategy Alpha for Elite Founders
        </Text>
        <Text style={footerSubtext}>
            Mardis HQ, Digital Nomad Valley
        </Text>
        <Text style={footerSubtext}>
            You received this because you are a registered user of Mardis. 
            <br />
            <Link href="{{unsubscribe_url}}" style={link}>Unsubscribe</Link> from these emails.
        </Text>
        <Text style={footerSubtext}>
            &copy; 2026 MardisHub. All rights reserved.
        </Text>
    </Section>
);

const footerSection = {
    marginTop: "32px",
};

const hr = {
    borderColor: "#e6ebf1",
    margin: "20px 0",
};

const footerText = {
    color: "#1d1c1d",
    fontSize: "12px",
    fontWeight: "700",
    lineHeight: "16px",
    textAlign: "center" as const,
    margin: "0 0 8px",
};

const footerSubtext = {
    color: "#8898aa",
    fontSize: "12px",
    lineHeight: "16px",
    textAlign: "center" as const,
    margin: "4px 0",
};

const link = {
    color: "#10b981",
    textDecoration: "underline",
};
