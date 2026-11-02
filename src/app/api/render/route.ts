import { render } from "@react-email/render";
import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/ai";
import { renderRequestSchema } from "@/lib/schema";
import CampaignEmail from "@/emails/CampaignEmail";

export async function POST(req: Request) {
  try {
    const { input, email } = renderRequestSchema.parse(await req.json());
    const element = CampaignEmail({ brand: input.brand, brandColor: input.brandColor, email });
    const [html, text] = await Promise.all([
      render(element),
      render(element, { plainText: true }),
    ]);
    return NextResponse.json({ html, text });
  } catch (error) {
    return errorResponse(error);
  }
}
