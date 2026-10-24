import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { SYSTEM_RULES, errorResponse, getModel } from "@/lib/ai";
import { GOALS, sendTimeRequestSchema, sendTimeSchema } from "@/lib/schema";

export async function POST(req: Request) {
  try {
    const { brand, industry, offer, goal } = sendTimeRequestSchema.parse(await req.json());
    const { output } = await generateText({
      model: getModel(),
      system: SYSTEM_RULES,
      output: Output.object({ schema: sendTimeSchema }),
      prompt: [
        `Thương hiệu: ${brand}`,
        ...(industry ? [`Ngành hàng người dùng nhập: ${industry}`] : []),
        `Nội dung ưu đãi: ${offer}`,
        `Mục tiêu chiến dịch: ${GOALS[goal]}`,
        "",
        industry
          ? "Dùng đúng ngành hàng người dùng nhập (điền vào trường industry) và suy ra nhóm khách nhận email từ đó."
          : "Người dùng không nhập ngành hàng: trước hết suy ra ngành và nhóm khách nhận email từ thương hiệu và nội dung ưu đãi (điền vào trường industry).",
        "Sau đó gợi ý 1-3 thời điểm gửi email tốt nhất (ngày trong tuần + khung giờ), dựa trên thói quen mở email phổ biến của nhóm khách đó. Nếu ưu đãi có hạn chót hoặc gắn với một dịp cụ thể (bữa trưa, cuối tuần, ngày lương), ưu tiên khung giờ phù hợp với điều đó.",
        "Nếu ngành không do người dùng nhập và không đủ căn cứ để xác định ngành, nêu rõ trong trường note và chọn khung giờ an toàn cho đa số khách hàng.",
        "Người dùng chưa cung cấp múi giờ hay thị trường: hãy nêu rõ giả định trong trường note và nhắc rằng đây là gợi ý cần kiểm chứng bằng A/B test, không phải số liệu đo đạc.",
      ].join("\n"),
    });
    return NextResponse.json(output);
  } catch (error) {
    return errorResponse(error);
  }
}
