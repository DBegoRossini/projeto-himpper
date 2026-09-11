(() => {
  "use strict";

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
    },
    refreshConditionalSections,
    bindDependentSelect,
    setMessage
  };

  document.addEventListener("DOMContentLoaded", () => {
    window.ImpperForms.init(document);
  });
})();

async function enviarFormulario(document, id_fluxo, id_etapa) {
  let form = document.querySelector('form');
  if (!form) {
    form = document
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
  } else if (id_proxet === 'Cancelado'){
    id_proxet = 'Cancelado'
  }
   const response = await fetch(`/flow/${id_fluxo}/${id_etapa}`, {
      method: 'POST',
      body: formData
    });
  window.location.href = `/flow/${String(id_fluxo)}/${id_etapa}`;
  return formData;
};

async function enviarEtapa(document, id_chamada, id_etapa, id_proxet) {
  const form = document
  const fields = Array.from(form.querySelectorAll('input, textarea, select'))
      .filter(f => f.name);
  const formData = new FormData();
  fields.forEach(field => {
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

      if (form.campo === 'tp_checagem' && form.valor === checagem){
        registro.criterios.add('Checagem');
      }
      if (form.campo === 'empreendimento' && form.valor === empreendimento){
        registro.criterios.add('Empreendimento');
      }
      if (form.valor === 'NAO'){
        registro.criterios.add('NAO');
        registro.camposNao.push(form.campo);
      }

      empCheck.set(form.id_chamada, registro);
    }

    for (const registro of empCheck.values()){
      const temTodosOsCriterios =
        registro.criterios.has('Checagem') &&
        registro.criterios.has('Empreendimento') &&
        registro.criterios.has('NAO');

      if (temTodosOsCriterios){
        lista_final.push(...registro.camposNao);
      }
    }
  }
  resultado.textContent = JSON.stringify(lista_final);
  window.ImpperForms?.refreshConditionalSections(document);
  return lista_final;
}