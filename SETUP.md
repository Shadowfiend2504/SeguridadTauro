# Guía de Instalación - Tauro Corporativo

## Requisitos Previos

### Opción 1: Usando Node.js (Recomendado para Desarrollo)

#### Paso 1: Instalar Node.js
1. Descarga Node.js LTS desde [nodejs.org](https://nodejs.org/)
2. Ejecuta el instalador y sigue las instrucciones
3. Verifica la instalación abriendo PowerShell o Command Prompt:
   ```bash
   node --version
   npm --version
   ```

#### Paso 2: Instalar Dependencias del Proyecto
```bash
cd c:\GitHub\Codigos\SeguridadTauro
npm install
```

#### Paso 3: Iniciar Servidor de Desarrollo
```bash
npm start
```
El sitio estará disponible en: **http://localhost:3000**

---

### Opción 2: Usando VS Code Live Server (Más Rápido)

#### Paso 1: Instalar la Extensión
1. Abre VS Code
2. Ve a Extensions (Ctrl+Shift+X)
3. Busca "Live Server" por Ritwick Dey
4. Haz clic en Instalar

#### Paso 2: Ejecutar
1. Abre el archivo `src/index.html`
2. Haz clic derecho en el archivo
3. Selecciona "Open with Live Server"
4. Se abrirá automáticamente en tu navegador

---

### Opción 3: Usando Python SimpleHTTPServer

Si tienes Python 3 instalado:
```bash
cd c:\GitHub\Codigos\SeguridadTauro\src
python -m http.server 3000
```

---

## Estructura del Proyecto

```
SeguridadTauro/
├── src/
│   ├── index.html              # Página principal
│   ├── css/
│   │   └── styles.css          # Estilos principales
│   ├── js/
│   │   └── main.js             # Lógica JavaScript
│   └── assets/                 # (Imágenes, videos, etc)
├── public/                     # Archivos compilados
├── .github/
│   └── copilot-instructions.md # Instrucciones para Copilot
├── .vscode/
│   └── settings.json           # Configuración de VS Code
├── .eslintrc.js                # Configuración ESLint
├── webpack.config.js           # Configuración Webpack
├── package.json                # Dependencias del proyecto
├── (Opcional) `server.js` local para desarrollo antiguo
├── .gitignore                  # Archivos ignorados por Git
├── README.md                   # Documentación del proyecto
└── SETUP.md                    # Este archivo
```

---

## Comandos Disponibles

### Desarrollo
```bash
# Para desarrollo local con bundling (recomendado):
npm run dev         # Compila en modo desarrollo con observador
npm run build       # Compila proyecto para producción (genera /public)
npm run lint        # Verifica calidad de código con ESLint
npm run lint --fix  # Corrige automáticamente errores de linting

# Despliegue en Vercel: el endpoint está en `api/contact.js` y la configuración está en `vercel.json`.
```

---

## Características del Sitio

### ✨ Secciones Principales

1. **Navbar con Top Bar**
   - Información de contacto
   - Enlaces a redes sociales
   - Menú responsivo para móviles

2. **Hero Section**
   - Video de fondo
   - Call-to-Action
   - Overlay transparente

3. **Acerca de**
   - Misión de la empresa
   - Valores corporativos

4. **Servicios**
   - Escolta Armada
   - Traslado de Valores
   - Custodia de Mercancías
   - Transporte Ejecutivo

5. **Formación y Capacitación**
   - Certificaciones profesionales
   - Estándares internacionales

6. **Cobertura**
   - Mapa de cobertura nacional

7. **Testimonios**
   - Casos de éxito
   - Testimonios de clientes

8. **Contacto**
   - Formulario funcional
   - Información de ubicación
   - Datos de contacto

---

## Personalización

### Cambiar Colores
Edita las variables CSS en `src/css/styles.css`:
```css
:root {
  --primary-color: #E6B02E;      /* Color principal (oro) */
  --secondary-color: #1a1a1a;    /* Color secundario (negro) */
  --text-color: #333333;         /* Color del texto */
  /* ... más variables */
}
```

### Agregar Imágenes y Videos
1. Coloca los archivos en `src/assets/`
2. Actualiza las rutas en `src/index.html`
3. Ejemplo:
   ```html
   <img src="assets/mi-imagen.jpg" alt="Descripción">
   <video src="assets/mi-video.mp4" autoplay muted loop></video>
   ```

### Agregar Nuevas Secciones
1. Abre `src/index.html`
2. Agrega el HTML en la ubicación deseada
3. Ajusta los estilos en `src/css/styles.css` si es necesario

---

## Solución de Problemas

### ❌ "npm no es reconocido"
**Solución:** Node.js no está instalado. Descárgalo de [nodejs.org](https://nodejs.org/)

### ❌ Puerto 3000 en uso
Si usas un servidor local (opcional), cambia el puerto según la herramienta que ejecutes. Si despliegas en Vercel no aplica.

### ❌ Formulario no envía
**Solución:** Configura un endpoint en `src/js/main.js`:
```javascript
// Reemplaza la sección de envío con tu servidor
const response = await fetch('/api/contacto', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(Object.fromEntries(formData))
});
```

---

## Desarrollo Avanzado

### Agregar Webpack Bundling
```bash
npm run build    # Crea versión optimizada en /public
```

### Verificar Calidad de Código
```bash
npm run lint     # Verifica errores de JavaScript
```

---

## Próximos Pasos

- [ ] Integrar con backend/API
- [ ] Implementar base de datos
- [ ] Agregar autenticación
- [ ] Optimizar imágenes
- [ ] Implementar CDN para assets
- [ ] Configurar dominio personalizado
- [ ] Implementar SSL/HTTPS

---

## Soporte

Para más información o asistencia:
- 📞 +55 19628075
- 📧 ventas@corporativotauro.com.mx

---

**Última actualización:** 2024  
**Versión del Proyecto:** 1.0.0
