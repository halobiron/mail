import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import {
  SYSTEM_RULES,
  TONE_GUIDE,
  describeCampaign,
  errorResponse,
  getModel,
} from "@/lib/ai";
import { emailSchema, rewriteRequestSchema } from "@/lib/schema";

export async function POST(req: Request) {
  try {
    const { input, email, tone, instruction } = rewriteRequestSchema.parse(await req.json());
    const asks = [
      tone && `đổi sang tông ${TONE_GUIDE[tone]}`,
      instruction && `làm theo yêu cầu của người dùng: "${instruction}"`,
    ].filter(Boolean);
    const { output } = await generateText({
      model: getModel(),
      system: SYSTEM_RULES,
      output: Output.object({ schema: emailSchema }),
      prompt: [
        describeCampaign(input),
        "",
        "Email hiện tại (JSON):",
        JSON.stringify(email),
        "",
        `Viết lại email này: ${asks.join(", đồng thời ")}.`,
        `Giữ nguyên thông tin ưu đãi. Giữ hướng tiếp cận "${email.angle}" trừ khi yêu cầu nói khác. Phần nào yêu cầu không đụng tới thì giữ nguyên từng chữ. Mỗi email luôn có đúng một nút kêu gọi hành động (cta) và nút không phải là khối. Giữ nguyên các khối và thứ tự khối; chỉ thêm, bớt, đổi loại hoặc đổi thứ tự khối khi yêu cầu cần điều đó (ví dụ "thêm danh sách ưu điểm").`,
      ].join("\n"),
    });
    return NextResponse.json(output);
  } catch (error) {
    return errorResponse(error);
  }
}
