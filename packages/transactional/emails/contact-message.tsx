import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Section,
  Text,
} from "@react-email/components";

export interface ContactMessageProps {
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message?: string;
}

export const ContactMessage = ({
  name,
  email,
  phone,
  subject,
  message,
}: ContactMessageProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Neue Kontaktanfrage</Heading>
        <Section style={section}>
          <Text style={label}>Name</Text>
          <Text style={value}>{name}</Text>
        </Section>
        <Section style={section}>
          <Text style={label}>E-Mail</Text>
          <Text style={value}>{email}</Text>
        </Section>
        <Section style={section}>
          <Text style={label}>Telefon</Text>
          <Text style={value}>{phone}</Text>
        </Section>
        {subject ? (
          <Section style={section}>
            <Text style={label}>Betreff</Text>
            <Text style={value}>{subject}</Text>
          </Section>
        ) : null}
        {message ? (
          <Section style={section}>
            <Text style={label}>Nachricht</Text>
            <Text style={value}>{message}</Text>
          </Section>
        ) : null}
        <Hr style={hr} />
        <Text style={footer}>Gesendet über das Kontaktformular auf autovendo.ch</Text>
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
  borderRadius: "8px",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
};

const h1 = {
  color: "#111827",
  fontSize: "24px",
  fontWeight: "600",
  margin: "0 0 24px 0",
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
  margin: "24px 0",
};

const footer = {
  color: "#9ca3af",
  fontSize: "12px",
};
