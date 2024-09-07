import { z } from "zod";

import { toBoolean } from "./utils/coerce";
import { logger } from "./utils/logger";

// The content of this string is evaluated by Jinja, and plays an important role.
// It updates the dkcutter context to trim leading and trailing spaces
// from domain/email values
// {{ dkcutter.update('domainName', dkcutter.domainName|trim) }}
// {{ dkcutter.update('email', dkcutter.email|trim) }}

const ctx = {
  useWhitenoise: toBoolean("{{ dkcutter.useWhitenoise }}"),
  cloudProvider: "{{ dkcutter.cloudProvider }}",
  mailService: "{{ dkcutter.mailService }}",
  useMailpit: toBoolean("{{ dkcutter.useMailpit }}"),
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
        (data) => !(!data.useWhitenoise && data.cloudProvider === "None"),
        "You must choose a cloud provider if you don't use Whitenoise.",
      )
      .refine(
        (data) =>
          !(data.mailService === "Amazon SES" && data.cloudProvider !== "AWS"),
        "Amazon SES is only available for AWS Cloud Provider.",
      )
      .refine(
        (data) => !(data.useMailpit && data.mailService === "None"),
        "You must choose a mail service if you use Mailpit.",
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
