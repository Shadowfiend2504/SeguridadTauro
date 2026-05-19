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

    const serviceLabel =
      {
        escolta: "Escolta Armada",
        traslado: "Traslado de Valores",
        custodia: "Custodia de Mercancías",
        transporte: "Transporte Ejecutivo",
        otro: "Otro Servicio",
      }[servicio] || servicio;

    const subject = `Nuevo contacto Tauro Corporativo: ${nombre}`;
    const html = `
      <h2>Nuevo mensaje desde el sitio web</h2>
      <p><strong>Nombre:</strong> ${escapeHtml(nombre)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Teléfono:</strong> ${escapeHtml(telefono)}</p>
      <p><strong>Servicio:</strong> ${escapeHtml(serviceLabel)}</p>
      <p><strong>Mensaje:</strong><br />${escapeHtml(mensaje).replace(/\n/g, "<br />")}</p>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject,
        html,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      res.statusCode = 502;
      res.end(
        JSON.stringify({
          message: "No fue posible enviar el correo.",
          detail: errorText,
        }),
      );
      return;
    }

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
