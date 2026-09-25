(() => {
  "use strict";

  const normalizeDocument = value =>
    String(value || "").replace(/\D/g, "");

  // execTarefas.html reuses a shared form (id="purchaseForm") instead of #supplierForm
  const getSupplierForm = scope =>
    scope.querySelector("#supplierForm") || scope.querySelector("form[data-execution-form]");

  const registeredDocuments = () => {
    const source = document.querySelector("[data-fornecedores-cadastrados]");

    return new Set(
      Array.from(source?.options || [])
        .map(option => normalizeDocument(option.value))
        .filter(Boolean)
    );
  };

  const registeredSuppliers = () => {
    const source = document.querySelector("[data-fornecedores-cadastrados]");

    return Array.from(source?.options || []).map(option => ({
      document: normalizeDocument(option.value),
      name: String(option.dataset.razaoSocial || option.textContent || "").trim()
    }));
  };

  const showMessage = (element, text) => {
    if (!element) return;

    element.textContent = text;
    element.hidden = !text;
  };

  const syncSupplierFields = form => {
    const activity = form.querySelector("[name='tipo_atividade']")?.value;
    const isCadastro = activity === "CADASTRO_FORNECEDOR";
    const cadastroName = form.querySelector("[data-fornecedor-razao-social-cadastro]");
    const alteracaoName = form.querySelector("[data-fornecedor-razao-social]");
    const cadastroDocument = form.querySelector("[data-fornecedor-documento-cadastro]");
    const alteracaoDocument = form.querySelector("[data-fornecedor-documento]");

    [
      [cadastroName, isCadastro],
      [cadastroDocument, isCadastro],
      [alteracaoName, !isCadastro && Boolean(activity)],
      [alteracaoDocument, !isCadastro && Boolean(activity)]
    ].forEach(([input, active]) => {
      if (!input) return;

      const editable = input.dataset.supplierEditable === "true";
      input.disabled = !active || !editable;
      input.required = active && editable;
      input.dataset.fieldName ||= input.name;
      input.name = active ? input.dataset.fieldName : "";
    });

    form.querySelector("[data-fornecedor-cadastro-razao-social]").hidden = !isCadastro;
    form.querySelector("[data-fornecedor-cadastro-documento]").hidden = !isCadastro;
    form.querySelector("[data-fornecedor-alteracao-razao-social]").hidden = isCadastro || !activity;
    form.querySelector("[data-fornecedor-alteracao-documento]").hidden = isCadastro || !activity;
  };

  const renderSupplierMenu = (input, menu, suppliers, field) => {
    const term = input.value.trim().toLowerCase();
    const matches = suppliers.filter(supplier => {
      const value = field === "document"
        ? supplier.document
        : supplier.name.toLowerCase();

      return !term || value.includes(term);
    });

    menu.innerHTML = "";

    if (!matches.length) {
      const empty = document.createElement("div");
      empty.className = "imp-search-select__empty";
      empty.textContent = "Nenhum fornecedor encontrado.";
      menu.appendChild(empty);
      menu.classList.add("show");
      return;
    }

    matches.forEach(supplier => {
      const option = document.createElement("button");
      const code = document.createElement("span");
      const description = document.createElement("span");

      option.type = "button";
      option.className = "dropdown-item imp-search-select__option";
      code.className = "imp-search-select__code";
      code.textContent = supplier.document;
      description.className = "imp-search-select__description";
      description.textContent = supplier.name;
      option.append(code, description);
      option.addEventListener("mousedown", event => event.preventDefault());
      option.addEventListener("click", () => {
        input.value = field === "document" ? supplier.document : supplier.name;
        if (field === "document") {
          document.querySelector("[data-fornecedor-razao-social]").value = supplier.name;
        } else {
          document.querySelector("[data-fornecedor-documento]").value = supplier.document;
        }
        input.setCustomValidity("");
        menu.classList.remove("show");
      });
      menu.appendChild(option);
    });

    menu.classList.add("show");
  };

  const validateSupplier = form => {
    const activity = form.querySelector("[name='tipo_atividade']")?.value;
    const documentInput = form.querySelector(
      activity === "CADASTRO_FORNECEDOR"
        ? "[data-fornecedor-documento-cadastro]"
        : "[data-fornecedor-documento]"
    );
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

  const bindSupplierSearch = form => {
    const nameInput = form.querySelector("[data-fornecedor-razao-social]");
    const documentInput = form.querySelector("[data-fornecedor-documento]");
    const suppliers = registeredSuppliers();

    if (!nameInput || !documentInput) return;

    const nameMenu = form.querySelector("[data-fornecedor-razao-social-menu]");
    const documentMenu = form.querySelector("[data-fornecedor-documento-menu]");

    const bindSearch = (input, menu, field) => {
      if (!input || !menu) return;

      const update = () => renderSupplierMenu(input, menu, suppliers, field);
      input.addEventListener("focus", update);
      input.addEventListener("input", update);
      input.addEventListener("click", update);
      input.addEventListener("blur", () => {
        window.setTimeout(() => menu.classList.remove("show"), 150);
      });
    };

    bindSearch(nameInput, nameMenu, "name");
    bindSearch(documentInput, documentMenu, "document");

    const fillFromDocument = () => {
      const documentValue = normalizeDocument(documentInput.value);
      const supplier = suppliers.find(item => item.document === documentValue);

      if (supplier) {
        form.querySelector("[data-fornecedor-razao-social]").value = supplier.name;
        form.querySelector("[data-fornecedor-razao-social-cadastro]").value = supplier.name;
      }
    };

    const fillFromName = () => {
      const nameValue = nameInput.value.trim().toLowerCase();
      const supplier = suppliers.find(item =>
        item.name.toLowerCase() === nameValue
      );

      if (supplier) {
        form.querySelector("[data-fornecedor-documento]").value = supplier.document;
        form.querySelector("[data-fornecedor-documento-cadastro]").value = supplier.document;
      }
    };

    documentInput.addEventListener("change", fillFromDocument);
    documentInput.addEventListener("blur", fillFromDocument);
    nameInput.addEventListener("change", fillFromName);
    nameInput.addEventListener("blur", fillFromName);
  };

  window.enviarCadastroFornecedor = formDocument => {
    const form = getSupplierForm(formDocument);
    if (
      !form
      || !validateSupplier(form)
      || !validatePaymentMethods(form)
    ) {
      return;
    }

    const paymentInputs = Array.from(
      form.querySelectorAll("input[name='forma_pagamento']")
    );
    const paymentValues = paymentInputs
      .filter(input => input.checked)
      .map(input => input.value);
    const paymentField = document.createElement("input");

    paymentInputs.forEach(input => {
      input.name = "forma_pagamento_opcao";
    });
    paymentField.type = "hidden";
    paymentField.name = "forma_pagamento";
    paymentField.value = paymentValues.join(";");
    form.appendChild(paymentField);

    enviarFormulario(
      formDocument,
      form.dataset.idFluxo,
      "CF-00"
    );
  };

  document.addEventListener("DOMContentLoaded", () => {
    const form = getSupplierForm(document);
    const documentInput = form?.querySelector("[data-fornecedor-documento]");

    if (form) {
      syncSupplierFields(form);
      bindSupplierSearch(form);
    }

    form?.querySelector("[name='tipo_atividade']")?.addEventListener(
      "change",
      () => syncSupplierFields(form)
    );

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
