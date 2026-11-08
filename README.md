# Email Campaign Studio — Cuộc thi Vibe Coding 2026

## 1. Thông tin chung

| Hạng mục | Nội dung |
|---|---|
| Tên đội thi | <ProPTIT/> RGB |
| Bảng thi | Bảng A - Công nghệ |
| Đề bài bốc thăm | Đề số 6 — Trình tạo email marketing bằng AI |
| Demo online | https://mail-three-jet.vercel.app/ |
| Video demo (≤ 02 phút) | https://drive.google.com/file/d/1F--0VLwfEWDdjvrKFBuQIgg7rIn34wXe/view?usp=sharing |
| Source ZIP | https://drive.google.com/file/d/1qNhzwSWo554f8ni9CBPOnjsCJzec87HP/view?usp=sharing |
| Minh chứng dùng AI | https://drive.google.com/file/d/1mQPYiJfou-HcwEf_r3C-etByedVN9RE0/view?usp=sharing |
| Bảng kiểm thử | Mục 11 của README này, và tệp [KIEM-THU.md](KIEM-THU.md) trong ZIP |

> Không đưa khóa API hoặc mật khẩu vào bài nộp. Tệp `.env` không nằm trong ZIP, chỉ kèm `.env.example`.

## 2. Tính năng chính

1. **Nhập thông tin chiến dịch**: mục tiêu (Ra mắt sản phẩm, Khuyến mãi, Chăm sóc khách hàng), thương hiệu, nội dung ưu đãi (bắt buộc), ngành hàng (không bắt buộc, bỏ trống thì AI suy ra từ ưu đãi) và màu thương hiệu.
2. **AI soạn 3 mẫu email** khác nhau, mỗi mẫu có tiêu đề, nội dung và nút CTA.
3. **Xem trước như hộp thư thật** (chế độ Desktop và Mobile 375px), có avatar theo thương hiệu và nhãn mẫu A/B/C.
4. **Copy từng mẫu**: copy nội dung dạng văn bản hoặc copy HTML email.
5. **Viết lại theo tông khác** (Trang trọng, Hài hước, Khẩn cấp) sau khi đã có 3 mẫu, có nút Hoàn tác.
6. **Gợi ý thời điểm gửi theo ngành**: 1–3 khung giờ kèm lý do và múi giờ. Đây là suy luận của AI, không phải số liệu đo.

Tính năng ngoài đề bài, làm thêm: sửa trực tiếp nội dung trong khung xem trước, thêm/đổi các khối (tiêu đề, đoạn văn, danh sách, khung ưu đãi, đường kẻ, ghi chú), và thanh gợi ý chỉnh nhanh bằng AI (ngắn gọn hơn, thân thiện hơn, sửa chính tả...).

Ứng dụng không gửi email thật (đề bài yêu cầu không dùng SMTP).

## 3. Công nghệ sử dụng

| Lớp | Công nghệ |
|---|---|
| Giao diện | React 19.3.0 trên Next.js 16.4.2 (App Router, TypeScript) + Tailwind CSS 4.3.3 |
| Thư viện | `ai` 7.0.148 (Vercel AI SDK), `@ai-sdk/react` ^4.0.152, `@react-email/components` 1.0.12 và `@react-email/render` (dựng HTML email), `zod` ^4.6.7 (kiểm tra dữ liệu) |
| Phông chữ | Be Vietnam Pro, Barlow Condensed (Google Fonts, qua `next/font`) |
| Backend | Các route API của Next.js: `/api/generate`, `/api/rewrite`, `/api/edit`, `/api/send-time`, `/api/render` |
| Lưu trữ | Không lưu dữ liệu. Không có cơ sở dữ liệu và không dùng localStorage |
| Triển khai | Vercel (https://mail-three-jet.vercel.app/) |

## 4. Tích hợp AI

- **Chế độ đang dùng**: API thật, qua Vercel AI Gateway.
- **Model**: `minimax/minimax-m3.1-flash` (đặt trong biến môi trường `AI_MODEL`, đổi được mà không sửa mã).
- **Mục đích**: sinh 3 mẫu email, viết lại theo tông, chỉnh từng đoạn theo yêu cầu, và gợi ý thời điểm gửi theo ngành.
- **Chống bịa thông tin**: lời nhắc hệ thống yêu cầu AI chỉ dùng thông tin trong phần ưu đãi người dùng nhập, không tự thêm giá, phần trăm, ngày hết hạn hay chính sách.
- **Bảo mật khóa API**: khóa chỉ nằm ở biến môi trường phía server, không có trong mã phía client và không được commit (`.env` nằm trong `.gitignore`).

Biến môi trường (xem `.env.example`):

```env
AI_MODEL=minimax/minimax-m3.1-flash
AI_GATEWAY_API_KEY=<khóa Vercel AI Gateway của bạn>
```

Khi triển khai trên Vercel có thể dùng OIDC thay cho `AI_GATEWAY_API_KEY`. Nếu thiếu khóa, API trả HTTP 500 kèm thông báo thiếu cấu hình và không gọi AI.

## 5. Cài đặt và chạy local

Yêu cầu: Node.js (phiên bản tương thích Next.js 16) và một khóa Vercel AI Gateway.

```bash
npm install
cp .env.example .env     # rồi điền AI_GATEWAY_API_KEY
npm run dev              # chạy dev, mặc định http://localhost:3000
npm run build            # build production
npm start                # chạy bản build
npm run lint
```

Mỗi lần tạo 3 mẫu mất khoảng 25–35 giây khi gọi API, nên cần chờ sau khi bấm tạo.

## 6. Cấu trúc thư mục

```text
email-campaign-studio/
├── src/
│   ├── app/            # trang chính, layout và các route API (generate, rewrite, edit, send-time, render)
│   ├── components/     # Studio, CampaignForm, Inbox, ReadingPane, SendTimePanel, BlockBar...
│   ├── emails/         # CampaignEmail.tsx: mẫu React Email dựng HTML
│   └── lib/            # ai.ts (model, lỗi, lời nhắc), schema.ts (zod), api.ts, edit-actions.ts
├── public/             # tài nguyên tĩnh
├── .env.example        # mẫu biến môi trường
├── KIEM-THU.md         # bảng kiểm thử đầy đủ
├── PRODUCT.md, DESIGN.md
└── README.md
```

## 7. Truy cập và phân quyền

- Không yêu cầu đăng nhập và không có màn hình quản trị.
- Không có dữ liệu người dùng được lưu, nên không có danh sách bản ghi để xem hay xoá.

## 8. Giới hạn hiện tại

- Không lưu lịch sử: tải lại trang là mất các mẫu đã tạo.
- Không gửi email thật, không quản lý danh sách khách hàng.
- Gợi ý thời điểm gửi là suy luận của AI, không dựa trên số liệu đo.
- Thời gian phản hồi của AI khoảng 25–35 giây cho mỗi lần tạo 3 mẫu.
- Không có xác thực, nên các route API không được bảo vệ khỏi người gọi bên ngoài khi triển khai công khai.

## 9. Nguồn tham khảo

- Google Fonts (Be Vietnam Pro, Barlow Condensed)
- Tài liệu Next.js, Vercel AI SDK và React Email

## 10. Minh chứng dùng AI để xây dựng sản phẩm

- Minh chứng: https://drive.google.com/file/d/1mQPYiJfou-HcwEf_r3C-etByedVN9RE0/view?usp=sharing
- Công cụ AI: Claude Code (Anthropic).
- Một vòng thử và cải thiện tiêu biểu (08/11/2026): trên giả lập điện thoại 390×780, khung xem trước email đè lên thanh "Viết lại theo tông" 53px. AI đo vị trí, tìm ra vùng giữa không có thanh cuộn nên tràn xuống, rồi thêm `overflow-y-auto` ở `ReadingPane.tsx`. Đo lại ở 390×780 và 360×640 thì đáy khung email nằm trên đỉnh thanh sửa (607 < 633 và 467 < 527).
- Bốn đoạn còn lại: gỡ ô "Tông viết" lệch đề khỏi form; chặn `javascript:` trong link CTA và che lỗi gateway (sau đó ô link CTA được gỡ hẳn); gỡ trường preheader do AI tự thêm ngoài đề; sửa lỗi khung email tự cuộn lên đầu khi thêm khối.

## 11. Bảng kiểm thử

Chạy ngày 08/11/2026 trên `next dev`, gọi API bằng `curl` và thao tác giao diện, AI thật qua Vercel AI Gateway, model `minimax/minimax-m3.1-flash`. Bản đầy đủ nằm trong [KIEM-THU.md](KIEM-THU.md). Dưới đây là các ca tiêu biểu.

| Mã ca | Loại ca | Dữ liệu và bước thử | Kỳ vọng | Kết quả thực tế | Đạt/Chưa đạt |
|---|---|---|---|---|---|
| TC01 | Bình thường | `POST /api/generate`: mục tiêu Khuyến mãi, thương hiệu "Cà phê Nhà Lá", ngành để trống, ưu đãi giảm 20% đá xay từ 10/11 đến 15/11 | HTTP 200, đủ 3 mẫu, tiếng Việt, không bịa số liệu | HTTP 200 sau 33,5 giây; mẫu 1 chỉ dùng 20%, 10/11–15/11, tại cửa hàng | Đạt |
| TC02 | Bình thường | Thương hiệu "Aurora Fit", ngành "Thiết bị thể thao", ưu đãi bằng tiếng Anh | 3 mẫu, viết bằng tiếng Anh | HTTP 200 sau 26,2 giây, nội dung tiếng Anh, CTA "Pre-order now" | Đạt |
| TC03 | Đầu vào không hợp lệ | Thương hiệu chỉ gồm khoảng trắng | Bị chặn, không gọi AI | HTTP 400, `brand: Nhập tên thương hiệu` | Đạt |
| TC04 | Đầu vào không hợp lệ | `/api/render` với `brandColor` = `#fff;background:url(x)` | Bị chặn | HTTP 400, `Màu thương hiệu phải có dạng #RRGGBB` | Đạt |
| TC07 | Biên | Ưu đãi dài đúng 1000 ký tự | Chấp nhận, vẫn ra 3 mẫu | HTTP 200 sau 31,7 giây, 3 mẫu | Đạt |
| TC05 | Biên | Ưu đãi dài 1001 ký tự | Bị chặn | HTTP 400, `Nội dung ưu đãi tối đa 1000 ký tự` | Đạt |
| TC08 | Sự cố | Gửi nội dung không phải JSON | HTTP 400 | HTTP 400, `Dữ liệu gửi lên không phải JSON hợp lệ` | Đạt |
| TC10 | Sự cố | Chạy server khi `AI_GATEWAY_API_KEY` để trống | HTTP 500, `code: config`, không gọi AI | HTTP 500, `Thiếu AI_GATEWAY_API_KEY`, không gọi AI | Đạt |
| TC11 | Bình thường | `/api/render` với email có `<script>` và `<b>` | Ký tự đặc biệt bị escape | `<script>` thành `&lt;script&gt;`, có CTA và màu thương hiệu | Đạt |
| TC15 | Giao diện | Điền form, tạo 3 mẫu, Copy nội dung, Copy HTML, đổi tông Hài hước, Hoàn tác, chuyển mẫu B | Mọi bước chạy, không lỗi console | Đạt, 19 giây; clipboard nhận 679 ký tự (văn bản) và 4852 ký tự (HTML) | Đạt |

## 12. Hồ sơ bàn giao

- Source ZIP chứa mã nguồn và README này; chỉ kèm `.env.example`, không kèm khóa.
- Video demo tối đa 2 phút: https://drive.google.com/file/d/1F--0VLwfEWDdjvrKFBuQIgg7rIn34wXe/view?usp=sharing
- Minh chứng dùng AI và bảng kiểm thử: xem mục 1.
- Tài khoản/dữ liệu demo: không cần tài khoản. Dữ liệu thử có thể lấy từ TC01 (Cà phê Nhà Lá).
- Bản nộp trước hạn là căn cứ chấm; không sửa tính năng sau hạn nộp.
