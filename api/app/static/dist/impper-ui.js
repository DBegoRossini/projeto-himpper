/**
 * IMPPER UI
 * Comportamentos leves e opcionais para páginas HTML.
 * Sem dependências.
 *
 * API:
 * ImpperUI.init()
 * ImpperUI.toast(message, options)
 * ImpperUI.showLoading(message)
 * ImpperUI.hideLoading()
 * ImpperUI.openModal(id)
 * ImpperUI.closeModal(id)
 * ImpperUI.setButtonLoading(button, loading, label)
 * ImpperUI.formToObject(form)
 */
(() => {
  "use strict";

  const STORAGE_KEYS = {
    theme: "impper-ui-theme",
    sidebar: "impper-ui-sidebar-collapsed"
  };

  const state = {
    initialized: false,
    shell: null
  };

  const html = document.documentElement;

  const escapeHtml = value =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const getPreferredTheme = () => "light";

  const applyTheme = () => {
    const nextTheme = "light";

    html.dataset.impperTheme = nextTheme;
    localStorage.setItem(STORAGE_KEYS.theme, nextTheme);

    document
      .querySelectorAll("[data-impper-theme-icon]")
      .forEach(icon => {
        icon.textContent = "☾";
      });

    document.dispatchEvent(
      new CustomEvent("impper:themechange", {
        detail: { theme: nextTheme }
      })
    );
  };

  const toggleTheme = () => applyTheme("light");

  const ensureToastRegion = () => {
    let region = document.querySelector(".imp-toast-region");

    if (!region) {
      region = document.createElement("div");
      region.className = "imp-toast-region";
      region.setAttribute("aria-live", "polite");
      region.setAttribute("aria-atomic", "false");
      document.body.appendChild(region);
    }

    return region;
  };

  const ensureLoadingOverlay = () => {
    let overlay = document.querySelector(".imp-loading-overlay");

    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "imp-loading-overlay";
      overlay.setAttribute("aria-hidden", "true");
      overlay.innerHTML = `
        <div class="imp-loading-box" role="status" aria-live="polite">
          <div class="imp-spinner" aria-hidden="true"></div>
          <div data-impper-loading-message>Processando...</div>
        </div>
      `;
      document.body.appendChild(overlay);
    }

    return overlay;
  };

  const getShell = () =>
    document.querySelector("[data-impper-shell], .imp-shell");

  const syncSidebarToggleState = () => {
    const shell = getShell();

    if (!shell) return;

    const collapsed = shell.classList.contains(
      "is-sidebar-collapsed"
    );
    const label = collapsed ? "Abrir menu" : "Recolher menu";
    const icon = collapsed ? "⇥" : "⇤";

    document
      .querySelectorAll("[data-impper-toggle-sidebar]")
      .forEach(button => {
        button.setAttribute("aria-label", label);

        const iconElement = button.querySelector(
          ".imp-sidebar__toggle-icon"
        );

        if (iconElement) {
          iconElement.textContent = icon;
        }
      });
  };

  const closeMobileSidebar = () => {
    const shell = getShell();

    if (shell) {
      shell.classList.remove("is-sidebar-open");
      document.body.style.overflow = "";
      syncSidebarToggleState();
    }
  };

  const toggleSidebar = () => {
    const shell = getShell();

    if (!shell) return;

    const mobile = window.matchMedia("(max-width: 56rem)").matches;

    if (mobile) {
      const open = shell.classList.toggle("is-sidebar-open");
      document.body.style.overflow = open ? "hidden" : "";
      return;
    }

    const collapsed = shell.classList.toggle(
      "is-sidebar-collapsed"
    );

    localStorage.setItem(
      STORAGE_KEYS.sidebar,
      String(collapsed)
    );

    syncSidebarToggleState();
  };

  const restoreSidebar = () => {
    const shell = getShell();

    if (!shell) return;

    const collapsed =
      localStorage.getItem(STORAGE_KEYS.sidebar) === "true";

    shell.classList.toggle(
      "is-sidebar-collapsed",
      collapsed
    );

    syncSidebarToggleState();
  };

  const openModal = id => {
    const modal = document.getElementById(id);

    if (!modal) {
      console.warn(`ImpperUI: modal #${id} não encontrado.`);
      return;
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    const focusable = modal.querySelector(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );

    window.setTimeout(() => focusable?.focus(), 20);
  };

  const closeModal = modalOrId => {
    const modal =
      typeof modalOrId === "string"
        ? document.getElementById(modalOrId)
        : modalOrId;

    if (!modal) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const dismissElement = element => {
    const targetSelector = element.dataset.impperDismissTarget;
    const target = targetSelector
      ? document.querySelector(targetSelector)
      : element.closest(
          ".imp-alert, .imp-toast, [data-impper-dismissible]"
        );

    target?.remove();
  };

  const maskCnpj = value => {
    let digits = value.replace(/\D/g, "").slice(0, 14);

    digits = digits.replace(/^(\d{2})(\d)/, "$1.$2");
    digits = digits.replace(
      /^(\d{2})\.(\d{3})(\d)/,
      "$1.$2.$3"
    );
    digits = digits.replace(
      /\.(\d{3})(\d)/,
      ".$1/$2"
    );
    digits = digits.replace(/(\d{4})(\d)/, "$1-$2");

    return digits;
  };

  const maskCpf = value => {
    let digits = value.replace(/\D/g, "").slice(0, 11);

    digits = digits.replace(/^(\d{3})(\d)/, "$1.$2");
    digits = digits.replace(
      /^(\d{3})\.(\d{3})(\d)/,
      "$1.$2.$3"
    );
    digits = digits.replace(/(\d{3})(\d)/, "$1-$2");

    return digits;
  };

  const maskPhone = value => {
    const digits = value.replace(/\D/g, "").slice(0, 11);

    if (digits.length <= 10) {
      return digits
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }

    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  };

  const maskCurrency = value => {
    const digits = value.replace(/\D/g, "");

    if (!digits) return "";

    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(digits) / 100);
  };

  const applyMask = input => {
    const type = input.dataset.impperMask;

    const masks = {
      cnpj: maskCnpj,
      cpf: maskCpf,
      phone: maskPhone,
      currency: maskCurrency
    };

    if (masks[type]) {
      input.value = masks[type](input.value);
    }
  };

  const updateCounter = field => {
    const outputSelector = field.dataset.impperCounter;
    const output = outputSelector
      ? document.querySelector(outputSelector)
      : field
          .closest(".imp-field")
          ?.querySelector("[data-impper-counter-output]");

    if (!output) return;

    const max = Number(field.maxLength);

    output.textContent =
      Number.isFinite(max) && max > 0
        ? `${field.value.length}/${max}`
        : String(field.value.length);
  };

  const bindEvents = () => {
    document.addEventListener("click", event => {
      const element = event.target.closest(
        [
          "[data-impper-toggle-theme]",
          "[data-impper-toggle-sidebar]",
          "[data-impper-close-sidebar]",
          "[data-impper-open-modal]",
          "[data-impper-close-modal]",
          "[data-impper-dismiss]"
        ].join(",")
      );

      if (!element) return;

      if (element.hasAttribute("data-impper-toggle-theme")) {
        toggleTheme();
        return;
      }

      if (element.hasAttribute("data-impper-toggle-sidebar")) {
        toggleSidebar();
        return;
      }

      if (element.hasAttribute("data-impper-close-sidebar")) {
        closeMobileSidebar();
        return;
      }

      if (element.hasAttribute("data-impper-open-modal")) {
        openModal(element.dataset.impperOpenModal);
        return;
      }

      if (element.hasAttribute("data-impper-close-modal")) {
        closeModal(element.closest(".imp-modal"));
        return;
      }

      if (element.hasAttribute("data-impper-dismiss")) {
        dismissElement(element);
      }
    });

    document.addEventListener("input", event => {
      const field = event.target;

      if (field.matches("[data-impper-mask]")) {
        applyMask(field);
      }

      if (field.matches("[data-impper-counter]")) {
        updateCounter(field);
      }
    });

    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;

      const openModalElement =
        document.querySelector(".imp-modal.is-open");

      if (openModalElement) {
        closeModal(openModalElement);
      } else {
        closeMobileSidebar();
      }
    });

    document.addEventListener("click", event => {
      const modal = event.target.closest(".imp-modal");

      if (
        modal &&
        event.target === modal &&
        modal.dataset.impperBackdropClose !== "false"
      ) {
        closeModal(modal);
      }
    });

    window.addEventListener("resize", () => {
      if (!window.matchMedia("(max-width: 56rem)").matches) {
        closeMobileSidebar();
      }
    });
  };

  const initCounters = () => {
    document
      .querySelectorAll("[data-impper-counter]")
      .forEach(updateCounter);
  };

  const ImpperUI = {
    init(options = {}) {
      if (state.initialized) return;

      if (options.theme === "light") {
        applyTheme(options.theme);
      } else {
        applyTheme(getPreferredTheme());
      }

      restoreSidebar();
      ensureToastRegion();
      ensureLoadingOverlay();
      initCounters();
      bindEvents();

      state.shell = getShell();
      state.initialized = true;

      document.dispatchEvent(
        new CustomEvent("impper:ready")
      );
    },

    setTheme: applyTheme,
    toggleTheme,

    toast(message, options = {}) {
      const {
        type = "info",
        title = "",
        duration = 4500
      } = options;

      const iconMap = {
        info: "●",
        success: "✓",
        warning: "!",
        danger: "×"
      };

      const toast = document.createElement("div");
      toast.className = `imp-toast imp-toast--${type}`;
      toast.setAttribute(
        "role",
        type === "danger" ? "alert" : "status"
      );

      toast.innerHTML = `
        <div class="imp-toast__icon" aria-hidden="true">
          ${escapeHtml(iconMap[type] || iconMap.info)}
        </div>
        <div>
          ${
            title
              ? `<p class="imp-toast__title">${escapeHtml(title)}</p>`
              : ""
          }
          <p class="imp-toast__message">${escapeHtml(message)}</p>
        </div>
        <button
          type="button"
          class="imp-btn imp-btn--ghost imp-btn--icon imp-btn--sm"
          data-impper-dismiss
          aria-label="Fechar notificação"
        >
          ×
        </button>
      `;

      ensureToastRegion().appendChild(toast);

      if (duration > 0) {
        window.setTimeout(() => toast.remove(), duration);
      }

      return toast;
    },

    showLoading(message = "Processando...") {
      const overlay = ensureLoadingOverlay();
      const label = overlay.querySelector(
        "[data-impper-loading-message]"
      );

      if (label) {
        label.textContent = message;
      }

      overlay.classList.add("is-visible");
      overlay.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    },

    hideLoading() {
      const overlay = ensureLoadingOverlay();

      overlay.classList.remove("is-visible");
      overlay.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    },

    openModal,
    closeModal,

    setButtonLoading(button, loading, label = "Processando...") {
      if (!(button instanceof HTMLElement)) return;

      if (loading) {
        button.dataset.impperOriginalHtml = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `
          <span class="imp-btn__spinner" aria-hidden="true"></span>
          <span>${escapeHtml(label)}</span>
        `;
      } else {
        button.disabled = false;

        if (button.dataset.impperOriginalHtml) {
          button.innerHTML = button.dataset.impperOriginalHtml;
          delete button.dataset.impperOriginalHtml;
        }
      }
    },

    formToObject(form) {
      if (!(form instanceof HTMLFormElement)) {
        throw new TypeError(
          "ImpperUI.formToObject espera um elemento <form>."
        );
      }

      const output = {};

      for (const [key, value] of new FormData(form).entries()) {
        if (Object.prototype.hasOwnProperty.call(output, key)) {
          output[key] = Array.isArray(output[key])
            ? [...output[key], value]
            : [output[key], value];
        } else {
          output[key] = value;
        }
      }

      return output;
    },

    parseCurrency(value) {
      const normalized = String(value ?? "")
        .replace(/\./g, "")
        .replace(",", ".")
        .replace(/[^\d.-]/g, "");

      const number = Number(normalized);

      return Number.isFinite(number) ? number : null;
    },

    formatCurrency(value) {
      const number = Number(value);

      if (!Number.isFinite(number)) return "";

      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
      }).format(number);
    }
  };

  window.ImpperUI = ImpperUI;

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => ImpperUI.init()
    );
  } else {
    ImpperUI.init();
  }
})();

const flowCatalog = [
    {
        title: "Abrir Ordem de Compra",
        description:
            "Inicie pedidos de compra com dados do fornecedor, centro de custo e aprovação financeira.",
        category: "Suprimentos",
        eta: "2 a 5 min",
        href: "#"
    },
    {
        title: "Solicitação de Contrato",
        description:
            "Formalize uma nova contratação com escopo, vigência, anexos e responsáveis pela validação.",
        category: "Jurídico",
        eta: "4 a 8 min",
        href: "#"
    },
    {
        title: "Requisição de Pagamento",
        description:
            "Encaminhe pagamentos eventuais com comprovantes, classificação contábil e trilha de aprovação.",
        category: "Financeiro",
        eta: "3 a 6 min",
        href: "#"
    },
    {
        title: "Solicitação de Aditivo",
        description:
            "Registre alterações de escopo ou prazo em contratos vigentes com justificativa e documentos de suporte.",
        category: "Contratos",
        eta: "5 a 7 min",
        href: "#"
    }
];

const flowCards = document.getElementById("flowCards");
const flowCountBadge = document.getElementById("flowCountBadge");
const flowHighlights = document.getElementById("flowHighlights");
const flowEmptyState = document.getElementById("flowEmptyState");

function pluralizeFlows(count) {
    return count === 1 ? "1 fluxo" : `${count} fluxos`;
}

function renderHighlights(flows) {
    const categories = new Set(flows.map(flow => flow.category)).size;

    flowHighlights.innerHTML = `
        <article class="imp-stat">
            <div class="imp-stat__icon">＋</div>
            <div>
                <span class="imp-stat__label">Fluxos disponíveis</span>
                <strong class="imp-stat__value">${flows.length}</strong>
            </div>
        </article>
        <article class="imp-stat">
            <div class="imp-stat__icon">▥</div>
            <div>
                <span class="imp-stat__label">Categorias</span>
                <strong class="imp-stat__value">${categories}</strong>
            </div>
        </article>
        <article class="imp-stat">
            <div class="imp-stat__icon">◷</div>
            <div>
                <span class="imp-stat__label">Tempo médio</span>
                <strong class="imp-stat__value">5 min</strong>
            </div>
        </article>
        <article class="imp-stat">
            <div class="imp-stat__icon">✓</div>
            <div>
                <span class="imp-stat__label">Acesso direto</span>
                <strong class="imp-stat__value">100%</strong>
            </div>
        </article>
    `;
}

function renderFlowCards(flows) {
    flowCountBadge.textContent = pluralizeFlows(flows.length);

    if (!flows.length) {
        flowCards.innerHTML = "";
        flowHighlights.innerHTML = "";
        flowEmptyState.classList.remove("imp-hidden");
        return;
    }

    flowEmptyState.classList.add("imp-hidden");
    renderHighlights(flows);

    flowCards.innerHTML = flows
        .map(
            flow => `
                <article class="imp-card imp-request-card">
                    <header class="imp-card__header">
                        <div>
                            <div class="imp-request-card__meta">
                                <span>${flow.category}</span>
                                <span>${flow.eta}</span>
                            </div>
                            <h3 class="imp-card__title">${flow.title}</h3>
                        </div>
                    </header>

                    <div class="imp-card__body">
                        <p class="imp-request-card__description">
                            ${flow.description}
                        </p>
                    </div>

                    <footer class="imp-card__footer">
                        <a class="imp-btn" href="${flow.href}">
                            Acessar fluxo
                        </a>
                    </footer>
                </article>
            `
        )
        .join("");
}

renderFlowCards(flowCatalog);