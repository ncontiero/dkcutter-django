import { Heading, Hr, Section } from "@react-email/components";

export function Header() {
  const projectName = "{{ dkcutter.projectName }}";

  return (
    <Section>
      <Heading>{projectName}</Heading>
      <Hr />
    </Section>
  );
}
