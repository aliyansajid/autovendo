import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Section,
  Text,
  Link,
} from "@react-email/components";

export interface DealerContactEmailProps {
  dealerName: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  message: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL
  : "https://autovendo.ch";

export const DealerContactEmail = ({
  dealerName,
  senderName,
  senderEmail,
  senderPhone,
  message,
}: DealerContactEmailProps) => (
  <Html>
    <Head />
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

        <Heading style={h1}>New contact request</Heading>
        <Text style={subtitle}>
          A new message has been sent to <strong>{dealerName}</strong> via
          autovendo.ch.
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
          To reply, simply click "Reply" – your response will go directly to {senderName} ({senderEmail}).
        </Text>
        <Text style={footer}>
          This is an automated message from autovendo.ch
        </Text>
      </Container>
    </Body>
  </Html>
);

export default DealerContactEmail;

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

const h1 = {
  color: "#111827",
  fontSize: "24px",
  fontWeight: "600",
  textAlign: "center" as const,
  margin: "30px 0",
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
