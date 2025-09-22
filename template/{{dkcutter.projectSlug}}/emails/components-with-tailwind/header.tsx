import { Heading, Hr, Section } from "@react-email/components";

export function Header() {
  const projectName = "{{ dkcutter.projectName }}";

  return (
    <Section className="text-center">
      <Heading className="my-3">{projectName}</Heading>
      <Hr />
    </Section>
  );
}
