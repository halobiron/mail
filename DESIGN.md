---
name: Email Campaign Studio
description: Ba mẫu email là ba kênh A/B/C trên một bảng lịch phát sóng; giờ gửi gợi ý là các ô vàng bật sáng.
colors:
  shell: "#101b3d"
  sheet: "#eef1f7"
  paper: "#ffffff"
  ink: "#101b3d"
  ink-soft: "#4a5578"
  rule: "#cbd2e1"
  rule-strong: "#aeb8cd"
  onair: "#ffd23f"
  onair-soft: "#fff6cc"
  focus: "#2b50e8"
  danger: "#b4232f"
  danger-wash: "#fdecee"
  channel-a: "#2b50e8"
  channel-b: "#c41e68"
  channel-c: "#0b8a5f"
  shell-hover: "#1c2c5e"
typography:
  channel-title:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    letterSpacing: "0.025em"
  panel-title:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    letterSpacing: "0.025em"
  channel-letter:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "20px"
    fontWeight: 700
  body:
    fontFamily: "Be Vietnam Pro, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
  subject:
    fontFamily: "Be Vietnam Pro, Segoe UI, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.375
  label:
    fontFamily: "Be Vietnam Pro, Segoe UI, sans-serif"
    fontSize: "12px"
    fontWeight: 600
rounded:
  none: "0px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
components:
  button-primary:
    backgroundColor: "{colors.shell}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    height: "36px"
    padding: "0 16px"
  button-primary-hover:
    backgroundColor: "{colors.shell-hover}"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.shell}"
    rounded: "{rounded.none}"
    height: "36px"
    padding: "0 16px"
  button-outline-hover:
    backgroundColor: "{colors.onair-soft}"
  button-submit:
    backgroundColor: "{colors.onair}"
    textColor: "{colors.shell}"
    rounded: "{rounded.none}"
    height: "44px"
  input-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
  segment-selected:
    backgroundColor: "{colors.shell}"
    textColor: "{colors.paper}"
  channel-badge:
    textColor: "{colors.paper}"
    typography: "{typography.channel-letter}"
    rounded: "{rounded.none}"
    size: "34px"
  inbox-row-active:
    backgroundColor: "{colors.onair-soft}"
  panel-header:
    backgroundColor: "{colors.sheet}"
    typography: "{typography.panel-title}"
    padding: "8px 16px"
---

# Design System: Email Campaign Studio

## Overview

**Creative North Star: "Lịch phát sóng" (The Broadcast Schedule)**

Công cụ này trông như một bảng lịch phát sóng truyền hình: vỏ navy đậm, nền lịch xanh xám nhạt, mọi vùng chia nhau bằng kẻ mảnh 1px. Ba mẫu email là ba kênh A/B/C, mỗi kênh có một ô chữ cái Barlow Condensed đậm; giờ gửi gợi ý là các ô giờ vàng "đang phát". Không có thẻ bo tròn, không có đổ bóng trang trí: cấu trúc đến từ đường kẻ và khối phẳng.

Mật độ cao nhưng yên. Ba cột cố định (form 300px, hộp thư 380px, khung đọc phần còn lại) nằm trong một viewport không cuộn cả trang; mỗi cột tự cuộn bên trong. Giao diện là công cụ vận hành cho nhân viên marketing làm nhiều chiến dịch, nên chữ nhỏ (14px nền), nhãn rõ, trạng thái chọn nhìn thấy ngay.

Màu có ngữ nghĩa hẹp: vàng chỉ nghĩa là "đang chọn / giờ gửi / hành động chính của form"; màu kênh chỉ để phân biệt mẫu A/B/C.

**Key Characteristics:**
- Vỏ navy + nền lịch + kẻ mảnh, góc vuông tuyệt đối (0px).
- Hai họ chữ: Be Vietnam Pro cho UI, Barlow Condensed đậm cho tiêu đề panel, nhãn kênh và số giờ.
- Phẳng: chiều sâu bằng tông nền (sheet/paper) và đường kẻ, không bóng cho thành phần cố định.
- Một hiệu ứng chuyển động duy nhất (`air-in`) khi ba mẫu về.
- Ba cột ở lg trở lên; dưới lg là một khu vực một lần, chuyển bằng thanh tab dưới đáy.

## Colors

Palette chính là navy và giấy lịch, với hai nhóm nhấn có nghĩa hẹp: vàng "on-air" và ba màu kênh.

### Primary
- **Navy Phát Sóng** (#101b3d, `shell` / `ink`): vỏ ứng dụng (header 48px), nút chính, mục chọn trong nhóm phân đoạn, tab đang mở, và cũng là màu chữ chính. Hover nút chính là navy sáng hơn (#1c2c5e).

### Secondary
- **Vàng On-Air** (#ffd23f, `onair`): nút gửi "Viết 3 mẫu email", tông đang chọn ở thanh viết lại, các ô giờ gửi gợi ý, chấm chú thích giờ, và nền vùng bôi chọn chữ.
- **Vàng Nhạt** (#fff6cc, `onair-soft`): hover của dòng/nút, dòng thư đang chọn.

### Tertiary (màu kênh, chỉ phân biệt mẫu)
- **Kênh A Cobalt** (#2b50e8, `channel-a`)
- **Kênh B Magenta** (#c41e68, `channel-b`)
- **Kênh C Lục** (#0b8a5f, `channel-c`)

### Neutral
- **Nền Lịch** (#eef1f7, `sheet`): nền trang, cột hộp thư, tiêu đề panel, vùng xem trước.
- **Giấy** (#ffffff, `paper`): cột form, dòng thư, bảng giờ, khung email, ô nhập.
- **Chữ Phụ** (#4a5578, `ink-soft`): mô tả, placeholder, trạng thái trống.
- **Kẻ Mảnh** (#cbd2e1, `rule`): đường chia panel và dòng.
- **Kẻ Đậm** (#aeb8cd, `rule-strong`): viền ô nhập, nhóm phân đoạn, thanh cuộn.
- **Focus Cobalt** (#2b50e8, `focus`): vòng focus 2px, offset 2px (cùng giá trị với kênh A).
- **Đỏ Lỗi** (#b4232f, `danger`) trên nền #fdecee: thông báo lỗi, nút Xoá.

### Named Rules
**The Reserved Yellow Rule.** Vàng chỉ nói "đang chọn" hoặc "giờ gửi" (và nút gửi chính của form). Không dùng vàng làm trang trí hay làm nền khối.

**The Channel Means Sample Rule.** Cobalt/magenta/lục chỉ xuất hiện trên ô chữ cái A/B/C. Không dùng chúng cho trạng thái, liên kết hay nhấn mạnh.

## Typography

**Display Font:** Barlow Condensed 600/700 (fallback Arial Narrow, sans-serif), biến `--font-channel`
**Body Font:** Be Vietnam Pro 400/500/600 (fallback Segoe UI, sans-serif), biến `--font-ui`, subset latin + vietnamese

**Character:** Chữ condensed đậm của bảng giờ phát sóng cho tiêu đề, chữ cái kênh và số giờ; chữ sans hỗ trợ tiếng Việt đầy đủ dấu cho mọi nội dung đọc.

### Hierarchy
- **Channel Title** (700, 20px ở sm+, 16px trên mobile, tracking 0.025em): tên ứng dụng ở header, chữ hoa.
- **Panel Title** (700, 16px, tracking 0.025em): tiêu đề mỗi panel trên nền sheet ("Chiến dịch", "Hộp thư · 3 kênh", "Giờ gửi gợi ý · ngành").
- **Channel Letter** (700, 20px): chữ A/B/C trong ô 34px (36px trong khung đọc); số giờ trong bảng ở 12px/600.
- **Subject** (Be Vietnam Pro 600, 18px, line-height 1.375): tiêu đề email trong khung đọc.
- **Body** (400, 14px, line-height 1.45): nội dung chung; tiêu đề dòng thư 14px/600; phụ đề dòng thư 12px ink-soft.
- **Label** (600, 12px): nhãn trường form, nút phân đoạn (12px/500), ngày trong bảng giờ.

### Named Rules
**The Condensed For Signage Rule.** Barlow Condensed chỉ dành cho tiêu đề panel, chữ cái kênh và số giờ. Mọi thứ đọc liền mạch dùng Be Vietnam Pro.

## Layout

Khung là lưới `h-dvh` với hàng header 48px và vùng làm việc chiếm phần còn lại. Từ lg: ba cột `300px | 380px | 1fr`, ngăn nhau bằng kẻ mảnh; cột giữa xếp hộp thư rồi bảng giờ gửi và tự cuộn. Khung đọc: thanh công cụ (copy, viết lại theo tông) phía trên, xem trước email trong khung giấy rộng tối đa 680px trên nền sheet.

Dưới lg chỉ một khu vực hiện cùng lúc (Chiến dịch / Hộp thư / Email), chuyển bằng thanh tab 3 cột cao 48px cố định dưới đáy. Nhịp khoảng cách theo bậc 4px: 8 (tiêu đề panel dọc, gap nút), 12 (gap dòng thư), 16 (padding panel, dòng), 20 (padding form). Trang không cuộn dọc; chỉ các panel bên trong cuộn, thanh cuộn mảnh (`.scroll`).

## Elevation & Depth

Phẳng theo mặc định. Chiều sâu đến từ hai tông nền (sheet cho khung và tiêu đề panel, paper cho nội dung) cùng đường kẻ 1px. Hầu như không có bóng đổ; nếu cần lớp nổi tạm thời thì dùng `shadow-lg` mặc định của Tailwind.

### Named Rules
**The Rule-Not-Shadow Rule.** Phân tách vùng bằng đường kẻ `rule`, không bằng bóng. Bóng chỉ cho lớp nổi tạm thời.

## Shapes

Góc vuông hoàn toàn: không có border-radius ở bất kỳ thành phần nào (0px). Viền 1px `rule` hoặc `rule-strong`. Nhóm phân đoạn là một khung viền với các ô chia bởi kẻ dọc. Ô kênh A/B/C và ô giờ là khối vuông đặc. Ô vàng trong bảng giờ lấp đầy hết ô lưới, các ô cách nhau 1px do khe lưới hiện nền `rule`.

## Components

### Buttons
- **Shape:** vuông, cao 36px, padding ngang 16px, chữ 14px/600.
- **Primary (navy):** nền #101b3d, chữ trắng, hover #1c2c5e. Dùng cho "Copy nội dung".
- **Outline:** nền trắng, viền và chữ navy, hover nền vàng nhạt. Dùng cho "Copy HTML".
- **Submit:** cao 44px, nền vàng, chữ navy, hover `brightness-95`, đang tải mờ 60%. Chỉ một nút này trên màn hình.
- **Disabled:** mờ 50% và con trỏ not-allowed.

### Segmented Choice (mục tiêu)
Khung viền `rule-strong`, các ô chia đều. Chọn: nền navy, chữ trắng. Chưa chọn: nền trắng, hover vàng nhạt. Radio ẩn bằng `sr-only`, focus hiện vòng 2px bên trong ô.

### Inputs / Fields
Viền 1px `rule-strong`, nền trắng, padding 8px 12px, chữ 14px, placeholder ink-soft; focus đổi viền sang navy cộng vòng focus cobalt. Nhãn 12px/600 phía trên. Ô chọn màu thương hiệu là khung vuông 48x36.

### Channel Badge (signature)
Ô vuông 34px (36px trong khung đọc) nền màu kênh, chữ cái Barlow Condensed 20px/700 màu trắng. Khi chưa có kết quả, ô ở độ mờ 25% (40% khi đang viết).

### Inbox Row
Lưới `34px | 1fr`, gap 12px, padding 12px 16px, ngăn bằng kẻ `rule`. Ba dòng: tiêu đề (14px/600), thương hiệu · góc tiếp cận, preheader (12px ink-soft), đều cắt một dòng. Đang chọn: nền vàng nhạt; hover: nền sheet. Xuất hiện lần lượt, lệch 70ms, bằng `air-in` (280ms, ease-out, trượt 6px).

### Send-Time Grid
Bảng 7 cột ngày (T2..CN) và các hàng 2 giờ, ô cao 20px, khe 1px nền `rule`. Ô nằm trong khung gợi ý: nền vàng; còn lại trắng. Nhãn giờ Barlow Condensed 12px. Dưới bảng là chú giải: chấm vuông vàng 12px kèm ngày, giờ, lý do.

### Navigation
Mobile: thanh tab 3 cột, cao 48px, đang mở nền navy chữ trắng, còn lại chữ navy hover vàng nhạt. Desktop không có điều hướng (ba cột luôn hiện).

## Do's and Don'ts

### Do:
- **Do** giữ góc vuông (0px) và kẻ 1px `rule` để chia vùng.
- **Do** dùng vàng #ffd23f chỉ cho trạng thái đang chọn, giờ gửi, và nút gửi chính.
- **Do** dùng Barlow Condensed cho tiêu đề panel, chữ cái kênh và số giờ; Be Vietnam Pro cho mọi nội dung còn lại.
- **Do** giữ viewport không cuộn dọc cả trang; để từng panel tự cuộn.
- **Do** giữ vòng focus 2px #2b50e8, offset 2px trên mọi điều khiển.
- **Do** tắt `air-in` khi `prefers-reduced-motion: reduce`.

### Don't:
- **Don't** dùng màu kênh (cobalt, magenta, lục) cho thứ gì ngoài ô A/B/C.
- **Don't** bo góc hoặc làm thẻ SaaS đồng dạng; bố cục là bảng lịch, không phải lưới thẻ.
- **Don't** thêm bóng đổ cho thành phần cố định; chỉ lớp nổi tạm thời mới có bóng.
- **Don't** quay lại bố cục trang dài "form rồi kết quả".
- **Don't** thêm chuyển động ngoài `air-in`.
