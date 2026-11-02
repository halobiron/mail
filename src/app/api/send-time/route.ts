import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { SYSTEM_RULES, errorResponse, getModel } from "@/lib/ai";
import { GOALS, sendTimeRequestSchema, sendTimeSchema, type SendTime } from "@/lib/schema";

export const maxDuration = 60;

const MAX_WORDS = 20;

/** Thứ, ngày dd/mm hay vị trí trong tuần đã có ở dayOfWeek và giờ; nhắc lại trong lý do là chỗ AI hay viết lệch. */
const TIME_WORDS = /thứ (hai|ba|tư|năm|sáu|bảy)|chủ nhật|\d{1,2}\/\d{1,2}|(đầu|giữa|cuối) tuần|ngày (đầu|cuối|kề)/i;

function isInvalid({ slots }: SendTime) {
  return slots.some(({ reason }) => TIME_WORDS.test(reason));
}

/** Ngày hiện tại theo UTC+7, để AI đối chiếu ngày trong ưu đãi với thứ trong tuần thay vì đoán. */
function todayInVietnam() {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
}

export async function POST(req: Request) {
  try {
    const { brand, industry, offer, goal } = sendTimeRequestSchema.parse(await req.json());
    const prompt = [
      `Hôm nay là ${todayInVietnam()}.`,
      `Thương hiệu: ${brand}`,
      ...(industry ? [`Ngành hàng người dùng nhập: ${industry}`] : []),
      `Nội dung ưu đãi: ${offer}`,
      `Mục tiêu chiến dịch: ${GOALS[goal]}`,
      "",
      industry
        ? "Dùng đúng ngành hàng người dùng nhập (điền vào trường industry) và suy ra nhóm khách nhận email từ đó."
        : "Người dùng không nhập ngành hàng: trước hết suy ra ngành và nhóm khách nhận email từ thương hiệu và nội dung ưu đãi (điền vào trường industry).",
      "Sau đó gợi ý 1-3 thời điểm gửi email tốt nhất (ngày trong tuần + khung giờ), dựa trên thói quen mở email phổ biến của nhóm khách đó. Nếu ưu đãi có hạn chót hoặc gắn với một dịp cụ thể (bữa trưa, cuối tuần, ngày lương), ưu tiên khung giờ phù hợp với điều đó.",
      "Nếu ưu đãi nêu ngày cụ thể, dùng ngày hôm nay ở trên để xác định đúng thứ trong tuần của ngày đó (lần xuất hiện sắp tới nếu không ghi năm) và chỉ gợi ý thời điểm gửi trước hoặc trong thời gian ưu đãi.",
      `Mỗi reason tối đa ${MAX_WORDS} từ và chỉ giải thích theo hành vi của khách (giờ giải lao, đi làm về, nghỉ trưa...). Tuyệt đối không nhắc thứ, ngày dd/mm, "đầu/cuối tuần" hay "ngày đầu/cuối" trong reason: ngày và giờ đã có ở dayOfWeek, startHour, endHour.`,
      "Nếu ngành không do người dùng nhập và không đủ căn cứ để xác định ngành, chọn khung giờ an toàn cho đa số khách hàng.",
      "Người dùng chưa cung cấp múi giờ hay thị trường: hãy giả định UTC+7 (Việt Nam) và điền vào trường timezone.",
    ].join("\n");

    // Quy tắc về reason chỉ nằm trong prompt nên AI có thể vi phạm: kiểm tra lại, gọi thêm tối đa hai lần.
    let output = await generate(prompt);
    for (let retry = 0; retry < 2 && isInvalid(output); retry++) {
      output = await generate(prompt);
    }
    return NextResponse.json(output);
  } catch (error) {
    return errorResponse(error);
  }
}

async function generate(prompt: string) {
  const { output } = await generateText({
    model: getModel(),
    system: SYSTEM_RULES,
    output: Output.object({ schema: sendTimeSchema }),
    prompt,
  });
  return output;
}
