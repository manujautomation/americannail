import { Resend } from "resend";

const FROM = "American Nails & Spa <notifications@americannailsspa.com>";
const OWNER = process.env.CONTACT_EMAIL ?? "manuj.automation.ssn@gmail.com";

export async function sendPurchaseOrderEmail(po: {
  reference: string;
  supplier_name: string;
  notes: string;
  total: number;
  lines: { name: string; qty: number; unit_price: number }[];
}) {
  if (!process.env.RESEND_API_KEY) return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const rows = po.lines.map((l) =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e8e8">${l.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e8e8;text-align:center">${l.qty}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e8e8;text-align:right">$${l.unit_price.toFixed(2)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e8e8;text-align:right">$${(l.qty * l.unit_price).toFixed(2)}</td>
    </tr>`
  ).join("");
  await resend.emails.send({
    from: FROM,
    to: OWNER,
    subject: `🛒 New Purchase Order ${po.reference} — $${po.total.toFixed(2)}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1C1C1C">
        <div style="background:linear-gradient(135deg,#B76E79,#C9A96E);padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;color:#fff;font-size:20px;font-weight:600">Purchase Order Created</h1>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:14px">${po.reference}</p>
        </div>
        <div style="background:#fff;padding:24px 32px;border:1px solid #f0e8e8;border-top:none">
          <div style="display:flex;gap:32px;margin-bottom:20px">
            <div><p style="margin:0;font-size:11px;color:#8C7B7B;text-transform:uppercase;letter-spacing:0.1em">Supplier / Ordered By</p><p style="margin:4px 0 0;font-weight:600">${po.supplier_name}</p></div>
            ${po.notes ? `<div><p style="margin:0;font-size:11px;color:#8C7B7B;text-transform:uppercase;letter-spacing:0.1em">Notes</p><p style="margin:4px 0 0">${po.notes}</p></div>` : ""}
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <thead>
              <tr style="background:#f8f3f2">
                <th style="padding:8px 12px;text-align:left;font-size:11px;color:#8C7B7B;font-weight:500;text-transform:uppercase">Item</th>
                <th style="padding:8px 12px;text-align:center;font-size:11px;color:#8C7B7B;font-weight:500;text-transform:uppercase">Qty</th>
                <th style="padding:8px 12px;text-align:right;font-size:11px;color:#8C7B7B;font-weight:500;text-transform:uppercase">Unit Price</th>
                <th style="padding:8px 12px;text-align:right;font-size:11px;color:#8C7B7B;font-weight:500;text-transform:uppercase">Subtotal</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding:12px;text-align:right;font-weight:600;font-size:15px">Total</td>
                <td style="padding:12px;text-align:right;font-weight:700;font-size:16px;color:#B76E79">$${po.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          <div style="margin-top:24px">
            <a href="https://americannail.vercel.app/en/admin" style="display:inline-block;padding:10px 24px;background:#B76E79;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500">View in Admin → Inventory</a>
          </div>
          <p style="margin-top:16px;font-size:12px;color:#8C7B7B">Contact your supplier to arrange delivery. Once received, mark the order as received in admin to update stock quantities automatically.</p>
        </div>
      </div>`,
  });
}

export async function sendLowStockAlert(items: { name: string; category: string; current_qty: number; min_qty: number }[]) {
  if (!process.env.RESEND_API_KEY) return; // silently skip if not configured
  const resend = new Resend(process.env.RESEND_API_KEY);
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
