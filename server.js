const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const HOST = "localhost";

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
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const server = http.createServer((req, res) => {
  if (req.url === "/api/contact" && req.method === "POST") {
    readJsonBody(req)
      .then(async (body) => {
        const nombre = String(body.nombre || "").trim();
        const email = String(body.email || "").trim();
        const telefono = String(body.telefono || "").trim();
        const servicio = String(body.servicio || "").trim();
        const mensaje = String(body.mensaje || "").trim();
        const website = String(body.website || "").trim();

        if (website) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "OK" }));
          return;
        }

        if (!nombre || !email || !telefono || !servicio || !mensaje) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Faltan campos obligatorios" }));
          return;
        }

        const apiKey = process.env.RESEND_API_KEY;
        const fromEmail = process.env.RESEND_FROM_EMAIL;
        const toEmail = process.env.CONTACT_TO_EMAIL;

        if (!apiKey || !fromEmail || !toEmail) {
          res.writeHead(500, { "Content-Type": "application/json" });
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
          res.writeHead(502, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              message: "No fue posible enviar el correo.",
              detail: errorText,
            }),
          );
          return;
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Mensaje enviado correctamente" }));
      })
      .catch(() => {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            message: "Error interno al procesar el formulario",
          }),
        );
      });
    return;
  }

  let filePath = "./src" + (req.url === "/" ? "/index.html" : req.url);

  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
  };

  const contentType = mimeTypes[extname] || "application/octet-stream";

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === "ENOENT") {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("<h1>404 - Archivo no encontrado</h1>", "utf-8");
      } else {
        res.writeHead(500);
        res.end("Error del servidor: " + error.code + " ..\n");
      }
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content, "utf-8");
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Servidor ejecutándose en http://${HOST}:${PORT}/`);
  console.log("Presiona Ctrl+C para detener el servidor");
});
