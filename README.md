# Tauro Corporativo - Seguridad Privada

## Descripción

Sitio web profesional para Tauro Corporativo, una empresa líder en seguridad privada con más de 20 años de experiencia. Ofrecemos servicios integrales de seguridad incluyendo:

- **Escolta Armada**: Protección especializada con personal entrenado
- **Traslado de Valores**: Transporte seguro de efectivo y valores
- **Custodia de Mercancías**: Vigilancia profesional de inventarios
- **Transporte Ejecutivo**: Movilidad segura para ejecutivos

## Características del Sitio

✅ Diseño responsivo y moderno  
✅ Formularios de contacto funcionales  
✅ Navegación intuitiva  
✅ Información de servicios detallada  
✅ Testimonios y casos de éxito  
✅ Cobertura nacional

## Estructura del Proyecto

```
src/
├── index.html           # Página principal
├── css/
│   └── styles.css       # Estilos principales
├── js/
│   └── main.js          # Lógica JavaScript
└── assets/              # Imágenes, iconos, etc.

public/                  # Archivos compilados finales
```

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/usuario/tauro-corporativo.git

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

## Desarrollo

### Iniciar servidor local

```bash
npm start
```

El sitio estará disponible en `http://localhost:3000`

### Compilar assets

```bash
npm run build
```

### Verificar calidad de código

```bash
npm lint
```

## Formulario de Contacto

El formulario del sitio envía datos a la ruta `/api/contact`.

Para que funcione en Vercel, configura estas variables de entorno:

- `RESEND_API_KEY`: llave privada de Resend
- `RESEND_FROM_EMAIL`: remitente verificado en Resend
- `CONTACT_TO_EMAIL`: buzón que recibirá los mensajes

Si prefieres otra pasarela, puedes sustituir `api/contact.js` por un webhook de Formspree, Resend o el proveedor que uses, pero no expongas la llave en el frontend.

## WhatsApp

El enlace de WhatsApp se arma desde el atributo `data-whatsapp-number` del `<body>`.

Si cambias el número, actualiza ese valor y el texto base `data-whatsapp-message` en `src/index.html`.

## Despliegue en Vercel

1. Sube el repositorio a GitHub.
2. Importa el proyecto en Vercel.
3. Agrega las variables de entorno anteriores en el panel de Vercel.
4. Despliega sin cambiar la estructura de `src/`.

El archivo `vercel.json` define rutas y builds explícitos para:

- Servir `src/index.html` en `/`
- Resolver assets desde `src/`
- Exponer la función serverless `/api/contact`
- Publicar archivos estáticos adicionales dentro de `public/` (por ejemplo `robots.txt` y `sitemap.xml`)

## Archivos sensibles

- `.env` y `.env.local` quedan fuera del repositorio.
- `.env.example` se mantiene como referencia pública.
- `.vercel/` también está ignorado para evitar artefactos locales.

## Información de Contacto

📞 **Teléfono**: +55 19628075  
📧 **Email**: ventas@corporativotauro.com.mx  
📍 **Dirección**: Alexander Von Humboldt 12, Lomas Verdes, CDMX, México

## Redes Sociales

Síguenos en nuestras redes sociales para actualizaciones de seguridad y nuevos servicios.

## Licencia

MIT License - Todos los derechos reservados © 2024 Tauro Corporativo

## Autor

Proyecto desarrollado por Juan Sebastian Carvajal para Tauro Corporativo como solución web profesional para el sector de seguridad privada.
