import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Section,
  Text,
} from "@react-email/components";

export interface ListingContactEmailProps {
  recipientName: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  message: string;
  appName?: string;
  appUrl?: string;
}

const defaultBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://autovendo.ch";

export const ListingContactEmail = ({
  recipientName,
  senderName,
  senderEmail,
  senderPhone,
  message,
  appName = "Autovendo",
  appUrl = defaultBaseUrl,
}: ListingContactEmailProps) => (
  <Html>
    <Head />
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

        <Text style={subtitle}>
          You have received a new message from <strong>{senderName}</strong> via{" "}
          {appUrl.replace("https://", "")}.
        </Text>

        <Hr style={hr} />

        <Section style={section}>
          <Text style={label}>Name</Text>
          <Text style={value}>{senderName}</Text>
        </Section>

        <Section style={section}>
          <Text style={label}>Email</Text>
          <Text style={value}>
            <Link href={`mailto:${senderEmail}`} style={link}>
              {senderEmail}
            </Link>
          </Text>
        </Section>

        <Section style={section}>
          <Text style={label}>Phone</Text>
          <Text style={value}>
            <Link href={`tel:${senderPhone}`} style={link}>
              {senderPhone}
            </Link>
          </Text>
        </Section>

        <Hr style={hr} />

        <Section style={section}>
          <Text style={label}>Message</Text>
          <Text style={messageStyle}>{message}</Text>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          To reply, simply click "Reply" – your response will go directly to{" "}
          {senderName} ({senderEmail}).
        </Text>
        <Text style={footer}>
          This is an automated message from {appUrl.replace("https://", "")}
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ListingContactEmail;

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

const subtitle = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "22px",
  textAlign: "center" as const,
  margin: "0 0 24px 0",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "32px 0",
};

const section = {
  marginBottom: "16px",
};

const label = {
  color: "#6b7280",
  fontSize: "11px",
  fontWeight: "600" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 4px 0",
};

const value = {
  color: "#111827",
  fontSize: "15px",
  lineHeight: "22px",
  margin: "0",
};

const messageStyle = {
  color: "#111827",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
  backgroundColor: "#f9fafb",
  padding: "16px",
  borderLeft: "3px solid #e5e7eb",
};

const link = {
  color: "#2563eb",
};

const footer = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "18px",
  textAlign: "center" as const,
  margin: "4px 0 0 0",
};
