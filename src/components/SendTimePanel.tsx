import type { SendTime } from "@/lib/schema";

const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const DAY_NAMES = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ nhật"];
const hh = (h: number) => `${String(h).padStart(2, "0")}:00`;

/** Bảng lịch tuần x giờ; các khung AI gợi ý được bật sáng vàng. */
export default function SendTimePanel({
  sendTime,
  error,
}: {
  sendTime: SendTime | null;
  error: string | null;
}) {
  const slots = sendTime?.slots ?? [];
  // Mỗi hàng một giờ, ghi giờ ở mọi hàng; chỉ lấy khoảng giờ có khung gợi ý, chừa một giờ đệm mỗi đầu.
  const from = Math.max(0, Math.min(...slots.map((s) => s.startHour)) - 1);
  const to = Math.min(24, Math.max(...slots.map((s) => s.endHour)) + 1);
  const hours = Array.from({ length: to - from }, (_, i) => from + i);

  return (
    <section aria-labelledby="send-time-title" className="bg-paper">
      <h2 id="send-time-title" className="flex h-12 items-center border-b border-rule bg-sheet px-4 font-channel text-base font-bold tracking-wide">
        Giờ gửi gợi ý{sendTime ? ` · ${sendTime.industry}` : ""}
      </h2>
      {error ? (
        <p role="alert" className="p-4 text-sm text-danger">
          Không lấy được gợi ý giờ gửi: {error}
        </p>
      ) : !sendTime ? (
        <p className="p-4 text-sm text-ink-soft">Đang phân tích giờ gửi cho ngành này…</p>
      ) : (
        <div className="space-y-3 p-4">
          <ul aria-label="Giả định" className="flex flex-wrap gap-1.5 text-xs font-semibold">
            <li className="bg-ink px-2 py-0.5 text-paper">Giả định</li>
            <li className="border border-rule px-2 py-0.5">🕐 {sendTime.timezone}</li>
            <li className="border border-rule px-2 py-0.5">🧪 Cần A/B test</li>
            <li className="border border-rule px-2 py-0.5">🤖 AI suy luận, không phải số đo</li>
          </ul>
          <div
            role="img"
            aria-label={`Lịch tuần, khung giờ gợi ý: ${slots
              .map((s) => `${DAY_NAMES[s.dayOfWeek - 1]} ${hh(s.startHour)} đến ${hh(s.endHour)}`)
              .join("; ")}`}
            className="grid gap-px border border-rule bg-rule"
            style={{ gridTemplateColumns: "36px repeat(7, 1fr)" }}
          >
            <div className="bg-sheet" />
            {DAYS.map((d) => (
              <div key={d} className="bg-sheet py-0.5 text-center text-xs font-semibold">
                {d}
              </div>
            ))}
            {hours.map((h) => (
              <Row key={h} hour={h} slots={slots} />
            ))}
          </div>

          <ul className="space-y-2 text-sm">
            {slots.map((s, i) => (
              <li key={i} className="grid grid-cols-[12px_1fr] items-start gap-2">
                <span className="mt-1.5 h-3 w-3 bg-onair" aria-hidden />
                <span>
                  <span className="font-semibold">
                    {DAY_NAMES[s.dayOfWeek - 1]}, {hh(s.startHour)}–{hh(s.endHour)}
                  </span>
                  <span className="text-ink-soft"> · {s.reason}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Row({ hour, slots }: { hour: number; slots: SendTime["slots"] }) {
  return (
    <>
      <div className="bg-paper pr-1 text-right font-channel text-xs font-semibold leading-[14px] text-ink-soft">{hour}h</div>
      {DAYS.map((_, d) => {
        const on = slots.some((s) => s.dayOfWeek === d + 1 && hour >= s.startHour && hour < s.endHour);
        return <div key={d} className={`h-3.5 ${on ? "bg-onair" : "bg-paper"}`} />;
      })}
    </>
  );
}
