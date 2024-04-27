export const PATTERN = /{{(\s?dkcutter)\.(.*?)}}/;

export const SUPPORTED_COMBINATIONS = [
  { postgresqlVersion: "16" },
  { postgresqlVersion: "15" },
  { postgresqlVersion: "14" },
  { postgresqlVersion: "13" },
  { postgresqlVersion: "12" },
  { cloudProvider: "AWS", useWhitenoise: true },
  { cloudProvider: "AWS", useWhitenoise: false },
  { cloudProvider: "GCP", useWhitenoise: true },
  { cloudProvider: "GCP", useWhitenoise: false },
  { cloudProvider: "None", useWhitenoise: true, mailService: "Mailgun" },
  { cloudProvider: "None", useWhitenoise: true, mailService: "Mailjet" },
  { cloudProvider: "None", useWhitenoise: true, mailService: "Mandrill" },
  { cloudProvider: "None", useWhitenoise: true, mailService: "Postmark" },
  { cloudProvider: "None", useWhitenoise: true, mailService: "Sendgrid" },
  { cloudProvider: "None", useWhitenoise: true, mailService: "SendinBlue" },
  { cloudProvider: "None", useWhitenoise: true, mailService: "SparkPost" },
  { cloudProvider: "None", useWhitenoise: true, mailService: "Other SMTP" },
  { cloudProvider: "None", useWhitenoise: true, mailService: "None" },
  // Note: cloudProvider=None AND useWhitenoise=false is not supported
  { cloudProvider: "AWS", mailService: "Mailgun" },
  { cloudProvider: "AWS", mailService: "Amazon SES" },
  { cloudProvider: "AWS", mailService: "Mailjet" },
  { cloudProvider: "AWS", mailService: "Mandrill" },
  { cloudProvider: "AWS", mailService: "Postmark" },
  { cloudProvider: "AWS", mailService: "Sendgrid" },
  { cloudProvider: "AWS", mailService: "SendinBlue" },
  { cloudProvider: "AWS", mailService: "SparkPost" },
  { cloudProvider: "AWS", mailService: "Other SMTP" },
  { cloudProvider: "AWS", mailService: "None" },
  { cloudProvider: "GCP", mailService: "Mailgun" },
  { cloudProvider: "GCP", mailService: "Mailjet" },
  { cloudProvider: "GCP", mailService: "Mandrill" },
  { cloudProvider: "GCP", mailService: "Postmark" },
  { cloudProvider: "GCP", mailService: "Sendgrid" },
  { cloudProvider: "GCP", mailService: "SendinBlue" },
  { cloudProvider: "GCP", mailService: "SparkPost" },
  { cloudProvider: "GCP", mailService: "Other SMTP" },
  { cloudProvider: "GCP", mailService: "None" },
  // Note: cloudProviders GCP and None
  // with mailService Amazon SES is not supported
  { useWhitenoise: true },
  { useWhitenoise: false },
  { useMailpit: true },
  { useMailpit: false },
  { useSentry: true },
  { useSentry: false },
  { restFramework: "None" },
  { restFramework: "DRF" },
  { restFramework: "DNRF" },
  { useCelery: true },
  { useCelery: false },
  { useTailwindcss: true },
  { useTailwindcss: false },
  { automatedDepsUpdater: "renovate" },
  { automatedDepsUpdater: "dependabot" },
];
export const UNSUPPORTED_COMBINATIONS = [
  { postgresqlVersion: 5 },
  { restFramework: "NOn" },
  { restFramework: "Rest" },
  { cloudProvider: "None", useWhitenoise: false },
  { cloudProvider: "Non" },
  { mailService: "Non" },
  { mailService: "Other" },
  { automatedDepsUpdater: "xpto" },
];
export const INVALID_SLUGS = ["", " ", "1est", "tes1@", "t!es", "project slug"];
