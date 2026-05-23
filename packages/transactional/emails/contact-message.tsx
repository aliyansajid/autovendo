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
} from "@react-email/components";

export interface ContactMessageProps {
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message?: string;
  appName?: string;
  appUrl?: string;
}

const defaultBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://autovendo.ch";

export const ContactMessage = ({
  name,
  email,
  phone,
  subject,
  message,
  appName = "Autovendo",
  appUrl = defaultBaseUrl,
}: ContactMessageProps) => (
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
        <Section style={section}>
          <Text style={label}>Name</Text>
          <Text style={value}>{name}</Text>
        </Section>
        <Section style={section}>
          <Text style={label}>Email</Text>
          <Text style={value}>{email}</Text>
        </Section>
        <Section style={section}>
          <Text style={label}>Phone</Text>
          <Text style={value}>{phone}</Text>
        </Section>
        {subject ? (
          <Section style={section}>
            <Text style={label}>Subject</Text>
            <Text style={value}>{subject}</Text>
          </Section>
        ) : null}
        {message ? (
          <Section style={section}>
            <Text style={label}>Message</Text>
            <Text style={value}>{message}</Text>
          </Section>
        ) : null}
        <Hr style={hr} />
        <Text style={footer}>
          This is an automated message from {appUrl.replace("https://", "")}
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ContactMessage;

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

const section = {
  marginBottom: "20px",
};

const label = {
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  margin: "0 0 4px 0",
};

const value = {
  color: "#111827",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
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
