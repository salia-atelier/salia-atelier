const header = document.querySelector(".site-header");
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
const year = document.querySelector("[data-year]");

if (year) year.textContent = new Date().getFullYear();

window.addEventListener("scroll", () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 8);
});

toggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(open));
});

document.querySelectorAll("[data-featured]").forEach(async (el) => {
  const products = await Salia.allProducts();
  el.innerHTML = products.slice(0, 4).map(Salia.productCard).join("");
});

document.querySelectorAll("[data-collection]").forEach(async (el) => {
  const products = await Salia.allProducts();
  el.innerHTML = products.map(Salia.productCard).join("");
});

const form = document.querySelector("[data-contact-form]");
const status = document.querySelector("[data-form-status]");

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const note = String(data.get("message") || "").trim();
  if (!name || !note) {
    status.textContent = "Please share your name and a short message.";
    return;
  }
  const text = `Hello Salia Atelier, my name is ${name}. ${note}`;
  status.textContent = "Opening WhatsApp so we can continue the conversation...";
  window.open(Salia.whatsappLink(text), "_blank", "noopener");
  form.reset();
});
