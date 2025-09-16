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
// --- FILTRO PORTAFOLIO ---
const filterButtons = document.querySelectorAll("#portfolio button");
const portfolioItems = document.querySelectorAll(".portfolio-item");
const itemsPerPage = 6;
let currentPage = 1;
let currentFilter = "todos";

function showItems() {
  // Filtrar
  let visibleItems = [...portfolioItems].filter((item) => {
    return currentFilter === "todos" || item.dataset.category === currentFilter;
  });

  // Ocultar todos
  portfolioItems.forEach((item) => (item.style.display = "none"));

  // Mostrar los de la página actual
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  visibleItems
    .slice(start, end)
    .forEach((item) => (item.style.display = "block"));

  // Mostrar/ocultar botón "Ver más"
  const loadMoreBtn = document.getElementById("loadMore");
  if (end < visibleItems.length) {
    loadMoreBtn.style.display = "inline-flex";
  } else {
    loadMoreBtn.style.display = "none";
  }
}

// Botones de filtro
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.textContent.trim().toLowerCase();
    currentPage = 1;

    // Reset estilos
    filterButtons.forEach((b) => {
      b.classList.remove("bg-[#46C5C8]", "text-[#0F2435]");
      b.classList.add("bg-[#173447]", "text-white");
    });

    // Activar este
    btn.classList.add("bg-[#46C5C8]", "text-[#0F2435]");
    btn.classList.remove("bg-[#173447]", "text-white");

    showItems();
  });
});

// Botón "Ver más"
const loadMoreBtn = document.getElementById("loadMore");
if (loadMoreBtn) {
  loadMoreBtn.addEventListener("click", () => {
    currentPage++;
    showItems();
  });
}

// Inicializar
showItems();
