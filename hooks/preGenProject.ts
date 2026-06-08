import type { FrontendPipeline } from "./utils/types";

import { logger } from "dkcutter/utils";
import { z } from "zod";
import { toBoolean } from "./utils/coerce";

// The content of this string is evaluated by Jinja, and plays an important role.
// It updates the dkcutter context to trim leading and trailing spaces
// from domain/email values
// {{ dkcutter.update("domainName", dkcutter.domainName|trim) }}
// {{ dkcutter.update("email", dkcutter.email|trim) }}

// And this add values in context for ease in conditions.
// {{ dkcutter.update("pkgManager", dkcutter._pkgManager) }}
// {{ dkcutter.add("useReactEmail", "{{ 'reactEmail' in dkcutter.additionalTools }}") }}
// {{ dkcutter.add("useTailwind", "{{ 'tailwindcss' in dkcutter.additionalTools }}") }}
// {{ dkcutter.add("useEslintWithTypeInformation", "{{ 'eslint-ts' in dkcutter.additionalTools }}") }}
// {{ dkcutter.add("useEslint", "{{ 'eslint' in dkcutter.additionalTools or dkcutter.useEslintWithTypeInformation }}") }}
// {{ dkcutter.add("useMailpit", "{{ 'mailpit' in dkcutter.additionalTools }}") }}
// {{ dkcutter.add("useCelery", "{{ 'celery' in dkcutter.additionalTools }}") }}
// {{ dkcutter.add("useSentry", "{{ 'sentry' in dkcutter.additionalTools }}") }}
// {{ dkcutter.add("useWhitenoise", "{{ 'whitenoise' in dkcutter.additionalTools }}") }}
// {{ dkcutter.add("usePgadmin", "{% if 'pgadmin' in dkcutter.additionalTools %}true{% endif %}") }}

// Add this values in context to avoid repetitions
// {{ dkcutter.add("pageTitleClass", "{{ 'my-4 text-4xl font-bold underline' if dkcutter.useTailwind else 'page-title' }}") }}
// {{ dkcutter.add("pageErrorDescriptionClass", "{{ 'text-lg' if dkcutter.useTailwind else 'page-error-description' }}") }}

const ctx = {
  frontendPipeline: "{{ dkcutter.frontendPipeline }}" as FrontendPipeline,
  useReactEmail: toBoolean("{{ dkcutter.useReactEmail }}"),
  useEslint: toBoolean("{{ dkcutter.useEslint }}"),
  useWhitenoise: toBoolean("{{ dkcutter.useWhitenoise }}"),
  cloudProvider: "{{ dkcutter.cloudProvider }}",
  mailService: "{{ dkcutter.mailService }}",
  useMailpit: toBoolean("{{ dkcutter.useMailpit }}"),
};

export function validateProject() {
  try {
    z.object({
      frontendPipeline: z.enum(["None", "Rspack", "Webpack"]),
      useReactEmail: z.boolean(),
      useEslint: z.boolean(),
      useWhitenoise: z.boolean(),
      cloudProvider: z.string(),
      mailService: z.string(),
      useMailpit: z.boolean(),
    })
      .refine(
        (data) =>
          !data.useEslint ||
          data.frontendPipeline !== "None" ||
          data.useReactEmail,
        "ESLint requires a Frontend Pipeline or React Email to be selected.",
      )
      .refine(
        (data) => data.useWhitenoise || data.cloudProvider !== "None",
        "You must choose a cloud provider if you don't use Whitenoise.",
      )
      .parse(ctx);
  } catch (error) {
    logger.break();
    if (error instanceof z.ZodError) {
      logger.error(error.format()._errors.join(",").replaceAll(",", "\n"));
    } else {
      logger.error(error);
    }
    process.exit(1);
  }
}

validateProject();
