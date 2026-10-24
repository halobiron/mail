# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Nhân viên marketing trong doanh nghiệp. Họ chạy nhiều chiến dịch email, cần có 3 bản nháp dùng được nhanh, so sánh và chỉnh giữa các phiên bản, rồi đem đi dùng. Bối cảnh: ngồi làm việc trên máy tính, lặp lại nhiều lần trong ngày.

## Product Purpose

Soạn email chiến dịch tự động: nhập mục tiêu, thương hiệu, ngành hàng, ưu đãi, nhận 3 mẫu email (tiêu đề, nội dung, nút CTA), xem trước như trong hộp thư thật, copy từng mẫu, viết lại theo tông khác, và nhận gợi ý thời điểm gửi theo ngành. Thành công là người dùng có một mẫu chọn được và copy đi trong vài phút, không phải đọc hướng dẫn.

## Capabilities and Constraints

- Mục tiêu chiến dịch: ra mắt sản phẩm, khuyến mãi, chăm sóc khách hàng. Tông viết lại: trang trọng, hài hước, khẩn cấp.
- Bản nháp lưu bằng localStorage. Không có cơ sở dữ liệu, danh sách khách hàng hay gửi email.
- AI chạy qua Vercel AI Gateway, model lấy từ biến môi trường, chưa chốt model.
- Giao diện tiếng Việt. Người dùng không đặt thêm ràng buộc về thiết bị hay chế độ sáng/tối.
- Gợi ý thời điểm gửi là suy luận của AI, không phải số liệu đo; phải nói rõ điều đó.

## Brand Commitments

Chưa có logo, bảng màu hay giọng thương hiệu cho chính công cụ. Màu thương hiệu trong email là do người dùng nhập theo từng chiến dịch.

## Evidence on Hand

Không có người dùng thật, số liệu hay phản hồi. Chỉ có phản hồi của chủ dự án về giao diện cũ (xem dưới).

## Product Principles

- Một màn hình làm việc: thấy form, kết quả và xem trước cùng lúc, không phải cuộn dọc dài để tìm kết quả.
- Bám đề bài: form nhập có 3 trường bắt buộc theo đề (mục tiêu, thương hiệu, ưu đãi) và một ô ngành hàng không bắt buộc, bỏ trống thì AI suy ngành từ ưu đãi; tông viết là nút "Viết lại theo tông khác" sau khi đã có 3 mẫu, không phải ô trong form.
- Hành động chính (copy, viết lại, lưu nháp) phải nổi bật và tên gọi rõ nghĩa.
- Xem trước phải giống hộp thư thật; không bịa dữ liệu hay số liệu.

## Feedback on the incumbent UI (evidence, not direction)

Bố cục rối và không rõ bước nào trước; xem trước chưa giống hộp thư thật; nút nhỏ, khó hiểu; màu sắc và chữ nhạt, không có cá tính; bố cục trải dài, phải cuộn mới thấy kết quả; còn các lỗi khác chưa liệt kê.
