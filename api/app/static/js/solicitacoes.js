(() => {
  "use strict";

  const normalize = value =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const getDeadline = row => {
    const value = row.dataset.deadline;

    if (!value) {
      return Number.POSITIVE_INFINITY;
    }

    const timestamp = Date.parse(value);

    return Number.isNaN(timestamp)
      ? Number.POSITIVE_INFINITY
      : timestamp;
  };

  const getOriginalOrder = row => {
    const value = Number(row.dataset.originalOrder);

    return Number.isNaN(value)
      ? Number.MAX_SAFE_INTEGER
      : value;
  };

  const sortContainer = (container, order) => {
    if (!container) {
      return;
    }

    const items = Array.from(container.children).filter(
      element => element.matches("[data-request-row]")
    );

    items.sort((a, b) => {
      if (order === "deadline-asc") {
        return getDeadline(a) - getDeadline(b);
      }

      if (order === "deadline-desc") {
        const deadlineA = getDeadline(a);
        const deadlineB = getDeadline(b);

        if (
          deadlineA === Number.POSITIVE_INFINITY &&
          deadlineB === Number.POSITIVE_INFINITY
        ) {
          return 0;
        }

        if (deadlineA === Number.POSITIVE_INFINITY) {
          return 1;
        }

        if (deadlineB === Number.POSITIVE_INFINITY) {
          return -1;
        }

        return deadlineB - deadlineA;
      }

      return getOriginalOrder(a) - getOriginalOrder(b);
    });

    items.forEach(item => {
      container.appendChild(item);
    });
  };

  const initSolicitacoesPage = () => {
    const searchField = document.querySelector(
      "[data-request-search]"
    );

    const requesterFilter = document.querySelector(
      "[data-request-requester-filter]"
    );

    const statusFilter = document.querySelector(
      "[data-request-status-filter]"
    );

    const ownerFilter = document.querySelector(
      "[data-request-owner-filter]"
    );

    const sortFilter = document.querySelector(
      "[data-request-sort]"
    );

    if (!searchField) {
      return;
    }

    const rows = Array.from(
      document.querySelectorAll("[data-request-row]")
    );

    const emptyState = document.querySelector(
      "[data-request-empty]"
    );

    const totalOutput = document.querySelector(
      "[data-summary-total]"
    );

    const visibleOutput = document.querySelector(
      "[data-summary-visible]"
    );

    const openOutput = document.querySelector(
      "[data-summary-open]"
    );

    const mineOutput = document.querySelector(
      "[data-summary-mine]"
    );

    const tableBody = document.querySelector(
      "[data-request-table] tbody"
    );

    const mobileList = document.querySelector(
      "[data-request-mobile-list]"
    );

    const getUniqueCount = predicate => {
      const ids = new Set();

      rows.forEach(row => {
        if (!predicate(row)) {
          return;
        }

        ids.add(
          row.dataset.requestId ||
          row.dataset.search
        );
      });

      return ids.size;
    };

    const applySort = () => {
      const order =
        sortFilter?.value ||
        "original";

      sortContainer(
        tableBody,
        order
      );

      sortContainer(
        mobileList,
        order
      );
    };

    const sync = () => {
      const searchTerm = normalize(
        searchField.value
      );

      const requesterTerm = normalize(
        requesterFilter?.value
      );

      const selectedStatus = normalize(
        statusFilter?.value
      );

      const selectedOwner = normalize(
        ownerFilter?.value
      );

      rows.forEach(row => {
        const haystack = normalize(
          row.dataset.search
        );

        const requester = normalize(
          row.dataset.requester
        );

        const status = normalize(
          row.dataset.status
        );

        const owner = normalize(
          row.dataset.owner
        );

        const matchesSearch =
          !searchTerm ||
          haystack.includes(searchTerm);

        const matchesRequester =
          !requesterTerm ||
          requester.includes(requesterTerm);

        const matchesStatus =
          !statusFilter ||
          !selectedStatus ||
          status === selectedStatus;

        const matchesOwner =
          !ownerFilter ||
          !selectedOwner ||
          owner === selectedOwner;

        const visible =
          matchesSearch &&
          matchesRequester &&
          matchesStatus &&
          matchesOwner;

        row.hidden = !visible;
      });

      applySort();

      const visibleCount =
        getUniqueCount(
          row => !row.hidden
        );

      const totalCount =
        getUniqueCount(
          () => true
        );

      const mineCount =
        getUniqueCount(
          row =>
            normalize(row.dataset.owner) ===
            "mine"
        );

      const openCount =
        getUniqueCount(
          row =>
            !row.hidden &&
            normalize(row.dataset.status) ===
            normalize("Em andamento")
        );

      if (visibleOutput) {
        visibleOutput.textContent =
          String(visibleCount);
      }

      if (totalOutput) {
        totalOutput.textContent =
          String(totalCount);
      }

      if (mineOutput) {
        mineOutput.textContent =
          String(mineCount);
      }

      if (openOutput) {
        openOutput.textContent =
          String(openCount);
      }

      if (emptyState) {
        emptyState.classList.toggle(
          "imp-hidden",
          visibleCount > 0
        );
      }
    };

    searchField.addEventListener(
      "input",
      sync
    );

    requesterFilter?.addEventListener(
      "input",
      sync
    );

    statusFilter?.addEventListener(
      "change",
      sync
    );

    ownerFilter?.addEventListener(
      "change",
      sync
    );

    sortFilter?.addEventListener(
      "change",
      sync
    );

    sync();
  };

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initSolicitacoesPage
    );
  } else {
    initSolicitacoesPage();
  }
})();