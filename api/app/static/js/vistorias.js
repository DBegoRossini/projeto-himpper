(() => {
  "use strict";

  const form       = document.getElementById("supplierForm");
  const blocosList = form.querySelector("[data-blocos-list]");
  const blocoTpl   = document.getElementById("blocoTemplate");
  const loteTpl    = document.getElementById("loteTemplate");

  const SITUACOES = {
    agendar:  { value: "agendado",  badge: "text-bg-success" },
    devolver: { value: "devolvido", badge: "text-bg-warning" }
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
    bloco.querySelector("[data-lotes-list]")
         .appendChild(loteTpl.content.cloneNode(true));
    reindex();
  };

  const addBloco = () => {
    blocosList.appendChild(blocoTpl.content.cloneNode(true));
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
    if (e.target.dataset.field === "data_inicio") {
      const fim = e.target.closest("[data-bloco]").querySelector('[data-field="data_fim"]');
      fim.min = e.target.value;
    }
  });

  form.addEventListener("submit", e => {
    if (!form.checkValidity()) {
      e.preventDefault();
      form.reportValidity();
    }
  });

  addBloco(); // estado inicial
})();