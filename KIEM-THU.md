# Bảng kiểm thử

Chạy ngày 02/11/2026 trên `next dev` (localhost), gọi trực tiếp API bằng `curl`, AI thật qua Vercel AI Gateway, model `minimax/minimax-m3.1-flash`. Kết quả dưới đây là kết quả thực tế của lần chạy đó.

| Mã ca | Loại ca | Dữ liệu và bước thử | Kỳ vọng | Kết quả thực tế | Đạt/Chưa đạt |
|---|---|---|---|---|---|
| TC01 | Bình thường | `POST /api/generate`: mục tiêu Khuyến mãi, thương hiệu "Cà phê Nhà Lá", ngành để trống, ưu đãi "Giảm 20% mọi món đá xay từ 10/11 đến 15/11, áp dụng tại cửa hàng.", màu `#8a4b2a` | HTTP 200, đủ 3 mẫu khác nhau, tiếng Việt, không bịa số liệu ngoài ưu đãi | HTTP 200 sau 33,5 giây. Mẫu 1 (xem được): có tiêu đề, đoạn văn, khung ưu đãi, danh sách, ghi chú, CTA "Ghé cửa hàng dùng ưu đãi"; chỉ dùng 20%, 10/11–15/11, tại cửa hàng. | Đạt |
| TC02 | Bình thường | `POST /api/generate`: mục tiêu Ra mắt sản phẩm, thương hiệu "Aurora Fit", ngành "Thiết bị thể thao", ưu đãi bằng tiếng Anh (thảm yoga thông minh, đặt trước tặng dây đeo) | HTTP 200, 3 mẫu, viết bằng tiếng Anh theo ngôn ngữ của ưu đãi | HTTP 200 sau 26,2 giây, nội dung tiếng Anh, CTA "Pre-order now"; mẫu 1 chỉ nhắc cảm biến tư thế và dây đeo miễn phí. | Đạt |
| TC03 | Đầu vào không hợp lệ | `POST /api/generate` với thương hiệu chỉ gồm khoảng trắng | Bị chặn, không gọi AI | HTTP 400, `brand: Nhập tên thương hiệu` | Đạt |
| TC04 | Đầu vào không hợp lệ | `POST /api/render` với `brandColor` = `#fff;background:url(x)` (chèn CSS vào màu thương hiệu) | Bị chặn, không dựng HTML | HTTP 400, `input.brandColor: Màu thương hiệu phải có dạng #RRGGBB` | Đạt |
| TC05 | Đầu vào không hợp lệ | Ưu đãi dài 1001 ký tự | Bị chặn | HTTP 400, `offer: Nội dung ưu đãi tối đa 1000 ký tự` | Đạt |
| TC06 | Đầu vào không hợp lệ | Mục tiêu `hack`, màu `red` | Bị chặn, nêu rõ trường sai | HTTP 400, `goal: Mục tiêu chiến dịch không hợp lệ; brandColor: Màu thương hiệu phải có dạng #RRGGBB` | Đạt |
| TC07 | Biên | Ưu đãi dài đúng 1000 ký tự | Chấp nhận, vẫn ra 3 mẫu | HTTP 200 sau 31,7 giây, 3 mẫu, 3 kiểu đầu thư khác nhau (banner, plain, center), mỗi mẫu có một CTA | Đạt |
| TC08 | Sự cố | Gửi nội dung không phải JSON (`not json`) tới `/api/generate` | HTTP 400 với thông báo dữ liệu sai | HTTP 400, `Dữ liệu gửi lên không phải JSON hợp lệ` | Đạt |
| TC09 | Bình thường (phụ) | `POST /api/send-time` với dữ liệu của TC01 | Trả 1–3 khung giờ kèm lý do và múi giờ | HTTP 200, 3 khung giờ kèm lý do, múi giờ UTC+7. Chạy 8 lần: 8/8 HTTP 200 (11–22 giây), 24/24 khung giờ không nhắc sai ngày/thứ | Đạt |
| TC10 | Sự cố | Chạy server với `AI_GATEWAY_API_KEY` để trống, gọi `/api/generate` | HTTP 500, `code: config`, thông báo thiếu khóa | Khởi động với `AI_GATEWAY_API_KEY` và `VERCEL_OIDC_TOKEN` để trống: `/api/generate` và `/api/send-time` đều trả HTTP 500, `Thiếu AI_GATEWAY_API_KEY. Xem .env.example.`, `code: config`, không gọi AI | Đạt |
| TC11 | Bình thường | `POST /api/render` với email có `<script>` và `<b>` trong nội dung | HTTP 200, ký tự đặc biệt bị escape, có màu thương hiệu và CTA | HTTP 200 sau 0,2 giây; `<script>` thành `&lt;script&gt;`, không còn thẻ gốc; có CTA và màu `#8a4b2a` | Đạt |
| TC12 | Bình thường | `POST /api/rewrite` tông Khẩn cấp (AI thật) | HTTP 200, giữ nguyên số liệu ưu đãi | HTTP 200 sau 6,5 giây; chỉ dùng 20%, 10/11–15/11 | Đạt |
| TC13 | Bình thường | `POST /api/edit` trường CTA, yêu cầu "tối đa 3 từ" | HTTP 200, trả về văn bản thay thế | HTTP 200 sau 2,3 giây, trả về "Ghé quán" | Đạt |
| TC14 | Đầu vào không hợp lệ | `/api/rewrite` với tông `bad`; `/api/rewrite` không tông và không yêu cầu; `/api/edit` với `text` rỗng | HTTP 400 nêu rõ trường sai | Cả ba trả HTTP 400 với thông báo tiếng Việt | Đạt |
| TC15 | Giao diện (desktop) | Điền form, tạo 3 mẫu, Copy nội dung, Copy HTML, đổi tông Hài hước, Hoàn tác, chuyển mẫu B | Mọi bước chạy, không lỗi console | Đạt cả 3 mẫu sau 19 giây; clipboard nhận 679 ký tự (văn bản) và 4852 ký tự (HTML); nút tông có `aria-pressed`; không lỗi console | Đạt |
| TC16 | Giao diện | Công tắc Desktop/Mobile | Mobile thu khung email còn 375px, vẫn sửa được, quay lại Desktop được | Khung 710px thành 375px rồi trở lại 710px; vùng chữ vẫn `contenteditable` | Đạt |
| TC17 | Giao diện | Avatar trong hộp thư | Hiện chữ cái đầu thương hiệu, màu theo thương hiệu, kèm nhãn mẫu A/B/C | "CL" cho "Cà phê Nhà Lá", nhãn A/B/C ở góc | Đạt |
| TC21 | Giao diện (mobile 390px) | Đọc email sau khi tạo 3 mẫu | Không tràn ngang | `scrollWidth` 390 | Đạt |

## Ghi chú

- Lần chạy bổ sung ngày 08/11/2026 (TC11–TC21): `npm run lint` và `tsc --noEmit` đều không lỗi.
- Đã thử làm nút "Gửi test" (Gmail, .eml, mailto) rồi gỡ bỏ vì trùng chức năng với Copy HTML; các ca TC18–TC20 và TC22 đã bị xóa theo. Ứng dụng không gửi email thật (đề bài yêu cầu né SMTP).
- `npm run build` chạy thành công (Next.js 16.4.2), không lỗi hay cảnh báo.
- Thời gian phản hồi của AI khoảng 25–35 giây cho mỗi lần tạo 3 mẫu qua API (19 giây trong lần chạy qua giao diện).
