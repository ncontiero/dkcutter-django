import { Hr, Section, Text } from "@react-email/components";

export function Footer() {
  const team = "{{ dkcutter.projectName }} Team.";

  return (
    <Section>
      <Hr />
      <Text>
        Best regards,
        <br />
        <span>{team}</span>
      </Text>
    </Section>
  );
}
