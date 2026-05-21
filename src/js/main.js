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
  initFormationCarousel();
});

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
      if (parent && window.innerWidth <= 900) {
        // en móvil, al pulsar el enlace padre mostramos/ocultamos el submenu
        e.preventDefault();
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
function initCoverageMap() {
  const coverageData = {
    cdmx: {
      name: "Ciudad de México",
      description:
        "Centro corporativo y punto de coordinación operativa. Desde aquí gestionamos atención ejecutiva, despliegue táctico y supervisión regional.",
      facts: [
        "Coordinación nacional",
        "Atención corporativa",
        "Operaciones de respuesta rápida",
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

  function positionCoverageButtons() {
    // Use precise SVG -> screen mapping to compute target coordinates
    // Remove manual nudges: rely on iterative automatic alignment only
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
      const h =
        button.offsetHeight || parseFloat(getComputedStyle(button).height);
      const beforeStyle = getComputedStyle(button, "::before");
      const beforeH = parseFloat(beforeStyle.height) || h * 0.66;

      // transform translate(-50%, -33%) shifts element by -0.5*w horizontally and -0.33*h vertically
      // the circle center is located at beforeH/2 from the element top. Solve for top so that
      // (top - 0.33*h + beforeH/2) === desiredTop
      const computedTop = desiredTop + 0.33 * h - beforeH / 2;

      // place roughly, then measure and nudge to remove any remaining pixel delta
      button.style.left = `${desiredLeft.toFixed(2)}px`;
      button.style.top = `${computedTop.toFixed(2)}px`;

      // force layout and compute rects
      const btnRect = button.getBoundingClientRect();
      const pathRect = path.getBoundingClientRect();
      const circleCenterY = btnRect.top + beforeH / 2;
      const pathCenterY = pathRect.top + pathRect.height / 2;
      const deltaY = Math.round(circleCenterY - pathCenterY);

      if (Math.abs(deltaY) > 0) {
        // move button up/down by delta to align circle center precisely
        const currentTop = parseFloat(button.style.top || 0);
        button.style.top = `${Math.round(currentTop - deltaY)}px`;
      }

      // no manual nudges: rely on automatic iterative refinement below
    });

    // Iterative automatic refinement: adjust until each button's visible circle
    // center matches the corresponding SVG path center (in screen pixels).
    const maxIter = 20;
    for (let iter = 0; iter < maxIter; iter++) {
      let allCentered = true;

      buttons.forEach((button) => {
        const path = document.getElementById(button.id);
        if (!path) return;

        const btnRect = button.getBoundingClientRect();
        const pathRect = path.getBoundingClientRect();
        const beforeH =
          parseFloat(getComputedStyle(button, "::before").height) ||
          button.offsetHeight * 0.66;

        const circleCx = btnRect.left + btnRect.width / 2;
        const circleCy = btnRect.top + beforeH / 2;
        const pathCx = pathRect.left + pathRect.width / 2;
        const pathCy = pathRect.top + pathRect.height / 2;

        const dx = Math.round(circleCx - pathCx);
        const dy = Math.round(circleCy - pathCy);

        if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
          allCentered = false;
          const currentLeft = parseFloat(button.style.left || 0);
          const currentTop = parseFloat(button.style.top || 0);
          button.style.left = `${(currentLeft - dx).toFixed(2)}px`;
          button.style.top = `${(currentTop - dy).toFixed(2)}px`;
        }
      });

      // Force a reflow so measurements update for the next iteration
      void document.body.offsetHeight;
      if (allCentered) break;
    }
  }

  function setActiveCity(cityKey, activeButton) {
    const data = coverageData[cityKey];
    if (!data || !cityName || !cityDescription || !cityFacts) return;

    if (activeButton) {
      syncActiveState(activeButton);
    }

    cityName.textContent = data.name;
    cityDescription.textContent = data.description;
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
 * Carrusel continuo para la banda de formación.
 */
function initFormationCarousel() {
  const band = document.querySelector(".formation-band");
  const track = band?.querySelector(".formation-band-track");

  if (!band || !track) return;

  const imageSources = Array.from({ length: 19 }, (_, index) => ({
    src: `assets/recursos/${index + 1}.png`,
    alt: `Reconocimiento académico ${index + 1}`,
  }));

  const buildGroup = (isClone = false) => {
    const group = document.createElement("div");
    group.className = "formation-band-group";

    if (isClone) {
      group.setAttribute("aria-hidden", "true");
    }

    imageSources.forEach(({ src, alt }) => {
      const img = document.createElement("img");
      img.src = src;
      img.loading = "lazy";
      img.decoding = "async";
      img.alt = isClone ? "" : alt;
      img.onerror = () => {
        img.onerror = null;
        img.src = "assets/recursos/LogoTauro.png";
        img.alt = isClone ? "" : alt;
      };
      group.appendChild(img);
    });

    return group;
  };

  track.replaceChildren(buildGroup(false), buildGroup(true));

  const firstGroup = band.querySelector(".formation-band-group");

  if (!firstGroup) return;

  const state = {
    offset: 0,
    groupWidth: 0,
    lastTimestamp: 0,
    paused: false,
    rafId: 0,
  };

  const measureGroupWidth = () => {
    const groupRect = firstGroup.getBoundingClientRect();
    const styles = window.getComputedStyle(firstGroup);
    const gapValue =
      Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
    state.groupWidth = groupRect.width + gapValue;
    if (!state.groupWidth) {
      state.groupWidth = firstGroup.scrollWidth;
    }
  };

  const render = () => {
    track.style.transform = `translate3d(${-state.offset}px, 0, 0)`;
  };

  const step = (timestamp) => {
    if (!state.lastTimestamp) {
      state.lastTimestamp = timestamp;
    }

    const delta = timestamp - state.lastTimestamp;
    state.lastTimestamp = timestamp;

    if (!state.paused && state.groupWidth > 0) {
      const pixelsPerSecond = 120;
      state.offset += (delta / 1000) * pixelsPerSecond;

      if (state.offset >= state.groupWidth) {
        state.offset -= state.groupWidth;
      }

      render();
    }

    if (state.paused) {
      render();
    }

    state.rafId = window.requestAnimationFrame(step);
  };

  const startCarousel = () => {
    if (state.rafId) return;
    measureGroupWidth();
    render();
    state.rafId = window.requestAnimationFrame(step);
  };

  const resizeObserver = new ResizeObserver(() => {
    measureGroupWidth();
    if (state.offset >= state.groupWidth) {
      state.offset = 0;
    }
    render();
  });

  band.addEventListener("mouseenter", () => {
    state.paused = true;
  });

  band.addEventListener("mouseleave", () => {
    state.paused = false;
  });

  resizeObserver.observe(firstGroup);
  resizeObserver.observe(band);

  const imgs = Array.from(firstGroup.querySelectorAll("img"));
  const loadPromises = imgs.map(
    (img) =>
      new Promise((res) => {
        if (img.complete) return res();
        img.addEventListener("load", res, { once: true });
        img.addEventListener("error", res, { once: true });
      }),
  );

  Promise.all(loadPromises).then(() => {
    startCarousel();
  });
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
