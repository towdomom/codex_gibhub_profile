const DATA_PATH = "./assets/data/portfolio.json";
const STORAGE_KEY = "portfolio-lang";

const state = {
  lang: "ko",
  data: null,
};

document.addEventListener("DOMContentLoaded", () => {
  void init();
});

async function init() {
  try {
    state.data = await loadData(DATA_PATH);
    state.lang = resolveInitialLanguage(state.data.meta?.defaultLang || "ko");
    bindLanguageControls();
    render();
    applyAnalytics();
  } catch (error) {
    console.error("Failed to initialize portfolio:", error);
    renderBootstrapError();
  }
}

async function loadData(path) {
  const response = await fetch(path, { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`Failed to load data (${response.status})`);
  }
  return response.json();
}

function resolveInitialLanguage(defaultLang) {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "ko" || saved === "en") {
    return saved;
  }
  return defaultLang === "en" ? "en" : "ko";
}

function bindLanguageControls() {
  const buttons = document.querySelectorAll("[data-lang-option]");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextLang = button.getAttribute("data-lang-option");
      if (!nextLang || state.lang === nextLang) {
        return;
      }
      state.lang = nextLang;
      localStorage.setItem(STORAGE_KEY, nextLang);
      render();
    });
  });
}

function render() {
  document.documentElement.lang = state.lang;
  const siteTitle = getLocalized(state.data.meta?.siteTitle) || "Developer Portfolio";
  document.title = siteTitle;
  applyUiLabels();
  updateLanguageButtonState();
  renderHero();
  renderAbout();
  renderProjects();
  renderSkills();
  renderContact();
  renderFooter();
}

function applyUiLabels() {
  const labels = document.querySelectorAll("[data-i18n]");
  labels.forEach((element) => {
    const key = element.getAttribute("data-i18n");
    if (!key) {
      return;
    }
    const value = getLocalized(getByPath(state.data.ui, key));
    if (typeof value === "string") {
      element.textContent = value;
    }
  });
}

function updateLanguageButtonState() {
  const buttons = document.querySelectorAll("[data-lang-option]");
  buttons.forEach((button) => {
    const lang = button.getAttribute("data-lang-option");
    const selected = lang === state.lang;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function renderHero() {
  const profile = state.data.profile;
  const githubUrl = profile.contacts?.github || "#";

  setText("profile-name", profile.name);
  setText("profile-title", getLocalized(profile.title));
  setText("profile-summary", getLocalized(profile.summary));
  setText("panel-text", getLocalized(profile.panelNote));

  const githubCta = document.getElementById("github-cta");
  if (githubCta) {
    githubCta.textContent = getLocalized(getByPath(state.data.ui, "hero.githubCta"));
    githubCta.href = githubUrl;
  }
}

function renderAbout() {
  const profile = state.data.profile;
  const aboutItems = getLocalized(profile.about);
  const strengthItems = getLocalized(profile.strengths);

  const aboutContainer = document.getElementById("about-content");
  if (aboutContainer) {
    aboutContainer.innerHTML = "";
    (Array.isArray(aboutItems) ? aboutItems : []).forEach((text) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      aboutContainer.appendChild(paragraph);
    });
  }

  const strengthList = document.getElementById("strength-list");
  if (strengthList) {
    strengthList.innerHTML = "";
    (Array.isArray(strengthItems) ? strengthItems : []).forEach((item) => {
      const listItem = document.createElement("li");
      listItem.textContent = item;
      strengthList.appendChild(listItem);
    });
  }
}

function renderProjects() {
  const container = document.getElementById("project-list");
  if (!container) {
    return;
  }

  container.innerHTML = "";
  const projects = Array.isArray(state.data.projects) ? state.data.projects : [];
  projects.forEach((project) => {
    const card = document.createElement("article");
    card.className = "project-card";

    const title = document.createElement("h3");
    title.textContent = getLocalized(project.title);
    card.appendChild(title);

    card.appendChild(buildProjectBlock("problem", getLocalized(project.problem)));
    card.appendChild(buildProjectBlock("role", getLocalized(project.role)));
    card.appendChild(buildProjectBlock("solution", getLocalized(project.solution)));
    card.appendChild(buildProjectBlock("impact", getLocalized(project.impact)));

    const stackList = document.createElement("ul");
    stackList.className = "stack-list";
    project.stack.forEach((skill) => {
      const chip = document.createElement("li");
      chip.textContent = skill;
      stackList.appendChild(chip);
    });
    card.appendChild(stackList);

    const linksWrap = document.createElement("div");
    linksWrap.className = "project-links";
    appendLinkIfExists(linksWrap, project.links?.github, getLocalized(getByPath(state.data.ui, "projects.repoLink")));
    appendLinkIfExists(linksWrap, project.links?.demo, getLocalized(getByPath(state.data.ui, "projects.demoLink")));
    appendLinkIfExists(linksWrap, project.links?.detail, getLocalized(getByPath(state.data.ui, "projects.detailLink")));
    card.appendChild(linksWrap);

    container.appendChild(card);
  });
}

function buildProjectBlock(labelKey, text) {
  const wrap = document.createElement("div");
  wrap.className = "project-block";

  const label = document.createElement("p");
  label.className = "project-label";
  label.textContent = getLocalized(getByPath(state.data.ui, `projects.labels.${labelKey}`));

  const detail = document.createElement("p");
  detail.className = "project-text";
  detail.textContent = text || "";

  wrap.append(label, detail);
  return wrap;
}

function appendLinkIfExists(parent, href, text) {
  if (!href || !text) {
    return;
  }
  const link = document.createElement("a");
  link.className = "inline-link";
  link.href = href;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = text;
  parent.appendChild(link);
}

function renderSkills() {
  const skills = state.data.skills || {};
  const grid = document.getElementById("skills-grid");
  if (!grid) {
    return;
  }

  grid.innerHTML = "";
  ["frontend", "backend", "tools"].forEach((key) => {
    const card = document.createElement("article");
    card.className = "skills-card";

    const title = document.createElement("h3");
    title.textContent = getLocalized(getByPath(state.data.ui, `skills.categories.${key}`));

    const listText = document.createElement("p");
    listText.textContent = (skills[key] || []).join(", ");

    card.append(title, listText);
    grid.appendChild(card);
  });

  setText("skills-level", getLocalized(skills.levels));
}

function renderContact() {
  const contacts = state.data.profile.contacts || {};
  const email = contacts.email || "";
  const github = contacts.github || "";
  const linkedin = contacts.linkedin || "";

  const emailLink = document.getElementById("email-link");
  if (emailLink) {
    emailLink.href = email ? `mailto:${email}` : "#contact";
    emailLink.textContent = getLocalized(getByPath(state.data.ui, "contact.emailCta"));
  }

  const githubLink = document.getElementById("github-link");
  if (githubLink) {
    githubLink.href = github || "#";
    githubLink.textContent = getLocalized(getByPath(state.data.ui, "contact.githubCta"));
  }

  const linkedinLink = document.getElementById("linkedin-link");
  if (linkedinLink) {
    linkedinLink.textContent = getLocalized(getByPath(state.data.ui, "contact.linkedinCta"));
    if (linkedin) {
      linkedinLink.href = linkedin;
      linkedinLink.classList.remove("hidden");
    } else {
      linkedinLink.classList.add("hidden");
    }
  }
}

function renderFooter() {
  const template = getLocalized(getByPath(state.data.ui, "footer.copy"));
  const year = String(new Date().getFullYear());
  const text = template.replace("{year}", year);
  setText("footer-copy", text);
}

function applyAnalytics() {
  const analytics = state.data.analytics;
  if (!analytics?.enabled) {
    return;
  }

  if (analytics.provider === "plausible" && analytics.plausibleDomain) {
    const plausibleScript = document.createElement("script");
    plausibleScript.defer = true;
    plausibleScript.setAttribute("data-domain", analytics.plausibleDomain);
    plausibleScript.src = "https://plausible.io/js/script.js";
    document.head.appendChild(plausibleScript);
    return;
  }

  if (analytics.provider === "ga4" && analytics.gaMeasurementId) {
    const sourceScript = document.createElement("script");
    sourceScript.async = true;
    sourceScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analytics.gaMeasurementId)}`;
    document.head.appendChild(sourceScript);

    const inlineScript = document.createElement("script");
    inlineScript.textContent = [
      "window.dataLayer = window.dataLayer || [];",
      "function gtag(){dataLayer.push(arguments);}",
      "gtag('js', new Date());",
      `gtag('config', '${escapeForInline(analytics.gaMeasurementId)}');`,
    ].join("\n");
    document.head.appendChild(inlineScript);
  }
}

function escapeForInline(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function setText(id, text) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = text || "";
  }
}

function getLocalized(value) {
  if (value == null) {
    return "";
  }
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "object") {
    if ("ko" in value || "en" in value) {
      return value[state.lang] || value.ko || value.en || "";
    }
  }
  return "";
}

function getByPath(source, path) {
  if (!source || !path) {
    return undefined;
  }
  return path.split(".").reduce((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return acc[key];
    }
    return undefined;
  }, source);
}

function renderBootstrapError() {
  const container = document.getElementById("main-content");
  if (!container) {
    return;
  }
  container.innerHTML = [
    "<section class='section'>",
    "<div class='container'>",
    "<h1>Portfolio data load failed</h1>",
    "<p>assets/data/portfolio.json path or format needs to be checked.</p>",
    "</div>",
    "</section>",
  ].join("");
}
