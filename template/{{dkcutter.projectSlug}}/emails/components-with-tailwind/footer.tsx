import { Hr, Section, Text } from "@react-email/components";

export function Footer() {
  const team = "{{ dkcutter.projectName }} Team.";

  return (
    <Section>
      <Hr />
      <Text className="text-muted-foreground">
        Best regards,
        <br />
        <span className="font-medium">{team}</span>
      </Text>
    </Section>
  );
}
