import { Heading, Hr, Section } from "react-email";

export function Header() {
  const projectName = "{{ dkcutter.projectName }}";

  return (
    <Section>
      <Heading>{projectName}</Heading>
      <Hr />
    </Section>
  );
}
