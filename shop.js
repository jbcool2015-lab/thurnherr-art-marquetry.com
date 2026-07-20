(function () {
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
    { id: "all", label: "Tout" },
    { id: "automobile", label: "Automobile" },
    { id: "animalier", label: "Animalier" },
    { id: "armoiries", label: "Armoiries" },
    { id: "echiquier", label: "Échiquier" },
    { id: "horlogerie", label: "Horlogerie" },
    { id: "nautique", label: "Nautique" },
  ];

  const money = new Intl.NumberFormat("fr-FR", {
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

  function getSectionImage(section, index) {
    const image = section.querySelector("img[data-src], img[src]");
    if (!image) return fallbackImages[index % fallbackImages.length];
    return image.getAttribute("data-src") || image.getAttribute("src") || fallbackImages[index % fallbackImages.length];
  }

  function getSectionImages(section, index) {
    const images = Array.from(section.querySelectorAll("img[data-src], img[src]"));
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

  const SOLD_SLUGS = new Set([
    "armoiriemonaco", "monacogp", "casino", "chat", "dog", "riva3", "riva2", "porscheprince", "astonmartin1",
    "bugatti3", "bugatti4", "bugatti5", "bugatti6", "lotussuperseven", "porschegt3rs", "bonhomme", "jaguar"
  ]);

  const HIDDEN_SLUGS = new Set([
    "astonmartin1", "bonhomme", "chat", "lotussuperseven", "riva2", "bugatti4"
  ]);

  function getAvailability(slug, title, description) {
    if (SOLD_SLUGS.has(slug)) return "Collection privée";
    const haystack = `${title} ${description}`.toLowerCase();
    if (/collection sas|prince albert|collection priv/.test(haystack)) return "Collection privée";
    return "Disponible";
  }

  const ECHIQUIER_SLUGS = new Set([
    "echiquiermonaco", "lemans70blanc", "lemans70noir",
    "hondaferrari", "monacogp", "hondamclaren"
  ]);

  const ANIMALIER_SLUGS = new Set(["bonhomme"]);

  function productCategory(slug, title, description) {
    if (ECHIQUIER_SLUGS.has(slug)) return "echiquier";
    if (ANIMALIER_SLUGS.has(slug)) return "animalier";
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
      const description = details.description || "Œuvre unique en marqueterie d'art.";

      seen.add(slug);
      products.push({
        availability: getAvailability(slug, title, description),
        category: productCategory(slug, title, description),
        description,
        id: slug,
        image,
        price: 0,
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
        description: details.description || "Œuvre unique en marqueterie d'art.",
        id: slug,
        image: details.image,
        images: DIPTYCH_SLUGS.has(slug) ? getSectionImages(section, products.length) : null,
        price: 0,
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

    filters.innerHTML = categories
      .map((category) => {
        const active = category.id === state.category ? " is-active" : "";
        return `<button class="shop-filter${active}" type="button" data-category="${category.id}">${category.label}</button>`;
      })
      .join("");
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
    result.textContent = `${count} oeuvre${count > 1 ? "s" : ""}`;
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
        const media = isDiptych
          ? `<div class="shop-media" style="display:grid;grid-template-columns:1fr 1fr;gap:2px">
              ${product.images.map((src) => `<img src="${src}" alt="${product.title}" loading="lazy" style="aspect-ratio:1;width:100%;object-fit:cover;padding:0.6rem">`).join("")}
            </div>`
          : `<div class="shop-media"><img src="${product.image}" alt="${product.title}" loading="lazy"></div>`;
        return `
          <article class="shop-card${isDiptych ? " is-featured" : ""}" style="cursor:pointer" onclick="location.href='${product.url}'">
            ${media}
            <div class="shop-card-body">
              <div class="shop-product-label">${categories.find((category) => category.id === product.category)?.label || "Pièce unique"}</div>
              <h3>${product.title}${isDiptych ? ' <span style="font-family:Alata,sans-serif;font-size:0.65rem;letter-spacing:0.12rem;color:rgba(201,169,110,0.55);font-weight:400;text-transform:uppercase;vertical-align:middle;margin-left:0.5rem">Diptyque</span>' : ''}</h3>
              <div class="shop-actions">
                <div class="shop-availability ${product.availability === 'Collection privée' ? 'is-sold' : 'is-available'}">${product.availability}</div>
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
      list.innerHTML = '<div class="shop-empty">Votre panier est vide.</div>';
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
            <button class="cart-remove" type="button" data-remove="${index}">Retirer</button>
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
      alert("Paiement simulé : aucune transaction réelle n'a été effectuée.");
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeCart();
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
  }

  function hydrateDeferredImages() {
    document.querySelectorAll("img[data-src]").forEach((image) => {
      const realSource = image.getAttribute("data-src");
      if (!realSource) return;
      image.setAttribute("src", realSource);
      image.closest(".deferred")?.classList.remove("deferred", "loading");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initShop);
  } else {
    initShop();
  }
})();
