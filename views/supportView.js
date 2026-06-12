import { requireAuth } from "../services/auth-service.js";

if (!requireAuth()) {
  throw new Error("Authentication required.");
}

const SUPPORT_CONTENT = {
  mental: {
    pageClass: "support-page--mental",
    image: "../assets/support.svg",
    imageAlt: "Mental health support helpline",
    description:
      "SAMHSA's free, confidential helpline. Available 24/7 in English and Spanish for individuals and families facing mental or substance-use challenges.",
    phoneHref: "tel:18006624357",
    copyNumber: "1-800-662-4357",
    website: "https://www.samhsa.gov/find-help/helplines/national-helpline",
  },
  crisis: {
    pageClass: "support-page--crisis",
    image: "../assets/crisis.svg",
    imageAlt: "Crisis lifeline helpline",
    description:
      "If you or someone you know is struggling or in crisis, help is available. Call or text 988 to reach the Suicide & Crisis Lifeline. You're not alone.",
    phoneHref: "tel:988",
    copyNumber: "988",
    website: "https://988lifeline.org/",
  },
};

const params = new URLSearchParams(window.location.search);
const supportType = params.get("type") === "crisis" ? "crisis" : "mental";
const content = SUPPORT_CONTENT[supportType];

const page = document.querySelector("[data-support-page]");
const hero = document.querySelector("[data-support-hero]");
const description = document.querySelector("[data-support-description]");
const callLink = document.querySelector("[data-support-call]");
const copyButton = document.querySelector("[data-support-copy]");
const websiteLink = document.querySelector("[data-support-website]");
const feedback = document.querySelector("[data-support-feedback]");

function renderSupportPage() {
  page?.classList.add(content.pageClass);

  if (hero) {
    hero.src = content.image;
    hero.alt = content.imageAlt;
  }

  if (description) {
    description.textContent = content.description;
  }

  if (callLink) {
    callLink.href = content.phoneHref;
  }

  if (websiteLink) {
    websiteLink.href = content.website;
  }
}

function showCopyFeedback() {
  if (!feedback) {
    return;
  }

  feedback.hidden = false;
  window.setTimeout(() => {
    feedback.hidden = true;
  }, 1800);
}

async function copySupportNumber() {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(content.copyNumber);
    } else {
      const fallbackInput = document.createElement("textarea");
      fallbackInput.value = content.copyNumber;
      fallbackInput.setAttribute("readonly", "");
      fallbackInput.classList.add("support-copy-fallback");
      document.body.append(fallbackInput);
      fallbackInput.select();
      document.execCommand("copy");
      fallbackInput.remove();
    }

    showCopyFeedback();
  } catch {
    showCopyFeedback();
  }
}

copyButton?.addEventListener("click", copySupportNumber);

renderSupportPage();
