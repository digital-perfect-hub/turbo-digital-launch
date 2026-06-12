import "@supabase/functions-js/edge-runtime.d.ts";

type LeadRecord = {
  id?: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  service?: string;
  budget?: string;
  website?: string;
  description?: string;
  created_at?: string;
};

type WebhookPayload = {
  type?: string;
  table?: string;
  schema?: string;
  record?: LeadRecord;
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const clean = (value: unknown, fallback = "—") => {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : fallback;
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const expectedSecret = Deno.env.get("CONTACT_WEBHOOK_SECRET");
  const receivedSecret = req.headers.get("x-webhook-secret");

  if (!expectedSecret || receivedSecret !== expectedSecret) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const toEmail = Deno.env.get("CONTACT_TO_EMAIL") || "hello@digital-perfect.com";
  const fromEmail =
    Deno.env.get("CONTACT_FROM_EMAIL") ||
    "Digital-Perfect <hello@digital-perfect.com>";

  if (!resendApiKey) {
    return jsonResponse({ error: "Missing RESEND_API_KEY" }, 500);
  }

  let payload: WebhookPayload;

  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON payload" }, 400);
  }

  if (payload.type !== "INSERT" || payload.table !== "leads") {
    return jsonResponse({ ok: true, skipped: true });
  }

  const lead = payload.record;

  if (!lead) {
    return jsonResponse({ error: "Missing lead record" }, 400);
  }

  const name = clean(lead.name);
  const company = clean(lead.company);
  const email = clean(lead.email);
  const phone = clean(lead.phone);
  const service = clean(lead.service);
  const budget = clean(lead.budget);
  const website = clean(lead.website);
  const description = clean(lead.description);
  const createdAt = lead.created_at
    ? new Date(lead.created_at).toLocaleString("de-AT", {
        timeZone: "Europe/Vienna",
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

  const subject = `Neue Anfrage über Digital-Perfect: ${name}`;

  const text = [
    "Neue Anfrage über digital-perfect.com",
    "",
    `Name: ${name}`,
    `Unternehmen: ${company}`,
    `E-Mail: ${email}`,
    `Telefon: ${phone}`,
    `Gewünschtes Paket: ${service}`,
    `Budget: ${budget}`,
    `Website: ${website}`,
    "",
    "Projektbeschreibung:",
    description,
    "",
    `Zeitpunkt: ${createdAt}`,
    lead.id ? `Lead-ID: ${lead.id}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;background:#f6f7fb;padding:28px;color:#08111f;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden;">
        <div style="background:#0a1842;color:#ffffff;padding:24px 28px;">
          <div style="font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#ff6b2c;font-weight:800;">
            Neue Anfrage
          </div>
          <h1 style="margin:8px 0 0;font-size:26px;line-height:1.25;">
            Digital-Perfect Kontaktformular
          </h1>
        </div>

        <div style="padding:28px;">
          <table style="width:100%;border-collapse:collapse;font-size:15px;">
            <tr><td style="padding:10px 0;color:#64748b;">Name</td><td style="padding:10px 0;font-weight:700;">${escapeHtml(name)}</td></tr>
            <tr><td style="padding:10px 0;color:#64748b;">Unternehmen</td><td style="padding:10px 0;font-weight:700;">${escapeHtml(company)}</td></tr>
            <tr><td style="padding:10px 0;color:#64748b;">E-Mail</td><td style="padding:10px 0;font-weight:700;">${escapeHtml(email)}</td></tr>
            <tr><td style="padding:10px 0;color:#64748b;">Telefon</td><td style="padding:10px 0;font-weight:700;">${escapeHtml(phone)}</td></tr>
            <tr><td style="padding:10px 0;color:#64748b;">Paket</td><td style="padding:10px 0;font-weight:700;">${escapeHtml(service)}</td></tr>
            <tr><td style="padding:10px 0;color:#64748b;">Budget</td><td style="padding:10px 0;font-weight:700;">${escapeHtml(budget)}</td></tr>
            <tr><td style="padding:10px 0;color:#64748b;">Website</td><td style="padding:10px 0;font-weight:700;">${escapeHtml(website)}</td></tr>
            <tr><td style="padding:10px 0;color:#64748b;">Zeitpunkt</td><td style="padding:10px 0;font-weight:700;">${escapeHtml(createdAt)}</td></tr>
          </table>

          <div style="margin-top:24px;padding:20px;border-radius:16px;background:#f8fafc;border:1px solid #e2e8f0;">
            <div style="font-size:13px;text-transform:uppercase;letter-spacing:.12em;color:#ff6b2c;font-weight:800;margin-bottom:10px;">
              Projektbeschreibung
            </div>
            <div style="white-space:pre-line;line-height:1.65;font-size:15px;">
              ${escapeHtml(description)}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const resendBody: Record<string, unknown> = {
    from: fromEmail,
    to: [toEmail],
    subject,
    html,
    text,
  };

  if (lead.email && String(lead.email).includes("@")) {
    resendBody.reply_to = String(lead.email).trim();
  }

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(resendBody),
  });

  const resendResult = await resendResponse.json().catch(() => null);

  if (!resendResponse.ok) {
    console.error("Resend error", resendResult);
    return jsonResponse(
      {
        error: "Resend send failed",
        details: resendResult,
      },
      500,
    );
  }

  return jsonResponse({
    ok: true,
    resend: resendResult,
  });
});