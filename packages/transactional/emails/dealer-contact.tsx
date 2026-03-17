import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
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
        <Text style={platform}>autovendo.ch</Text>
        <Heading style={h1}>Neue Kontaktanfrage</Heading>
        <Text style={subtitle}>
          Jemand hat über autovendo.ch eine Nachricht an{" "}
          <strong>{dealerName}</strong> gesendet.
        </Text>

        <Hr style={hr} />

        <Section style={section}>
          <Text style={label}>Name</Text>
          <Text style={value}>{senderName}</Text>
        </Section>

        <Section style={section}>
          <Text style={label}>E-Mail</Text>
          <Text style={value}>
            <Link href={`mailto:${senderEmail}`} style={link}>
              {senderEmail}
            </Link>
          </Text>
        </Section>

        <Section style={section}>
          <Text style={label}>Telefon</Text>
          <Text style={value}>
            <Link href={`tel:${senderPhone}`} style={link}>
              {senderPhone}
            </Link>
          </Text>
        </Section>

        <Hr style={hr} />

        <Section style={section}>
          <Text style={label}>Nachricht</Text>
          <Text style={messageStyle}>{message}</Text>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          Um zu antworten, klicken Sie auf „Antworten" – Ihre Antwort geht
          direkt an {senderName} ({senderEmail}).
        </Text>
        <Text style={footer}>
          Diese E-Mail wurde über das Kontaktformular auf autovendo.ch gesendet.
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
  padding: "40px 32px",
  borderRadius: "8px",
  maxWidth: "560px",
  boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1)",
};

const platform = {
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: "600" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 12px 0",
};

const h1 = {
  color: "#111827",
  fontSize: "22px",
  fontWeight: "700" as const,
  margin: "0 0 8px 0",
};

const subtitle = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 4px 0",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
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
  borderRadius: "6px",
  borderLeft: "3px solid #e5e7eb",
};

const link = {
  color: "#2563eb",
};

const footer = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "4px 0 0 0",
};
