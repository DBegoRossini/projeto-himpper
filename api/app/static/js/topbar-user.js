(() => {
  "use strict";

  const normalizeWhitespace = value =>
    String(value || "")
      .replace(/\s+/g, " ")
      .trim();

  const closeMenu = card => {
    const toggle = card.querySelector("[data-topbar-user-toggle]");
    const menu = card.querySelector("[data-topbar-user-menu]");

    card.classList.remove("is-open");

    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    }

    if (menu) {
      menu.hidden = true;
    }
  };

  const openMenu = card => {
    const toggle = card.querySelector("[data-topbar-user-toggle]");
    const menu = card.querySelector("[data-topbar-user-menu]");

    card.classList.add("is-open");

    if (toggle) {
      toggle.setAttribute("aria-expanded", "true");
    }

    if (menu) {
      menu.hidden = false;
    }
  };

  const bindMenu = card => {
    const toggle = card.querySelector("[data-topbar-user-toggle]");
    const menu = card.querySelector("[data-topbar-user-menu]");
    const logoutButton = card.querySelector("[data-topbar-user-logout]");

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", () => {
      const isOpen = card.classList.contains("is-open");

      document.querySelectorAll("[data-topbar-user].is-open").forEach(openCard => {
        if (openCard !== card) {
          closeMenu(openCard);
        }
      });

      if (isOpen) {
        closeMenu(card);
      } else {
        openMenu(card);
      }
    });

    document.addEventListener("click", event => {
      if (!card.contains(event.target)) {
        closeMenu(card);
      }
    });

    card.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeMenu(card);
        toggle.focus();
      }
    });

    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        closeMenu(card);
      });
    }
  };

  const initTopbarUser = () => {
    document.querySelectorAll("[data-topbar-user]").forEach(card => {
      const name = normalizeWhitespace(card.dataset.userName);
      const email = normalizeWhitespace(card.dataset.userEmail);
      const role = normalizeWhitespace(card.dataset.userRole);
      const emailElement = card.querySelector("[data-topbar-user-email]");
      const roleElement = card.querySelector("[data-topbar-user-role]");
      const detailNameElement = card.querySelector("[data-topbar-user-detail-name]");
      const detailEmailElement = card.querySelector("[data-topbar-user-detail-email]");
      const detailRoleElement = card.querySelector("[data-topbar-user-detail-role]");
      const detailEmailWrap = card.querySelector('[data-topbar-user-detail="email"]');
      const detailRoleWrap = card.querySelector('[data-topbar-user-detail="role"]');

      if (detailNameElement) {
        detailNameElement.textContent = name;
      }

      if (emailElement && !email) {
        emailElement.remove();
      }

      if (detailEmailElement) {
        detailEmailElement.textContent = email;
      }

      if (detailEmailWrap && !email) {
        detailEmailWrap.remove();
      }

      if (roleElement && !role) {
        roleElement.remove();
      }

      if (detailRoleElement) {
        detailRoleElement.textContent = role;
      }

      if (detailRoleWrap && !role) {
        detailRoleWrap.remove();
      }

      bindMenu(card);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTopbarUser);
  } else {
    initTopbarUser();
  }
})();