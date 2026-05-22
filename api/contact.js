const { Resend } = require("resend");
const fs = require("fs");
const path = require("path");

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let rawBody = "";

    req.on("data", (chunk) => {
      rawBody += chunk;
    });

    req.on("end", () => {
      if (!rawBody) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(rawBody));
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const serviceLabels = {
  escolta: "Escolta Armada",
  traslado: "Traslado de Valores",
  custodia: "Custodia de Mercancías",
  transporte: "Transporte Ejecutivo",
  otro: "Otro Servicio",
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.statusCode = 405;
    res.end(JSON.stringify({ message: "Método no permitido" }));
    return;
  }

  try {
    const body = await readJsonBody(req);
    const nombre = String(body.nombre || "").trim();
    const email = String(body.email || "").trim();
    const telefono = String(body.telefono || "").trim();
    const servicio = String(body.servicio || "").trim();
    const mensaje = String(body.mensaje || "").trim();
    const website = String(body.website || "").trim();

    if (website) {
      res.statusCode = 200;
      res.end(JSON.stringify({ message: "OK" }));
      return;
    }

    if (!nombre || !email || !telefono || !servicio || !mensaje) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: "Faltan campos obligatorios" }));
      return;
    }

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    const toEmail = process.env.CONTACT_TO_EMAIL;

    if (!apiKey || !fromEmail || !toEmail) {
      res.statusCode = 500;
      res.end(
        JSON.stringify({
          message:
            "Faltan variables de entorno. Configura RESEND_API_KEY, RESEND_FROM_EMAIL y CONTACT_TO_EMAIL.",
        }),
      );
      return;
    }

    const resend = new Resend(apiKey);
    const serviceLabel = serviceLabels[servicio] || servicio;

    const subject = `Nuevo contacto Tauro Corporativo: ${nombre}`;
    // Preparar attachments: preferimos adjuntar el logo como inline CID leyendo el archivo
    const attachments = [];
    const publicLogoUrlBase =
      process.env.SITE_PUBLIC_URL || "https://seguridad-tauro.vercel.app";
    const publicLogoUrl = `${publicLogoUrlBase.replace(/\/$/, "")}/assets/recursos/LogoTauro.png`;

    // Intentar leer el fichero del logo para adjuntarlo inline (CID)
    try {
      const logoPath = path.join(
        __dirname,
        "..",
        "src",
        "assets",
        "recursos",
        "LogoTauro.png",
      );
      if (fs.existsSync(logoPath)) {
        const buf = fs.readFileSync(logoPath);
        const cid = "logo@tauro";
        attachments.push({
          filename: "LogoTauro.png",
          type: "image/png",
          content: buf.toString("base64"),
          disposition: "inline",
          cid,
        });
        // Referenciar por CID en el HTML
        var logoSrc = `cid:${cid}`;
      } else {
        var logoSrc = publicLogoUrl;
      }
    } catch (err) {
      console.warn(
        "No se pudo leer LogoTauro.png para adjuntar como CID:",
        err && err.message ? err.message : err,
      );
      var logoSrc = publicLogoUrl;
    }

    const html = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial; background:#f6f7fb; margin:0; padding:20px; }
          .card { max-width:700px; margin:0 auto; background:#ffffff; border-radius:8px; box-shadow:0 2px 6px rgba(16,24,40,.08); overflow:hidden }
          .header { padding:20px; text-align:center; background: #0c0b09; }
          .header img { max-height:56px; }
          .content { padding:24px; color:#0b1220; }
          .row { display:flex; gap:12px; margin-bottom:10px; }
          .label { width:150px; color:#6b7280; font-size:14px; }
          .value { flex:1; font-weight:600; color:#111827 }
          .message { margin-top:12px; white-space:pre-wrap; color:#374151 }
          .footer { padding:16px 24px; font-size:13px; color:#6b7280; background:#f9fafb; text-align:center }
        </style>
      </head>
      <body>
        <div class="card">
            <div class="header">
            <img src="${logoSrc}" alt="Tauro Corporativo" />
          </div>
          <div class="content">
            <h2 style="margin:0 0 12px 0;font-weight:700;font-size:18px;color:#0b1220;">Nuevo mensaje desde el sitio web</h2>
            <div class="row"><div class="label">Nombre:</div><div class="value">${escapeHtml(nombre)}</div></div>
            <div class="row"><div class="label">Email:</div><div class="value">${escapeHtml(email)}</div></div>
            <div class="row"><div class="label">Teléfono:</div><div class="value">${escapeHtml(telefono)}</div></div>
            <div class="row"><div class="label">Servicio:</div><div class="value">${escapeHtml(serviceLabel)}</div></div>
            <div class="message"><strong>Mensaje:</strong><br/>${escapeHtml(mensaje).replace(/\n/g, "<br />")}</div>
          </div>
          <div class="footer">Tauro Corporativo — mensaje enviado desde el formulario web</div>
        </div>
      </body>
      </html>
    `;

    const text = `Nuevo mensaje desde el sitio web\n\nNombre: ${nombre}\nEmail: ${email}\nTeléfono: ${telefono}\nServicio: ${serviceLabel}\n\nMensaje:\n${mensaje}`;

    // Debug: log which logo source we will send as attachment
    console.log("logoSrc used in HTML:", logoSrc);
    console.log("publicLogoUrl (for attachment):", publicLogoUrl);

    // If no CID attachment was added, try adding the public URL as attachment path
    if (attachments.length === 0) {
      try {
        const isHttp =
          typeof publicLogoUrl === "string" &&
          /^https?:\/\//i.test(publicLogoUrl);
        if (isHttp) {
          attachments.push({ path: publicLogoUrl, filename: "LogoTauro.png" });
        } else {
          console.warn(
            "publicLogoUrl is not an http(s) URL, skipping attachments. publicLogoUrl=",
            publicLogoUrl,
          );
        }
      } catch (e) {
        console.warn("Error validating publicLogoUrl for attachment", e);
      }
    }

    // Log payload (html + attachments) before sending to Resend for debugging
    try {
      const payloadPreview = {
        subject,
        htmlSnippet: typeof html === "string" ? html.slice(0, 1000) : null,
        attachments: attachments.map((a) => ({
          filename: a.filename,
          type: a.type,
          disposition: a.disposition,
          cid: a.cid,
          path: a.path,
          contentLength: a.content ? a.content.length : undefined,
        })),
      };
      console.log("Resend payload preview:", JSON.stringify(payloadPreview, null, 2));
    } catch (logErr) {
      console.log("Failed to stringify payload preview:", String(logErr));
    }

    await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email,
      subject,
      html,
      text,
      attachments,
    });

    res.statusCode = 200;
    res.end(JSON.stringify({ message: "Mensaje enviado correctamente" }));
  } catch (error) {
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        message: "Error interno al procesar el formulario",
      }),
    );
  }
};
