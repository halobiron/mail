import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { Block, Email } from "@/lib/schema";

export interface CampaignEmailProps {
  brand: string;
  brandColor: string;
  email: Email;
}

const INK = "#18181b";
const BODY_TEXT = "#3f3f46";
const MUTED = "#71717a";

/**
 * Các thuộc tính data-block / data-part / data-item chỉ để giao diện nhận ra phần nào sửa được;
 * chúng không ảnh hưởng cách email hiển thị.
 */
function renderBlock(block: Block, i: number, brandColor: string) {
  switch (block.type) {
    case "heading":
      return (
        <Heading key={i} as="h1" data-block={i} data-part="text" style={{ margin: "0 0 16px", fontSize: 24, lineHeight: "32px", color: INK }}>
          {block.text}
        </Heading>
      );
    case "text":
      return (
        <Text key={i} data-block={i} data-part="text" style={{ fontSize: 16, lineHeight: "24px", color: BODY_TEXT, margin: "0 0 16px" }}>
          {block.text}
        </Text>
      );
    case "list":
      return (
        <ul key={i} data-block={i} style={{ margin: "0 0 16px", padding: "0 0 0 22px", fontSize: 16, lineHeight: "24px", color: BODY_TEXT }}>
          {block.items.map((item, j) => (
            <li key={j} data-block={i} data-part="item" data-item={j} style={{ margin: "0 0 6px" }}>
              {item}
            </li>
          ))}
        </ul>
      );
    case "offer":
      return (
        <Section
          key={i}
          data-block={i}
          style={{ margin: "0 0 16px", padding: "16px 20px", backgroundColor: "#f4f4f5", borderTop: `3px solid ${brandColor}` }}
        >
          {block.label && (
            <Text data-block={i} data-part="label" style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: MUTED }}>
              {block.label}
            </Text>
          )}
          <Text data-block={i} data-part="text" style={{ margin: 0, fontSize: 20, lineHeight: "28px", fontWeight: 700, color: INK }}>
            {block.text}
          </Text>
        </Section>
      );
    case "divider":
      return <Hr key={i} data-block={i} style={{ borderColor: "#e4e4e7", margin: "8px 0 24px" }} />;
    case "note":
      return (
        <Text key={i} data-block={i} data-part="text" style={{ fontSize: 13, lineHeight: "20px", color: MUTED, margin: "0 0 12px" }}>
          {block.text}
        </Text>
      );
  }
}

function Header({ brand, brandColor, style }: { brand: string; brandColor: string; style: Email["header"] }) {
  if (style === "plain") {
    return (
      <Section style={{ padding: "24px 32px 0" }}>
        <Text style={{ margin: 0, fontSize: 16, fontWeight: 700, color: INK }}>{brand}</Text>
        <Hr style={{ borderColor: brandColor, borderWidth: 2, margin: "12px 0 0", width: 48 }} />
      </Section>
    );
  }
  if (style === "center") {
    return (
      <Section style={{ padding: "28px 32px 20px", textAlign: "center", borderBottom: `4px solid ${brandColor}` }}>
        <Heading as="h2" style={{ margin: 0, fontSize: 22, letterSpacing: "0.04em", color: INK }}>
          {brand}
        </Heading>
      </Section>
    );
  }
  return (
    <Section style={{ backgroundColor: brandColor, padding: "20px 32px" }}>
      <Heading as="h2" style={{ margin: 0, color: "#ffffff", fontSize: 20 }}>
        {brand}
      </Heading>
    </Section>
  );
}

export default function CampaignEmail({ brand, brandColor, email }: CampaignEmailProps) {
  return (
    <Html lang="vi">
      <Head />
      <Preview>{email.preheader}</Preview>
      <Body style={{ backgroundColor: "#f4f4f5", margin: 0, padding: "24px 0", fontFamily: "Arial, Helvetica, sans-serif" }}>
        <Container style={{ maxWidth: 600, backgroundColor: "#ffffff", borderRadius: 8, overflow: "hidden" }}>
          <Header brand={brand} brandColor={brandColor} style={email.header} />
          <Section style={{ padding: "28px 32px 12px" }}>
            {email.blocks.map((b, i) => renderBlock(b, i, brandColor))}
            <Section style={{ margin: "0 0 16px" }}>
              <Button
                href="#"
                style={{
                  backgroundColor: brandColor,
                  color: "#ffffff",
                  fontSize: 16,
                  fontWeight: 600,
                  padding: "12px 24px",
                  borderRadius: 6,
                  textDecoration: "none",
                  boxSizing: "border-box",
                  display: "inline-block",
                }}
              >
                <span data-block="cta" data-part="cta">
                  {email.cta}
                </span>
              </Button>
            </Section>
          </Section>
          <Hr style={{ borderColor: "#e4e4e7", margin: 0 }} />
          <Section style={{ padding: "16px 32px" }}>
            <Text style={{ fontSize: 12, color: MUTED, margin: 0 }}>{brand}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
