(() => {
  "use strict";

  const form       = document.getElementById("supplierForm");
  const blocosList = form.querySelector("[data-blocos-list]");
  const blocoTpl   = document.getElementById("blocoTemplate");
  const loteTpl    = document.getElementById("loteTemplate");
  const empreendimentos = Array.isArray(window.infoempreend)
    ? window.infoempreend.filter(item => item && typeof item === "object")
    : [];

  const SITUACOES = {
    agendar:  { value: "agendado",  badge: "text-bg-success" },
    devolver: { value: "devolvido", badge: "text-bg-warning" }
  };

  const getEmpreendimentoRows = value =>
    empreendimentos.filter(item =>
      String(item.CODEMP ?? "").trim() === String(value).trim() ||
      String(item.NOME ?? "").trim() === String(value).trim()
    );

  const getDistinctOptions = (items, field, selectedValue = "") => {
    const values = [...new Set(
      items
        .map(item => String(item[field] ?? "").trim())
        .filter(Boolean)
    )];

    if (selectedValue && !values.includes(String(selectedValue))) {
      values.push(String(selectedValue));
    }

    return values.map(value => ({ value, label: value }));
  };

  const renderOptions = (select, options, placeholder, preserveValue) => {
    const selectedValue = preserveValue
      ? select.dataset.currentValue ?? select.value
      : "";
    const locked = select.dataset.impperLocked === "true";

    select.innerHTML = "";

    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = placeholder;
    select.appendChild(placeholderOption);

    options.forEach(({ value, label }) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      select.appendChild(option);
    });

    select.value = selectedValue;
    select.dataset.currentValue = select.value;
    select.disabled = locked || options.length === 0;
  };

  const updateLoteOptions = (row, preserveValue) => {
    const bloco = row.closest("[data-bloco]");
    const empreendimento = bloco.querySelector('[data-field="empreendimento"]');
    const quadra = row.querySelector('[data-lote-field="quadra"]');
    const lote = row.querySelector('[data-lote-field="lote"]');
    const rows = quadra.value
      ? getEmpreendimentoRows(empreendimento.value).filter(item =>
        String(item.QUADRA ?? "").trim() === quadra.value
      )
      : [];
    const selectedLote = preserveValue
      ? lote.dataset.currentValue ?? lote.value
      : "";

    renderOptions(
      lote,
      getDistinctOptions(rows, "LOTE", selectedLote),
      "Selecione o lote",
      preserveValue
    );
  };

  const fillCliente = (row, preserveValue = false) => {
    const cliente = row.querySelector('[data-lote-field="cliente"]');
    if (!cliente) return;

    const bloco = row.closest("[data-bloco]");
    const empreendimento = bloco.querySelector('[data-field="empreendimento"]').value;
    const quadra = row.querySelector('[data-lote-field="quadra"]').value;
    const lote = row.querySelector('[data-lote-field="lote"]').value;

    const match = lote && getEmpreendimentoRows(empreendimento).find(item =>
      String(item.QUADRA ?? "").trim() === quadra &&
      String(item.LOTE ?? "").trim() === lote
    );

    if (match) {
      cliente.value = String(match.CLIENTE ?? "").trim();
    } else if (!preserveValue) {
      cliente.value = "";
    }
  };

  const updateBlocoOptions = (bloco, preserveValue) => {
    const empreendimento = bloco.querySelector('[data-field="empreendimento"]');
    const rows = getEmpreendimentoRows(empreendimento.value);

    bloco.querySelectorAll('[data-lote-field="quadra"]').forEach(quadra => {
      const row = quadra.closest("[data-lote-row]");
      const lote = row.querySelector('[data-lote-field="lote"]');
      const selectedQuadra = preserveValue
        ? quadra.dataset.currentValue ?? quadra.value
        : "";

      renderOptions(
        quadra,
        getDistinctOptions(rows, "QUADRA", selectedQuadra),
        "Selecione a quadra",
        preserveValue
      );

      updateLoteOptions(row, preserveValue);
      lote.dataset.currentValue = lote.value;
    });
  };

  const normalizeText = value =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const initEmpreendimentoSearch = bloco => {
    const box = bloco.querySelector("[data-empreendimento-combobox]");
    if (!box || box.dataset.bound) return;
    box.dataset.bound = "true";

    const search = box.querySelector("[data-empreendimento-search]");
    const hidden = box.querySelector('[data-field="empreendimento"]');
    const menu = box.querySelector("[data-empreendimento-dropdown]");
    const options = Array.from(
      box.querySelectorAll("[data-empreendimento-source] option")
    ).map(option => ({
      value: option.value,
      label: option.textContent.trim()
    }));

    const display = option => `${option.value} - ${option.label}`;
    const closeMenu = () => {
      menu.classList.remove("show");
      search.setAttribute("aria-expanded", "false");
    };

    const render = () => {
      if (search.disabled) return;

      const term = normalizeText(search.value);
      const filtered = options.filter(option =>
        normalizeText(display(option)).includes(term)
      );

      menu.innerHTML = "";

      if (!filtered.length) {
        const empty = document.createElement("div");
        empty.className = "imp-search-select__empty";
        empty.textContent = "Nenhuma opção encontrada.";
        menu.appendChild(empty);
      }

      filtered.forEach(option => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "dropdown-item imp-search-select__option";
        item.textContent = display(option);
        item.addEventListener("mousedown", e => e.preventDefault());
        item.addEventListener("click", () => {
          search.value = display(option);
          search.setCustomValidity("");
          hidden.value = option.value;
          hidden.dispatchEvent(new Event("change", { bubbles: true }));
          closeMenu();
        });
        menu.appendChild(item);
      });

      menu.classList.add("show");
      search.setAttribute("aria-expanded", "true");
    };

    const initial = options.find(option =>
      option.value === hidden.value || option.label === hidden.value
    );
    if (initial) search.value = display(initial);

    search.addEventListener("focus", render);
    search.addEventListener("input", () => {
      if (hidden.value) {
        hidden.value = "";
        hidden.dispatchEvent(new Event("change", { bubbles: true }));
      }
      search.setCustomValidity(
        search.value.trim() ? "Selecione uma opção da lista." : ""
      );
      render();
    });
    search.addEventListener("blur", closeMenu);
  };

  // Reindexa nomes (blocos-i-campo / blocos-i-lotes-j-campo), títulos e botões remover
  const reindex = () => {
    const blocos = blocosList.querySelectorAll(":scope > [data-bloco]");

    blocos.forEach((bloco, i) => {
      bloco.querySelectorAll("[data-field]").forEach(el => {
        el.name = `blocos-${i}-${el.dataset.field}`;
      });
      bloco.querySelector("[data-bloco-title]").textContent = `Período ${i + 1}`;
      bloco.querySelector("[data-remove-bloco]").hidden = blocos.length === 1;

      const lotes = bloco.querySelectorAll("[data-lote-row]");
      lotes.forEach((row, j) => {
        row.querySelectorAll("[data-lote-field]").forEach(el => {
          el.name = `blocos-${i}-lotes-${j}-${el.dataset.loteField}`;
        });
        row.querySelector("[data-remove-lote]").hidden = lotes.length === 1;
      });
    });
  };

  const addLote = bloco => {
    const row = loteTpl.content.cloneNode(true);
    bloco.querySelector("[data-lotes-list]").appendChild(row);
    reindex();
    updateBlocoOptions(bloco, true);
  };

  const addBloco = () => {
    blocosList.appendChild(blocoTpl.content.cloneNode(true));
    initEmpreendimentoSearch(blocosList.lastElementChild);
    addLote(blocosList.lastElementChild);   // todo bloco nasce com 1 lote
  };

  // Delegation: um único listener de click resolve tudo, inclusive elementos futuros
  form.addEventListener("click", e => {
    const t = e.target;

    if (t.closest("[data-add-bloco]")) {
      addBloco();
      return;
    }
    if (t.closest("[data-remove-bloco]")) {
      t.closest("[data-bloco]").remove();
      reindex();
      return;
    }
    if (t.closest("[data-add-lote]")) {
      addLote(t.closest("[data-bloco]"));
      return;
    }
    if (t.closest("[data-remove-lote]")) {
      t.closest("[data-lote-row]").remove();
      reindex();
      return;
    }

    const actionBtn = t.closest("[data-action]");
    if (actionBtn) {
      const row = actionBtn.closest("[data-lote-row]");
      const cfg = SITUACOES[actionBtn.dataset.action];
      row.querySelector('[data-lote-field="situacao"]').value = cfg.value;

      const badge = row.querySelector("[data-situacao-badge]");
      badge.textContent = cfg.value;
      badge.className = `badge ${cfg.badge}`;

      if (actionBtn.dataset.action === "agendar") {
        agendarVist(row);
      }

      // Ponto de extensão: se for chamar o backend na hora (fetch), dispare aqui.
      row.dispatchEvent(new CustomEvent("lote-action", {
        bubbles: true,
        detail: { action: actionBtn.dataset.action, row }
      }));
    }
  });

  // data_fim >= data_inicio (escopado ao bloco)
  form.addEventListener("change", e => {
    const target = e.target;
    const bloco = target.closest("[data-bloco]");

    if (target.dataset.field === "empreendimento") {
      bloco.querySelectorAll("[data-lote-field]").forEach(field => {
        field.dataset.currentValue = "";
      });
      updateBlocoOptions(bloco, false);
      bloco.querySelectorAll("[data-lote-row]").forEach(row =>
        fillCliente(row, true)
      );
      return;
    }

    if (target.dataset.loteField === "quadra") {
      target.dataset.currentValue = target.value;
      const lote = target.closest("[data-lote-row]").querySelector('[data-lote-field="lote"]');
      lote.dataset.currentValue = "";
      updateLoteOptions(target.closest("[data-lote-row]"), false);
      fillCliente(target.closest("[data-lote-row]"));
      return;
    }

    if (target.dataset.loteField === "lote") {
      target.dataset.currentValue = target.value;
      fillCliente(target.closest("[data-lote-row]"));
      return;
    }

    if (target.dataset.field === "data_inicio") {
      const fim = bloco.querySelector('[data-field="data_fim"]');
      fim.min = e.target.value;
    }
  });

  form.addEventListener("submit", e => {
    if (!form.checkValidity()) {
      e.preventDefault();
      form.reportValidity();
    }
  });

  if (!blocosList.querySelector("[data-bloco]")) {
    addBloco();
  } else {
    reindex();
    blocosList.querySelectorAll(":scope > [data-bloco]").forEach(bloco => {
      initEmpreendimentoSearch(bloco);
      updateBlocoOptions(bloco, true);
      bloco.querySelectorAll("[data-lote-row]").forEach(fillCliente);
    });
  }
})();