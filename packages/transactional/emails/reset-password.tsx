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
// Utils
// ---------------------------------------------------------------------------

const getLocalizedUrl = (url: string, locale?: string) => {
  if (!locale) return url;
  try {
    const urlObj = new URL(url);
    // If the URL already contains the locale prefix, don't add it again
    if (
      urlObj.pathname.startsWith(`/${locale}/`) ||
      urlObj.pathname === `/${locale}`
    ) {
      return url;
    }
    urlObj.pathname = `/${locale}${urlObj.pathname}`;
    return urlObj.toString();
  } catch (e) {
    return url;
  }
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ResetPasswordEmailProps {
  userEmail: string;
  resetPasswordUrl: string;
  locale?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL
  : "https://autovendo.ch";

export const ResetPasswordEmail = ({
  userEmail,
  resetPasswordUrl,
  locale,
}: ResetPasswordEmailProps) => {
  const localizedUrl = getLocalizedUrl(resetPasswordUrl, locale);

  return (
    <Html>
      <Head />
      <Preview>Reset your Autovendo password</Preview>
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
          <Text style={text}>Hello,</Text>
          <Text style={text}>
            We received a request to reset the password for your Autovendo
            account associated with <strong>{userEmail}</strong>.
          </Text>
          <Text style={text}>
            To choose a new password and regain access to your account, please
            click the button below. This link will expire in 1 hour for your
            security.
          </Text>
          <Section style={btnContainer}>
            <Button style={button} href={localizedUrl}>
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
};

export default ResetPasswordEmail;
