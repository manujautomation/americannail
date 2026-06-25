import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "American Nails & Spa <notifications@americannailsspa.com>";
const OWNER = process.env.CONTACT_EMAIL ?? "manuj.automation.ssn@gmail.com";

export async function sendLowStockAlert(items: { name: string; category: string; current_qty: number; min_qty: number }[]) {
  if (!process.env.RESEND_API_KEY) return; // silently skip if not configured
  const rows = items.map((i) => `<tr><td style="padding:6px 12px">${i.name}</td><td style="padding:6px 12px">${i.category}</td><td style="padding:6px 12px;color:#ef4444;font-weight:600">${i.current_qty}</td><td style="padding:6px 12px">${i.min_qty}</td></tr>`).join("");
  await resend.emails.send({
    from: FROM,
    to: OWNER,
    subject: `⚠️ Low Stock Alert — ${items.length} item${items.length > 1 ? "s" : ""} need restocking`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#B76E79">Low Stock Alert</h2>
        <p style="color:#555">${items.length} item${items.length > 1 ? "s are" : " is"} at or below the reorder threshold:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead><tr style="background:#f8f3f2">
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#8C7B7B">PRODUCT</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#8C7B7B">CATEGORY</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#8C7B7B">IN STOCK</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#8C7B7B">MIN QTY</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <a href="https://americannail.vercel.app/en/admin" style="display:inline-block;padding:10px 24px;background:#B76E79;color:#fff;border-radius:8px;text-decoration:none;font-size:14px">Go to Admin → Inventory</a>
      </div>`,
  });
}
