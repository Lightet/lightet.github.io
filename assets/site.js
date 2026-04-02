const bibtexManifest = window.BIBTEX_MANIFEST || {};
const toastState = {
  element: null,
  hideTimer: null
};

function getResourceLabel(element) {
  return (element.dataset.label || element.textContent || "").trim();
}

function getResourceKind(label) {
  const normalized = label.toLowerCase().replace(/\s+/g, "");
  return normalized === "bib" ? "bibtex" : normalized;
}

function decorateResource(element, label) {
  element.dataset.kind = getResourceKind(label);
  if (element.querySelector(".paper-resource-label")) return;

  element.textContent = "";
  const span = document.createElement("span");
  span.className = "paper-resource-label";
  span.textContent = label;
  element.appendChild(span);
}

function getBibtexText(path) {
  return (bibtexManifest[path] || "").trim();
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function ensureToast() {
  if (toastState.element) return toastState.element;

  const toast = document.createElement("div");
  toast.className = "site-toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  document.body.appendChild(toast);
  toastState.element = toast;
  return toast;
}

function showToast(message, tone = "success") {
  const toast = ensureToast();
  toast.textContent = message;
  toast.dataset.tone = tone;
  toast.classList.add("is-visible");

  if (toastState.hideTimer) {
    window.clearTimeout(toastState.hideTimer);
  }

  toastState.hideTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 1600);
}

async function copyBibtex(button) {
  const path = button.dataset.bibtexFile;
  if (!path) {
    showToast("bib unavailable", "error");
    return;
  }

  const bibtex = getBibtexText(path);
  if (!bibtex) {
    showToast("bib unavailable", "error");
    return;
  }

  try {
    try {
      await navigator.clipboard.writeText(bibtex);
    } catch {
      fallbackCopy(bibtex);
    }
  } catch {
    showToast("copy failed", "error");
    return;
  }
  showToast("bib copied");
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".paper-resource").forEach((element) => {
    const label = getResourceLabel(element);
    if (!label) return;
    decorateResource(element, label);
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".paper-resource--copy");
    if (!button) return;
    event.preventDefault();
    copyBibtex(button);
  });
});
