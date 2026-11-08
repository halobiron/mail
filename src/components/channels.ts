/** Ba kênh A/B/C: màu chỉ dùng để phân biệt ba mẫu. */
export const CHANNELS = [
  { letter: "A", bg: "bg-ch-a", text: "text-ch-a" },
  { letter: "B", bg: "bg-ch-b", text: "text-ch-b" },
  { letter: "C", bg: "bg-ch-c", text: "text-ch-c" },
] as const;

export const btnBase =
  "inline-flex h-9 items-center whitespace-nowrap justify-center gap-2 px-4 text-sm font-semibold transition-colors disabled:opacity-50";
export const btnPrimary = `${btnBase} bg-shell text-white hover:bg-[#1c2c5e]`;
export const btnOutline = `${btnBase} border border-shell bg-paper text-shell hover:bg-onair-soft`;
