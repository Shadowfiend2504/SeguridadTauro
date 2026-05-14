// Utilidades
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Estado de la aplicación
const app = {
  menuOpen: false,
  formSubmitting: false,
};

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initFormHandlers();
  initScrollEffects();
  initVideoBackground();
});

/**
 * Manejo del menú móvil
 */
function initMobileMenu() {
  const menuToggle = $('#menu-toggle');
  const mobileMenu = $('#mobile-menu');
  const menuClose = $('#menu-close');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      app.menuOpen = !app.menuOpen;
      mobileMenu.classList.toggle('active', app.menuOpen);
      document.body.style.overflow = app.menuOpen ? 'hidden' : 'auto';
    });
  }

  if (menuClose) {
    menuClose.addEventListener('click', () => {
      app.menuOpen = false;
      mobileMenu.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
  }

  // Cerrar menú al hacer clic en un enlace
  const mobileMenuLinks = $$('#mobile-menu a');
  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
      app.menuOpen = false;
      mobileMenu.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
  });
}

/**
 * Manejo de formularios
 */
function initFormHandlers() {
  const contactForm = $('#contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (app.formSubmitting) return;
      app.formSubmitting = true;

      const formData = new FormData(contactForm);
      
      try {
        // Simulación de envío - reemplaza con tu endpoint real
        console.log('Formulario enviado:', Object.fromEntries(formData));
        
        // Mostrar mensaje de éxito
        showNotification('¡Mensaje enviado correctamente!', 'success');
        contactForm.reset();
      } catch (error) {
        console.error('Error al enviar formulario:', error);
        showNotification('Error al enviar el mensaje. Intenta de nuevo.', 'error');
      } finally {
        app.formSubmitting = false;
      }
    });
  }
}

/**
 * Efectos de scroll
 */
function initScrollEffects() {
  const navbar = $('#navbar');
  
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Smooth scroll para enlaces internos
  const navLinks = $$('a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetElement = $(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/**
 * Video de fondo
 */
function initVideoBackground() {
  const videoContainer = $('#video-container');
  
  if (!videoContainer) return;

  // Ajustar altura del video al tamaño de la ventana
  function setVideoHeight() {
    videoContainer.style.height = window.innerHeight + 'px';
  }

  setVideoHeight();
  window.addEventListener('resize', setVideoHeight);
}

/**
 * Mostrar notificaciones
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Animar entrada
  setTimeout(() => notification.classList.add('show'), 100);
  
  // Remover después de 5 segundos
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// Exportar funciones para uso en otros módulos
window.app = {
  ...app,
  showNotification,
};
