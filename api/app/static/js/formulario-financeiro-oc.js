(() => {
  "use strict";


  /*
   * =========================================================
   * DOCUMENTAÇÃO POR TIPO DE DESPESA
   * =========================================================
   */

  const regrasDocumentos = {

    "Nota fiscal - 15 dias":
      "O arquivo anexado é um PDF com O.C., NF e boleto e a O.C. está aprovada e possui saldo.",


    "Despesa consumo sem doc Fiscal - 5 dias úteis":
      "O arquivo anexado é um PDF com O.C. e fatura e o lançamento foi feito no sistema Totvs RM.",


    "Despesa consumo com doc Fiscal - 8 dias úteis":
      "O arquivo anexado é um PDF com O.C. e fatura.",


    "Despesa direta e adiantamento - 8 dias úteis":
      "O arquivo anexado é um PDF com O.C., fatura e boleto.",


    "Medição de empreiteiro - envio até 25 pgto dia 5":
      "O arquivo anexado é um PDF com O.C., NF e boleto e a O.C. está aprovada.",


    "Imposto e sindicatos - 5 dias úteis":
      "O arquivo anexado é um PDF com Guia.",


    "Cartório/ibti/taxas de aprovação/vt - 2 dias úteis":
      "O arquivo anexado é um PDF com O.C. e boleto.",


    "Notas cartão de crédito - Envio até o 4° dia do mês":
      "O arquivo anexado é um PDF com O.C. e NF.",


    "Caixinha - cartão Alelo":
      "O arquivo anexado é um PDF com O.C., NF e comprovante.",


    "Distratos - 15 dias":
      "O arquivo anexado é um contrato de rescisão/distrato e foi recebido no sistema Totvs RM.",


    "Fluxo de alteração - 10 dias antes do vencimento original":
      "O lançamento foi recebido no sistema e a alteração foi aprovada.",


    "Permuta - 15 dias":
      "O arquivo anexado é um PDF com O.C., fatura e boleto.",


    "Emissão de cartão de credito - até 2 dias úteis para emissão":
      "O arquivo anexado é um PDF com O.C."
  };


  /*
   * =========================================================
   * ETAPAS POR EMPREENDIMENTO
   * =========================================================
   */

  const etapasPorEmpreendimento = {


    PRIME: [
      "DESPESAS INICIAS",
      "INSTALACAO DO CANTEIRO DE OBRA",
      "SERVICOS GERAIS ADMINISTRACAO",
      "MOVIMENTO DE TERRA",
      "FUNDACOES INFRA ESTRUTURA",
      "ESTRUTURA",
      "ALVENARIA",
      "COBERTURAS E IMPERMEABILIZACAO",
      "REVESTIMENTO INTERNO",
      "REVESTIMENTO EXTERNO",
      "REVESTIMENTO CERAMICO POR PAREDE",
      "REVESTIMENTOS ESPECIAIS",
      "ESQUADRIAS DE MADEIRAS",
      "ESQUADRIAS METALICAS",
      "PEITORIS SOLEIRAS E RODAPES",
      "PORTAS E FERRAGENS",
      "TACOS",
      "LADRILHOS PISOS",
      "PISOS ESPECIAIS",
      "INSTALACOES ELETRICAS",
      "ENFIACAO E APARELHOS",
      "INSTALACAO HIDRAULICA",
      "APARELHOS SANITARIOS",
      "PINTURA",
      "VIDROS",
      "MUROS E GRADES",
      "LIMPEZA",
      "SERVICOS COMP E URBANIZACAO",
      "ELEVADORES",
      "OUTROS EQUIPAMENTOS/DIVERSOS"
    ],


    LEGACY: [
      "DESPESAS INICIAIS",
      "SERVIÇOS GERAIS",
      "INSTALAÇÃO DA OBRA",
      "MOVIMENTO DE TERRA",
      "FUNDAÇÕES",
      "ESTRUTURA",
      "INSTALAÇÕES HIDRÁULICAS",
      "INSTALAÇÕES ELÉTRICAS",
      "ALVENARIA",
      "COBERTURA",
      "ESQUADRIAS DE MADEIRA",
      "ESQUADRIAS METÁLICAS",
      "TRATAMENTOS",
      "REVESTIMENTOS INTERNOS",
      "AZULEJOS",
      "REVESTIMENTOS ESPECIAIS",
      "REVESTIMENTOS EXTERNOS",
      "PISOS",
      "RODAPÉS, SOLEIRAS E PEITORIS",
      "VIDROS",
      "PINTURA",
      "DIVERSOS",
      "LIMPEZA",
      "ELEVADORES",
      "OUTROS EQUIPAMENTOS"
    ],


    RESERVA: [
      "DESPESAS INICIAS",
      "INSTALACAO DO CANTEIRO DE OBRA",
      "SERVICOS GERAIS ADMINISTRACAO",
      "MOVIMENTO DE TERRA",
      "FUNDACOES INFRA ESTRUTURA",
      "ESTRUTURA",
      "ALVENARIA",
      "COBERTURAS E IMPERMEABILIZACAO",
      "REVESTIMENTO INTERNO",
      "REVESTIMENTO EXTERNO",
      "REVESTIMENTO CERAMICO POR PAREDE",
      "REVESTIMENTOS ESPECIAIS",
      "ESQUADRIAS DE MADEIRAS",
      "ESQUADRIAS METALICAS",
      "PEITORIS SOLEIRAS E RODAPES",
      "PORTAS E FERRAGENS",
      "TACOS",
      "LADRILHOS PISOS",
      "PISOS ESPECIAIS",
      "INSTALACOES ELETRICAS",
      "ENFIACAO E APARELHOS",
      "INSTALACAO HIDRAULICA",
      "APARELHOS SANITARIOS",
      "PINTURA",
      "VIDROS",
      "MUROS E GRADES",
      "LIMPEZA",
      "SERVICOS COMP E URBANIZACAO",
      "ELEVADORES",
      "OUTROS EQUIPAMENTOS/DIVERSOS"
    ],


    VILLAS: [
      "DESPESAS INDIRETAS",
      "SERVIÇOS INICIAIS",
      "TERRAPLENAGEM",
      "DRENAGEM",
      "REDE DE ESGOTO",
      "REDES DE ÁGUA POTÁVEL",
      "PAVIMENTAÇÃO",
      "INFRAESTRUTURA ELÉTRICA",
      "SINALIZAÇÃO VIÁRIA VERTICAL E HORIZONTAL",
      "PREPARO DE TERRENO E MOVIMENTO DE TERRA",
      "SERVICOS INICIAIS",
      "CONTENÇOES",
      "FUNDACÕES PROFUNDAS - ESTACA ESCAVADA/ HÉLICE/ TUBULÃO",
      "FUNDAÇÕES RASAS - SAPATA/ BLOCO/ BALDRAME/ RADIER",
      "SUPERESTRUTURA PILARES/ VIGAS/ ESCADAS E LAJES - PERIFERIA",
      "SUPERESTRUTURA PILARES/ VIGAS/ ESCADAS E LAJES - TORRE",
      "FORMAS E MISCELÂNEAS PARA ESTRUTURA",
      "PAREDES E PAINÉIS",
      "COBERTURA - ESTRUTURA METÁLICA/ TELHAS/ CALHAS/ RUFOS",
      "IMPERMEABILIZAÇÃO E TRATAMENTO"
    ],


    CONNECT: [
      "ÁGUA FRIA",
      "ÁGUA POTÁVEL",
      "ALVENARIA",
      "AMBIENTAÇÃO",
      "APARELHOS",
      "AZULEJOS",
      "CALAFERE / LIMPEZA",
      "CLIMATIZAÇÃO",
      "DRENAGEM DAS ÁGUAS",
      "ENERGIA E ILUMINAÇÃO",
      "EQUIPAMENTOS E",
      "ESGOTO E ÁGUAS",
      "ESGOTO SANITÁRIO",
      "ESQUADRIAS DE MADEIRA",
      "ESQUADRIAS METÁLICAS",
      "FORROS",
      "FUNDAÇÕES E OUTROS SERVIÇOS",
      "GÁS",
      "IMPERMEABILIZ.",
      "INCÊNDIO",
      "INSTALAÇÕES MECÂNICAS",
      "LIGAÇÕES DEFINITIVAS",
      "LÓGICA",
      "PAISAGISMO",
      "PAVIMENTAÇÃO",
      "PEITORIS",
      "PINTURAS",
      "PISO CERÂMICO",
      "PISO CIMENTADO",
      "PLUVIAIS",
      "REVEST. EXTERNO",
      "REVEST. INTERNO",
      "RODAPÉS",
      "SERV. PRELIMINARES",
      "SOLEIRAS",
      "SUPRAESTRUTURA",
      "TELEFONE",
      "TELHADOS",
      "TERRAPLENAGEM",
      "TRABALHOS COM TERRA",
      "TRATAMENTOS"
    ],


    VISTA: [
      "DESPESAS INICIAS",
      "INSTALACAO DO CANTEIRO DE OBRA",
      "SERVICOS GERAIS ADMINISTRACAO",
      "MOVIMENTO DE TERRA",
      "FUNDACOES INFRA ESTRUTURA",
      "ESTRUTURA",
      "ALVENARIA",
      "COBERTURAS E IMPERMEABILIZACAO",
      "REVESTIMENTO INTERNO",
      "REVESTIMENTO EXTERNO",
      "REVESTIMENTO CERAMICO POR PAREDE",
      "REVESTIMENTOS ESPECIAIS",
      "ESQUADRIAS DE MADEIRAS",
      "ESQUADRIAS METALICAS",
      "PEITORIS SOLEIRAS E RODAPES",
      "PORTAS E FERRAGENS",
      "TACOS",
      "LADRILHOS PISOS",
      "PISOS ESPECIAIS",
      "iNSTALACOES ELETRICAS",
      "ENFIACAO E APARELHOS",
      "INSTALACAO HIDRAULICA",
      "APARELHOS SANITARIOS",
      "PINTURA",
      "VIDROS",
      "MUROS E GRADES",
      "LIMPEZA",
      "SERVICOS COMP E URBANIZACAO",
      "ELEVADORES",
      "OUTROS EQUIPAMENTOS/DIVERSOS"
    ],


    LINE: [
      "DESPESAS INICIAS",
      "INSTALACAO DO CANTEIRO DE OBRA",
      "SERVICOS GERAIS ADMINISTRACAO",
      "MOVIMENTO DE TERRA",
      "FUNDACOES INFRA ESTRUTURA",
      "ESTRUTURA",
      "ALVENARIA",
      "COBERTURAS E IMPERMEABILIZACAO",
      "REVESTIMENTO INTERNO",
      "REVESTIMENTO EXTERNO",
      "REVESTIMENTO CERAMICO POR PAREDE",
      "REVESTIMENTOS ESPECIAIS",
      "ESQUADRIAS DE MADEIRAS",
      "ESQUADRIAS METALICAS",
      "PEITORIS SOLEIRAS E RODAPES",
      "PORTAS E FERRAGENS",
      "TACOS",
      "LADRILHOS PISOS",
      "PISOS ESPECIAIS",
      "INSTALACOES ELETRICAS",
      "ENFIACAO E APARELHOS",
      "INSTALACAO HIDRAULICA",
      "APARELHOS SANITARIOS",
      "PINTURA",
      "VIDROS",
      "MUROS E GRADES",
      "LIMPEZA",
      "SERVICOS COMP E URBANIZACAO",
      "ELEVADORES",
      "OUTROS EQUIPAMENTOS/DIVERSOS"
    ]
  };


  /*
   * =========================================================
   * DOCUMENTAÇÃO
   * =========================================================
   */

  const initRegraDocumentos = () => {

    const tipoDespesa =
      document.getElementById(
        "tipo_despesa"
      );

    const wrap =
      document.getElementById(
        "documentacaoFinanceiroWrap"
      );

    const texto =
      document.getElementById(
        "documentacaoFinanceiroTexto"
      );


    if (
      !tipoDespesa ||
      !wrap ||
      !texto
    ) {
      return;
    }


    const atualizar = () => {

      const regra =
        regrasDocumentos[
          tipoDespesa.value
        ] || "";


      texto.textContent =
        regra;


      wrap.hidden =
        !regra;
    };


    tipoDespesa.addEventListener(
      "change",
      atualizar
    );


    atualizar();
  };


  /*
   * =========================================================
   * EMPREENDIMENTO → ETAPA
   * =========================================================
   */

  const initEtapasMedicao = () => {

    const empreendimento =
      document.getElementById(
        "empreendimento_medicao"
      );

    const etapa =
      document.getElementById(
        "etapa_medicao"
      );


    if (
      !empreendimento ||
      !etapa
    ) {
      return;
    }


    const valorInicial =
      etapa.dataset.currentValue || "";


    let primeiraCarga =
      true;


    const renderizar = () => {

      const empreendimentoSelecionado =
        empreendimento.value;


      const opcoes =
        etapasPorEmpreendimento[
          empreendimentoSelecionado
        ] || [];


      const locked =
        etapa.dataset.impperLocked ===
        "true";


      etapa.innerHTML = "";


      const placeholder =
        document.createElement(
          "option"
        );


      placeholder.value = "";


      placeholder.textContent =
        empreendimentoSelecionado
          ? "Selecione a etapa"
          : "Selecione primeiro o empreendimento";


      etapa.appendChild(
        placeholder
      );


      opcoes.forEach(nome => {

        const option =
          document.createElement(
            "option"
          );


        option.value =
          nome;


        option.textContent =
          nome;


        etapa.appendChild(
          option
        );

      });


      if (
        primeiraCarga &&
        valorInicial &&
        opcoes.includes(
          valorInicial
        )
      ) {
        etapa.value =
          valorInicial;
      }


      primeiraCarga =
        false;


      etapa.disabled =
        locked ||
        !empreendimentoSelecionado;
    };


    empreendimento.addEventListener(
      "change",
      () => {

        primeiraCarga =
          false;

        renderizar();

      }
    );


    renderizar();
  };


  const init = () => {
    initRegraDocumentos();
    initEtapasMedicao();
  };


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init
    );

  } else {

    init();

  }

})();

(() => {
  "use strict";

  const initAnexosRetorno = () => {
    const list = document.querySelector("[data-anexos-retorno-list]");
    const addButton = document.querySelector("[data-add-anexo-retorno]");

    if (!list || !addButton || addButton.disabled) {
      return;
    }

    const updateRows = () => {
      const rows = Array.from(
        list.querySelectorAll("[data-anexo-retorno-row]")
      );

      rows.forEach((row, index) => {
        const removeButton = row.querySelector(
          "[data-remove-anexo-retorno]"
        );

        if (removeButton) {
          removeButton.hidden = rows.length === 1;
        }

        if (index > 0) {
          const input = row.querySelector("[data-anexo-retorno-input]");
          if (input) {
            input.required = false;
          }
        }
      });
    };

    addButton.addEventListener("click", () => {
      const template = list.querySelector("[data-anexo-retorno-row]");
      if (!template) return;

      const row = template.cloneNode(true);
      const input = row.querySelector("[data-anexo-retorno-input]");
      const removeButton = row.querySelector(
        "[data-remove-anexo-retorno]"
      );

      if (input) {
        input.value = "";
        input.required = false;
      }

      if (removeButton) {
        removeButton.hidden = false;
        removeButton.addEventListener("click", () => {
          row.remove();
          updateRows();
        });
      }

      list.appendChild(row);
      updateRows();
    });

    list.addEventListener("click", event => {
      const removeButton = event.target.closest(
        "[data-remove-anexo-retorno]"
      );

      if (!removeButton) return;

      const row = removeButton.closest("[data-anexo-retorno-row]");
      if (row) {
        row.remove();
        updateRows();
      }
    });

    updateRows();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAnexosRetorno);
  } else {
    initAnexosRetorno();
  }
})();