import type { PropsWithChildren } from "react";
import {
  Body,
  Container,
  Heading,
  Html,
  Preview,
} from "@react-email/components";
import { Footer } from "./footer";
import { Header } from "./header";
import { Text } from "./text";

export interface LayoutProps extends PropsWithChildren {
  readonly previewText: string;
  readonly title?: string;
}

export function Layout({ title, previewText, children }: LayoutProps) {
  return (
    <Html>
      <Preview>{previewText}</Preview>

      <Body>
        <Container>
          <Header />

          {title ? <Heading as="h2">{title}</Heading> : null}

          <Text>Hello, User!</Text>
          {children}

          <br />
          <Footer />
        </Container>
      </Body>
    </Html>
  );
}
