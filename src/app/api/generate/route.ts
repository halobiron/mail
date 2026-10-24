import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import {
  SYSTEM_RULES,
  describeCampaign,
  errorResponse,
  getModel,
} from "@/lib/ai";
import { generateOutputSchema, generateRequestSchema } from "@/lib/schema";

export async function POST(req: Request) {
  try {
    const input = generateRequestSchema.parse(await req.json());
    const { output } = await generateText({
      model: getModel(),
      system: SYSTEM_RULES,
      output: Output.object({ schema: generateOutputSchema }),
      prompt: [
        describeCampaign(input),
        "",
        "Viết đúng 3 mẫu email chiến dịch, mỗi mẫu theo một hướng tiếp cận khác nhau rõ rệt (ví dụ: lợi ích, câu chuyện, thúc đẩy hành động).",
        "Mỗi mẫu gồm: angle, subject, preheader, header (kiểu đầu thư) và blocks (các khối nội dung từ trên xuống).",
        "Các loại khối: heading (tiêu đề lớn), text (đoạn văn), list (danh sách ý ngắn), offer (khung nổi bật cho ưu đãi, có label nhỏ phía trên), button (nút kêu gọi hành động), divider (đường kẻ), note (ghi chú nhỏ như thời hạn, điều kiện đã có trong ưu đãi).",
        "Ba mẫu phải khác nhau cả về cấu trúc khối và kiểu đầu thư, không chỉ khác chữ: ví dụ một mẫu dùng khung ưu đãi và danh sách, một mẫu kể chuyện bằng vài đoạn văn, một mẫu ngắn gọn thúc đẩy hành động. Chỉ dùng list, offer, divider, note khi nội dung thật sự cần.",
        "Kiểu đầu thư (header): ba mẫu dùng ba kiểu khác nhau là banner, plain và center, mỗi kiểu đúng một lần.",
        "angle chỉ là một nhãn ngắn tối đa 6 từ (ví dụ: Lợi ích rõ ràng), không phải câu mô tả.",
        "Bắt đầu bằng lời chào (text) hoặc heading. Có ít nhất một button. Email ngắn gọn, dễ đọc trên điện thoại, tối đa 8 khối.",
      ].join("\n"),
    });
    return NextResponse.json(output);
  } catch (error) {
    return errorResponse(error);
  }
}
