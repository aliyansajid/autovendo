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

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SellerWelcomeEmailProps {
  sellerName: string;
  dashboardUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://autosolo.ch";

export const SellerWelcomeEmail = ({
  sellerName,
  dashboardUrl,
}: SellerWelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to AutoSolo – start selling your car today</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img
              src={`${baseUrl}/email-logo.png`}
              width="200"
              alt="AutoSolo"
              style={logo}
            />
          </Section>
          <Text style={text}>Hello {sellerName},</Text>
          <Text style={text}>
            Welcome to AutoSolo! Your account is ready and you can now list your
            car directly to buyers — no middleman, no monthly fees.
          </Text>
          <Text style={text}>
            Simply create a listing, choose a plan (CHF 19 for 30 days or CHF
            49 until sold), pay once and your car goes live immediately.
          </Text>
          <Section style={btnContainer}>
            <Button style={button} href={dashboardUrl}>
              Go to Your Dashboard
            </Button>
          </Section>
          <Text style={text}>
            If you have any questions, reply to this email and we will be happy
            to help.
          </Text>
          <Text style={text}>The AutoSolo Team</Text>
          <Hr style={hr} />
          <Text style={footer}>
            This is an automated message from autosolo.ch
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default SellerWelcomeEmail;
