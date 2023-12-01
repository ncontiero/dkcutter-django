import { z } from "zod";

import { logger } from "./utils/logger";
import { toBoolean } from "./utils/coerce";

const ctx = {
  useWhitenoise: toBoolean("{{ useWhitenoise }}"),
  cloudProvider: "{{ cloudProvider }}",
  mailService: "{{ mailService }}",
  useMailpit: toBoolean("{{ useMailpit }}"),
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
  } catch (err) {
    logger.break();
    if (err instanceof z.ZodError) {
      logger.error(err.format()._errors.join(",").replaceAll(",", "\n"));
    } else {
      logger.error(err);
    }
    process.exit(1);
  }
}

validateProject();
