(function () {
  const LANG = document.documentElement.lang === "en" ? "en" : "fr";

  const I18N = {
    fr: {
      categories: {
        all: "Tout", automobile: "Automobile", animalier: "Animalier",
        armoiries: "Armoiries", echiquier: "Échiquier", horlogerie: "Horlogerie", nautique: "Nautique",
      },
      available: "Disponible",
      sold: "Collection privée",
      uniquePiece: "Pièce unique",
      defaultDescription: "Œuvre unique en marqueterie d'art.",
      diptych: "Diptyque",
      resultCount: (count) => `${count} œuvre${count > 1 ? "s" : ""}`,
      cartEmpty: "Votre panier est vide.",
      cartRemove: "Retirer",
      checkoutAlert: "Paiement simulé : aucune transaction réelle n'a été effectuée.",
      numberLocale: "fr-FR",
      contactSending: "Envoi en cours…",
      contactSuccess: "📬 Message envoyé — merci, Christophe vous répondra rapidement. N'oubliez pas de consulter votre boîte mail.",
      contactError: "Une erreur est survenue. Merci de réessayer ou d'écrire directement à christophe.thurnherr@gmail.com.",
      reproductionsLabel: "Reproductions du moment",
      acquisitionNotice: (title) => `Demande d'acquisition — ${title}`,
      acquisitionMessage: (title) => `Bonjour,\n\nJe souhaite acquérir l'œuvre « ${title} ». Merci de me recontacter pour connaître les modalités d'acquisition (devis, livraison).\n\n`,
      acquireCta: "Faire une offre d'acquisition",
    },
    en: {
      categories: {
        all: "All", automobile: "Automotive", animalier: "Wildlife",
        armoiries: "Heraldry", echiquier: "Chess", horlogerie: "Watchmaking", nautique: "Nautical",
      },
      available: "Available",
      sold: "Private collection",
      uniquePiece: "Unique piece",
      defaultDescription: "Unique marquetry artwork.",
      diptych: "Diptych",
      resultCount: (count) => `${count} artwork${count > 1 ? "s" : ""}`,
      cartEmpty: "Your cart is empty.",
      cartRemove: "Remove",
      checkoutAlert: "Simulated payment: no real transaction was made.",
      numberLocale: "en-GB",
      contactSending: "Sending…",
      contactSuccess: "📬 Message sent — thank you, Christophe will get back to you soon. Don't forget to check your inbox.",
      contactError: "Something went wrong. Please try again or email christophe.thurnherr@gmail.com directly.",
      reproductionsLabel: "Current Reproductions",
      acquisitionNotice: (title) => `Acquisition request — ${title}`,
      acquisitionMessage: (title) => `Hello,\n\nI would like to acquire the artwork "${title}". Please get back to me with the details on how to proceed (quote, delivery).\n\n`,
      acquireCta: "Make an acquisition offer",
    },
  };

  const EMAILJS_SERVICE_ID = "service_31yghwb";
  const EMAILJS_TEMPLATE_ID = "template_v0kshal";
  const EMAILJS_PUBLIC_KEY = "zyGCfqt_hMA-2YmhB";

  if (typeof emailjs !== "undefined") {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY, limitRate: { id: "contact-form", throttle: 10000 } });
  }

  const T = I18N[LANG];

  const CATEGORY_SECTIONS = new Set([
    "home",
    "galleryall",
    "armoiries",
    "artanimalier",
    "astonmartin",
    "bugatti",
    "echiquier",
    "ferrari",
    "formule1",
    "jaguar",
    "lamborghini",
    "mclaren",
    "mercedes",
    "omega",
    "porsche",
    "riva",
    "expo",
    "contact",
    "boutique",
    "expomonaco",
    "expogrimaldi2023",
    "exporetro",
    "expopeugeot",
    "exposchlumpf",
    "expobeaune",
    // Pages « Technique et mise en œuvre » : contenu éditorial, pas des œuvres
    "techarmoiries",
    "techleclerc",
    // Page d'annonce, pas une œuvre du catalogue
    "reproductions",
  ]);

  const fallbackImages = [
    "assets/images/card.jpg",
    "assets/images/gallery55/41c949da.webp",
    "assets/images/gallery56/a854f53b.webp",
    "assets/images/gallery57/35dd522f.webp",
    "assets/images/gallery58/8d19a300.webp",
  ];

  const state = {
    category: "all",
    cart: [],
    products: [],
    query: "",
    sort: "featured",
  };

  const categories = [
    { id: "all", label: T.categories.all },
    { id: "automobile", label: T.categories.automobile },
    { id: "animalier", label: T.categories.animalier },
    { id: "armoiries", label: T.categories.armoiries },
    { id: "echiquier", label: T.categories.echiquier },
    { id: "horlogerie", label: T.categories.horlogerie },
    { id: "nautique", label: T.categories.nautique },
  ];

  const money = new Intl.NumberFormat(T.numberLocale, {
    currency: "EUR",
    maximumFractionDigits: 0,
    style: "currency",
  });

  function cleanText(value) {
    const raw = (value || "")
      .replace(/\s+/g, " ")
      .replace(/^>\s*/, "")
      .trim();

    if (!/[ÃÂ]/.test(raw)) return raw;

    try {
      const bytes = Uint8Array.from(Array.from(raw, (char) => char.charCodeAt(0) & 255));
      return new TextDecoder("utf-8").decode(bytes);
    } catch (_error) {
      return raw;
    }
  }

  function slugFromSection(section) {
    return section.id.replace(/-section$/, "");
  }

  function getSectionText(section) {
    const nodes = Array.from(section.querySelectorAll("h1,h2,h3,p"));
    return nodes.map((node) => cleanText(node.textContent)).filter(Boolean);
  }

  // Images de mise en situation : visibles sur la fiche détail, exclues du catalogue
  const SHOP_IMAGE_SELECTOR = "img[data-src]:not([data-shop-exclude]), img[src]:not([data-shop-exclude])";

  function getSectionImage(section, index) {
    const image = section.querySelector(SHOP_IMAGE_SELECTOR);
    if (!image) return fallbackImages[index % fallbackImages.length];
    return image.getAttribute("data-src") || image.getAttribute("src") || fallbackImages[index % fallbackImages.length];
  }

  function getSectionImages(section, index) {
    const images = Array.from(section.querySelectorAll(SHOP_IMAGE_SELECTOR));
    if (!images.length) return [fallbackImages[index % fallbackImages.length]];
    return images.map((img) => img.getAttribute("data-src") || img.getAttribute("src")).filter(Boolean);
  }

  const DIPTYCH_SLUGS = new Set(["dyptique1"]);

  function makeTitle(slug, texts) {
    const candidate = texts[0] || prettifySlug(slug);
    const firstSentence = candidate.split(/[.!?]/)[0].trim();
    const compact = firstSentence.length > 72 ? firstSentence.slice(0, 69).trim() + "..." : firstSentence;
    return compact || prettifySlug(slug);
  }

  function prettifySlug(slug) {
    return slug
      .replace(/[0-9]+$/g, "")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
      .trim();
  }

  function simulatedPrice(index, title, description) {
    return 0;
  }

  // Prix affichés (en euros). Les œuvres absentes de cette table n'affichent pas de prix.
  const PRICES = new Map([
    ["f12rougesatine", 2800],
    ["f12berlinettabrillant", 2800],
    ["f12berlinetta2", 2800],
  ]);

  const SOLD_SLUGS = new Set([
    "armoiriemonaco", "monacogp", "casino", "chat", "dog", "riva3", "riva2", "porscheprince", "astonmartin1",
    "bugatti3", "bugatti4", "bugatti5", "lotussuperseven", "porschegt3rs", "bonhomme", "jaguar",
    "ferrarif12"
  ]);

  const HIDDEN_SLUGS = new Set([
    "astonmartin1", "bonhomme", "chat", "lotussuperseven", "riva2", "bugatti4", "jaguarxkr"
  ]);

  function getAvailability(slug, title, description) {
    if (SOLD_SLUGS.has(slug)) return T.sold;
    const haystack = `${title} ${description}`.toLowerCase();
    if (/collection sas|prince albert|collection priv|private collection/.test(haystack)) return T.sold;
    return T.available;
  }

  const ECHIQUIER_SLUGS = new Set([
    "echiquiermonaco", "lemans70blanc", "lemans70noir",
    "hondaferrari", "monacogp", "hondamclaren"
  ]);

  const ANIMALIER_SLUGS = new Set(["bonhomme"]);

  const ARMOIRIES_SLUGS = new Set(["trophee"]);

  function productCategory(slug, title, description) {
    if (ECHIQUIER_SLUGS.has(slug)) return "echiquier";
    if (ANIMALIER_SLUGS.has(slug)) return "animalier";
    if (ARMOIRIES_SLUGS.has(slug)) return "armoiries";
    const haystack = `${slug} ${title} ${description}`.toLowerCase();
    if (/echiquier|échiquier|chess/.test(haystack)) return "echiquier";
    if (/cheval|chat|dog|bouledogue|animal|persan|sang/.test(haystack)) return "animalier";
    if (/armoir/.test(haystack)) return "armoiries";
    if (/omega|moonwatch|watch|montre/.test(haystack)) return "horlogerie";
    if (/riva|boat|bateau|naut/.test(haystack)) return "nautique";
    if (/aston|bugatti|ferrari|formule|porsche|jaguar|lamborghini|mclaren|mercedes|honda|senna|prost|lemans|monaco|f12|f40|f1|sls|leclerc|casino|miami|sydney/.test(haystack)) {
      return "automobile";
    }
    return "automobile";
  }

  function collectProducts() {
    const sections = Array.from(document.querySelectorAll("section[id$='-section']"));
    const sectionDetails = new Map();

    sections.forEach((section, index) => {
        const slug = slugFromSection(section);
        const texts = getSectionText(section);
        const image = getSectionImage(section, index);

        const title = makeTitle(slug, texts);
        const descriptionSource = texts[0] === title ? texts.slice(1, 3) : texts.slice(0, 2);
        const description = descriptionSource.join(" ");

        sectionDetails.set(slug, { description, image, title });
    });

    const products = [];
    const seen = new Set();

    Array.from(document.querySelectorAll("a.thumbnail[href^='#']")).forEach((anchor, index) => {
      const slug = anchor.getAttribute("href").replace("#", "");
      if (!slug || slug === "header" || seen.has(slug) || HIDDEN_SLUGS.has(slug)) return;

      const img = anchor.querySelector("img[data-src], img[src]");
      const image = img?.getAttribute("data-src") || img?.getAttribute("src") || fallbackImages[index % fallbackImages.length];
      const details = sectionDetails.get(slug) || {};
      const title = details.title || prettifySlug(slug);
      const description = details.description || T.defaultDescription;

      seen.add(slug);
      products.push({
        availability: getAvailability(slug, title, description),
        category: productCategory(slug, title, description),
        description,
        id: slug,
        image,
        price: PRICES.get(slug) || 0,
        title,
        url: `#${slug}`,
      });
    });

    sections.forEach((section) => {
      const slug = slugFromSection(section);
      if (CATEGORY_SECTIONS.has(slug) || seen.has(slug) || HIDDEN_SLUGS.has(slug)) return;

      const details = sectionDetails.get(slug);
      if (!details?.image) return;

      seen.add(slug);
      products.push({
        availability: getAvailability(slug, details.title, details.description),
        category: productCategory(slug, details.title, details.description),
        description: details.description || T.defaultDescription,
        id: slug,
        image: details.image,
        images: DIPTYCH_SLUGS.has(slug) ? getSectionImages(section, products.length) : null,
        price: PRICES.get(slug) || 0,
        title: details.title,
        url: `#${slug}`,
      });
    });

    return products;
  }

  function ensureShopChrome() {
    const toolbar = document.querySelector(".shop-toolbar");
    if (!toolbar || document.querySelector("[data-shop-filters]")) return;

    const collectionBar = document.createElement("div");
    collectionBar.className = "shop-collection-bar";
    collectionBar.innerHTML = `
      <div class="shop-filters" data-shop-filters></div>
      <div class="shop-results" data-shop-results></div>
    `;
    toolbar.insertAdjacentElement("beforebegin", collectionBar);
  }

  function renderFilters() {
    const filters = document.querySelector("[data-shop-filters]");
    if (!filters) return;

    const categoryButtons = categories
      .map((category) => {
        const active = category.id === state.category ? " is-active" : "";
        return `<button class="shop-filter${active}" type="button" data-category="${category.id}">${category.label}</button>`;
      })
      .join("");

    filters.innerHTML = `${categoryButtons}<a href="#reproductions" class="shop-filter shop-filter-external">${T.reproductionsLabel}</a>`;
  }

  function productMatches(product) {
    const query = state.query.toLowerCase();
    const haystack = `${product.title} ${product.description}`.toLowerCase();
    const queryMatch = haystack.includes(query);
    const categoryMatch = state.category === "all" || product.category === state.category;
    return queryMatch && categoryMatch;
  }

  function updateResultCount(count) {
    const result = document.querySelector("[data-shop-results]");
    if (!result) return;
    result.textContent = T.resultCount(count);
  }

  function revealCards() {
    const cards = Array.from(document.querySelectorAll(".shop-card"));
    if (!("IntersectionObserver" in window)) {
      cards.forEach((card) => card.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    cards.forEach((card) => observer.observe(card));
  }

  function renderProducts() {
    const grid = document.querySelector("[data-shop-grid]");
    if (!grid) return;

    let products = state.products.filter(productMatches);

    if (state.sort === "price-asc") products = products.slice().sort((a, b) => a.price - b.price);
    if (state.sort === "price-desc") products = products.slice().sort((a, b) => b.price - a.price);
    if (state.sort === "name") products = products.slice().sort((a, b) => a.title.localeCompare(b.title));

    updateResultCount(products.length);

    grid.innerHTML = products
      .map((product, index) => {
        const isDiptych = product.images && product.images.length > 1;
        const categoryLabel = categories.find((category) => category.id === product.category)?.label;
        const productLabel = categoryLabel ? `${categoryLabel} · ${T.uniquePiece}` : T.uniquePiece;
        const media = isDiptych
          ? `<div class="shop-media" style="display:grid;grid-template-columns:1fr 1fr;gap:2px">
              ${product.images.map((src) => `<img src="${src}" alt="${product.title}" loading="lazy" style="aspect-ratio:1;width:100%;object-fit:cover;padding:0.6rem">`).join("")}
            </div>`
          : `<div class="shop-media"><img src="${product.image}" alt="${product.title}" loading="lazy"></div>`;
        return `
          <article class="shop-card${isDiptych ? " is-featured" : ""}" style="cursor:pointer" onclick="location.href='${product.url}'">
            ${media}
            <div class="shop-card-body">
              <div class="shop-product-label">${productLabel}</div>
              <h3>${product.title}${isDiptych ? ` <span style="font-family:Alata,sans-serif;font-size:0.65rem;letter-spacing:0.12rem;color:rgba(201,169,110,0.55);font-weight:400;text-transform:uppercase;vertical-align:middle;margin-left:0.5rem">${T.diptych}</span>` : ''}</h3>
              <div class="shop-actions">
                <div class="shop-availability ${product.availability === T.sold ? 'is-sold' : 'is-available'}">${product.availability}</div>
                ${product.price > 0 ? `<div class="shop-price">${money.format(product.price)}</div>` : ""}
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    revealCards();
  }

  function cartTotal() {
    return state.cart.reduce((sum, item) => sum + item.price, 0);
  }

  function renderCart() {
    const list = document.querySelector("[data-cart-list]");
    const count = document.querySelector("[data-cart-count]");
    const total = document.querySelector("[data-cart-total]");
    const checkoutButton = document.querySelector("[data-checkout-open]");
    const cartToggles = document.querySelectorAll("[data-cart-open]");

    if (count) count.textContent = String(state.cart.length);
    if (total) total.textContent = money.format(cartTotal());
    if (checkoutButton) checkoutButton.disabled = state.cart.length === 0;
    cartToggles.forEach((toggle) => {
      toggle.classList.toggle("is-hidden", state.cart.length === 0);
    });

    if (!list) return;
    if (state.cart.length === 0) {
      list.innerHTML = `<div class="shop-empty">${T.cartEmpty}</div>`;
      closeCart();
      return;
    }

    list.innerHTML = state.cart
      .map(
        (item, index) => `
          <div class="cart-line">
            <img src="${item.image}" alt="${item.title}">
            <div>
              <strong>${item.title}</strong>
              <span>${money.format(item.price)}</span>
            </div>
            <button class="cart-remove" type="button" data-remove="${index}">${T.cartRemove}</button>
          </div>
        `
      )
      .join("");
  }

  function addToCart(productId) {
    const product = state.products.find((item) => item.id === productId);
    if (!product) return;
    state.cart.push(product);
    renderCart();
    openCart();
  }

  function openCart() {
    document.querySelector("[data-cart-modal]")?.classList.add("is-open");
    document.body.classList.add("shop-cart-open");
  }

  function closeCart() {
    document.querySelector("[data-cart-modal]")?.classList.remove("is-open");
    document.body.classList.remove("shop-cart-open");
  }

  function initEvents() {
    document.addEventListener("click", (event) => {
      const add = event.target.closest("[data-add]");
      if (add) addToCart(add.getAttribute("data-add"));

      const remove = event.target.closest("[data-remove]");
      if (remove) {
        state.cart.splice(Number(remove.getAttribute("data-remove")), 1);
        renderCart();
      }

      if (event.target.closest("[data-cart-open]")) openCart();
      if (event.target.closest("[data-cart-close]")) closeCart();
      if (event.target.matches("[data-cart-modal]")) closeCart();

      const category = event.target.closest("[data-category]");
      if (category) {
        state.category = category.getAttribute("data-category");
        renderFilters();
        renderProducts();
      }

      if (event.target.closest("[data-checkout-open]")) {
        document.querySelector("[data-checkout-form]")?.classList.add("is-open");
      }

      const acquire = event.target.closest("[data-acquire]");
      if (acquire) openAcquisitionRequest(acquire.getAttribute("data-acquire"));
    });

    document.querySelector("[data-shop-search]")?.addEventListener("input", (event) => {
      state.query = event.target.value;
      renderProducts();
    });

    document.querySelector("[data-shop-sort]")?.addEventListener("change", (event) => {
      state.sort = event.target.value;
      renderProducts();
    });

    document.querySelector("[data-checkout-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      alert(T.checkoutAlert);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeCart();
    });
  }

  function injectAcquisitionButtons() {
    state.products.forEach((product) => {
      if (product.availability === T.sold) return;
      const section = document.getElementById(`${product.id}-section`);
      if (!section) return;
      const backLink = section.querySelector(".detail-back");
      if (!backLink || section.querySelector(".detail-acquire")) return;
      backLink.insertAdjacentHTML(
        "beforebegin",
        `<a href="#contact" class="detail-back detail-acquire" data-acquire="${product.title}">${T.acquireCta}</a>`
      );
    });
  }

  function injectAvailabilityBadges() {
    state.products.forEach((product) => {
      const section = document.getElementById(`${product.id}-section`);
      if (!section) return;
      const title = section.querySelector(".detail-title");
      if (!title || section.querySelector(".detail-availability-badge")) return;
      const badgeClass = product.availability === T.sold ? "is-sold" : "is-available";
      title.insertAdjacentHTML(
        "afterend",
        `<div class="shop-availability ${badgeClass} detail-availability-badge">${product.availability}</div>`
      );
    });
  }

  function initShop() {
    hydrateDeferredImages();
    const shop = document.querySelector("#boutique-section");
    if (!shop) return;
    state.products = collectProducts();
    ensureShopChrome();
    renderFilters();
    renderProducts();
    renderCart();
    initEvents();
    injectAcquisitionButtons();
    injectAvailabilityBadges();
  }

  function openAcquisitionRequest(title) {
    const form = document.querySelector("#contact-form");
    if (!form) return;
    const messageField = form.querySelector('[name="message"]');
    if (messageField) messageField.value = T.acquisitionMessage(title);
    const notice = document.querySelector("[data-acquisition-notice]");
    if (notice) {
      notice.textContent = T.acquisitionNotice(title);
      notice.style.display = "block";
    }
    location.hash = "contact";
    requestAnimationFrame(() => form.querySelector('[name="name"]')?.focus());
  }

  function initContactForm() {
    const form = document.querySelector("#contact-form");
    if (!form) return;
    const status = form.querySelector("[data-contact-status]");
    const button = form.querySelector('button[type="submit"]');
    const defaultButtonText = button ? button.textContent : "";

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!status) return;

      if (typeof emailjs === "undefined") {
        status.textContent = T.contactError;
        status.classList.remove("is-success");
        status.classList.add("is-error");
        return;
      }

      const params = {
        from_name: form.querySelector('[name="name"]')?.value || "",
        from_email: form.querySelector('[name="email"]')?.value || "",
        phone: form.querySelector('[name="phone"]')?.value || "",
        message: form.querySelector('[name="message"]')?.value || "",
      };

      status.classList.remove("is-success", "is-error");
      status.textContent = T.contactSending;
      if (button) { button.disabled = true; button.textContent = T.contactSending; }

      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params)
        .then(() => {
          status.textContent = T.contactSuccess;
          status.classList.add("is-success");
          form.reset();
        })
        .catch(() => {
          status.textContent = T.contactError;
          status.classList.add("is-error");
        })
        .finally(() => {
          if (button) { button.disabled = false; button.textContent = defaultButtonText; }
        });
    });
  }

  function hydrateDeferredImages() {
    document.querySelectorAll("img[data-src]").forEach((image) => {
      const realSource = image.getAttribute("data-src");
      if (!realSource) return;
      image.setAttribute("src", realSource);
      image.closest(".deferred")?.classList.remove("deferred", "loading");
    });
  }

  function init() {
    initShop();
    initContactForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
