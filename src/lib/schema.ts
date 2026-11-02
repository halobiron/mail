import { z } from "zod";

export const GOALS = {
  launch: "Ra mắt sản phẩm",
  promotion: "Khuyến mãi",
  nurture: "Chăm sóc khách hàng",
} as const;
export type Goal = keyof typeof GOALS;

export const TONES = {
  formal: "Trang trọng",
  humorous: "Hài hước",
  urgent: "Khẩn cấp",
} as const;
export type Tone = keyof typeof TONES;

const goalEnum = z.enum(Object.keys(GOALS) as [Goal, ...Goal[]], "Mục tiêu chiến dịch không hợp lệ");
const toneEnum = z.enum(Object.keys(TONES) as [Tone, ...Tone[]], "Tông viết không hợp lệ");

export const campaignInputSchema = z.object({
  goal: goalEnum,
  brand: z.string().trim().min(1, "Nhập tên thương hiệu").max(80, "Tên thương hiệu tối đa 80 ký tự"),
  industry: z.string().trim().max(80, "Ngành hàng tối đa 80 ký tự").optional().default(""),
  offer: z.string().trim().min(1, "Nhập nội dung ưu đãi").max(1000, "Nội dung ưu đãi tối đa 1000 ký tự"),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Màu thương hiệu phải có dạng #RRGGBB"),
});
export type CampaignInput = z.infer<typeof campaignInputSchema>;

export const BLOCK_TYPES = ["heading", "text", "list", "offer", "divider", "note"] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

export const BLOCK_LABELS: Record<BlockType, string> = {
  heading: "Tiêu đề",
  text: "Đoạn văn",
  list: "Danh sách",
  offer: "Khung ưu đãi",
  divider: "Đường kẻ",
  note: "Ghi chú nhỏ",
};

export const HEADER_STYLES = {
  banner: "Thanh màu",
  plain: "Đơn giản",
  center: "Căn giữa",
} as const;
export type HeaderStyle = keyof typeof HEADER_STYLES;

export const MAX_BLOCKS = 12;

/** Phẳng và đủ trường cho mọi loại khối để AI trả về ổn định; trường không dùng thì để rỗng. */
export const blockSchema = z.object({
  type: z.enum(BLOCK_TYPES),
  text: z
    .string()
    .describe("Nội dung chính: heading, text, offer (câu ưu đãi nổi bật), note. Chuỗi rỗng với list và divider"),
  label: z.string().describe("Chỉ cho offer: nhãn nhỏ phía trên khung. Chuỗi rỗng với các loại khác"),
  items: z.array(z.string()).describe("Chỉ cho list: các ý ngắn. Mảng rỗng với các loại khác"),
});
export type Block = z.infer<typeof blockSchema>;

export const emailSchema = z.object({
  angle: z.string().describe("Hướng tiếp cận của mẫu, tối đa 6 từ"),
  subject: z.string().describe("Tiêu đề email, tối đa khoảng 60 ký tự"),
  header: z.enum(Object.keys(HEADER_STYLES) as [HeaderStyle, ...HeaderStyle[]]).describe("Kiểu đầu thư"),
  blocks: z.array(blockSchema).min(1).max(MAX_BLOCKS).describe("Các khối nội dung theo thứ tự từ trên xuống, không gồm nút"),
  cta: z.string().describe("Chữ trên nút kêu gọi hành động duy nhất của email, tối đa 5 từ"),
});
export type Email = z.infer<typeof emailSchema>;

export function newBlock(type: BlockType): Block {
  const base = { type, text: "", label: "", items: [] as string[] };
  switch (type) {
    case "heading":
      return { ...base, text: "Tiêu đề mới" };
    case "text":
      return { ...base, text: "Đoạn văn mới" };
    case "list":
      return { ...base, items: ["Ý thứ nhất", "Ý thứ hai"] };
    case "offer":
      return { ...base, label: "Ưu đãi", text: "Nội dung ưu đãi" };
    case "note":
      return { ...base, text: "Ghi chú nhỏ" };
    default:
      return base;
  }
}

export const generateOutputSchema = z.object({
  emails: z.array(emailSchema).length(3),
});

export const sendTimeSchema = z.object({
  industry: z.string().describe("Ngành hàng: giữ nguyên ngành người dùng đã nhập, nếu không có thì suy ra từ thương hiệu và ưu đãi, tối đa 4 từ"),
  slots: z
    .array(
      z.object({
        dayOfWeek: z.number().int().min(1).max(7).describe("Thứ trong tuần: 1 là Thứ Hai, 7 là Chủ nhật"),
        startHour: z.number().int().min(0).max(23).describe("Giờ bắt đầu, số nguyên 0-23"),
        endHour: z.number().int().min(1).max(24).describe("Giờ kết thúc, số nguyên lớn hơn startHour"),
        reason: z.string().describe("Lý do một câu, tối đa 20 từ, gắn với hành vi khách hàng của ngành"),
      }),
    )
    .min(1)
    .max(3),
  timezone: z.string().describe("Múi giờ đã giả định, dạng ngắn như 'UTC+7 (Việt Nam)', tối đa 4 từ"),});
export type SendTime = z.infer<typeof sendTimeSchema>;

export const generateRequestSchema = campaignInputSchema;
export const rewriteRequestSchema = z
  .object({
    input: campaignInputSchema,
    email: emailSchema,
    tone: toneEnum.optional(),
    instruction: z.string().trim().min(1).max(500).optional(),
  })
  .refine((v) => v.tone || v.instruction, { message: "Cần chọn tông hoặc nhập yêu cầu chỉnh sửa" });

export const EDIT_FIELDS = ["subject", "heading", "text", "listItem", "offerLabel", "offerText", "cta", "note"] as const;
export type EditField = (typeof EDIT_FIELDS)[number];

export const editRequestSchema = z.object({
  input: campaignInputSchema,
  email: emailSchema,
  field: z.enum(EDIT_FIELDS),
  /** Đoạn cần sửa: phần được bôi đen, hoặc cả trường nếu không bôi đen. */
  text: z.string().min(1, "Chưa có nội dung để chỉnh").max(2000),
  /** Cả nội dung của trường chứa đoạn đó, để AI hiểu ngữ cảnh. */
  fieldText: z.string().max(2000),
  instruction: z.string().trim().min(1, "Nhập yêu cầu chỉnh sửa").max(300),
});
export const editOutputSchema = z.object({
  text: z.string().describe("Chỉ phần nội dung thay thế, không kèm giải thích hay dấu ngoặc kép"),
});
export const sendTimeRequestSchema = z.object({
  brand: campaignInputSchema.shape.brand,
  industry: campaignInputSchema.shape.industry,
  offer: campaignInputSchema.shape.offer,
  goal: goalEnum,
});
export const renderRequestSchema = z.object({
  input: campaignInputSchema,
  email: emailSchema,
});

export type CampaignResult = {
  emails: Email[];
  sendTime: SendTime | null;
};
