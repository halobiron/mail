/** Gợi ý chỉnh sửa nhanh. Lời nhắc gửi cho AI, nhãn hiển thị cho người dùng. */
export const EDIT_ACTIONS = [
  { label: "Ngắn gọn hơn", instruction: "Viết ngắn gọn hơn, giữ ý chính" },
  { label: "Chi tiết hơn", instruction: "Viết chi tiết hơn một chút, vẫn chỉ dùng thông tin đã có" },
  { label: "Thân thiện hơn", instruction: "Viết thân thiện, gần gũi hơn" },
  { label: "Trang trọng hơn", instruction: "Viết trang trọng, lịch sự hơn" },
  { label: "Mạnh mẽ hơn", instruction: "Viết dứt khoát, thuyết phục hơn" },
  { label: "Sửa chính tả", instruction: "Chỉ sửa lỗi chính tả, dấu câu và ngữ pháp, giữ nguyên ý và giọng văn" },
] as const;
