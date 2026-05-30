// Utilidades
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Estado de la aplicación
const app = {
  menuOpen: false,
  formSubmitting: false,
};

const siteConfig = {
  whatsappNumber: document.body?.dataset?.whatsappNumber || "525519628075",
  whatsappMessage:
    document.body?.dataset?.whatsappMessage ||
    "Hola, quiero recibir información sobre los servicios que ofrecen.",
  contactEndpoint: document.body?.dataset?.contactEndpoint || "/api/contact",
};

const analyticsConfig = {
  storageKey: "tauro_analytics_enabled",
  queryKey: "tauroAnalytics",
  productionScript: "/_vercel/insights/script.js",
  developmentScript: "https://va.vercel-scripts.com/v1/script.debug.js",
};

// Inicializar la aplicación
document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initWhatsAppLinks();
  initFormHandlers();
  initScrollEffects();
  initFloatingWhatsApp();
  initVideoBackground();
  initCoverageMap();
  initNavDropdowns();
  initVercelAnalytics();
});

function initVercelAnalytics() {
  const currentUrl = new URL(window.location.href);
  const optInFromQuery = currentUrl.searchParams.get(analyticsConfig.queryKey) === "1";

  if (optInFromQuery) {
    window.localStorage.setItem(analyticsConfig.storageKey, "1");
    currentUrl.searchParams.delete(analyticsConfig.queryKey);
    window.history.replaceState({}, document.title, currentUrl.toString());
  }

  const isEnabled = window.localStorage.getItem(analyticsConfig.storageKey) === "1";
  if (!isEnabled) return;

  const scriptId = "tauro-vercel-analytics";
  if (document.getElementById(scriptId)) return;

  const script = document.createElement("script");
  script.id = scriptId;
  script.defer = true;
  script.src =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? analyticsConfig.developmentScript
      : analyticsConfig.productionScript;

  document.head.appendChild(script);
}

function buildWhatsAppUrl(message = siteConfig.whatsappMessage) {
  const phone = siteConfig.whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function initWhatsAppLinks() {
  const whatsappLinks = document.querySelectorAll("[data-whatsapp-link]");
  const href = buildWhatsAppUrl();

  whatsappLinks.forEach((link) => {
    link.setAttribute("href", href);
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });
}

/**
 * Manejo del menú móvil
 */
function initMobileMenu() {
  const menuToggle = $("#menu-toggle");
  const mobileMenu = $("#mobile-menu");
  const menuClose = $("#menu-close");

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      app.menuOpen = !app.menuOpen;
      mobileMenu.classList.toggle("active", app.menuOpen);
      document.body.style.overflow = app.menuOpen ? "hidden" : "auto";
    });
  }

  if (menuClose) {
    menuClose.addEventListener("click", () => {
      app.menuOpen = false;
      mobileMenu.classList.remove("active");
      document.body.style.overflow = "auto";
    });
  }

  // Cerrar menú al hacer clic en un enlace; pero permitir que los padres con submenu se expandan
  const mobileMenuLinks = $$("#mobile-menu a");
  mobileMenuLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const parent = link.closest(".has-submenu");
      const isParentTrigger = link.matches(".has-submenu > a");

      if (parent && isParentTrigger && window.innerWidth <= 900) {
        // en móvil, al pulsar el enlace padre mostramos/ocultamos el submenu
        e.preventDefault();
        e.stopImmediatePropagation();
        parent.classList.toggle("open");
        const a = parent.querySelector("a");
        if (a)
          a.setAttribute("aria-expanded", parent.classList.contains("open"));
        return;
      }

      app.menuOpen = false;
      mobileMenu.classList.remove("active");
      document.body.style.overflow = "auto";
    });
  });
}

/**
 * Inicializa comportamiento del desplegable en el nav (desktop hover + móvil toggle)
 */
function initNavDropdowns() {
  const parents = document.querySelectorAll(".nav-menu .has-submenu > a");
  parents.forEach((link) => {
    link.addEventListener("click", (e) => {
      // en pantallas pequeñas, el click en el enlace principal debe abrir/cerrar el submenu
      if (window.innerWidth <= 900) {
        e.preventDefault();
        e.stopImmediatePropagation();
        const parent = link.parentElement;
        parent.classList.toggle("open");
        link.setAttribute("aria-expanded", parent.classList.contains("open"));
      }
    });
  });
}

/**
 * Manejo de formularios
 */
function initFormHandlers() {
  const contactForm = $("#contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (app.formSubmitting) return;
      app.formSubmitting = true;

      const formData = new FormData(contactForm);
      const payload = Object.fromEntries(formData.entries());
      const submitButton = contactForm.querySelector('button[type="submit"]');

      if (payload.website) {
        app.formSubmitting = false;
        return;
      }

      try {
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "Enviando...";
        }

        const response = await fetch(siteConfig.contactEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            result.message || "No fue posible enviar el formulario.",
          );
        }

        showNotification("¡Mensaje enviado correctamente!", "success");
        contactForm.reset();
        initWhatsAppLinks();
      } catch (error) {
        console.error("Error al enviar formulario:", error);
        showNotification(
          error.message || "Error al enviar el mensaje. Intenta de nuevo.",
          "error",
        );
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Enviar Mensaje";
        }
        app.formSubmitting = false;
      }
    });
  }
}

/**
 * Efectos de scroll
 */
function initScrollEffects() {
  const navbar = $("#navbar");

  if (!navbar) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Smooth scroll para enlaces internos
  const navLinks = $$('a[href^="#"]');
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href");
      const targetElement = $(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

/**
 * Botón flotante de WhatsApp
 * Se muestra solo después de hacer scroll para evitar ser invasivo
 */
function initFloatingWhatsApp() {
  const floatingBtn = $(".floating-whatsapp");
  if (!floatingBtn) return;

  // Mostrar después de hacer scroll 300px o más
  const scrollThreshold = 300;
  let hasScrolled = false;

  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY > scrollThreshold && !hasScrolled) {
        hasScrolled = true;
        floatingBtn.classList.add("visible");
      } else if (window.scrollY <= scrollThreshold && hasScrolled) {
        hasScrolled = false;
        floatingBtn.classList.remove("visible");
      }
    },
    { passive: true },
  );
}

/**
 * Video de fondo
 */
function initVideoBackground() {
  const videoContainer = $("#video-container");

  if (!videoContainer) return;

  // Ajustar altura del video al tamaño de la ventana
  function setVideoHeight() {
    videoContainer.style.height = window.innerHeight + "px";
  }

  setVideoHeight();
  window.addEventListener("resize", setVideoHeight);
}

/**
 * Mapa de cobertura interactivo
 */
// Inyectar regla de estilo para justificar texto si no existe en CSS
(function ensureTextJustifyStyle() {
  if (document.getElementById("text-justify-style")) return;
  const style = document.createElement("style");
  style.id = "text-justify-style";
  style.textContent =
    ".text-justify{ text-align: justify; text-justify: inter-word; }";
  document.head.appendChild(style);
})();

function initCoverageMap() {
  const coverageData = {
    cdmx: {
      name: "Ciudad de México y Área Metropolitana",
      description:
        "Centro corporativo y centro de operaciones. Desde aquí gestionamos atención ejecutiva, despliegue táctico y supervisión regional.",
      facts: [
        "Coordinación nacional",
        "Centro de Operación",
        "Operaciones de respuesta rápida",
        "Centro de gestión de crisis",
        "Unidades de soporte y respuesta inmediata",
      ],
    },
    monterrey: {
      name: "Monterrey",
      description:
        "Plaza industrial prioritaria para escolta, custodia y protección de activos en corredores logísticos y corporativos.",
      facts: [
        "Sector industrial",
        "Custodia de mercancías",
        "Cobertura ejecutiva",
      ],
    },
    guadalajara: {
      name: "Guadalajara",
      description:
        "Nodo estratégico para empresas de tecnología, comercio y distribución que requieren presencia preventiva y discreta.",
      facts: [
        "Corredor comercial",
        "Seguridad preventiva",
        "Protección patrimonial",
      ],
    },
    tijuana: {
      name: "Tijuana",
      description:
        "Cobertura en la frontera norte para protección ejecutiva, control de accesos críticos y custodia de operaciones sensibles.",
      facts: [
        "Operación fronteriza",
        "Control de accesos",
        "Custodia especializada",
      ],
    },
    cancun: {
      name: "Cancún",
      description:
        "Atención táctica para complejos turísticos y corporativos con protocolos de prevención, reacción y continuidad operativa.",
      facts: [
        "Cobertura hotelera",
        "Protección corporativa",
        "Respuesta inmediata",
      ],
    },
    queretaro: {
      name: "Querétaro",
      description:
        "Zona de alta actividad empresarial e industrial donde operamos con protocolos de vigilancia y traslado especializado.",
      facts: [
        "Hub logístico",
        "Traslado de valores",
        "Protección a corporativos",
      ],
    },
    puebla: {
      name: "Puebla",
      description:
        "Cobertura enfocada en instalaciones industriales, rutas de distribución y servicios corporativos de alto estándar.",
      facts: [
        "Industria y distribución",
        "Rutas críticas",
        "Monitoreo constante",
      ],
    },
    merida: {
      name: "Mérida",
      description:
        "Expansión regional para clientes que buscan acompañamiento profesional y continuidad operativa en el sureste.",
      facts: ["Presencia regional", "Atención al sureste", "Soporte operativo"],
    },
  };

  const map = document.querySelector(".coverage-layout");
  if (!map) return;

  const coverageSvg = document.querySelector(".coverage-map-svg");
  const coverageStates = Array.from(
    document.querySelectorAll(".coverage-map-svg .coverage-state"),
  );
  const buttons = Array.from(document.querySelectorAll(".coverage-point"));
  const cityName = $("#coverage-city-name");
  const cityDescription = $("#coverage-city-description");
  const cityFacts = $("#coverage-city-list");

  if (!coverageSvg || !buttons.length) return;

  function syncActiveState(activeButton) {
    buttons.forEach((button) => {
      button.classList.toggle("is-active", button === activeButton);
    });

    coverageStates.forEach((state) => state.classList.remove("is-active"));

    if (!activeButton || !activeButton.id) return;

    const activePath = document.getElementById(activeButton.id);
    if (activePath) {
      activePath.classList.add("is-active");
    }
  }

  buttons.forEach((button) => {
    const path = document.getElementById(button.id);
    if (path) {
      path.classList.add("coverage-state--featured");
    }
  });

  function positionCoverageButtons() {
    // Use precise SVG -> screen mapping to compute target coordinates
    const svgRect = coverageSvg.getBoundingClientRect();
    if (!svgRect.width || !svgRect.height) return;
    const svgPoint = coverageSvg.createSVGPoint();

    buttons.forEach((button) => {
      const path = document.getElementById(button.id);
      if (!path || typeof path.getBBox !== "function") return;

      const box = path.getBBox();
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;

      // map SVG user coordinates to screen pixels precisely
      svgPoint.x = centerX;
      svgPoint.y = centerY;
      const screenPt = svgPoint.matrixTransform(coverageSvg.getScreenCTM());

      // desired position relative to the svg container's top-left
      const desiredLeft = screenPt.x - svgRect.left;
      const desiredTop = screenPt.y - svgRect.top;

      // compute element sizes to align the visual circle (::before) center
      const w =
        button.offsetWidth || parseFloat(getComputedStyle(button).width);
      const afterStyle = getComputedStyle(button, "::after");
      const tipOffset =
        (parseFloat(afterStyle.top) || 0) +
        (parseFloat(afterStyle.borderTopWidth) || 0);

      button.style.left = `${(desiredLeft - w / 2).toFixed(2)}px`;
      button.style.top = `${(desiredTop - tipOffset).toFixed(2)}px`;
    });
  }

  function setActiveCity(cityKey, activeButton) {
    const data = coverageData[cityKey];
    if (!data || !cityName || !cityDescription || !cityFacts) return;

    if (activeButton) {
      syncActiveState(activeButton);
    }

    cityName.textContent = data.name;
    cityDescription.textContent = data.description;
    // Aplicar justificación al texto descriptivo
    cityDescription.classList.add("text-justify");
    cityFacts.innerHTML = data.facts.map((fact) => `<li>${fact}</li>`).join("");
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () =>
      setActiveCity(button.dataset.city, button),
    );
  });

  const defaultButton = buttons.find(
    (button) => button.dataset.city === "cdmx",
  );
  setActiveCity("cdmx", defaultButton);

  positionCoverageButtons();
  window.addEventListener("resize", positionCoverageButtons);
}
/**
 * Mostrar notificaciones
 */
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Animar entrada
  setTimeout(() => notification.classList.add("show"), 100);

  // Remover después de 5 segundos
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// Exportar funciones para uso en otros módulos
window.app = {
  ...app,
  showNotification,
};
