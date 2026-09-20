const lock = document.querySelector("[data-lock]");
const studio = document.querySelector("[data-studio]");
const pinForm = document.querySelector("[data-pin-form]");
const pinInput = document.querySelector("#pin");
const pinHint = document.querySelector("[data-pin-hint]");
const itemForm = document.querySelector("[data-item-form]");
const list = document.querySelector("[data-admin-list]");
const preview = document.querySelector("[data-preview]");
const photoInput = document.querySelector("#photo");

const hashPin = async (value) => {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
};

const unlock = () => {
  lock.classList.add("hidden");
  studio.classList.remove("hidden");
  renderList();
};

pinHint.textContent = localStorage.getItem(Salia.PIN_KEY)
  ? "Enter the studio PIN you created."
  : "Create a short PIN you will remember. This stays on this phone or computer only.";

pinForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const pin = pinInput.value.trim();
  if (pin.length < 4) {
    pinHint.textContent = "Please use at least 4 characters.";
    return;
  }
  const hashed = await hashPin(pin);
  const saved = localStorage.getItem(Salia.PIN_KEY);
  if (!saved) {
    localStorage.setItem(Salia.PIN_KEY, hashed);
    unlock();
    return;
  }
  if (saved === hashed) {
    unlock();
    return;
  }
  pinHint.textContent = "That PIN does not match. Try again.";
});

photoInput.addEventListener("change", () => {
  const file = photoInput.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    preview.innerHTML = `<img src="${reader.result}" alt="Selected garment photo">`;
  };
  reader.readAsDataURL(file);
});

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const max = 1200;
        const scale = Math.min(1, max / img.width);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

itemForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(itemForm);
  const name = String(data.get("name") || "").trim();
  const description = String(data.get("description") || "").trim();
  const price = Number(data.get("price"));
  const file = photoInput.files?.[0];
  if (!name || !description || !price || !file) {
    alert("Please add a photo, name, description, and price.");
    return;
  }
  const image = await fileToDataUrl(file);
  await Salia.saveProduct({
    id: `${Date.now()}`,
    name,
    description,
    price,
    image,
    featured: true,
    placeholder: false
  });
  itemForm.reset();
  preview.innerHTML = "";
  renderList();
});

async function renderList() {
  const products = await Salia.allProducts();
  list.innerHTML = products
    .map(
      (item) => `
      <article class="admin-item">
        <img src="${item.image}" alt="">
        <div>
          <strong>${item.name}</strong>
          <div class="price">${Salia.money(item.price)}</div>
        </div>
        <button class="btn btn-ghost" type="button" data-remove="${item.id}">Remove</button>
      </article>`
    )
    .join("");
}

list.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;
  const id = button.getAttribute("data-remove");
  const custom = await Salia.getCustomProducts();
  if (custom.some((item) => item.id === id)) {
    await Salia.deleteProduct(id);
  } else {
    Salia.hideSeed(id);
  }
  renderList();
});
