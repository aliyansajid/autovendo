import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ConfirmEmailChangeEmailProps {
  currentEmail: string;
  newEmail: string;
  confirmUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL
  : "https://autovendo.ch";

export const ConfirmEmailChangeEmail = ({
  currentEmail,
  newEmail,
  confirmUrl,
}: ConfirmEmailChangeEmailProps) => (
  <Html>
    <Head />
    <Preview>Approve your Autovendo email change</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img
            src={`${baseUrl}/email-logo.png`}
            width="200"
            alt="Autovendo"
            style={logo}
          />
        </Section>
        <Heading style={h1}>Confirm your email change</Heading>
        <Text style={text}>Hello,</Text>
        <Text style={text}>
          You have requested a change to the email address associated with your
          Autovendo account from <strong>{currentEmail}</strong> to{" "}
          <strong>{newEmail}</strong>.
        </Text>
        <Text style={text}>
          To confirm this change and transition your account to the new address,
          please click the button below. After approval, you will receive a
          verification link at your new address to complete the process.
        </Text>
        <Section style={btnContainer}>
          <Button style={button} href={confirmUrl}>
            Approve Change
          </Button>
        </Section>
        <Text style={text}>
          If you did not request this change, please ignore this email or
          contact support.
        </Text>
        <Text style={text}>The Autovendo Team</Text>
        <Hr style={hr} />
        <Text style={footer}>
          This is an automated message from autovendo.ch
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ConfirmEmailChangeEmail;

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

const h1 = {
  color: "#111827",
  fontSize: "24px",
  fontWeight: "600",
  textAlign: "center" as const,
  margin: "30px 0",
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
  textAlign: "center" as const,
};
