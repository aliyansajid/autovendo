import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

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

interface AccountDeletedEmailProps {
  dealerName: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://autovendo.ch";

export const AccountDeletedEmail = ({
  dealerName,
}: AccountDeletedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your Autovendo account has been closed</Preview>
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
          <Text style={text}>Hello {dealerName},</Text>
          <Text style={text}>
            We are writing to confirm that your Autovendo dealer account has
            been successfully closed and removed from our system.
          </Text>
          
          <Text style={text}>
            In accordance with our data policy, your business profile, listings,
            and personal information have been deleted. Please note that this
            action is irreversible.
          </Text>

          <Text style={text}>
            If you have any remaining questions or if this was not requested by you,
            please contact our support team immediately at info@autovendo.ch.
          </Text>
          
          <Text style={text}>
            We thank you for the time you spent with Autovendo.
            <br />
            The Autovendo Team
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            This is an automated message from autovendo.ch
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default AccountDeletedEmail;
