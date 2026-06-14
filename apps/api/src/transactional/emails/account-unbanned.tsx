import React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

const main = {
  backgroundColor: "#f9fafb",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  margin: "0 auto",
  padding: "40px 20px",
};

const logoSection = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const logo = {
  margin: "0 auto",
};

const text = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
};

const btnContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#003f88",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "500",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "32px 0",
};

const footer = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "18px",
  textAlign: "center" as const,
  margin: "4px 0 0 0",
};

interface AccountUnbannedEmailProps {
  userName: string;
  loginUrl: string;
  appName?: string;
  appUrl?: string;
}

const defaultBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://autovendo.ch";

export const AccountUnbannedEmail = ({
  userName,
  loginUrl,
  appName = "Autovendo",
  appUrl = defaultBaseUrl,
}: AccountUnbannedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your {appName} account access has been restored</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img
              src={`${appUrl}/email-logo.png`}
              width="200"
              alt={appName}
              style={logo}
            />
          </Section>
          <Text style={text}>Hello {userName},</Text>
          <Text style={text}>
            We are pleased to inform you that your {appName} account access
            has been restored.
          </Text>

          <Text style={text}>
            You can now log in to your account and resume managing your
            listings and services. Any hidden listings have been restored to
            their previous visibility status.
          </Text>

          <Section style={btnContainer}>
            <Button style={button} href={loginUrl}>
              Log In to Your Account
            </Button>
          </Section>

          <Text style={text}>
            Thank you for your patience.
            <br />
            The {appName} Team
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            This is an automated message from {appUrl.replace("https://", "")}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default AccountUnbannedEmail;
