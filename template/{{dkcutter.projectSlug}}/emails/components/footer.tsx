import { Hr, Section, Text } from "@react-email/components";

export function Footer() {
  return (
    <Section>
      <Hr />
      <Text>
        Best regards,
        <br />
        <span>{{ dkcutter.projectName }} Team.</span>
      </Text>
    </Section>
  );
}
