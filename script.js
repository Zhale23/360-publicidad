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

const swiper = new Swiper(".hero-swiper", {
  effect: "coverflow",
  centeredSlides: true,
  loop: true,
  slidesPerView: "auto",
  spaceBetween: 50,

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
  // Primero muteamos todos los videos
  document.querySelectorAll(".hero-swiper video").forEach((video) => {
    video.muted = true;
    video.pause(); // opcional, si no quieres que sigan corriendo en silencio
  });

  // Ahora obtenemos el slide activo
  const activeSlide = swiper.slides[swiper.activeIndex];
  const activeVideo = activeSlide.querySelector("video");

  if (activeVideo) {
    activeVideo.muted = false;
    activeVideo.play().catch((err) => {
      console.log("El navegador bloqueó el autoplay con sonido:", err);
    });
  }
});
// --- FILTRO PORTAFOLIO (versión dinámica y paginada) ---
const filtersContainer = document.getElementById("portfolio-filters");
const filterButtons = filtersContainer ? filtersContainer.querySelectorAll("button[data-filter]") : [];
const grid = document.getElementById("portfolio-grid");
const loadMoreBtn = document.getElementById("loadMore");

const itemsPerPage = 8; // número de items por carga
let currentPage = 1;
let currentFilter = "todos";

// Datos del portafolio (puedes ampliar/editar según los archivos en /media)
const portfolioData = [
  { src: "media/avisos-luminosos-acrilico.png", title: "Aviso luminoso en acrilico", category: "avisos" },
  { src: "media/avisos-luminosos-acrilico (2).png", title: "Aviso luminoso en acrilico", category: "avisos" },
  { src: "media/avisos-en-acrilico.png", title: "Aviso en acrilico", category: "avisos" },
  { src: "media/avisos-en-acrilico (2).png", title: "Aviso en acrilico", category: "avisos" },
  { src: "media/avisos-en-acrilico (3).png", title: "Aviso en acrilico", category: "avisos" },
  { src: "media/vinilo-decorativo (2).png", title: "Vinilo decorativo", category: "vinilos" },
  { src: "media/aviso-neon.png", title: "Letrero de Neón", category: "neón" },
  { src: "media/m-POP.png", title: "Material POP", category: "pop" },
  { src: "media/m-POP-2.png", title: "Material POP", category: "pop" },
  { src: "media/m-POP-3.png", title: "Material POP", category: "pop" },
  { src: "media/m-POP-4.png", title: "Material POP", category: "pop" },
  { src: "media/m-POP-5.png", title: "Material POP", category: "pop" },
  { src: "media/señal.png", title: "Señal en acrílico", category: "señalización" },
  { src: "media/señal-3.png", title: "Señal en acrílico", category: "señalización" },
  { src: "media/señal-2.png", title: "Señal en poliéster", category: "señalización" },
  { src: "media/stand-custom.png", title: "Stand Custom", category: "stands" },
  { src: "media/stand-custom (2).png", title: "Stand Custom", category: "stands" },
  { src: "media/stand-modular.png", title: "Stand Modular", category: "stands" },
  { src: "media/stand-portatil.png", title: "Stand Portatil", category: "stands" },
  { src: "media/papeleria1.png", title: "Imantados", category: "papelería comercial" },
  { src: "media/papeleria2.png", title: "Trípticos", category: "papelería comercial" },
  { src: "media/papeleria3.png", title: "Volantes", category: "papelería comercial" },
  { src: "media/papeleria4.png", title: "Manillas", category: "papelería comercial" },
  { src: "media/papeleria5.png", title: "Stickers", category: "papelería comercial" },
  { src: "media/papeleria6.png", title: "Abanicos", category: "papelería comercial" },
  { src: "media/papeleria6 (2).png", title: "Tarjetas de presentacion", category: "papelería comercial" },
  { src: "media/papeleria7.png", title: "Talonarios", category: "papelería comercial" }
];

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
    return normalizedFilter === "todos" || normalizeKey(item.category) === normalizedFilter;
  });

  const start = (currentPage - 1) * itemsPerPage;
  const pageItems = filtered.slice(start, start + itemsPerPage);

  // Render
  if (currentPage === 1) grid.innerHTML = "";
  pageItems.forEach((it) => {
    const wrapper = document.createElement("div");
    wrapper.className = "portfolio-item relative group overflow-hidden rounded-2xl";
    wrapper.setAttribute("data-category", it.category);

    const aspect = document.createElement("div");
    aspect.className = "aspect-w-4 aspect-h-3";

    const img = document.createElement("img");
    img.src = it.src;
    img.alt = it.title;
    img.loading = "lazy";
    img.className = "w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-110";

    aspect.appendChild(img);

    const overlay = document.createElement("div");
    overlay.className = "absolute inset-0 bg-[#0F2435]/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300";
    overlay.innerHTML = `<h3 class="text-xl font-bold text-white">${it.title}</h3>`;

    wrapper.appendChild(aspect);
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

// Inicializar
renderGallery();
