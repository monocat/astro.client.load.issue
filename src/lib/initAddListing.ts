// src/lib/initAddListing.ts

import DOMPurify from "dompurify";

export interface ListingType {
  id: string;
  name: string;
  slug: string;
  fields: { key: string; type: string; required: boolean }[];
}

export function initAddListing(listingTypes: ListingType[]): void {
  const addBtn = document.getElementById("add-listing-btn");
  const formEl = document.getElementById("dynamic-form") as HTMLFormElement;
  const fieldsCt = document.getElementById("type-fields");
  const categoryNameEl = document.getElementById("category-name");
  const submitLabel = document.getElementById("category-name-submit-listing");
  const msgEl = document.getElementById("message");

  if (
    !addBtn ||
    !formEl ||
    !fieldsCt ||
    !categoryNameEl ||
    !submitLabel ||
    !msgEl
  ) {
    console.error("Add Listing: missing required DOM elements");
    return;
  }

  let currentFields: ListingType["fields"] = [];

  // Simple slugify for title → id
  const slugify = (s: string) =>
    s
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");

  addBtn.addEventListener("click", () => {
    // Find the checked radio input
    const radio = document.querySelector<HTMLInputElement>(
      'input[name="listingType"]:checked'
    );
    if (!radio) {
      alert("Please select a listing type.");
      return;
    }

    const typeId = radio.value;
    const typeDef = listingTypes.find((t) => t.id === typeId);
    if (!typeDef) {
      alert("Invalid listing type.");
      return;
    }

    currentFields = typeDef.fields;
    formEl.dataset.listingTypeId = typeId;

    // Update UI
    categoryNameEl.textContent = `This form is for ${typeDef.name} listings.`;
    submitLabel.textContent = `Submit ${typeDef.name} Listing`;
    msgEl.textContent = "";
    fieldsCt.innerHTML = "";

    // Inject type-specific inputs
    for (const f of typeDef.fields) {
      const wrapper = document.createElement("div");
      wrapper.className = "form-control w-full";

      const label = document.createElement("label");
      label.className = "label";
      label.innerHTML = `<span class="label-text">${f.key}${
        f.required ? " *" : ""
      }</span>`;
      wrapper.appendChild(label);

      const input = document.createElement("input");
      input.name = f.key;
      input.required = f.required;
      input.className = "input input-bordered w-full";
      input.type =
        f.type === "timestamp"
          ? "date"
          : f.type === "number"
          ? "number"
          : "text";
      wrapper.appendChild(input);

      fieldsCt.appendChild(wrapper);
    }

    // Show the form
    formEl.classList.remove("hidden");
  });

  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    msgEl.textContent = "";

    const typeId = formEl.dataset.listingTypeId;
    if (!typeId) {
      alert("Listing type not set. Please click Add Listing again.");
      return;
    }
    const typeDef = listingTypes.find((t) => t.id === typeId)!;

    // Read common fields
    const data = new FormData(formEl);
    const titleRaw = data.get("title")?.toString().trim() ?? "";
    const descriptionRaw = data.get("description")?.toString().trim() ?? "";
    const priceRaw = data.get("price")?.toString().trim() ?? "";

    const title = DOMPurify.sanitize(titleRaw);
    const description = DOMPurify.sanitize(descriptionRaw);
    const price = priceRaw === "" ? null : Number(priceRaw);

    // Build attributes map
    const attributes: Record<string, any> = {};
    for (const f of currentFields) {
      const raw = data.get(f.key)?.toString().trim() ?? "";
      let value: string | number | null;
      if (f.type === "number") {
        value = raw === "" ? null : Number(raw);
      } else if (f.type === "timestamp") {
        value = raw === "" ? null : new Date(raw).toISOString();
      } else {
        value = raw;
      }
      // Sanitize and store
      attributes[f.key] = DOMPurify.sanitize(
        value === null ? "" : value.toString()
      );
    }

    try {
      // POST to your API route
      const res = await fetch("/api/listings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          typeId,
          title,
          description,
          price,
          attributes,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      window.location.href = "/listings/dashboard";
    } catch (err: any) {
      console.error("Error creating listing:", err);
      msgEl.textContent = err.message || "Failed to create listing.";
    }
  });
}