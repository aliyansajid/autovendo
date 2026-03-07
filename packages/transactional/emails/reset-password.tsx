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

interface ResetPasswordEmailProps {
  userEmail: string;
  resetPasswordUrl: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  ? `https://${process.env.NEXT_PUBLIC_APP_URL}`
  : "";

export const ResetPasswordEmail = ({
  userEmail,
  resetPasswordUrl,
}: ResetPasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your Autovendo password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img
            src={`${baseUrl}/static/logo.png`}
            width="140"
            height="40"
            alt="Autovendo"
            style={logo}
          />
        </Section>
        <Heading style={h1}>Password Reset Request</Heading>
        <Text style={text}>Hello,</Text>
        <Text style={text}>
          We received a request to reset the password for your Autovendo account
          associated with <strong>{userEmail}</strong>.
        </Text>
        <Text style={text}>
          Click the button below to choose a new password. This link will expire
          in 1 hour.
        </Text>
        <Section style={btnContainer}>
          <Button style={button} href={resetPasswordUrl}>
            Reset Password
          </Button>
        </Section>
        <Text style={text}>
          If you did not request a password reset, please ignore this email or
          contact support if you have concerns.
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

export default ResetPasswordEmail;

const main = {
  backgroundColor: "#f9fafb",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  borderRadius: "8px",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
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
  backgroundColor: "#000000",
  borderRadius: "6px",
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
