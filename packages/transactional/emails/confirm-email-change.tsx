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

interface ConfirmEmailChangeEmailProps {
  currentEmail: string;
  newEmail: string;
  confirmUrl: string;
  locale?: string;
  appName?: string;
  appUrl?: string;
}

const defaultBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://autovendo.ch";

export const ConfirmEmailChangeEmail = ({
  currentEmail,
  newEmail,
  confirmUrl,
  locale,
  appName = "Autovendo",
  appUrl = defaultBaseUrl,
}: ConfirmEmailChangeEmailProps) => {
  const localizedUrl = getLocalizedUrl(confirmUrl, locale);

  return (
    <Html>
      <Head />
      <Preview>Approve your {appName} email change</Preview>
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
          <Text style={text}>Hello,</Text>
          <Text style={text}>
            You have requested a change to the email address associated with
            your {appName} account from <strong>{currentEmail}</strong> to{" "}
            <strong>{newEmail}</strong>.
          </Text>
          <Text style={text}>
            To confirm this change and transition your account to the new
            address, please click the button below. After approval, you will
            receive a verification link at your new address to complete the
            process.
          </Text>
          <Section style={btnContainer}>
            <Button style={button} href={localizedUrl}>
              Approve Change
            </Button>
          </Section>
          <Text style={text}>
            If you did not request this change, please ignore this email or
            contact support.
          </Text>
          <Text style={text}>The {appName} Team</Text>
          <Hr style={hr} />
          <Text style={footer}>
            This is an automated message from {appUrl.replace("https://", "")}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ConfirmEmailChangeEmail;
