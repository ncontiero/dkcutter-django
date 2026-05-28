import { type TextProps, Text as ReactEmailText } from "react-email";

export function Text(props: TextProps) {
  return <ReactEmailText {...props} />;
}
