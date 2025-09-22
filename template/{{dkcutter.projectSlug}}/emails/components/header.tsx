import { Heading, Hr, Section } from "@react-email/components";

export function Header() {
  return (
    <Section>
      <Heading>{{ dkcutter.projectName }}</Heading>
      <Hr />
    </Section>
  );
}
