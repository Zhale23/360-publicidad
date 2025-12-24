// Initialize AOS
AOS.init({
  duration: 600,
  easing: "ease-out-quad",
  once: true,
  offset: 100,
});

// Mobile menu toggle
const menuToggle = document.getElementById("menu-toggle");
const menuClose = document.getElementById("menu-close");
const mobileMenu = document.getElementById("mobile-menu");

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";

  if (!isExpanded) {
    mobileMenu.classList.remove("hidden");
    setTimeout(() => {
      document
        .querySelector("#mobile-menu > div")
        .classList.remove("translate-x-full");
    }, 50);
    document.body.style.overflow = "hidden";
    menuToggle.setAttribute("aria-expanded", "true");

    // Transform logo to X
    document
      .getElementById("logo-text-1")
      .classList.add("opacity-0", "translate-x-4");
    document
      .getElementById("logo-text-2")
      .classList.add("opacity-0", "-translate-x-4");
    document.getElementById("menu-icon").setAttribute("data-feather", "x");
    feather.replace();
  } else {
    document
      .querySelector("#mobile-menu > div")
      .classList.add("translate-x-full");
    setTimeout(() => {
      mobileMenu.classList.add("hidden");
    }, 300);
    document.body.style.overflow = "auto";
    menuToggle.setAttribute("aria-expanded", "false");

    // Transform X back to logo
    document
      .getElementById("logo-text-1")
      .classList.remove("opacity-0", "translate-x-4");
    document
      .getElementById("logo-text-2")
      .classList.remove("opacity-0", "-translate-x-4");
    document.getElementById("menu-icon").setAttribute("data-feather", "menu");
    feather.replace();
  }
});

menuClose.addEventListener("click", () => {
  document
    .querySelector("#mobile-menu > div")
    .classList.add("translate-x-full");
  setTimeout(() => {
    mobileMenu.classList.add("hidden");
  }, 300);
  document.body.style.overflow = "auto";
  menuToggle.setAttribute("aria-expanded", "false");

  // Transform X back to logo
  document
    .getElementById("logo-text-1")
    .classList.remove("opacity-0", "translate-x-4");
  document
    .getElementById("logo-text-2")
    .classList.remove("opacity-0", "-translate-x-4");
  document.getElementById("menu-icon").setAttribute("data-feather", "menu");
  feather.replace();
});

// // Smooth scrolling for anchor links
// document.querySelectorAll('a[href^="#"]').forEach(anchor => {
//     anchor.addEventListener('click', function (e) {
//         e.preventDefault();

//         const targetId = this.getAttribute('href');
//         const targetElement = document.querySelector(targetId);

//         if (targetElement) {
//             window.scrollTo({
//                 top: targetElement.offsetTop - 80,
//                 behavior: 'smooth'
//             });

//             // Close mobile menu if open
//             if (!mobileMenu.classList.contains('hidden')) {
//                 document.querySelector('#mobile-menu > div').classList.add('translate-x-full');
//                 setTimeout(() => {
//                     mobileMenu.classList.add('hidden');
//                 }, 300);
//                 document.body.style.overflow = 'auto';
//                 menuToggle.setAttribute('aria-expanded', 'false');
//             }
//         }
//     });
// });

// Close menu when clicking outside
document.addEventListener("click", (e) => {
  if (
    !mobileMenu.classList.contains("hidden") &&
    !menuToggle.contains(e.target) &&
    !document.querySelector("#mobile-menu > div").contains(e.target)
  ) {
    document
      .querySelector("#mobile-menu > div")
      .classList.add("translate-x-full");
    setTimeout(() => {
      mobileMenu.classList.add("hidden");
    }, 300);
    document.body.style.overflow = "auto";
    menuToggle.setAttribute("aria-expanded", "false");

    // Transform X back to logo
    document
      .getElementById("logo-text-1")
      .classList.remove("opacity-0", "translate-x-4");
    document
      .getElementById("logo-text-2")
      .classList.remove("opacity-0", "-translate-x-4");
    document.getElementById("menu-icon").setAttribute("data-feather", "menu");
    feather.replace();
  }
});

// Hero cards hover effect
const heroCards = document.querySelectorAll(".hero-card");
heroCards.forEach((card) => {
  card.addEventListener("mouseenter", () => {
    card.querySelector("div").classList.add("scale-110");
  });
  card.addEventListener("mouseleave", () => {
    card.querySelector("div").classList.remove("scale-110");
  });
});

// Initialize feather icons
feather.replace();

const slidesCount = document.querySelectorAll(
  ".hero-swiper .swiper-slide"
).length;
const enableLoop = slidesCount >= 4; // evita warning de Swiper si hay pocas slides
const swiper = new Swiper(".hero-swiper", {
  effect: "coverflow",
  centeredSlides: true,
  loop: enableLoop,
  slidesPerView: "auto",
  spaceBetween: 40,

  coverflowEffect: {
    rotate: 0,
    stretch: 0,
    depth: 150,
    modifier: 1,
    slideShadows: false,
  },
  autoplay: {
    delay: 3500,
    disableOnInteraction: false,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});

// --- 🔊 Manejar el sonido del video activo ---
swiper.on("slideChangeTransitionEnd", () => {
  // Mantener todos los videos en silencio para evitar bloqueos de autoplay
  document.querySelectorAll(".hero-swiper video").forEach((video) => {
    video.muted = true;
  });

  // Reproducir el video activo en silencio
  const activeSlide = swiper.slides[swiper.activeIndex];
  const activeVideo = activeSlide?.querySelector("video");
  if (activeVideo) {
    activeVideo.muted = true;
    activeVideo.play().catch((err) => {
      console.log("Autoplay silenciado (permitido):", err);
    });
  }
});
// --- FILTRO PORTAFOLIO (versión dinámica y paginada) ---
const filtersContainer = document.getElementById("portfolio-filters");
const filterButtons = filtersContainer
  ? filtersContainer.querySelectorAll("button[data-filter]")
  : [];
const grid = document.getElementById("portfolio-grid");
const loadMoreBtn = document.getElementById("loadMore");

const itemsPerPage = 8; // número de items por carga
let currentPage = 1;
let currentFilter = "todos";

// Datos del portafolio (cargados desde images.json)
let portfolioData = [];
let imagesData = null;

// Cargar datos del portafolio desde images.json
async function loadPortfolioData() {
  try {
    const response = await fetch("/images.json");
    if (response.ok) {
      imagesData = await response.json();

      // Convertir el formato del JSON a portfolioData
      portfolioData = [];
      Object.entries(imagesData.portfolio).forEach(([category, images]) => {
        images.forEach((imgPath) => {
          portfolioData.push({
            src: imgPath,
            title: category,
            category: category.toLowerCase(),
          });
        });
      });

      currentPage = 1;
      renderGallery();
    } else {
      console.error("Error loading images.json:", response.statusText);
    }
  } catch (error) {
    console.error("Error loading images.json:", error);
  }
}

// Normaliza el texto para comparar filtros (quita tildes y mayúsculas)
function normalizeKey(s) {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

function renderGallery() {
  if (!grid) return;

  const normalizedFilter = normalizeKey(currentFilter);
  const filtered = portfolioData.filter((item) => {
    return (
      normalizedFilter === "todos" ||
      normalizeKey(item.category) === normalizedFilter
    );
  });

  const start = (currentPage - 1) * itemsPerPage;
  const pageItems = filtered.slice(start, start + itemsPerPage);

  // Render
  if (currentPage === 1) grid.innerHTML = "";
  pageItems.forEach((it) => {
    const wrapper = document.createElement("div");
    wrapper.className =
      "portfolio-item relative group overflow-hidden rounded-2xl";
    wrapper.setAttribute("data-category", it.category);

    const img = document.createElement("img");
    img.src = it.src;
    img.alt = it.title;
    img.loading = "lazy";
    img.className =
      "w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-110";

    const overlay = document.createElement("div");
    overlay.className =
      "absolute inset-0 bg-[#0F2435]/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300";
    overlay.innerHTML = `<h3 class="text-xl font-bold text-white">${it.title}</h3>`;

    wrapper.appendChild(img);
    wrapper.appendChild(overlay);
    grid.appendChild(wrapper);
  });

  // Mostrar/ocultar botón
  if (start + itemsPerPage < filtered.length) {
    loadMoreBtn.style.display = "inline-flex";
  } else {
    loadMoreBtn.style.display = "none";
  }
}

// Listeners filtros
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const selected = btn.dataset.filter;
    currentFilter = selected || "todos";
    currentPage = 1;

    // estilos accesibles
    filterButtons.forEach((b) => {
      b.classList.remove("bg-[#46C5C8]", "text-[#0F2435]");
      b.classList.add("bg-[#173447]", "text-white");
      b.setAttribute("aria-pressed", "false");
    });

    btn.classList.add("bg-[#46C5C8]", "text-[#0F2435]");
    btn.classList.remove("bg-[#173447]", "text-white");
    btn.setAttribute("aria-pressed", "true");

    // reset grid and render
    grid.innerHTML = "";
    renderGallery();
  });
});

// Botón Cargar más
if (loadMoreBtn) {
  loadMoreBtn.addEventListener("click", () => {
    currentPage++;
    renderGallery();
  });
}

// Inicializar - Cargar portafolio desde servidor
loadPortfolioData();

// =============================
// 4 BOTONES / SHOWCASE SECTION
// =============================

// Mapeo de categorías a carpetas en /media
const showcaseCategories = {
  "ADECUACION DE ESPACIOS": "4 BOTONES/ADECUACION DE ESPACIOS",
  LETREROS: "4 BOTONES/LETREROS",
  STAND: "4 BOTONES/STAND",
  VALLAS: "4 BOTONES/VALLAS",
};

// Almacenar imágenes cargadas por categoría (caché)
const galleryCache = {};

// Función para obtener imágenes de una categoría desde images.json
async function fetchCategoryImages(category) {
  if (galleryCache[category]) {
    return galleryCache[category];
  }

  try {
    // Si no tenemos los datos cargados, cargarlos
    if (!imagesData) {
      const response = await fetch("/images.json");
      if (response.ok) {
        imagesData = await response.json();
      } else {
        throw new Error("No se pudo cargar images.json");
      }
    }

    // Buscar en showcase (4 botones)
    const categoryKey = category.split("/").pop(); // Extraer nombre final
    const images = imagesData.showcase[categoryKey] || [];

    galleryCache[category] = images;
    return images;
  } catch (error) {
    console.error("Error fetching category images:", error);
    return [];
  }
}

// Función para abrir la galería modal
async function openGallery(categoryPath) {
  const galleryContainer = document.getElementById("gallery-container");
  const galleryTitle = document.getElementById("gallery-title");
  const galleryGrid = document.getElementById("gallery-grid");

  // Mostrar título (extraer el nombre de la carpeta final)
  const displayName = categoryPath.split("/").pop().replace(/_/g, " ");
  galleryTitle.textContent = displayName;

  // Mostrar loading mientras se cargan las imágenes
  galleryGrid.innerHTML =
    '<div class="col-span-full text-center py-8 text-[#0F2435]">Cargando galería...</div>';
  galleryContainer.classList.remove("hidden");

  // Fetch imágenes
  const images = await fetchCategoryImages(categoryPath);

  if (images.length === 0) {
    galleryGrid.innerHTML =
      '<div class="col-span-full text-center py-8 text-[#0F2435]">No hay imágenes disponibles en esta categoría.</div>';
    return;
  }

  // Renderizar imágenes
  galleryGrid.innerHTML = "";
  images.forEach((imagePath) => {
    const wrapper = document.createElement("div");
    wrapper.className =
      "gallery-item relative group overflow-hidden rounded-xl aspect-square cursor-pointer";

    const img = document.createElement("img");
    img.src = imagePath;
    img.alt = "Gallery image";
    img.loading = "lazy";
    img.className =
      "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110";

    // Lightbox al hacer click
    wrapper.addEventListener("click", () => openImageLightbox(imagePath));

    const overlay = document.createElement("div");
    overlay.className =
      "absolute inset-0 bg-[#0F2435]/0 group-hover:bg-[#0F2435]/50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100";
    overlay.innerHTML =
      '<i data-feather="maximize-2" class="w-8 h-8 text-white"></i>';

    wrapper.appendChild(img);
    wrapper.appendChild(overlay);
    galleryGrid.appendChild(wrapper);
  });

  // Re-inicializar Feather icons
  feather.replace();
}

// Función para abrir lightbox de imagen
function openImageLightbox(imagePath) {
  const lightbox = document.createElement("div");
  lightbox.className =
    "fixed inset-0 z-[60] bg-black bg-opacity-90 flex items-center justify-center p-4 animate-fade-in";
  lightbox.innerHTML = `
    <div class="relative max-w-4xl max-h-[90vh] flex items-center justify-center">
      <img src="${imagePath}" alt="Lightbox image" class="max-w-full max-h-[90vh] object-contain rounded-xl">
      <button class="absolute top-2 right-2 text-white hover:text-[#46C5C8] transition-colors z-[70]" id="close-lightbox">
        <i data-feather="x" class="w-8 h-8"></i>
      </button>
    </div>
  `;
  document.body.appendChild(lightbox);
  feather.replace();

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.closest("#close-lightbox")) {
      lightbox.remove();
    }
  });
}

// Botones de categoría
document.querySelectorAll(".category-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const categoryKey = btn.dataset.category;
    const categoryPath = showcaseCategories[categoryKey];
    openGallery(categoryPath);
  });
});

// Cerrar galería modal
const galleryClose = document.getElementById("gallery-close");
if (galleryClose) {
  galleryClose.addEventListener("click", () => {
    document.getElementById("gallery-container").classList.add("hidden");
  });
}

// Cerrar galería al hacer click fuera
document.getElementById("gallery-container")?.addEventListener("click", (e) => {
  if (e.target.id === "gallery-container") {
    document.getElementById("gallery-container").classList.add("hidden");
  }
});

// Cerrar galería con ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const galleryContainer = document.getElementById("gallery-container");
    if (galleryContainer && !galleryContainer.classList.contains("hidden")) {
      galleryContainer.classList.add("hidden");
    }
  }
});

// =============================
// Envío del formulario de contacto
// =============================
const contactForm = document.getElementById("contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const name = document.getElementById("name")?.value?.trim();
    const email = document.getElementById("email")?.value?.trim();
    const phone = document.getElementById("phone")?.value?.trim();
    const message = document.getElementById("message")?.value?.trim();

    if (!name || !email || !message) {
      alert(
        "Por favor completa los campos requeridos: Nombre, Correo y Mensaje."
      );
      return;
    }

    const payload = { name, email, phone, message };

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add("opacity-60");
    }

    try {
      const resp = await fetch("/api/contact.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        const serverMsg = err.details || err.error || err.message;
        throw new Error(serverMsg || "Error enviando el formulario");
      }

      const data = await resp.json();
      alert(data.message || "Mensaje enviado correctamente.");
      contactForm.reset();
    } catch (err) {
      console.error("Contact form error:", err);
      alert(
        "Ocurrió un error al enviar el mensaje. Revisa la consola o intenta más tarde."
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove("opacity-60");
      }
    }
  });
}
