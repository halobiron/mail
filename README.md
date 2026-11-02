# Email Campaign Studio

Next.js + TypeScript + React Email + Vercel AI SDK. Nhập mục tiêu, thương hiệu, ngành hàng, ưu đãi → 3 mẫu email (subject + nội dung + CTA), preview kiểu hộp thư, copy, viết lại theo tông, gợi ý thời điểm gửi.

## Chạy

```bash
cp .env.example .env.local   # điền AI_MODEL và AI_GATEWAY_API_KEY
npm install
npm run dev
```

- `AI_MODEL`: `provider/model` của Vercel AI Gateway (danh sách: `curl -s https://ai-gateway.vercel.sh/v1/models`).
- `AI_GATEWAY_API_KEY`: key của AI Gateway.

## Phạm vi

Không có cơ sở dữ liệu, danh sách khách hàng hay gửi email. Gợi ý thời điểm gửi do AI suy luận theo ngành, không phải số liệu đo đạc.
