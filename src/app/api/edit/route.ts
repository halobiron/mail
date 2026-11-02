import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { SYSTEM_RULES, describeCampaign, errorResponse, getModel } from "@/lib/ai";
import { editOutputSchema, editRequestSchema, type EditField } from "@/lib/schema";

const FIELD_RULES: Record<EditField, { label: string; rule: string; singleLine: boolean }> = {
  subject: { label: "tiêu đề email", rule: "Một dòng, tối đa khoảng 60 ký tự.", singleLine: true },
  heading: { label: "tiêu đề lớn trong thân email", rule: "Một dòng ngắn.", singleLine: true },
  text: { label: "một đoạn văn trong thân email", rule: "Giữ là một đoạn văn.", singleLine: false },
  listItem: { label: "một ý trong danh sách", rule: "Một ý ngắn, một dòng, không có ký hiệu đầu dòng.", singleLine: true },
  offerLabel: { label: "nhãn nhỏ phía trên khung ưu đãi", rule: "Vài từ, một dòng.", singleLine: true },
  offerText: { label: "câu ưu đãi nổi bật trong khung", rule: "Một câu ngắn, một dòng, chỉ dùng thông tin ưu đãi đã có.", singleLine: true },
  cta: { label: "chữ trên nút kêu gọi hành động", rule: "Tối đa 5 từ, một dòng.", singleLine: true },
  note: { label: "ghi chú nhỏ cuối email", rule: "Ngắn, chỉ nhắc điều kiện hoặc thời hạn đã có trong ưu đãi.", singleLine: true },
};

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { input, email, field, text, fieldText, instruction } = editRequestSchema.parse(await req.json());
    const { label, rule, singleLine } = FIELD_RULES[field];
    const isPart = text !== fieldText;
    const { output } = await generateText({
      model: getModel(),
      system: SYSTEM_RULES,
      output: Output.object({ schema: editOutputSchema }),
      prompt: [
        describeCampaign(input),
        "",
        "Toàn bộ email hiện tại (JSON), chỉ để hiểu ngữ cảnh:",
        JSON.stringify(email),
        "",
        `Trường đang sửa: ${label}. ${rule}`,
        isPart ? `Nội dung đầy đủ của trường: """${fieldText}"""` : "",
        `${isPart ? "Phần được chọn để sửa" : "Nội dung cần sửa"}: """${text}"""`,
        "",
        `Yêu cầu: ${instruction}`,
        isPart
          ? "Chỉ trả về phần thay thế cho đoạn được chọn, viết sao cho nối liền mạch với văn bản xung quanh."
          : "Chỉ trả về nội dung mới của trường.",
        "Không giải thích, không thêm dấu ngoặc kép bao quanh.",
      ]
        .filter(Boolean)
        .join("\n"),
    });
    const clean = singleLine ? output.text.replace(/\s*\n+\s*/g, " ").trim() : output.text.trim();
    return NextResponse.json({ text: clean });
  } catch (error) {
    return errorResponse(error);
  }
}
