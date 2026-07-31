(() => {
  "use strict";

  const normalize = value =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const initSolicitacoesPage = () => {
    const searchField = document.querySelector("[data-request-search]");
    const statusFilter = document.querySelector(
      "[data-request-status-filter]"
    );

    if (!searchField || !statusFilter) return;

    const rows = Array.from(
      document.querySelectorAll("[data-request-row]")
    );
    const emptyState = document.querySelector("[data-request-empty]");
    const totalOutput = document.querySelector("[data-summary-total]");
    const visibleOutput = document.querySelector("[data-summary-visible]");
    const openOutput = document.querySelector("[data-summary-open]");

    const getUniqueCount = predicate => {
      const ids = new Set();

      rows.forEach(row => {
        if (!predicate(row)) return;
        ids.add(row.dataset.requestId || row.dataset.search);
      });

      return ids.size;
    };

    const sync = () => {
      const searchTerm = normalize(searchField.value);
      const selectedStatus = normalize(statusFilter.value);

      rows.forEach(row => {
        const haystack = normalize(row.dataset.search);
        const status = normalize(row.dataset.status);
        const matchesSearch = !searchTerm || haystack.includes(searchTerm);
        const matchesStatus = !selectedStatus || status === selectedStatus;
        const visible = matchesSearch && matchesStatus;

        row.hidden = !visible;
      });

      const visibleCount = getUniqueCount(row => !row.hidden);
      const openCount = getUniqueCount(
        row =>
          !row.hidden &&
          normalize(row.dataset.status) === normalize("Em andamento")
      );
      const totalCount = getUniqueCount(() => true);

      if (visibleOutput) {
        visibleOutput.textContent = String(visibleCount);
      }

      if (totalOutput) {
        totalOutput.textContent = String(totalCount);
      }

      if (openOutput) {
        openOutput.textContent = String(openCount);
      }

      if (emptyState) {
        emptyState.classList.toggle("imp-hidden", visibleCount > 0);
      }
    };

    searchField.addEventListener("input", sync);
    statusFilter.addEventListener("change", sync);
    sync();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSolicitacoesPage);
  } else {
    initSolicitacoesPage();
  }
})();