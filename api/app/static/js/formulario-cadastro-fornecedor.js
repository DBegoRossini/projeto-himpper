(() => {
  "use strict";

  const normalizeDocument = value =>
    String(value || "").replace(/\D/g, "");

  const registeredDocuments = () => {
    const source = document.querySelector("[data-fornecedores-cadastrados]");

    return new Set(
      Array.from(source?.options || [])
        .map(option => normalizeDocument(option.value))
        .filter(Boolean)
    );
  };

  const showMessage = (element, text) => {
    if (!element) return;

    element.textContent = text;
    element.hidden = !text;
  };

  const validateSupplier = form => {
    const activity = form.querySelector("[name='tipo_atividade']")?.value;
    const documentInput = form.querySelector("[data-fornecedor-documento]");
    const documentMessage = form.querySelector(
      "[data-fornecedor-documento-message]"
    );

    if (
      activity !== "CADASTRO_FORNECEDOR"
      || !documentInput
    ) {
      return true;
    }

    const documentValue = normalizeDocument(documentInput.value);
    const alreadyRegistered = registeredDocuments().has(documentValue);

    if (alreadyRegistered) {
      const message =
        "Este fornecedor já está cadastrado. Não é possível abrir uma solicitação de cadastro.";
      documentInput.setCustomValidity(message);
      showMessage(documentMessage, message);
      documentInput.reportValidity();
      return false;
    }

    documentInput.setCustomValidity("");
    showMessage(documentMessage, "");
    return true;
  };

  const validatePaymentMethods = form => {
    const activity = form.querySelector("[name='tipo_atividade']")?.value;

    if (activity !== "CADASTRO_FORNECEDOR") return true;

    const methods = Array.from(
      form.querySelectorAll("[name='forma_pagamento']")
    );
    const message = form.querySelector("[data-forma-pagamento-message]");
    const valid = methods.some(method => method.checked);

    if (!valid) {
      showMessage(message, "Selecione pelo menos uma forma de pagamento.");
      methods[0]?.setCustomValidity("Selecione pelo menos uma forma de pagamento.");
      methods[0]?.reportValidity();
      return false;
    }

    methods.forEach(method => method.setCustomValidity(""));
    showMessage(message, "");
    return true;
  };

  window.enviarCadastroFornecedor = formDocument => {
    const form = formDocument.querySelector("#supplierForm");

    if (
      !form
      || !validateSupplier(form)
      || !validatePaymentMethods(form)
    ) {
      return;
    }

    enviarFormulario(
      formDocument,
      form.dataset.idFluxo,
      form.dataset.idEtapaInicial
    );
  };

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("supplierForm");
    const documentInput = form?.querySelector("[data-fornecedor-documento]");

    documentInput?.addEventListener("input", () => {
      documentInput.setCustomValidity("");
      showMessage(
        form.querySelector("[data-fornecedor-documento-message]"),
        ""
      );
    });

    form?.addEventListener("change", event => {
      if (event.target.name === "forma_pagamento") {
        validatePaymentMethods(form);
      }
    });
  });
})();
