import {
  type TextProps,
  Text as ReactEmailText,
} from "@react-email/components";

export function Text(props: TextProps) {
  return <ReactEmailText {...props} />;
}
