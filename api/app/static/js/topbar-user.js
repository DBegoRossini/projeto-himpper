(() => {
  "use strict";

  const normalizeWhitespace = value =>
    String(value || "")
      .replace(/\s+/g, " ")
      .trim();

  const getInitials = value => {
    const normalized = normalizeWhitespace(value);

    if (!normalized) return "US";

    const parts = normalized.split(" ").filter(Boolean);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
  };

  const initTopbarUser = () => {
    document.querySelectorAll("[data-topbar-user]").forEach(card => {
      const name = normalizeWhitespace(card.dataset.userName);
      const email = normalizeWhitespace(card.dataset.userEmail);
      const role = normalizeWhitespace(card.dataset.userRole);
      const avatar = card.querySelector("[data-topbar-user-avatar]");
      const emailElement = card.querySelector("[data-topbar-user-email]");
      const roleElement = card.querySelector("[data-topbar-user-role]");

      if (avatar) {
        avatar.textContent = getInitials(name || email);
      }

      if (emailElement && !email) {
        emailElement.remove();
      }

      if (roleElement && !role) {
        roleElement.remove();
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTopbarUser);
  } else {
    initTopbarUser();
  }
})();