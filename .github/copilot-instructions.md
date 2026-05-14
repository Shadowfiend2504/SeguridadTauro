# Instrucciones para Copilot - Proyecto Tauro Corporativo

## Descripción del Proyecto
Sitio web profesional para empresa de seguridad privada Tauro Corporativo, desarrollado con HTML5, CSS3 y JavaScript puro. Incluye servicios de seguridad, cobertura nacional, formularios de contacto y testimonios.

## Tecnologías
- HTML5
- CSS3 (Responsive Design)
- JavaScript (Vanilla)
- Node.js para desarrollo local
- Webpack para bundling
- ESLint para calidad de código

## Estructura de Carpetas
```
SeguridadTauro/
├── src/
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── main.js
│   └── assets/
│       └── (imágenes, iconos, etc)
├── public/
│   └── (archivos estáticos finales)
├── .vscode/
│   └── settings.json
├── package.json
├── .eslintrc.js
├── webpack.config.js
└── README.md
```

## Rutas Importantes
- Archivo principal: `src/index.html`
- Estilos: `src/css/styles.css`
- Scripts: `src/js/main.js`
- Configuración ESLint: `.eslintrc.js`

## Comandos Disponibles
- `npm start` - Inicia servidor de desarrollo
- `npm build` - Compila el proyecto
- `npm lint` - Verifica calidad de código

## Convenciones
- Componentes reutilizables en `src/js/components/`
- Estilos modulares en `src/css/`
- Assets organizados por tipo en `src/assets/`
