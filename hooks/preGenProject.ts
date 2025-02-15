import { z } from "zod";

import { toBoolean } from "./utils/coerce";
import { logger } from "./utils/logger";

// The content of this string is evaluated by Jinja, and plays an important role.
// It updates the dkcutter context to trim leading and trailing spaces
// from domain/email values
// {{ dkcutter.update("domainName", dkcutter.domainName|trim) }}
// {{ dkcutter.update("email", dkcutter.email|trim) }}

// And this add values in context for ease in conditions.
// {{ dkcutter.add("useMailpit", "{% if 'mailpit' in dkcutter.additionalTools %}true{% endif %}") }}
// {{ dkcutter.add("useCelery", "{% if 'celery' in dkcutter.additionalTools %}true{% endif %}") }}
// {{ dkcutter.add("useSentry", "{% if 'sentry' in dkcutter.additionalTools %}true{% endif %}") }}
// {{ dkcutter.add("useWhitenoise", "{% if 'whitenoise' in dkcutter.additionalTools %}true{% endif %}") }}
// {{ dkcutter.add("usePgadmin", "{% if 'pgadmin' in dkcutter.additionalTools %}true{% endif %}") }}

const ctx = {
  useWhitenoise: toBoolean("{{ 'whitenoise' in dkcutter.additionalTools }}"),
  cloudProvider: "{{ dkcutter.cloudProvider }}",
  mailService: "{{ dkcutter.mailService }}",
  useMailpit: toBoolean("{{ 'mailpit' in dkcutter.additionalTools }}"),
};

export function validateProject() {
  try {
    z.object({
      useWhitenoise: z.boolean(),
      cloudProvider: z.string(),
      mailService: z.string(),
      useMailpit: z.boolean(),
    })
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
