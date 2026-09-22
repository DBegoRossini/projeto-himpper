(() => {
  "use strict";

  const normalizeText = value =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  // Agora aceita "description" explicitamente, em vez de deduzir via
  // parsing de "valor - descrição" no label. Isso evita perder
  // informação quando o label não segue esse padrão à risca.
  const createOption = ({ value, label, description }) => {
    const optionValue = String(value ?? "").trim();
    const optionLabel = String(label ?? value ?? "").trim();
    const optionDescription = String(description ?? "").trim();

    return {
      value: optionValue,
      label: optionLabel,
      description: optionDescription,
      search: normalizeText(
        `${optionValue} ${optionLabel} ${optionDescription}`
      )
    };
  };

  const readOptionsFromSelect = source => {
    if (!source) return [];

    return Array.from(source.options)
      .filter(option => option.value)
      .map(option =>
        createOption({
          value: option.value,
          label: option.dataset.label || option.textContent.trim(),
          description: option.dataset.description || ""
        })
      )
      .filter(option => option.value && option.label);
  };

  const filterItems = (items, term) => {
    const normalizedTerm = normalizeText(term);

    if (!normalizedTerm) return items;

    return items.filter(item => item.search.includes(normalizedTerm));
  };

  // Descrição agora vem direto do dado da option, sem tentar
  // "descascar" o prefixo "valor - " do label. Se não houver
  // description explícita, cai de volta pro label (comportamento antigo).
  const getDescription = option => option.description || option.label;

  const getDisplayValue = option => {
    if (!option) return "";

    return `${option.value} - ${getDescription(option)}`;
  };

  const closeMenu = (input, menu) => {
    if (!menu) return;

    menu.classList.remove("show");

    if (input) {
      input.setAttribute("aria-expanded", "false");
    }
  };

  const openMenu = (input, menu) => {
    if (!input || !menu || input.disabled) return;

    menu.classList.add("show");
    input.setAttribute("aria-expanded", "true");
  };

  const renderMenu = ({ input, menu, options, emptyLabel, onSelect }) => {
    if (!menu) return;

    menu.innerHTML = "";

    if (!options.length) {
      const empty = document.createElement("div");

      empty.className = "imp-search-select__empty";
      empty.textContent = emptyLabel;

      menu.appendChild(empty);
      openMenu(input, menu);

      return;
    }

    options.forEach(option => {
      const button = document.createElement("button");
      const code = document.createElement("span");
      const description = document.createElement("span");

      button.type = "button";
      button.className = "dropdown-item imp-search-select__option";
      button.setAttribute("role", "option");

      code.className = "imp-search-select__code";
      code.textContent = option.value;

      description.className = "imp-search-select__description";
      description.textContent = getDescription(option);

      button.append(code, description);

      button.addEventListener("mousedown", event => {
        event.preventDefault();
      });

      button.addEventListener("click", () => {
        onSelect(option);
      });

      menu.appendChild(button);
    });

    openMenu(input, menu);
  };

  const splitStoredValues = value => {
    return String(value ?? "")
      .split(/[;,]/)
      .map(item => item.trim())
      .filter(Boolean);
  };

  const initMultiSearchList = ({
    listSelector,
    rowSelector,
    searchSelector,
    selectedSelector,
    dropdownSelector,
    addSelector,
    removeSelector,
    hiddenSelector,
    options,
    emptyLabel,
    requiredMessage
  }) => {
    const list = document.querySelector(listSelector);
    const hidden = document.querySelector(hiddenSelector);
    const addButton = document.querySelector(addSelector);

    if (!list || !hidden) return null;

    const boundRows = new WeakSet();

    const findOption = value => {
      const normalizedValue = String(value ?? "").trim();

      return options.find(option => option.value === normalizedValue);
    };

    const getRows = () => {
      return Array.from(list.querySelectorAll(rowSelector));
    };

    const getSelectedValues = () => {
      return getRows()
        .map(row => {
          const selected = row.querySelector(selectedSelector);

          return selected?.value?.trim();
        })
        .filter(Boolean);
    };

    const syncHidden = () => {
      hidden.value = getSelectedValues().join(";");
    };

    const closeRowMenu = row => {
      const input = row.querySelector(searchSelector);
      const menu = row.querySelector(dropdownSelector);

      closeMenu(input, menu);
    };

    const closeAllMenus = () => {
      getRows().forEach(closeRowMenu);
    };

    const updateRemoveButtons = () => {
      const rows = getRows();

      rows.forEach(row => {
        const button = row.querySelector(removeSelector);

        if (!button) return;

        button.hidden = rows.length === 1;
      });
    };

    const updateValidity = () => {
      const rows = getRows();
      const selectedValues = getSelectedValues();

      const enabledRows = rows.filter(row => {
        const search = row.querySelector(searchSelector);

        return search && !search.disabled;
      });

      rows.forEach(row => {
        const search = row.querySelector(searchSelector);
        const selected = row.querySelector(selectedSelector);

        if (!search || search.disabled) {
          search?.setCustomValidity("");

          return;
        }

        const hasTypedValue = Boolean(search.value.trim());
        const hasSelectedValue = Boolean(selected?.value?.trim());

        if (hasTypedValue && !hasSelectedValue) {
          search.setCustomValidity("Selecione uma opção da lista.");
        } else {
          search.setCustomValidity("");
        }
      });

      if (enabledRows.length && !selectedValues.length) {
        const firstSearch = enabledRows[0].querySelector(searchSelector);

        firstSearch?.setCustomValidity(requiredMessage);
      }
    };

    const renderRowMenu = row => {
      const search = row.querySelector(searchSelector);
      const selected = row.querySelector(selectedSelector);
      const menu = row.querySelector(dropdownSelector);

      if (!search || !selected || !menu || search.disabled) return;

      const selectedValues = getSelectedValues();
      const currentValue = selected.value.trim();

      const availableOptions = options.filter(option => {
        const alreadySelected = selectedValues.includes(option.value);

        return !alreadySelected || option.value === currentValue;
      });

      const filtered = filterItems(availableOptions, search.value);

      renderMenu({
        input: search,
        menu,
        options: filtered,
        emptyLabel,

        onSelect(option) {
          search.value = getDisplayValue(option);
          selected.value = option.value;

          search.setCustomValidity("");

          syncHidden();
          hidden.dispatchEvent(new Event("change", { bubbles: true }));
          updateValidity();
          closeMenu(search, menu);
        }
      });
    };

    const bindRow = (row, initialValue = "") => {
      if (!row || boundRows.has(row)) return;

      boundRows.add(row);

      const search = row.querySelector(searchSelector);
      const selected = row.querySelector(selectedSelector);
      const menu = row.querySelector(dropdownSelector);
      const remove = row.querySelector(removeSelector);

      if (!search || !selected || !menu) return;

      const cleanInitialValue = String(initialValue ?? "").trim();

      selected.value = cleanInitialValue;

      if (cleanInitialValue) {
        const option = findOption(cleanInitialValue);

        search.value = option
          ? getDisplayValue(option)
          : cleanInitialValue;
      } else {
        search.value = "";
      }

      search.setAttribute("aria-expanded", "false");

      search.addEventListener("focus", () => {
        closeAllMenus();
        renderRowMenu(row);
      });

      search.addEventListener("click", () => {
        closeAllMenus();
        renderRowMenu(row);
      });

      search.addEventListener("input", () => {
        selected.value = "";

        syncHidden();
        updateValidity();
        renderRowMenu(row);
      });

      search.addEventListener("keydown", event => {
        if (event.key === "Escape") {
          closeMenu(search, menu);

          return;
        }

        if (event.key === "Enter" && menu.classList.contains("show")) {
          event.preventDefault();

          const firstOption = menu.querySelector(
            ".imp-search-select__option"
          );

          firstOption?.click();
        }
      });

      remove?.addEventListener("click", () => {
        row.remove();

        syncHidden();
        updateRemoveButtons();
        updateValidity();
      });
    };

    const createRow = (initialValue = "", focus = false) => {
      const firstRow = list.querySelector(rowSelector);

      if (!firstRow) return null;

      const clone = firstRow.cloneNode(true);

      const search = clone.querySelector(searchSelector);
      const selected = clone.querySelector(selectedSelector);
      const menu = clone.querySelector(dropdownSelector);

      if (search) {
        search.value = "";
        search.setCustomValidity("");
        search.removeAttribute("id");
        search.setAttribute("aria-expanded", "false");
      }

      if (selected) {
        selected.value = "";
      }

      if (menu) {
        menu.innerHTML = "";
        menu.classList.remove("show");
        menu.removeAttribute("id");
      }

      list.appendChild(clone);

      bindRow(clone, initialValue);

      updateRemoveButtons();
      syncHidden();
      updateValidity();

      if (focus && search && !search.disabled) {
        search.focus();
      }

      return clone;
    };

    const initialValues = splitStoredValues(hidden.value);
    const firstRow = list.querySelector(rowSelector);

    if (firstRow) {
      bindRow(firstRow, initialValues[0] || "");

      initialValues.slice(1).forEach(value => {
        createRow(value, false);
      });
    }

    addButton?.addEventListener("click", () => {
      createRow("", true);
    });

    syncHidden();
    updateRemoveButtons();
    updateValidity();

    return {
      syncHidden,
      updateValidity,

      validate() {
        syncHidden();
        updateValidity();

        const rows = getRows();

        const invalidSearch = rows
          .map(row => row.querySelector(searchSelector))
          .find(
            search => search && !search.disabled && !search.checkValidity()
          );

        if (invalidSearch) {
          invalidSearch.reportValidity();

          return false;
        }

        return true;
      }
    };
  };

  const initSearchField = (scope, fieldName) => {
    const root = scope || document;

    const source = root.querySelector(`[data-${fieldName}-source]`);
    const options = readOptionsFromSelect(source);

    return initMultiSearchList({
      listSelector: `[data-${fieldName}-list]`,
      rowSelector: `[data-${fieldName}-row]`,
      searchSelector: `[data-${fieldName}-search]`,
      selectedSelector: `[data-${fieldName}-selected-value]`,
      dropdownSelector: `[data-${fieldName}-dropdown]`,
      addSelector: `[data-add-${fieldName}]`,
      removeSelector: `[data-remove-${fieldName}]`,
      hiddenSelector: `[data-${fieldName}-value]`,
      options,
      emptyLabel: "Nenhuma opção encontrada.",
      requiredMessage: "Selecione pelo menos uma opção da lista."
    });
  };

  const initSearchFields = scope => {
    const root = scope || document;

    root.querySelectorAll("[data-search-field]").forEach(element => {
      initSearchField(root, element.dataset.searchField);
    });
  };

  // Nomeia os inputs com o índice da linha (destinatariosN/assinado_emN)
  // para que fiquem correlacionados pelo número da linha no banco.
  const renumberDestinatariosRows = list => {
    const rows = Array.from(list.querySelectorAll("[data-destinatario-row]"));

    rows.forEach((row, index) => {
      const destinatarioInput = row.querySelector("[data-destinatario-input]");
      const assinadoEmInput = row.querySelector("[data-assinado-em-input]");
      const removeButton = row.querySelector("[data-remove-destinatario]");

      if (destinatarioInput) destinatarioInput.name = `destinatarios${index}`;
      if (assinadoEmInput) assinadoEmInput.name = `assinado_em${index}`;
      if (removeButton) removeButton.hidden = rows.length === 1;
    });
  };

  const initDestinatariosList = scope => {
    const root = scope || document;

    root.querySelectorAll("[data-destinatarios-list]").forEach(list => {
      const addButton = root.querySelector("[data-add-destinatario]");

      renumberDestinatariosRows(list);

      list.addEventListener("click", event => {
        const removeButton = event.target.closest(
          "[data-remove-destinatario]"
        );

        if (!removeButton || removeButton.disabled) return;

        const row = removeButton.closest("[data-destinatario-row]");
        const rows = list.querySelectorAll("[data-destinatario-row]");

        if (row && rows.length > 1) {
          row.remove();
          renumberDestinatariosRows(list);
        }
      });

      addButton?.addEventListener("click", () => {
        if (addButton.disabled) return;

        const rows = list.querySelectorAll("[data-destinatario-row]");
        const lastRow = rows[rows.length - 1];

        if (!lastRow) return;

        const clone = lastRow.cloneNode(true);

        clone.querySelectorAll("input").forEach(input => {
          input.value = "";
          input.setCustomValidity("");
        });

        list.appendChild(clone);
        renumberDestinatariosRows(list);

        clone.querySelector("[data-destinatario-input]")?.focus();
      });
    });
  };

  // Nomeia os inputs com o índice da linha (observadoresN) para
  // preservar cada valor como um campo distinto no envio do formulário.
  const renumberObservadoresRows = list => {
    const rows = Array.from(list.querySelectorAll("[data-observador-row]"));

    rows.forEach((row, index) => {
      const observadorInput = row.querySelector("[data-observador-input]");
      const removeButton = row.querySelector("[data-remove-observador]");

      if (observadorInput) observadorInput.name = `observadores${index}`;
      if (removeButton) removeButton.hidden = rows.length === 1;
    });
  };

  const initObservadoresList = scope => {
    const root = scope || document;

    root.querySelectorAll("[data-observadores-list]").forEach(list => {
      const addButton = root.querySelector("[data-add-observador]");

      renumberObservadoresRows(list);

      list.addEventListener("click", event => {
        const removeButton = event.target.closest(
          "[data-remove-observador]"
        );

        if (!removeButton || removeButton.disabled) return;

        const row = removeButton.closest("[data-observador-row]");
        const rows = list.querySelectorAll("[data-observador-row]");

        if (row && rows.length > 1) {
          row.remove();
          renumberObservadoresRows(list);
        }
      });

      addButton?.addEventListener("click", () => {
        if (addButton.disabled) return;

        const rows = list.querySelectorAll("[data-observador-row]");
        const lastRow = rows[rows.length - 1];

        if (!lastRow) return;

        const clone = lastRow.cloneNode(true);

        clone.querySelectorAll("input").forEach(input => {
          input.value = "";
          input.setCustomValidity("");
        });

        list.appendChild(clone);
        renumberObservadoresRows(list);

        clone.querySelector("[data-observador-input]")?.focus();
      });
    });
  };

  window.ImpperSearchSelect = {
    normalizeText,
    createOption,
    readOptionsFromSelect,
    filterItems,
    getDescription,
    getDisplayValue,
    closeMenu,
    openMenu,
    renderMenu,
    splitStoredValues,
    initMultiSearchList,
    initSearchField,
    initSearchFields
  };

  const conditionalSelector = "[data-impper-show-when]";

  const splitRule = rule => {
    const [fieldName, valuesRaw = ""] = String(rule).split(":");

    return {
      fieldName: fieldName?.trim(),
      values: valuesRaw
        .split("|")
        .map(value => value.trim())
        .filter(Boolean)
    };
  };

  const getFieldValues = (form, fieldName) => {
    const controls = Array.from(
      form.querySelectorAll(`[name="${fieldName}"]`)
    );

    if (!controls.length) return [];

    const [firstControl] = controls;

    if (
      firstControl.type === "radio" ||
      firstControl.type === "checkbox"
    ) {
      return controls
        .filter(control => control.checked)
        .map(control => control.value);
    }

    return [firstControl.value];
  };

  const toggleSectionControls = (section, visible) => {
    section
      .querySelectorAll("input, select, textarea, button")
      .forEach(control => {
        if (!control.dataset.impperRequiredCached) {
          control.dataset.impperRequiredCached = String(
            control.required
          );
        }

        const locked =
          control.dataset.impperLocked === "true";

        if (visible) {
          control.disabled = locked;

          control.required =
            !locked &&
            control.dataset.impperRequiredCached === "true";

          return;
        }

        if (!locked) {
          if (
            control.type === "radio" ||
            control.type === "checkbox"
          ) {
            control.checked = false;
          } else if (control.type === "file") {
            control.value = "";
          } else if (control.tagName === "SELECT") {
            control.selectedIndex = 0;
          }
        }

        control.required = false;
        control.disabled = true;
      });
  };

  const evaluateConditionalSection = section => {
    const form = section.closest("form");

    if (!form) return;

    const rule = section.dataset.impperShowWhen;
    const visible = rule
      .split(/\s*\|\|\s*/)
      .some(condition => {
        const emptyField = condition.match(
          /^([\w-]+)\s+null$/
        );

        if (emptyField) {
          return getFieldValues(form, emptyField[1])
            .every(value => !value.trim());
        }

        const missingResult = condition.match(
          /^!resultado\.includes\(['"]([^'"]+)['"]\)$/
        );

        if (missingResult) {
          const resultado = document.getElementById("resultado");
          return !resultado?.textContent.includes(
            missingResult[1]
          );
        }

        const { fieldName, values } = splitRule(condition);

        if (!fieldName || !values.length) return false;

        return getFieldValues(form, fieldName).some(value =>
          values.includes(value)
        );
      });

    section.hidden = !visible;
    section.setAttribute("aria-hidden", String(!visible));
    toggleSectionControls(section, visible);
  };

  const initConditionalSections = scope => {
    const root = scope || document;
    const sections = Array.from(
      root.querySelectorAll(conditionalSelector)
    );

    if (!sections.length) return;

    sections.forEach(section => {
      evaluateConditionalSection(section);
    });

    root.addEventListener("change", event => {
      if (!event.target.name) return;

      sections.forEach(section => {
        evaluateConditionalSection(section);
      });
    });
  };

  const refreshConditionalSections = scope => {
    const root = scope || document;

    root.querySelectorAll(conditionalSelector).forEach(section => {
      evaluateConditionalSection(section);
    });
  };

  const updateFileOutput = input => {
    const selector = input.dataset.impperFileOutput;

    if (!selector) return;

    const output = document.querySelector(selector);

    if (!output) return;

    const names = Array.from(input.files || []).map(
      file => file.name
    );

    output.textContent = names.length
      ? names.join(", ")
      : "Nenhum arquivo selecionado.";
  };

  const initFileInputs = scope => {
    const root = scope || document;
    const fileInputs = root.querySelectorAll(
      "input[type='file'][data-impper-file-output]"
    );

    fileInputs.forEach(input => {
      updateFileOutput(input);
      input.addEventListener("change", () => {
        updateFileOutput(input);
      });
    });
  };

  const bindDependentSelect = ({
    controller,
    target,
    optionsByValue,
    placeholder = "Selecione uma opção",
    emptyLabel = "Nenhuma opção disponível",
    hint,
    hintByValue = {}
  }) => {
    if (!controller || !target) return;

    const render = () => {
      const options = optionsByValue[controller.value] || [];

      target.innerHTML = "";

      const placeholderOption = document.createElement("option");
      placeholderOption.value = "";
      placeholderOption.textContent = controller.value
        ? options.length
          ? placeholder
          : emptyLabel
        : "Selecione primeiro a opção anterior";
      target.appendChild(placeholderOption);

      options.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        target.appendChild(optionElement);
      });

      target.disabled = !options.length;

      if (hint) {
        hint.textContent = hintByValue[controller.value] || "";
      }
    };

    controller.addEventListener("change", render);
    render();
  };

  const setMessage = (element, text, type = "info") => {
    if (!element) return;

    element.hidden = !text;
    element.textContent = text;
    element.className = "imp-form-message";

    if (text) {
      element.classList.add(`imp-form-message--${type}`);
    }
  };

  window.ImpperForms = {
    init(scope) {
      initConditionalSections(scope);
      initFileInputs(scope);
      initSearchFields(scope);
      initDestinatariosList(scope);
      initObservadoresList(scope);
    },
    refreshConditionalSections,
    bindDependentSelect,
    setMessage
  };

  document.addEventListener("DOMContentLoaded", () => {
    window.ImpperForms.init(document);
  });
})();

function validarCamposObrigatorios(root) {
  const controls = Array.from(
    root.querySelectorAll("input, textarea, select")
  ).filter(control =>
    control.required &&
    !control.disabled
  );

  for (const control of controls) {
    if (
      control.type === "radio" ||
      control.type === "checkbox"
    ) {
      const group = root.querySelectorAll(
        `[name="${CSS.escape(control.name)}"]`
      );

      if (!Array.from(group).some(item => item.checked)) {
        control.setCustomValidity(
          "Selecione uma opção."
        );
      } else {
        control.setCustomValidity("");
      }

      continue;
    }

    const value = control.type === "file"
      ? control.files?.length
        ? "arquivo"
        : ""
      : String(control.value ?? "").trim();

    control.setCustomValidity(
      value ? "" : "Preencha este campo obrigatório."
    );
  }

  const invalid = controls.find(control =>
    !control.checkValidity()
  );

  if (!invalid) {
    return true;
  }

  invalid.reportValidity();
  return false;
}

async function enviarFormulario(document, id_fluxo, id_etapa) {
  let form = document.querySelector('form');
  if (!form) {
    form = document
  }

  if (!validarCamposObrigatorios(form)) {
    return;
  }

  const fields = Array.from(form.querySelectorAll('input, textarea, select'))
      .filter(f => f.name);
  const formData = new FormData();
  fields.forEach(field => {
    if (field.type === 'file'){
      Array.from(field.files || []).forEach(file => {
        if (file.size > 0) formData.append(field.name, file);
      });
    } else if (field.type !== 'radio' || field.checked){
      formData.append(field.name, field.value);
    }
  });

  if (id_etapa === 'Correcao'){
    const etapaSelect = document.getElementById('correctionTarget');
    id_etapa = etapaSelect.value
  }
   const response = await fetch(`/flow/${id_fluxo}/${id_etapa}`, {
      method: 'POST',
      body: formData
    });
  window.location.href = `/flow/${String(id_fluxo)}/${id_etapa}`;
  return formData;
};

async function enviarEtapa(document, id_chamada, id_etapa, id_proxet) {
  const form = document.querySelector('form[data-execution-form]') || document;
  const validationRoot = id_proxet === 'Correcao'
    ? document.getElementById('correctionModal')
    : id_proxet === 'Cancelado'
      ? document.getElementById('cancelationModal')
      : form;

  if (
    !validationRoot ||
    !validarCamposObrigatorios(validationRoot)
  ) {
    return;
  }

  const fields = Array.from(document.querySelectorAll('input, textarea, select'))
      .filter(f => f.name);
  const formData = new FormData();
  fields.forEach(field => {
    if (
      field.name === 'comentario'
      && !['Aprovado', 'Finalizado'].includes(id_proxet)
    ) {
      return;
    }

    if (field.type === 'file' && field.files.length === 0){
      return field.files.length;
    } else if (field.type === 'file' && field.files.length > 0) {
      Array.from(field.files || []).forEach(file => {
        if (file.size > 0) formData.append(field.name, file);
      });
    } else if (field.type !== 'radio' || field.checked){
      formData.append(field.name, field.value);
    }
  });

  if (id_proxet === 'Correcao'){
    const etapaSelect = document.getElementById('correctionTarget');
    id_proxet = etapaSelect.value
  } else if (id_proxet === 'Cancelado'){
    id_proxet = 'Cancelado'
  }
   console.log(id_etapa);
   const response = await fetch(`/exec/${id_etapa}/${id_chamada}/${id_proxet}`, {
      method: 'POST',
      body: formData
    });
  window.location.href = `/exec/${String(id_etapa)}/${id_chamada}/${id_proxet}`;
  return formData;
};

function abrirModalConclusao(id_proxet) {
  const modalElement = document.getElementById('completionModal');

  if (!modalElement) {
    return;
  }

  modalElement.dataset.conclusionTarget = id_proxet;
  bootstrap.Modal.getOrCreateInstance(modalElement).show();
}

function confirmarConclusao(document, id_chamada, id_etapa) {
  const modalElement = document.getElementById('completionModal');
  const id_proxet = modalElement?.dataset.conclusionTarget;

  if (!id_proxet) {
    return;
  }

  return enviarEtapa(document, id_chamada, id_etapa, id_proxet);
}

async function filtrarForm(document){
  const checagem = document.querySelector(
    '[name="tp_checagem"]:checked'
  )?.value;
  console.log('checagem:', checagem);
  const empreendimento = document.getElementsByName('empreendimento')[0]?.value;
  console.log('empreendimento:', empreendimento);
  const form_abertos = JSON.parse(
    document.getElementById('teste').textContent
);
  let lista_final = []
  let resultado = document.getElementById('resultado');
  resultado.textContent = '[]';
  const empCheck = new Map();
  if (checagem && empreendimento){
    for (const form of form_abertos){
      const registro = empCheck.get(form.id_chamada) || {
        criterios: new Set(),
        camposNao: []
      };

// Mantida para compatibilidade; os campos agora se auto-inicializam via [data-search-field].
function campoPesquisa(document, campo) {
  return window.ImpperSearchSelect.initSearchField(document, campo);
}