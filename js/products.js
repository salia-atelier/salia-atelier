const Salia = window.Salia || {};

Salia.WHATSAPP = "254707436816";
Salia.DB_NAME = "salia-atelier";
Salia.STORE = "products";
Salia.PIN_KEY = "salia-atelier-pin";

Salia.placeholder = (title, from, to) => {
  const id = `g-${title.replace(/[^a-z0-9]/gi, "").toLowerCase()}`;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 800" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${from}"/>
          <stop offset="100%" stop-color="${to}"/>
        </linearGradient>
      </defs>
      <rect width="640" height="800" fill="url(#${id})"/>
      <circle cx="520" cy="110" r="120" fill="rgba(255,253,249,0.16)"/>
      <circle cx="80" cy="680" r="160" fill="rgba(42,34,28,0.08)"/>
      <text x="320" y="390" text-anchor="middle" fill="rgba(42,34,28,0.55)" font-family="Georgia, serif" font-size="34">${title}</text>
    </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

Salia.seedProducts = [
  {
    id: "linen-wrap-dress",
    name: "Linen Wrap Dress",
    description: "A soft oatmeal wrap that moves with you — easy for Sunday lunch in Kiserian, just as lovely for a Nairobi afternoon.",
    price: 8500,
    featured: true,
    placeholder: true,
    image: Salia.placeholder("Linen Wrap Dress", "#EAD9C8", "#C4A574")
  },
  {
    id: "ivory-blouse",
    name: "Ivory Day Blouse",
    description: "Light, breathable, and gently tailored at the shoulder. A quiet piece you will reach for without thinking.",
    price: 4200,
    featured: true,
    placeholder: true,
    image: Salia.placeholder("Ivory Day Blouse", "#F6F1E8", "#D7C4AE")
  },
  {
    id: "earth-culottes",
    name: "Earth-Tone Culottes",
    description: "Wide-leg ease in a warm clay shade. Comfortable enough for the market, composed enough for the office.",
    price: 5800,
    featured: true,
    placeholder: true,
    image: Salia.placeholder("Earth Culottes", "#CDB39A", "#6E5344")
  },
  {
    id: "midnight-trousers",
    name: "Midnight Tailored Trousers",
    description: "A clean, flattering line in deep charcoal. Made for evenings that start at dusk on the Ngong side.",
    price: 6400,
    featured: true,
    placeholder: true,
    image: Salia.placeholder("Midnight Trousers", "#4A4038", "#2A221C")
  },
  {
    id: "garden-midi",
    name: "Garden Party Midi",
    description: "A blush midi with a modest neckline and a little sway. For weddings, birthdays, and the days you want to feel celebrated.",
    price: 9200,
    featured: false,
    placeholder: true,
    image: Salia.placeholder("Garden Party Midi", "#E8C9C0", "#B8956A")
  },
  {
    id: "soft-cardigan",
    name: "Soft Atelier Cardigan",
    description: "A cashmere-feel knit in warm cream. The extra layer you keep on the back of your chair from morning to evening.",
    price: 7100,
    featured: false,
    placeholder: true,
    image: Salia.placeholder("Soft Cardigan", "#F3E6D6", "#9A8774")
  }
];

Salia.money = (n) =>
  `KES ${Number(n).toLocaleString("en-KE")}`;

Salia.whatsappLink = (message) =>
  `https://wa.me/${Salia.WHATSAPP}?text=${encodeURIComponent(message)}`;

Salia.orderMessage = (name) =>
  `Hello Salia Atelier, I would like to order the ${name}. Could you please share availability, sizing, and how to collect or have it delivered? Thank you.`;

Salia.openDb = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(Salia.DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(Salia.STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

Salia.getCustomProducts = async () => {
  try {
    const db = await Salia.openDb();
    return await new Promise((resolve, reject) => {
      const req = db.transaction(Salia.STORE, "readonly").objectStore(Salia.STORE).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
};

Salia.saveProduct = async (product) => {
  const db = await Salia.openDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(Salia.STORE, "readwrite").objectStore(Salia.STORE).put(product);
    req.onsuccess = () => resolve(product);
    req.onerror = () => reject(req.error);
  });
};

Salia.deleteProduct = async (id) => {
  const db = await Salia.openDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(Salia.STORE, "readwrite").objectStore(Salia.STORE).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

Salia.getHiddenSeeds = () => {
  try {
    return JSON.parse(localStorage.getItem("salia-hidden-seeds") || "[]");
  } catch {
    return [];
  }
};

Salia.hideSeed = (id) => {
  const hidden = new Set(Salia.getHiddenSeeds());
  hidden.add(id);
  localStorage.setItem("salia-hidden-seeds", JSON.stringify([...hidden]));
};

Salia.allProducts = async () => {
  const hidden = new Set(Salia.getHiddenSeeds());
  const custom = await Salia.getCustomProducts();
  const seeds = Salia.seedProducts.filter((item) => !hidden.has(item.id));
  const customIds = new Set(custom.map((item) => item.id));
  return [...custom, ...seeds.filter((item) => !customIds.has(item.id))];
};

Salia.productCard = (item) => `
  <article class="product-card">
    <div class="product-media">
      <img src="${item.image}" alt="${item.name}">
      ${item.placeholder ? `<span class="placeholder-badge">Placeholder photo</span>` : ""}
    </div>
    <div class="product-body">
      <h3>${item.name}</h3>
      <div class="price">${Salia.money(item.price)}</div>
      <p>${item.description}</p>
      <a class="btn btn-wa" href="${Salia.whatsappLink(Salia.orderMessage(item.name))}" target="_blank" rel="noopener">Order via WhatsApp</a>
    </div>
  </article>
`;

window.Salia = Salia;
