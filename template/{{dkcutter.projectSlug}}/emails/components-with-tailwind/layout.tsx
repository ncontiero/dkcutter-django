import type { PropsWithChildren } from "react";
import {
  type TailwindConfig,
  Body,
  Container,
  Head,
  Heading,
  Html,
  pixelBasedPreset,
  Preview,
  Tailwind,
} from "@react-email/components";
import { Footer } from "./footer";
import { Header } from "./header";
import { Text } from "./text";

export interface LayoutProps extends PropsWithChildren {
  readonly previewText: string;
  readonly title?: string;
}

const tailwindConfig: TailwindConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      colors: {
        border: "#e5e7eb",
        background: "#fff",
        foreground: "#121212",
        secondary: {
          DEFAULT: "#f3f4f6",
          foreground: "#121212",
        },
        muted: {
          DEFAULT: "#f5f5f5",
          foreground: "#666",
        },
      },
    },
  },
};

export function Layout({ title, previewText, children }: LayoutProps) {
  return (
    <Html>
      <Tailwind config={tailwindConfig}>
        <Head />
        <Preview>{previewText}</Preview>

        <Body className="m-auto bg-background font-sans">
          <Container className="mx-auto my-10 max-w-[600px] rounded-[6px] border border-solid border-transparent p-5 md:border-border">
            <Header />

            {title ? (
              <Heading
                as="h2"
                className="my-5 text-center text-[26px] font-semibold text-foreground"
              >
                {title}
              </Heading>
            ) : null}

            <Text>Hello, User!</Text>
            {children}

            <br />
            <Footer />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
