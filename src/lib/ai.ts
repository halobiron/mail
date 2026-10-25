import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { GOALS, type CampaignInput, type Tone } from "./schema";

export class ConfigError extends Error {}

/** Model là chuỗi "provider/model" lấy từ biến môi trường, không gắn cứng trong code. */
export function getModel(): string {
  const model = process.env.AI_MODEL;
  if (!model) {
    throw new ConfigError(
      "Thiếu biến môi trường AI_MODEL (dạng provider/model). Xem .env.example.",
    );
  }
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) {
    throw new ConfigError(
      "Thiếu AI_GATEWAY_API_KEY. Xem .env.example.",
    );
  }
  return model;
}

export function errorResponse(error: unknown) {
  if (error instanceof ConfigError) {
    return NextResponse.json({ error: error.message, code: "config" }, { status: 500 });
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "), code: "validation" },
      { status: 400 },
    );
  }
  console.error(error);
  return NextResponse.json(
    { error: "Dịch vụ AI đang gặp sự cố hoặc phản hồi không hợp lệ. Vui lòng thử lại sau ít phút.", code: "ai" },
    { status: 502 },
  );
}

export function describeCampaign(input: CampaignInput) {
  return [
    `Mục tiêu chiến dịch: ${GOALS[input.goal]}`,
    `Thương hiệu: ${input.brand}`,
    ...(input.industry ? [`Ngành hàng: ${input.industry}`] : []),
    `Nội dung ưu đãi do khách hàng cung cấp: ${input.offer}`,
  ].join("\n");
}

export const SYSTEM_RULES = [
  "Bạn là chuyên gia email marketing. Viết bằng ngôn ngữ của phần nội dung ưu đãi người dùng nhập.",
  "Chỉ dùng thông tin có trong nội dung ưu đãi. Không bịa giá, phần trăm giảm, ngày hết hạn, số liệu hay chính sách mà người dùng không cung cấp.",
  "Không khẳng định điều kiện hay chính sách mà ưu đãi không nêu, ví dụ: không cần mã, không giới hạn số lượng, không gia hạn, miễn phí vận chuyển, số lượng có hạn.",
  "Không chèn tên riêng hay biến mẫu như {{name}} vào nội dung.",
].join("\n");

export const TONE_GUIDE: Record<Tone, string> = {
  formal: "trang trọng, lịch sự, chuyên nghiệp",
  humorous: "hài hước, nhẹ nhàng, thân thiện, không lố hay xúc phạm",
  urgent: "khẩn cấp, thúc đẩy hành động nhanh, nhưng không tạo áp lực sai sự thật",
};
