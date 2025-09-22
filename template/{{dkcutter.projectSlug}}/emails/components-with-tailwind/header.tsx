import { Heading, Hr, Section } from "@react-email/components";

export function Header() {
  return (
    <Section className="text-center">
      <Heading className="my-3">{{ dkcutter.projectName }}</Heading>
      <Hr />
    </Section>
  );
}
