import { Hr, Section, Text } from "@react-email/components";

export function Footer() {
  return (
    <Section>
      <Hr />
      <Text className="text-muted-foreground">
        Best regards,
        <br />
        <span className="font-medium">{{ dkcutter.projectName }} Team.</span>
      </Text>
    </Section>
  );
}
