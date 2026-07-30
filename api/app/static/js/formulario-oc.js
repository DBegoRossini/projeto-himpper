(() => {
  "use strict";

  const coligadas = [
    {
      value: "IMPPER_MATRIZ",
      label: "Impper Matriz",
      hint: "Centros de custo administrativos e corporativos.",
      centros: [
        { value: "ADM_FIN", label: "Administrativo Financeiro" },
        { value: "SUPRIMENTOS", label: "Suprimentos" },
        { value: "JURIDICO", label: "Jurídico" }
      ]
    },
    {
      value: "IMPPER_OBRAS",
      label: "Impper Obras",
      hint: "Centros vinculados a contratos, canteiros e engenharia.",
      centros: [
        { value: "ENG_OBRAS", label: "Engenharia de Obras" },
        { value: "PLANEJAMENTO", label: "Planejamento" },
        { value: "QUALIDADE", label: "Qualidade e Segurança" }
      ]
    },
    {
      value: "IMPPER_PROJETOS",
      label: "Impper Projetos",
      hint: "Centros focados em desenvolvimento, compatibilização e projetos.",
      centros: [
        { value: "ARQUITETURA", label: "Arquitetura" },
        { value: "ESTRUTURAS", label: "Estruturas" },
        { value: "INSTALACOES", label: "Instalações" }
      ]
    }
  ];

  const fillSelect = (select, options) => {
    options.forEach(option => {
      const optionElement = document.createElement("option");
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      select.appendChild(optionElement);
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("purchaseForm");

    if (!form || !window.ImpperForms) return;

    const coligadaSelect = document.getElementById("codcoligada");
    const centroCustoSelect = document.getElementById("centro_custo");
    const centroCustoHint = document.getElementById("centroCustoHint");
    const generalMessage = document.getElementById("generalMessage");

    fillSelect(coligadaSelect, coligadas);

    const optionsByValue = Object.fromEntries(
      coligadas.map(item => [item.value, item.centros])
    );
    const hintByValue = Object.fromEntries(
      coligadas.map(item => [item.value, item.hint])
    );

    window.ImpperForms.bindDependentSelect({
      controller: coligadaSelect,
      target: centroCustoSelect,
      optionsByValue,
      placeholder: "Selecione um centro de custo",
      emptyLabel: "Nenhum centro de custo disponível",
      hint: centroCustoHint,
      hintByValue
    });

    form.addEventListener("submit", event => {
      event.preventDefault();

      window.ImpperForms.setMessage(generalMessage, "", "info");

      if (!form.reportValidity()) {
        window.ImpperForms.setMessage(
          generalMessage,
          "Revise os campos obrigatórios antes de enviar a solicitação.",
          "error"
        );
        return;
      }

      window.ImpperForms.setMessage(
        generalMessage,
        "Formulário validado com sucesso. A integração de envio ainda pode ser conectada ao backend quando a rota de submissão estiver definida.",
        "success"
      );
    });
  });
})();