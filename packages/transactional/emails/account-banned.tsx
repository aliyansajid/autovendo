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

const reasonBox = {
  backgroundColor: "#fef2f2",
  border: "1px solid #fee2e2",
  borderRadius: "4px",
  padding: "16px",
  margin: "24px 0",
};

const reasonText = {
  color: "#991b1b",
  fontSize: "14px",
  margin: "0",
  fontWeight: "500",
};

interface AccountBannedEmailProps {
  userName: string;
  reason: string;
  duration?: string;
  isPermanent?: boolean;
  appName?: string;
  appUrl?: string;
}

const defaultBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://autovendo.ch";

export const AccountBannedEmail = ({
  userName,
  reason,
  duration = "Permanent",
  isPermanent = true,
  appName = "Autovendo",
  appUrl = defaultBaseUrl,
}: AccountBannedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        {isPermanent
          ? "Your account has been permanently banned"
          : "Your account has been temporarily suspended"}
      </Preview>
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
          <Text style={text}>Hello {userName},</Text>
          <Text style={text}>
            We are sorry to inform you that your {appName} account has
            been {isPermanent ? "permanently banned" : "temporarily suspended"}.
          </Text>

          <Section style={reasonBox}>
            <Text style={reasonText}>Reason for this decision:</Text>
            <Text style={{ ...text, margin: "8px 0 0 0", color: "#b91c1c" }}>
              {reason}
            </Text>
            {!isPermanent && (
              <Text style={{ ...text, margin: "16px 0 0 0", fontSize: "14px", fontWeight: "bold" }}>
                Suspension Duration: {duration}
              </Text>
            )}
          </Section>

          <Text style={text}>
            {isPermanent
              ? "As this is a permanent ban, you will no longer have access to our services. All your listings and data associated with this account have been removed."
              : "During this temporary suspension, you will not be able to log in or manage your listings. Your active listings have been hidden and will be restored once the suspension is lifted."
            }
          </Text>

          <Text style={text}>
            If you have questions or wish to appeal this decision, please contact
            our support team at info@{appUrl.replace("https://", "")}.
          </Text>

          <Text style={text}>
            Regards,
            <br />
            The {appName} Team
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            This is an automated message from {appUrl.replace("https://", "")}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default AccountBannedEmail;
