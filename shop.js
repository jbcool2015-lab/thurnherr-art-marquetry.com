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
      numberLocale: "fr-FR",
      contactSending: "Envoi en cours…",
      contactSuccess: "📬 Message envoyé — merci, Christophe vous répondra rapidement. N'oubliez pas de consulter votre boîte mail.",
      contactError: "Une erreur est survenue. Merci de réessayer ou d'écrire directement à christophe.thurnherr@gmail.com.",
      reproductionsLabel: "Reproductions du moment",
      acquisitionNotice: (title) => `Demande d'acquisition — ${title}`,
      acquisitionMessage: (title) => `Bonjour,\n\nJe souhaite en savoir plus sur l'œuvre « ${title} ». Merci de m'envoyer les modalités d'acquisition (prix, fiche technique détaillée, livraison, etc.).\n\n`,
      acquireCta: "Faire une offre d'acquisition",
      guarantees: ["Certificat d'authenticité inclus", "Livraison assurée et sécurisée"],
      viewAcquireCta: "Voir & Acquérir",
      galleryPrev: "Photo précédente",
      galleryNext: "Photo suivante",
      galleryDot: (n, total) => `Photo ${n} / ${total}`,
      orderSuccess: "📬 Demande de commande envoyée — merci, Christophe vous recontactera rapidement pour finaliser votre commande. N'oubliez pas de consulter votre boîte mail.",
      orderThrottled: "Merci de patienter quelques secondes avant de renvoyer votre demande.",
      orderCaptchaMissing: "Merci de valider le captcha avant d'envoyer votre demande.",
      orderPaymentMissing: "Merci de choisir un mode de paiement.",
      paypalConfirmTitle: "Redirection PayPal",
      paypalConfirmBody: "Une fenêtre PayPal s'est ouverte.<br>Une fois le paiement effectué, Christophe vous confirmera votre commande par email.",
      bankConfirmTitle: "Demande reçue",
      bankConfirmBody: "Christophe a bien reçu votre demande.<br>Consultez vos emails — il vous transmettra son RIB pour procéder au virement.<br><br>Votre commande sera confirmée dès réception du paiement.",
      orderMessage: (d) => `Commande de reproduction — ${d.title}\n\nPrénom : ${d.firstName}\nNom : ${d.lastName}\nEmail : ${d.email}\nTéléphone : ${d.phone}\nAdresse : ${d.street}, ${d.zip} ${d.city}, ${d.country}\nMode de paiement : Virement bancaire`,
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
      numberLocale: "en-GB",
      contactSending: "Sending…",
      contactSuccess: "📬 Message sent — thank you, Christophe will get back to you soon. Don't forget to check your inbox.",
      contactError: "Something went wrong. Please try again or email christophe.thurnherr@gmail.com directly.",
      reproductionsLabel: "Current Reproductions",
      acquisitionNotice: (title) => `Acquisition request — ${title}`,
      acquisitionMessage: (title) => `Hello,\n\nI would like to know more about the artwork "${title}". Please send me the details on how to proceed (price, full technical sheet, delivery, etc.).\n\n`,
      acquireCta: "Make an acquisition offer",
      guarantees: ["Certificate of authenticity included", "Insured, secure delivery"],
      viewAcquireCta: "View & Acquire",
      galleryPrev: "Previous photo",
      galleryNext: "Next photo",
      galleryDot: (n, total) => `Photo ${n} / ${total}`,
      orderSuccess: "📬 Order request sent — thank you, Christophe will get back to you shortly to finalize your order. Don't forget to check your inbox.",
      orderThrottled: "Please wait a few seconds before sending your request again.",
      orderCaptchaMissing: "Please validate the captcha before sending your request.",
      orderPaymentMissing: "Please choose a payment method.",
      paypalConfirmTitle: "Redirecting to PayPal",
      paypalConfirmBody: "A PayPal window has opened.<br>Once payment is complete, Christophe will confirm your order by email.",
      bankConfirmTitle: "Request received",
      bankConfirmBody: "Christophe has received your request.<br>Check your inbox — he'll send his bank details to complete the transfer.<br><br>Your order will be confirmed once payment is received.",
      orderMessage: (d) => `Reproduction order — ${d.title}\n\nFirst name: ${d.firstName}\nLast name: ${d.lastName}\nEmail: ${d.email}\nPhone: ${d.phone}\nAddress: ${d.street}, ${d.zip} ${d.city}, ${d.country}\nPayment method: Bank transfer`,
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

  // Vignettes légères pour la grille catalogue (générées par
  // generate_catalog_thumbs.py), distinctes des fichiers pleine résolution
  // utilisés sur les fiches détail. Clé = chemin de la fiche détail (sans
  // domaine ni query string) ; valeur = chemin de la vignette + ?v=hash.
  // __CATALOG_THUMBS_START__
  const CATALOG_THUMBS = {
    "assets/Aventador Miami Book.webp": "assets/Aventador Miami Book-thumb.webp?v=d3991f94fa",
    "assets/Ferrari F12 Steve USA.  Marquetry no varnish N\u00b04.webp": "assets/Ferrari F12 Steve USA.  Marquetry no varnish N\u00b04-thumb.webp?v=cc1a950fb7",
    "assets/MA-230221191642-6874.webp": "assets/MA-230221191642-6874-thumb.webp?v=9588f3c489",
    "assets/PEUGEOT-208-01 _3.webp": "assets/PEUGEOT-208-01 _3-thumb.webp?v=73bac48da1",
    "assets/Porsche 911 GT3 RS 78X58CM.webp": "assets/Porsche 911 GT3 RS 78X58CM-thumb.webp?v=57be75946b",
    "assets/Troph\u00e9e Book.webp": "assets/Troph\u00e9e Book-thumb.webp?v=080802a02d",
    "assets/d.webp": "assets/d-thumb.webp?v=0d89010c81",
    "assets/images/Ferrari_Monaco_bureau_sans_logo.webp": "assets/images/Ferrari_Monaco_bureau_sans_logo-thumb.webp?v=150eec613c",
    "assets/images/Lamborghini_marquetry_salon_sans_logo_2.webp": "assets/images/Lamborghini_marquetry_salon_sans_logo_2-thumb.webp?v=831cad6e0e",
    "assets/images/RedBull_RB8_salon_sans_logo_1.webp": "assets/images/RedBull_RB8_salon_sans_logo_1-thumb.webp?v=94d210946c",
    "assets/images/armoiries-princieres-monaco.webp": "assets/images/armoiries-princieres-monaco-thumb.webp?v=bff46a7460",
    "assets/images/bugatti-type55-roadster-1932.webp": "assets/images/bugatti-type55-roadster-1932-thumb.webp?v=07b7d7fecd",
    "assets/images/bugatti-vision-gt-detail.webp": "assets/images/bugatti-vision-gt-detail-thumb.webp?v=b31e20393b",
    "assets/images/echiquier-plaque-inox-gravee-detail.webp": "assets/images/echiquier-plaque-inox-gravee-detail-thumb.webp?v=de534b14af",
    "assets/images/echiquier-plaque-inox-gravee.webp": "assets/images/echiquier-plaque-inox-gravee-thumb.webp?v=11e2f99bd2",
    "assets/images/echiquier-verso-plaque-inox.webp": "assets/images/echiquier-verso-plaque-inox-thumb.webp?v=58ae0e091a",
    "assets/images/ferrari-f12-berlinetta-brillant.webp": "assets/images/ferrari-f12-berlinetta-brillant-thumb.webp?v=c76068a812",
    "assets/images/ferrari-f12-berlinetta-satine-2.webp": "assets/images/ferrari-f12-berlinetta-satine-2-thumb.webp?v=34460c111a",
    "assets/images/ferrari-f12-berlinetta-satine-rouge.webp": "assets/images/ferrari-f12-berlinetta-satine-rouge-thumb.webp?v=ad3066d235",
    "assets/images/gallery55/41c949da.webp": "assets/images/gallery55/41c949da-thumb.webp?v=49c5a94ec1",
    "assets/images/gallery55/c184f4ad.webp": "assets/images/gallery55/c184f4ad-thumb.webp?v=46200f734c",
    "assets/images/gallery55/f673b1d2.webp": "assets/images/gallery55/f673b1d2-thumb.webp?v=db804171e2",
    "assets/images/gallery56/45e58e1d.webp": "assets/images/gallery56/45e58e1d-thumb.webp?v=d176e0869b",
    "assets/images/gallery56/d26ad77f.webp": "assets/images/gallery56/d26ad77f-thumb.webp?v=fb87dde9ba",
    "assets/images/gallery57/81cc2283.webp": "assets/images/gallery57/81cc2283-thumb.webp?v=0e1b8df146",
    "assets/images/gallery58/2a8e719d.webp": "assets/images/gallery58/2a8e719d-thumb.webp?v=bfa4f7e58c",
    "assets/images/gallery58/3f73f3d0.webp": "assets/images/gallery58/3f73f3d0-thumb.webp?v=236d75ba87",
    "assets/images/image02.webp": "assets/images/image02-thumb.webp?v=3b35627746",
    "assets/images/image07.webp": "assets/images/image07-thumb.webp?v=90d456825b",
    "assets/images/image11.webp": "assets/images/image11-thumb.webp?v=fb71bda595",
    "assets/images/image12.webp": "assets/images/image12-thumb.webp?v=aa8ef0d995",
    "assets/images/image14.webp": "assets/images/image14-thumb.webp?v=1ab6fa1d09",
    "assets/images/image15.webp": "assets/images/image15-thumb.webp?v=8c280bbe56",
    "assets/images/image16.webp": "assets/images/image16-thumb.webp?v=62b938ea23",
    "assets/images/image17.webp": "assets/images/image17-thumb.webp?v=9917e8510e",
    "assets/images/image19.webp": "assets/images/image19-thumb.webp?v=df04a8e44f",
    "assets/images/image20.webp": "assets/images/image20-thumb.webp?v=925d1f9e11",
    "assets/images/image21.webp": "assets/images/image21-thumb.webp?v=111faf1f6d",
    "assets/images/image22.webp": "assets/images/image22-thumb.webp?v=df0d46a370",
    "assets/images/image23.webp": "assets/images/image23-thumb.webp?v=b8f460e7df",
    "assets/images/image24.webp": "assets/images/image24-thumb.webp?v=9316a9aff0",
    "assets/images/image26.webp": "assets/images/image26-thumb.webp?v=9434352f6e",
    "assets/images/image27.webp": "assets/images/image27-thumb.webp?v=b481a88335",
    "assets/images/image28.webp": "assets/images/image28-thumb.webp?v=cffb2c5ea8",
    "assets/images/image31.webp": "assets/images/image31-thumb.webp?v=c1d46a39b2",
    "assets/images/image32.webp": "assets/images/image32-thumb.webp?v=5a5ba24b69",
    "assets/images/image35.webp": "assets/images/image35-thumb.webp?v=5c2372656c",
    "assets/images/jaguar-xkr-vernis-brillant-80x40cm.webp": "assets/images/jaguar-xkr-vernis-brillant-80x40cm-thumb.webp?v=edd135ff83",
    "assets/images/pur-sang-arabe-111x87cm.webp": "assets/images/pur-sang-arabe-111x87cm-thumb.webp?v=47757ce329",
  };
// __CATALOG_THUMBS_END__

  function thumbSrc(src) {
    if (!src) return src;
    const isAbsolute = src.charAt(0) === "/";
    const clean = (isAbsolute ? src.slice(1) : src).split("?")[0];
    const thumb = CATALOG_THUMBS[clean];
    if (!thumb) return src;
    return isAbsolute ? "/" + thumb : thumb;
  }

  const state = {
    category: "all",
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

  function escapeAttr(value) {
    return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
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

      const isDiptychSlug = DIPTYCH_SLUGS.has(slug);
      const sectionImages = isDiptychSlug ? null : getSectionImages(section, products.length);

      seen.add(slug);
      products.push({
        availability: getAvailability(slug, details.title, details.description),
        category: productCategory(slug, details.title, details.description),
        description: details.description || T.defaultDescription,
        gallery: sectionImages && sectionImages.length > 1 ? sectionImages : null,
        id: slug,
        image: details.image,
        images: isDiptychSlug ? getSectionImages(section, products.length) : null,
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

  // Vignette catalogue à plusieurs photos : seule la 1ère est chargée
  // d'emblée (data-src pour les suivantes, chargées à la demande au 1er
  // changement de photo) pour ne pas alourdir le chargement de la grille.
  function cardGalleryMedia(product) {
    const slides = product.gallery
      .map((src, i) => {
        const thumb = thumbSrc(src);
        const attr = i === 0 ? `src="${thumb}"` : `data-src="${thumb}"`;
        return `<div class="detail-gallery-slide"><img ${attr} alt="${product.title}" loading="lazy"></div>`;
      })
      .join("");

    return `
      <div class="shop-media">
        <div class="detail-gallery detail-gallery--card" data-card-gallery>
          <div class="detail-gallery-track">${slides}</div>
          <button type="button" class="detail-gallery-nav detail-gallery-prev" data-gallery-prev aria-label="${T.galleryPrev}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>
          <button type="button" class="detail-gallery-nav detail-gallery-next" data-gallery-next aria-label="${T.galleryNext}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>
          <div class="detail-gallery-dots" data-gallery-dots></div>
        </div>
      </div>`;
  }

  function initCardGalleries(root) {
    root.querySelectorAll("[data-card-gallery]").forEach((gallery) => {
      const track = gallery.querySelector(".detail-gallery-track");
      const slides = Array.prototype.slice.call(gallery.querySelectorAll(".detail-gallery-slide"));
      const dotsWrap = gallery.querySelector("[data-gallery-dots]");
      const prevBtn = gallery.querySelector("[data-gallery-prev]");
      const nextBtn = gallery.querySelector("[data-gallery-next]");
      let index = 0;

      const dots = slides.map((_slide, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "detail-gallery-dot" + (i === 0 ? " is-active" : "");
        dot.setAttribute("aria-label", T.galleryDot(i + 1, slides.length));
        dot.addEventListener("click", (event) => {
          event.stopPropagation();
          goTo(i);
        });
        dotsWrap.appendChild(dot);
        return dot;
      });

      function goTo(i) {
        index = (i + slides.length) % slides.length;
        const img = slides[index].querySelector("img");
        if (img && img.dataset.src && !img.src) img.src = img.dataset.src;
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((dot, di) => dot.classList.toggle("is-active", di === index));
      }

      if (prevBtn) {
        prevBtn.addEventListener("click", (event) => {
          event.stopPropagation();
          goTo(index - 1);
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener("click", (event) => {
          event.stopPropagation();
          goTo(index + 1);
        });
      }

      // Glisser change de photo sans ouvrir la fiche œuvre (la carte entière
      // navigue au clic simple) : on avale le clic de synthèse qui suit un swipe.
      let touchStartX = null;
      let didSwipe = false;
      gallery.addEventListener("touchstart", (event) => {
        touchStartX = event.touches[0].clientX;
        didSwipe = false;
      }, { passive: true });
      gallery.addEventListener("touchmove", (event) => {
        if (touchStartX === null) return;
        if (Math.abs(event.touches[0].clientX - touchStartX) > 10) didSwipe = true;
      }, { passive: true });
      gallery.addEventListener("touchend", (event) => {
        if (touchStartX === null) return;
        const dx = event.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 40) {
          goTo(dx < 0 ? index + 1 : index - 1);
          didSwipe = true;
        }
        touchStartX = null;
      }, { passive: true });
      gallery.addEventListener("click", (event) => {
        if (didSwipe) {
          event.preventDefault();
          event.stopPropagation();
          didSwipe = false;
        }
      });
    });
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
        const hasGallery = !isDiptych && product.gallery && product.gallery.length > 1;
        const categoryLabel = categories.find((category) => category.id === product.category)?.label;
        const productLabel = categoryLabel ? `${categoryLabel} · ${T.uniquePiece}` : T.uniquePiece;
        const media = isDiptych
          ? `<div class="shop-media" style="display:grid;grid-template-columns:1fr 1fr;gap:2px">
              ${product.images.map((src) => `<img src="${thumbSrc(src)}" alt="${product.title}" loading="lazy" style="aspect-ratio:1;width:100%;object-fit:cover;padding:0.6rem">`).join("")}
            </div>`
          : hasGallery
          ? cardGalleryMedia(product)
          : `<div class="shop-media"><img src="${thumbSrc(product.image)}" alt="${product.title}" loading="lazy"></div>`;
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
              ${product.availability !== T.sold ? `<a href="#contact" class="shop-button" style="width:100%" data-acquire-title="${escapeAttr(product.title)}" onclick="event.stopPropagation(); window.openAcquisitionRequest(this.dataset.acquireTitle)">${T.viewAcquireCta}</a>` : ""}
            </div>
          </article>
        `;
      })
      .join("");

    initCardGalleries(grid);
    revealCards();
  }

  function initEvents() {
    document.addEventListener("click", (event) => {
      const category = event.target.closest("[data-category]");
      if (category) {
        state.category = category.getAttribute("data-category");
        renderFilters();
        renderProducts();
      }

      const acquire = event.target.closest("[data-acquire]");
      if (acquire) openAcquisitionRequest(acquire.getAttribute("data-acquire"));

      const contactLink = event.target.closest('a[href="#contact"]');
      if (contactLink && !contactLink.hasAttribute("data-acquire") && !contactLink.hasAttribute("data-acquire-title")) {
        resetContactForm();
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
        `<a href="#contact" class="detail-back detail-acquire" data-acquire="${escapeAttr(product.title)}">${T.acquireCta}</a>`
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

  function injectGuarantees() {
    const checkIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg>';
    const items = T.guarantees.map((label) => `<li>${checkIcon}<span>${label}</span></li>`).join("");

    state.products.forEach((product) => {
      if (product.availability === T.sold) return;
      const section = document.getElementById(`${product.id}-section`);
      if (!section) return;
      const desc = section.querySelector(".detail-desc");
      if (!desc || section.querySelector(".detail-guarantees")) return;
      desc.insertAdjacentHTML("afterend", `<ul class="detail-guarantees">${items}</ul>`);
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
    initEvents();
    injectAcquisitionButtons();
    injectAvailabilityBadges();
    injectGuarantees();
  }

  function resetContactForm() {
    const form = document.querySelector("#contact-form");
    if (!form) return;
    const messageField = form.querySelector('[name="message"]');
    if (messageField) messageField.value = "";
    const notice = document.querySelector("[data-acquisition-notice]");
    if (notice) {
      notice.textContent = "";
      notice.style.display = "none";
    }
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
  window.openAcquisitionRequest = openAcquisitionRequest;

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

  function openReproductionOrder(title) {
    const modal = document.querySelector('[data-order-modal]');
    if (!modal) return;
    const form = modal.querySelector('#order-form');
    form?.reset();
    // Réouverture après une commande précédente : on réaffiche le
    // formulaire et on efface l'écran de confirmation encore en mémoire.
    const confirmation = modal.querySelector('[data-order-confirmation]');
    if (confirmation) { confirmation.hidden = true; confirmation.innerHTML = ""; }
    if (form) form.hidden = false;
    const display = modal.querySelector('[data-order-title-display]');
    if (display) display.textContent = title;
    const titleInput = form?.querySelector('[data-order-title-input]');
    if (titleInput) titleInput.value = title;
    const status = modal.querySelector('[data-order-status]');
    if (status) { status.textContent = ""; status.classList.remove("is-success", "is-error"); }
    // Le reCAPTCHA doit être revalidé à chaque ouverture : le bouton
    // d'envoi reste désactivé tant que onOrderCaptchaVerified n'a pas
    // été déclenché par le widget Google.
    const button = form?.querySelector('button[type="submit"]');
    if (button) button.disabled = true;
    resetOrderCaptcha();
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => form?.querySelector('[name="firstName"]')?.focus());
  }
  window.openReproductionOrder = openReproductionOrder;

  function closeOrderModal() {
    const modal = document.querySelector('[data-order-modal]');
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // Piège de focus : Tab/Shift+Tab restent dans le panneau tant que la
  // modale de commande est ouverte (le rôle dialog/aria-modal ne suffit
  // pas à lui seul à empêcher le focus clavier de sortir du panneau).
  function trapFocus(modal, event) {
    if (event.key !== "Tab" || !modal.classList.contains("is-open")) return;
    const panel = modal.querySelector(".shop-panel");
    if (!panel) return;
    const focusable = Array.prototype.slice
      .call(panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      .filter((el) => !el.disabled && el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function initOrderModal() {
    const modal = document.querySelector('[data-order-modal]');
    if (!modal) return;

    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-order-title]");
      if (trigger) openReproductionOrder(trigger.getAttribute("data-order-title"));
    });

    modal.addEventListener("click", (event) => {
      if (event.target === modal || event.target.closest("[data-order-close]")) closeOrderModal();
    });

    document.addEventListener("keydown", (event) => {
      if (!modal.classList.contains("is-open")) return;
      if (event.key === "Escape") closeOrderModal();
      trapFocus(modal, event);
    });

    const form = modal.querySelector("#order-form");
    if (!form) return;
    const status = form.querySelector("[data-order-status]");
    const button = form.querySelector('button[type="submit"]');
    const defaultButtonText = button ? button.textContent : "";

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!status) return;

      // Filet de sécurité : le bouton reste désactivé tant que le captcha
      // n'est pas validé, mais un Entrée dans un champ texte peut tout de
      // même déclencher la soumission du formulaire.
      if (typeof grecaptcha === "undefined" || !grecaptcha.getResponse()) {
        status.classList.remove("is-success");
        status.classList.add("is-error");
        status.textContent = T.orderCaptchaMissing;
        return;
      }

      const title = form.querySelector("[data-order-title-input]")?.value || "";
      const payment = form.querySelector('[name="payment"]')?.value || "";
      const orderDetails = {
        title,
        firstName: form.querySelector('[name="firstName"]')?.value || "",
        lastName: form.querySelector('[name="lastName"]')?.value || "",
        email: form.querySelector('[name="email"]')?.value || "",
        phone: form.querySelector('[name="phone"]')?.value || "",
        street: form.querySelector('[name="street"]')?.value || "",
        city: form.querySelector('[name="city"]')?.value || "",
        zip: form.querySelector('[name="zip"]')?.value || "",
        country: form.querySelector('[name="country"]')?.value || "",
      };

      status.classList.remove("is-success", "is-error");

      if (!payment) {
        status.classList.add("is-error");
        status.textContent = T.orderPaymentMissing;
        return;
      }

      if (payment === "paypal") {
        window.open("https://www.paypal.me/marquetrycthurnherr", "_blank");
        showOrderConfirmation(modal, "paypal");
        return;
      }

      status.textContent = T.contactSending;
      if (button) { button.disabled = true; button.textContent = T.contactSending; }

      sendOrderEmailVirement(orderDetails)
        .then(() => {
          showOrderConfirmation(modal, "virement");
        })
        .catch((error) => {
          status.textContent = error?.status === 429 ? T.orderThrottled : T.contactError;
          status.classList.add("is-error");
        })
        .finally(() => {
          if (button) { button.disabled = false; button.textContent = defaultButtonText; resetOrderCaptcha(); }
        });
    });
  }

  // Envoie la demande de virement bancaire via EmailJS (mêmes identifiants
  // réels que le formulaire de contact, cf. EMAILJS_SERVICE_ID plus haut) —
  // renvoie la promesse pour que l'appelant gère succès/erreur/throttle.
  function sendOrderEmailVirement(orderDetails) {
    if (typeof emailjs === "undefined") return Promise.reject(new Error("emailjs indisponible"));
    const params = {
      from_name: `${orderDetails.firstName} ${orderDetails.lastName}`.trim(),
      from_email: orderDetails.email,
      phone: orderDetails.phone,
      message: T.orderMessage(orderDetails),
    };
    // Throttle EmailJS dédié ("order-form") : évite que l'envoi d'une
    // commande soit bloqué par le throttle du formulaire de contact
    // ("contact-form") si les deux sont utilisés à moins de 10s d'écart.
    return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params, {
      limitRate: { id: "order-form", throttle: 10000 },
    });
  }

  // Remplace le formulaire par un écran de confirmation dans le corps
  // scrollable du panneau. Le formulaire est masqué (pas détruit) : il
  // réapparaît intact au prochain openReproductionOrder().
  function showOrderConfirmation(modal, type) {
    const form = modal.querySelector("#order-form");
    const confirmation = modal.querySelector("[data-order-confirmation]");
    if (!confirmation) return;
    const title = type === "paypal" ? T.paypalConfirmTitle : T.bankConfirmTitle;
    const body = type === "paypal" ? T.paypalConfirmBody : T.bankConfirmBody;
    confirmation.innerHTML = `
      <div style="text-align:center;padding:40px 20px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <h2 style="color:#1a1410;margin:16px 0 8px;">${title}</h2>
        <p style="color:#5a4f46;line-height:1.6;">${body}</p>
      </div>`;
    if (form) form.hidden = true;
    confirmation.hidden = false;
  }

  // ── Google reCAPTCHA v2 : callbacks globaux référencés par data-callback
  // / data-expired-callback sur le widget .g-recaptcha du formulaire de
  // commande. Le bouton "Envoyer la demande" reste désactivé tant que
  // onOrderCaptchaVerified n'a pas été déclenché.
  function resetOrderCaptcha() {
    if (typeof grecaptcha !== "undefined" && grecaptcha.reset) {
      try { grecaptcha.reset(); } catch (_error) { /* widget pas encore rendu */ }
    }
  }

  window.onOrderCaptchaVerified = function () {
    const button = document.querySelector('#order-form button[type="submit"]');
    if (button) button.disabled = false;
  };

  window.onOrderCaptchaExpired = function () {
    const button = document.querySelector('#order-form button[type="submit"]');
    if (button) button.disabled = true;
  };

  function openReproductionDetail(title, image) {
    const modal = document.querySelector('[data-repro-modal]');
    if (!modal) return;
    const titleEl = modal.querySelector('[data-repro-modal-title]');
    if (titleEl) titleEl.textContent = title;
    const img = modal.querySelector('[data-repro-modal-image]');
    if (img) {
      img.setAttribute("src", image || "");
      img.setAttribute("alt", `Reproduction — ${title}`);
    }
    const orderBtn = modal.querySelector('[data-repro-modal-order]');
    if (orderBtn) orderBtn.setAttribute("data-repro-modal-order-title", title);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeReproDetailModal() {
    const modal = document.querySelector('[data-repro-modal]');
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // Mécanisme identique pour chaque carte reproduction : le titre et
  // l'image sont lus directement sur la carte cliquée (h3 / img), pas
  // besoin de dupliquer ces informations en attributs data-*.
  function initReproDetailModal() {
    const modal = document.querySelector('[data-repro-modal]');
    if (!modal) return;

    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-repro-detail]");
      if (!trigger) return;
      const card = trigger.closest(".shop-card");
      const title = card?.querySelector("h3")?.textContent.trim();
      const image = card?.querySelector("img")?.getAttribute("src");
      if (title) openReproductionDetail(title, image);
    });

    modal.addEventListener("click", (event) => {
      if (event.target === modal || event.target.closest("[data-repro-modal-close]")) closeReproDetailModal();
    });

    document.addEventListener("keydown", (event) => {
      if (!modal.classList.contains("is-open")) return;
      if (event.key === "Escape") closeReproDetailModal();
      trapFocus(modal, event);
    });

    modal.querySelector('[data-repro-modal-order]')?.addEventListener("click", (event) => {
      const title = event.currentTarget.getAttribute("data-repro-modal-order-title");
      closeReproDetailModal();
      if (title) openReproductionOrder(title);
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
    initOrderModal();
    initReproDetailModal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
