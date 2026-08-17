(() => {
  "use strict";

  /*
   * Lista estática de Naturezas Orçamentárias.
   * Preencha somente este array quando a relação oficial for definida.
   * Exemplo de formato:
   * { value: "CODIGO", label: "Descrição da natureza" }
   */
  const NATUREZAS_ORCAMENTARIAS = [{ value: "10.01.002.004", label: "(-) Vendas Rescindidas (Restituição)" },
  { value: "20.01.001.001", label: "Materiais" },
  { value: "20.01.001.002", label: "Mão-de-obra Própria" },
  { value: "20.01.001.003", label: "Mão-de-obra Terceirizada" },
  { value: "20.01.001.004", label: "Equipamentos" },
  { value: "20.01.002.001", label: "Despesas com manutenção Pós-Obra" },
  { value: "20.01.003.001", label: "Taxa de Administração Própria" },
  { value: "20.01.003.002", label: "Taxa de Administração Terceirizada" },
  { value: "20.01.004.001", label: "Projetos" },
  { value: "20.01.004.002", label: "Licenciamento e Aprovação" },
  { value: "20.01.004.003", label: "Imagens, Perspectivas e Maquetes" },
  { value: "20.01.004.004", label: "Levantamentos Planialtimétricos, Laudos e Sondagem" },
  { value: "20.01.004.005", label: "Registros, Tributos e Taxas de Incorporação" },
  { value: "20.01.004.006", label: "Projeto e Construção Stand de Vendas e Casa Modelo" },
  { value: "20.01.004.007", label: "Manutenção Stand de Vendas e Casa Modelo" },
  { value: "20.01.004.008", label: "Taxa ou honorários com Financiamento PJ" },
  { value: "20.01.004.009", label: "Seguro de Obra" },
  { value: "20.01.005.001", label: "Aquisição de Terrenos" },
  { value: "20.01.005.002", label: "Comissão sobre Terreno" },
  { value: "20.01.005.003", label: "Regularização (Retificação, Registros)" },
  { value: "20.01.005.005", label: "Permuta Financeira" },
  { value: "20.01.005.006", label: "IPTU / ITBI / ITCMD - Terreno" },
  { value: "20.01.005.007", label: "Contrapartidas" },

  { value: "20.01.010.001", label: "Correios, Jornais e Revistas" },
  { value: "20.01.010.002", label: "Cartórios, Tabelionatos e Certificados" },
  { value: "20.01.010.003", label: "Serviços de Limpeza" },
  { value: "20.01.010.004", label: "Material de Escritório" },
  { value: "20.01.010.005", label: "Suprimentos de Copa e Cozinha" },
  { value: "20.01.010.006", label: "Motoboys e Fretes" },
  { value: "20.01.010.007", label: "Viagens - Alimentação" },
  { value: "20.01.010.008", label: "Multas" },
  { value: "20.01.010.009", label: "Internet" },
  { value: "20.01.010.010", label: "Locação de Equipamentos e Veículos" },
  { value: "20.01.010.011", label: "Locação de Imóveis" },
  { value: "20.01.010.012", label: "Água/Esgoto" },
  { value: "20.01.010.013", label: "Segurança e Vigilância" },
  { value: "20.01.010.014", label: "Seguros - (Bens Móveis e Imóveis)" },
  { value: "20.01.010.015", label: "Serviço de Análise de Crédito" },
  { value: "20.01.010.016", label: "Combustível" },
  { value: "20.01.010.017", label: "Bens de Pequeno Valor" },
  { value: "20.01.010.018", label: "Despesas a Recuperar" },
  { value: "20.01.010.019", label: "Locação de Veiculos" },
  { value: "20.01.010.020", label: "Locação de Bens" },
  { value: "20.01.010.021", label: "Mensalidade Condomínio" },
  { value: "20.01.010.022", label: "Material de Informática" },
  { value: "20.01.010.023", label: "Licenciamento de Veículos" },
  { value: "20.01.010.024", label: "IPVA" },
  { value: "20.01.010.025", label: "Telefonia Fixa e Móvel" },
  { value: "20.01.010.026", label: "Estacionamento" },
  { value: "20.01.010.027", label: "Pedágio" },
  { value: "20.01.010.028", label: "Manutenção de Veículos" },
  { value: "20.01.010.029", label: "Despesas IPTU Escritório" },
  { value: "20.01.010.030", label: "Despesas IPTU Stand" },
  { value: "20.01.010.031", label: "Viagens - Hospedagem" },
  { value: "20.01.010.033", label: "Manutenção de Equipamentos e Conservação" },
  { value: "20.01.010.034", label: "Energia" },
  { value: "20.01.010.035", label: "Despesas Recrutamento e Seleção" },
  { value: "20.01.010.036", label: "Material de Limpeza" },

  { value: "20.01.011.001", label: "Salários e Ordenados" },
  { value: "20.01.011.002", label: "Salário - Pagto de Adiantamento" },
  { value: "20.01.011.003", label: "Pró labores" },
  { value: "20.01.011.004", label: "Auxílio Alimentação" },
  { value: "20.01.011.005", label: "Convênio Médico, Odontológico e Seguro de Vida" },
  { value: "20.01.011.006", label: "Transporte" },
  { value: "20.01.011.007", label: "Férias" },
  { value: "20.01.011.008", label: "13º Salário" },
  { value: "20.01.011.009", label: "Cursos e Treinamentos" },
  { value: "20.01.011.010", label: "Rescisões Trabalhistas" },
  { value: "20.01.011.011", label: "Reclamatórias Trabalhistas" },
  { value: "20.01.011.012", label: "Auxílio Moradia" },
  { value: "20.01.011.013", label: "Sindicatos e Associações" },
  { value: "20.01.011.014", label: "Segurança e Medicina do Trabalho" },
  { value: "20.01.011.015", label: "Serviços de Terceiros – Programa Jovem Aprendiz" },
  { value: "20.01.011.016", label: "Uniformes - Desp. Pessoal" },
  { value: "20.01.011.017", label: "Estágio" },
  { value: "20.01.011.018", label: "Confraternizações" },
  { value: "20.01.011.019", label: "Auxilio Transporte" },
  { value: "20.01.011.020", label: "Prestação de Serviços PJ Interno" },
  { value: "20.01.011.021", label: "Comissão e Corretagem – Interno" },
  { value: "20.01.011.022", label: "Pensão Alimentícia" },
  { value: "20.01.011.023", label: "Empréstimo Crédito do Trabalhador" },
  { value: "20.01.011.024", label: "Equipamentos de proteção individual (EPI)" },
  { value: "20.01.011.025", label: "Premios e bonificações" },

  { value: "20.01.012.001", label: "Contribuição Sindical e Assistencial" },
  { value: "20.01.012.002", label: "Encargos Sociais IRRF" },
  { value: "20.01.012.003", label: "Encargos Sociais FGTS" },
  { value: "20.01.012.004", label: "Encargos Sociais INSS" },

  { value: "20.01.013.001", label: "Assessoria Administrativa" },
  { value: "20.01.013.002", label: "Assessoria Contábil" },
  { value: "20.01.013.003", label: "Assessoria Jurídica" },
  { value: "20.01.013.004", label: "Assessoria Técnica" },
  { value: "20.01.013.005", label: "Assessoria Executiva" },
  { value: "20.01.013.006", label: "Prestação de Serviços PJ" },

  { value: "20.01.014.001", label: "IPTU / ITBI / ITCMD - Estoque" },
  { value: "20.01.014.002", label: "Energia, Água e Condomínio - Estoques" },
  { value: "20.01.014.003", label: "Limpeza, Manutenção e Conservação - Estoques" },

  { value: "20.01.015.001", label: "Custas Judiciais" },
  { value: "20.01.015.002", label: "Depósitos Judiciais" },
  { value: "20.01.015.003", label: "Multas por auto de infração" },
  { value: "20.01.015.004", label: "Regularizações / Indenizações" },

  { value: "20.01.016.001", label: "Periféricos de Eletroeletrônicos" },
  { value: "20.01.016.002", label: "Computadores e Eletroeletrônicos" },
  { value: "20.01.016.003", label: "Áreas e Imóveis" },
  { value: "20.01.016.004", label: "Móveis e Utensílios" },
  { value: "20.01.016.005", label: "Softwares" },
  { value: "20.01.016.006", label: "Veículos" },
  { value: "20.01.016.007", label: "Máquinas e Ferramentas" },
  { value: "20.01.016.008", label: "Marcas e Patentes" },
  { value: "20.01.016.009", label: "Compra da Participação Societária" },

  { value: "20.01.017.001", label: "Comissões e Corretagem" },
  { value: "20.01.017.002", label: "Prêmios e Bônus sobre Vendas" },
  { value: "20.01.017.003", label: "Despesas de Comercialização" },
  { value: "20.01.017.004", label: "Ajuda de Custo - Comercial" },
  { value: "20.01.017.005", label: "Campanhas Comerciais ao Cliente" },

  { value: "20.01.018.001", label: "Agências de Marketing Terceiras" },
  { value: "20.01.018.002", label: "Assessoria de Imprensa" },
  { value: "20.01.018.003", label: "Eventos" },
  { value: "20.01.018.004", label: "Doações e Patrocínios" },
  { value: "20.01.018.005", label: "Produção (Gráfica, Fotos, Vídeos e Animações)" },
  { value: "20.01.018.006", label: "Publicidade e Sinalizações" },
  { value: "20.01.018.007", label: "Pesquisa de Mercado" },
  { value: "20.01.018.008", label: "Presentes / Brindes" },
  { value: "20.01.018.009", label: "Mídia Digital" },

  { value: "20.01.019.001", label: "Mão de Obra Construção" },
  { value: "20.01.019.002", label: "Material Construção Stand" },
  { value: "20.01.019.003", label: "Decoração do Stand" },

  { value: "20.02.001.001", label: "Saída de Aporte Sócio Impper" },
  { value: "20.02.001.002", label: "Saída de Aporte Sócio Outros" },

  { value: "20.02.002.001", label: "Saída Mútuo" },
  { value: "20.02.002.002", label: "Amortização Empréstimo Instituições Financeira" },
  { value: "20.02.002.003", label: "Repasse entre Empresas do Grupo - a Pagar" },
  { value: "20.02.002.004", label: "Quitação de Financiamento IQ" },
  { value: "20.02.002.005", label: "Quitação de Financiamento VMD" },

  { value: "20.02.003.001", label: "Multa/Juros sobre Empréstimos e Financiamentos" },
  { value: "20.02.003.002", label: "Multa/Juros sobre Tributos e Fornecedores" },
  { value: "20.02.003.003", label: "Taxas e Tarifas Bancarias" },
  { value: "20.02.003.004", label: "Leasing / Consórcios" },

  { value: "20.02.004.001", label: "Cofins a Recolher" },
  { value: "20.02.004.002", label: "CSLL a Recolher" },
  { value: "20.02.004.003", label: "IRPJ a Recolher" },
  { value: "20.02.004.004", label: "ISSQN a Recolher" },
  { value: "20.02.004.005", label: "PIS a Recolher" },
  { value: "20.02.004.006", label: "RET - Regime Especial de Tributação" },

  { value: "20.02.005.001", label: "Distribuição de Lucros Sócios" },
  { value: "20.02.005.002", label: "Devolução de Distribuição de Lucros Sócios" },
  { value: "20.02.005.003", label: "Distribuição de Lucros – Terreneiros" },
  { value: "20.02.005.010", label: "Distribuição – Unidades Real Park Valério" },
  { value: "20.02.005.011", label: "Distribuição – Unidades Eco Park Capov" },

  { value: "20.02.007.001", label: "Pagamentos Indevidos" },
  { value: "20.02.007.002", label: "(-) Estorno de Pagamentos Indevidos" },
  { value: "20.02.007.003", label: "Reembolso de clientes" },

  { value: "30.01.001.001", label: "(-) Retenção Imposto de Renda" },
  { value: "30.01.001.002", label: "(-) Retenção Imposto de Renda" },
  { value: "30.01.001.003", label: "(-) Retenção INSS" },
  { value: "30.01.001.005", label: "(-) Retenção ISSQN" },
  { value: "30.01.001.007", label: "(-) Retenção CSRF" },
  { value: "30.01.001.008", label: "Impostos a Pagar" },
  { value: "30.01.001.009", label: "Atualização Selic" },

  { value: "30.01.002.001", label: "(-) Retenção Técnica de Obra" },
  { value: "30.01.002.002", label: "Pagamento Retenção Técnica de Obra" },

  { value: "30.01.003.001", label: "(-) Transferências entre Contas de Mesma Titularidade" },
  { value: "30.01.003.003", label: "Créditos Indevidos" },
  { value: "30.01.003.004", label: "Crédito Cartão Caixinha" },

  { value: "30.01.004.001", label: "Juros de Obra - DB Encargos" },
  { value: "30.01.005.001", label: "Despesas Compartilhadas" }];

    const normalizeText = value =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const createOption = ({ value, label, coligada = "" }) => ({
    value: String(value ?? "").trim(),
    label: String(label ?? value ?? "").trim(),
    coligada: String(coligada ?? "").trim(),
    search: normalizeText(`${value ?? ""} ${label ?? ""}`)
  });

  const normalizeKey = value =>
    String(value ?? "")
      .trim()
      .replace(/^0+(?=\d)/, "");

  const readCentroCustoOptions = source => {
    if (!source) return [];

    return Array.from(source.options)
      .filter(option => option.value)
      .map(option =>
        createOption({
          value: option.value,
          label: option.textContent.trim(),
          coligada: option.dataset.coligada
        })
      );
  };

  const filterCentrosByColigada = (centros, codcoligada) => {
    const coligadaSelecionada = normalizeKey(codcoligada);

    if (!coligadaSelecionada) {
      return [];
    }

    const centrosComColigada = centros.filter(
      item => item.coligada
    );

    if (centrosComColigada.length) {
      return centrosComColigada.filter(
        item =>
          normalizeKey(item.coligada) ===
          coligadaSelecionada
      );
    }

    return centros;
  };

  const filterItems = (items, term) => {
    const normalizedTerm = normalizeText(term);

    if (!normalizedTerm) {
      return items;
    }

    return items.filter(
      item => item.search.includes(normalizedTerm)
    );
  };

  const closeMenu = (input, menu) => {
    if (!menu) {
      return;
    }

    menu.classList.remove("show");

    if (input) {
      input.setAttribute("aria-expanded", "false");
    }
  };

  const openMenu = (input, menu) => {
    if (!input || !menu || input.disabled) {
      return;
    }

    menu.classList.add("show");
    input.setAttribute("aria-expanded", "true");
  };

  const getDescription = option => {
    const prefix = `${option.value} - `;

    if (option.label.startsWith(prefix)) {
      return option.label.slice(prefix.length);
    }

    return option.label;
  };

  const renderMenu = ({
    input,
    menu,
    options,
    emptyLabel,
    onSelect
  }) => {
    if (!menu) {
      return;
    }

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
      button.className =
        "dropdown-item imp-search-select__option";
      button.setAttribute("role", "option");

      code.className = "imp-search-select__code";
      code.textContent = option.value;

      description.className =
        "imp-search-select__description";
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

  const initOcForm = () => {
    const form =
      document.getElementById("purchaseForm");

    if (!form) {
      return;
    }

    const coligadaSelect =
      document.getElementById("codcoligada");

    const centroSearch =
      document.querySelector(
        "[data-centro-custo-search]"
      );

    const centroValue =
      document.querySelector(
        "[data-centro-custo-value]"
      );

    const centroSource =
      document.querySelector(
        "[data-centro-custo-source]"
      );

    const centroMenu =
      document.querySelector(
        "[data-centro-custo-dropdown]"
      );

    const centroHint =
      document.getElementById("centroCustoHint");

    const naturezaList =
      document.querySelector(
        "[data-natureza-list]"
      );

    const addNaturezaButton =
      document.querySelector(
        "[data-add-natureza]"
      );

    const naturezaHidden =
      document.querySelector(
        "[data-natureza-value]"
      );

    const submitButton =
      document.querySelector(
        "[data-oc-submit]"
      );

    const centros =
      readCentroCustoOptions(centroSource);

    const naturezas =
      NATUREZAS_ORCAMENTARIAS
        .map(item => createOption(item))
        .filter(
          item => item.value && item.label
        );

    let centrosDisponiveis = [];

    const syncNaturezaHidden = () => {
      if (
        !naturezaHidden ||
        !naturezaList
      ) {
        return;
      }

      naturezaHidden.value =
        Array.from(
          naturezaList.querySelectorAll(
            "[data-natureza-selected-value]"
          )
        )
          .map(input => input.value)
          .filter(Boolean)
          .join(";");
    };

    const updateNatureRemoveButtons = () => {
      if (!naturezaList) {
        return;
      }

      const rows =
        Array.from(
          naturezaList.querySelectorAll(
            "[data-natureza-row]"
          )
        );

      rows.forEach(row => {
        const button =
          row.querySelector(
            "[data-remove-natureza]"
          );

        if (button) {
          button.hidden =
            rows.length === 1;
        }
      });
    };

    const bindNatureRow = row => {
      const search =
        row.querySelector(
          "[data-natureza-search]"
        );

      const selectedValue =
        row.querySelector(
          "[data-natureza-selected-value]"
        );

      const menu =
        row.querySelector(
          "[data-natureza-dropdown]"
        );

      const remove =
        row.querySelector(
          "[data-remove-natureza]"
        );

      if (
        !search ||
        !selectedValue ||
        !menu
      ) {
        return;
      }

      const render = () => {
        const filtered =
          filterItems(
            naturezas,
            search.value
          );

        renderMenu({
          input: search,
          menu,
          options: filtered,
          emptyLabel:
            "Nenhuma natureza encontrada.",

          onSelect(option) {
            search.value =
              `${option.value} - ${option.label}`;

            selectedValue.value =
              option.value;

            search.setCustomValidity("");

            syncNaturezaHidden();

            closeMenu(
              search,
              menu
            );
          }
        });
      };

      search.addEventListener(
        "focus",
        render
      );

      search.addEventListener(
        "click",
        render
      );

      search.addEventListener(
        "input",
        () => {
          selectedValue.value = "";

          search.setCustomValidity("");

          syncNaturezaHidden();

          render();
        }
      );

      search.addEventListener(
        "keydown",
        event => {
          if (
            event.key === "Escape"
          ) {
            closeMenu(
              search,
              menu
            );
          }
        }
      );

      remove?.addEventListener(
        "click",
        () => {
          row.remove();

          updateNatureRemoveButtons();

          syncNaturezaHidden();
        }
      );
    };

    const renderCentros = () => {
      if (
        !centroSearch ||
        !centroMenu
      ) {
        return;
      }

      const filtered =
        filterItems(
          centrosDisponiveis,
          centroSearch.value
        );

      renderMenu({
        input: centroSearch,
        menu: centroMenu,
        options: filtered,
        emptyLabel:
          "Nenhum centro de custo encontrado.",

        onSelect(option) {
          centroSearch.value =
            option.label;

          if (centroValue) {
            centroValue.value =
              option.value;
          }

          centroSearch.setCustomValidity("");

          closeMenu(
            centroSearch,
            centroMenu
          );
        }
      });
    };

    const refreshCentroCusto = () => {
      const codcoligada =
        coligadaSelect?.value || "";

      centrosDisponiveis =
        filterCentrosByColigada(
          centros,
          codcoligada
        );

      const possuiCentros =
        Boolean(
          codcoligada &&
          centrosDisponiveis.length
        );

      if (centroSearch) {
        centroSearch.value = "";
        centroSearch.disabled =
          !possuiCentros;

        centroSearch.setCustomValidity("");
      }

      if (centroValue) {
        centroValue.value = "";
      }

      closeMenu(
        centroSearch,
        centroMenu
      );

      if (centroHint) {
        if (!codcoligada) {
          centroHint.textContent =
            "Selecione a coligada para habilitar os centros de custo.";
        } else if (possuiCentros) {
          centroHint.textContent =
            `${centrosDisponiveis.length} centro(s) de custo disponível(is) para a coligada selecionada.`;
        } else {
          centroHint.textContent =
            "Nenhum centro de custo disponível para a coligada selecionada.";
        }
      }
    };

    centroSearch?.addEventListener(
      "focus",
      renderCentros
    );

    centroSearch?.addEventListener(
      "click",
      renderCentros
    );

    centroSearch?.addEventListener(
      "input",
      () => {
        if (centroValue) {
          centroValue.value = "";
        }

        centroSearch.setCustomValidity("");

        renderCentros();
      }
    );

    centroSearch?.addEventListener(
      "keydown",
      event => {
        if (
          event.key === "Escape"
        ) {
          closeMenu(
            centroSearch,
            centroMenu
          );
        }
      }
    );

    coligadaSelect?.addEventListener(
      "change",
      refreshCentroCusto
    );

    naturezaList
      ?.querySelectorAll(
        "[data-natureza-row]"
      )
      .forEach(bindNatureRow);

    addNaturezaButton
      ?.addEventListener(
        "click",
        () => {
          if (!naturezaList) {
            return;
          }

          const firstRow =
            naturezaList.querySelector(
              "[data-natureza-row]"
            );

          if (!firstRow) {
            return;
          }

          const clone =
            firstRow.cloneNode(true);

          const search =
            clone.querySelector(
              "[data-natureza-search]"
            );

          const selectedValue =
            clone.querySelector(
              "[data-natureza-selected-value]"
            );

          const menu =
            clone.querySelector(
              "[data-natureza-dropdown]"
            );

          if (search) {
            search.value = "";

            search.setCustomValidity("");

            search.setAttribute(
              "aria-expanded",
              "false"
            );
          }

          if (selectedValue) {
            selectedValue.value = "";
          }

          if (menu) {
            menu.innerHTML = "";

            menu.classList.remove(
              "show"
            );
          }

          naturezaList.appendChild(
            clone
          );

          bindNatureRow(clone);

          updateNatureRemoveButtons();

          search?.focus();
        }
      );

    document.addEventListener(
      "click",
      event => {
        document
          .querySelectorAll(
            ".imp-search-select__menu.show"
          )
          .forEach(menu => {
            const wrapper =
              menu.closest(
                ".imp-search-select"
              );

            if (
              wrapper &&
              !wrapper.contains(
                event.target
              )
            ) {
              const input =
                wrapper.querySelector(
                  '[role="combobox"]'
                );

              closeMenu(
                input,
                menu
              );
            }
          });
      }
    );

    submitButton
      ?.addEventListener(
        "click",
        () => {
          const naturezaSearches =
            Array.from(
              document.querySelectorAll(
                "[data-natureza-search]"
              )
            );

          const naturezaValues =
            Array.from(
              document.querySelectorAll(
                "[data-natureza-selected-value]"
              )
            )
              .map(
                input => input.value
              )
              .filter(Boolean);

          if (
            !centroValue?.value
          ) {
            centroSearch?.setCustomValidity(
              "Selecione um Centro de custo da lista."
            );

            centroSearch?.reportValidity();

            return;
          }

          if (
            !naturezaValues.length
          ) {
            const firstSearch =
              naturezaSearches[0];

            firstSearch?.setCustomValidity(
              "Selecione pelo menos uma Natureza Orçamentária da lista."
            );

            firstSearch?.reportValidity();

            return;
          }

          syncNaturezaHidden();

          enviarFormularioOC(
            document,
            submitButton.dataset.flowId,
            submitButton.dataset.stepId
          );
        }
      );

    updateNatureRemoveButtons();

    refreshCentroCusto();
  };

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initOcForm
    );
  } else {
    initOcForm();
  }

})();

async function enviarFormularioOC(
  document,
  id_fluxo,
  id_etapa
) {
  const form =
    document.getElementById(
      "purchaseForm"
    );

  if (!form) {
    return;
  }

  if (!form.reportValidity()) {
    return;
  }

  return enviarFormulario(
    document,
    id_fluxo,
    id_etapa
  );
}