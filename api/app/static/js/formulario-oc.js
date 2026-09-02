(() => {
  "use strict";

  const NATUREZAS_ORCAMENTARIAS = [
    { value: "10.01.002.004", label: "(-) Vendas Rescindidas (Restituição)" },

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

    { value: "30.01.005.001", label: "Despesas Compartilhadas" }
  ];


  const normalizeText = value =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();


  const createOption = ({
    value,
    label
  }) => {
    const optionValue =
      String(value ?? "").trim();

    const optionLabel =
      String(label ?? value ?? "").trim();

    return {
      value: optionValue,
      label: optionLabel,
      search: normalizeText(
        `${optionValue} ${optionLabel}`
      )
    };
  };


  const readOptionsFromSelect = source => {
    if (!source) {
      return [];
    }

    return Array.from(source.options)
      .filter(option => option.value)
      .map(option =>
        createOption({
          value: option.value,
          label:
            option.dataset.label ||
            option.textContent.trim()
        })
      )
      .filter(
        option =>
          option.value &&
          option.label
      );
  };


  const filterItems = (
    items,
    term
  ) => {
    const normalizedTerm =
      normalizeText(term);

    if (!normalizedTerm) {
      return items;
    }

    return items.filter(
      item =>
        item.search.includes(
          normalizedTerm
        )
    );
  };


  const getDescription = option => {
    const prefix =
      `${option.value} - `;

    if (
      option.label.startsWith(
        prefix
      )
    ) {
      return option.label.slice(
        prefix.length
      );
    }

    return option.label;
  };


  const getDisplayValue = option => {
    if (!option) {
      return "";
    }

    return (
      `${option.value} - ` +
      `${getDescription(option)}`
    );
  };


  const closeMenu = (
    input,
    menu
  ) => {
    if (!menu) {
      return;
    }

    menu.classList.remove("show");

    if (input) {
      input.setAttribute(
        "aria-expanded",
        "false"
      );
    }
  };


  const openMenu = (
    input,
    menu
  ) => {
    if (
      !input ||
      !menu ||
      input.disabled
    ) {
      return;
    }

    menu.classList.add("show");

    input.setAttribute(
      "aria-expanded",
      "true"
    );
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
      const empty =
        document.createElement(
          "div"
        );

      empty.className =
        "imp-search-select__empty";

      empty.textContent =
        emptyLabel;

      menu.appendChild(empty);

      openMenu(
        input,
        menu
      );

      return;
    }


    options.forEach(option => {
      const button =
        document.createElement(
          "button"
        );

      const code =
        document.createElement(
          "span"
        );

      const description =
        document.createElement(
          "span"
        );


      button.type = "button";

      button.className =
        "dropdown-item " +
        "imp-search-select__option";

      button.setAttribute(
        "role",
        "option"
      );


      code.className =
        "imp-search-select__code";

      code.textContent =
        option.value;


      description.className =
        "imp-search-select__description";

      description.textContent =
        getDescription(option);


      button.append(
        code,
        description
      );


      button.addEventListener(
        "mousedown",
        event => {
          event.preventDefault();
        }
      );


      button.addEventListener(
        "click",
        () => {
          onSelect(option);
        }
      );


      menu.appendChild(button);
    });


    openMenu(
      input,
      menu
    );
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
    const list =
      document.querySelector(
        listSelector
      );

    const hidden =
      document.querySelector(
        hiddenSelector
      );

    const addButton =
      document.querySelector(
        addSelector
      );


    if (
      !list ||
      !hidden
    ) {
      return null;
    }


    const boundRows =
      new WeakSet();


    const findOption = value => {
      const normalizedValue =
        String(value ?? "").trim();

      return options.find(
        option =>
          option.value ===
          normalizedValue
      );
    };


    const getRows = () => {
      return Array.from(
        list.querySelectorAll(
          rowSelector
        )
      );
    };


    const getSelectedValues = () => {
      return getRows()
        .map(row => {
          const selected =
            row.querySelector(
              selectedSelector
            );

          return selected?.value
            ?.trim();
        })
        .filter(Boolean);
    };


    const syncHidden = () => {
      hidden.value =
        getSelectedValues()
          .join(";");
    };


    const closeRowMenu = row => {
      const input =
        row.querySelector(
          searchSelector
        );

      const menu =
        row.querySelector(
          dropdownSelector
        );

      closeMenu(
        input,
        menu
      );
    };


    const closeAllMenus = () => {
      getRows().forEach(
        closeRowMenu
      );
    };


    const updateRemoveButtons =
      () => {
        const rows =
          getRows();

        rows.forEach(row => {
          const button =
            row.querySelector(
              removeSelector
            );

          if (!button) {
            return;
          }

          button.hidden =
            rows.length === 1;
        });
      };


    const updateValidity = () => {
      const rows =
        getRows();

      const selectedValues =
        getSelectedValues();

      const enabledRows =
        rows.filter(row => {
          const search =
            row.querySelector(
              searchSelector
            );

          return (
            search &&
            !search.disabled
          );
        });


      rows.forEach(row => {
        const search =
          row.querySelector(
            searchSelector
          );

        const selected =
          row.querySelector(
            selectedSelector
          );

        if (
          !search ||
          search.disabled
        ) {
          search?.setCustomValidity(
            ""
          );

          return;
        }


        const hasTypedValue =
          Boolean(
            search.value.trim()
          );

        const hasSelectedValue =
          Boolean(
            selected?.value
              ?.trim()
          );


        if (
          hasTypedValue &&
          !hasSelectedValue
        ) {
          search.setCustomValidity(
            "Selecione uma opção da lista."
          );
        } else {
          search.setCustomValidity(
            ""
          );
        }
      });


      if (
        enabledRows.length &&
        !selectedValues.length
      ) {
        const firstSearch =
          enabledRows[0]
            .querySelector(
              searchSelector
            );

        firstSearch?.setCustomValidity(
          requiredMessage
        );
      }
    };


    const renderRowMenu = row => {
      const search =
        row.querySelector(
          searchSelector
        );

      const selected =
        row.querySelector(
          selectedSelector
        );

      const menu =
        row.querySelector(
          dropdownSelector
        );


      if (
        !search ||
        !selected ||
        !menu ||
        search.disabled
      ) {
        return;
      }


      const selectedValues =
        getSelectedValues();


      const currentValue =
        selected.value.trim();


      const availableOptions =
        options.filter(option => {
          const alreadySelected =
            selectedValues.includes(
              option.value
            );

          return (
            !alreadySelected ||
            option.value ===
              currentValue
          );
        });


      const filtered =
        filterItems(
          availableOptions,
          search.value
        );


      renderMenu({
        input: search,
        menu,
        options: filtered,
        emptyLabel,

        onSelect(option) {
          search.value =
            getDisplayValue(
              option
            );

          selected.value =
            option.value;

          search.setCustomValidity(
            ""
          );

          syncHidden();

          updateValidity();

          closeMenu(
            search,
            menu
          );
        }
      });
    };


    const bindRow = (
      row,
      initialValue = ""
    ) => {
      if (
        !row ||
        boundRows.has(row)
      ) {
        return;
      }


      boundRows.add(row);


      const search =
        row.querySelector(
          searchSelector
        );

      const selected =
        row.querySelector(
          selectedSelector
        );

      const menu =
        row.querySelector(
          dropdownSelector
        );

      const remove =
        row.querySelector(
          removeSelector
        );


      if (
        !search ||
        !selected ||
        !menu
      ) {
        return;
      }


      const cleanInitialValue =
        String(
          initialValue ?? ""
        ).trim();


      selected.value =
        cleanInitialValue;


      if (cleanInitialValue) {
        const option =
          findOption(
            cleanInitialValue
          );

        search.value =
          option
            ? getDisplayValue(option)
            : cleanInitialValue;
      } else {
        search.value = "";
      }


      search.setAttribute(
        "aria-expanded",
        "false"
      );


      search.addEventListener(
        "focus",
        () => {
          closeAllMenus();

          renderRowMenu(row);
        }
      );


      search.addEventListener(
        "click",
        () => {
          closeAllMenus();

          renderRowMenu(row);
        }
      );


      search.addEventListener(
        "input",
        () => {
          selected.value = "";

          syncHidden();

          updateValidity();

          renderRowMenu(row);
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

            return;
          }


          if (
            event.key === "Enter" &&
            menu.classList.contains(
              "show"
            )
          ) {
            event.preventDefault();

            const firstOption =
              menu.querySelector(
                ".imp-search-select__option"
              );

            firstOption?.click();
          }
        }
      );


      remove?.addEventListener(
        "click",
        () => {
          row.remove();

          syncHidden();

          updateRemoveButtons();

          updateValidity();
        }
      );
    };


    const createRow = (
      initialValue = "",
      focus = false
    ) => {
      const firstRow =
        list.querySelector(
          rowSelector
        );

      if (!firstRow) {
        return null;
      }


      const clone =
        firstRow.cloneNode(true);


      const search =
        clone.querySelector(
          searchSelector
        );

      const selected =
        clone.querySelector(
          selectedSelector
        );

      const menu =
        clone.querySelector(
          dropdownSelector
        );


      if (search) {
        search.value = "";

        search.setCustomValidity(
          ""
        );

        search.removeAttribute(
          "id"
        );

        search.setAttribute(
          "aria-expanded",
          "false"
        );
      }


      if (selected) {
        selected.value = "";
      }


      if (menu) {
        menu.innerHTML = "";

        menu.classList.remove(
          "show"
        );

        menu.removeAttribute(
          "id"
        );
      }


      list.appendChild(clone);


      bindRow(
        clone,
        initialValue
      );


      updateRemoveButtons();

      syncHidden();

      updateValidity();


      if (
        focus &&
        search &&
        !search.disabled
      ) {
        search.focus();
      }


      return clone;
    };


    const initialValues =
      splitStoredValues(
        hidden.value
      );


    const firstRow =
      list.querySelector(
        rowSelector
      );


    if (firstRow) {
      bindRow(
        firstRow,
        initialValues[0] || ""
      );


      initialValues
        .slice(1)
        .forEach(value => {
          createRow(
            value,
            false
          );
        });
    }


    addButton?.addEventListener(
      "click",
      () => {
        createRow(
          "",
          true
        );
      }
    );


    syncHidden();

    updateRemoveButtons();

    updateValidity();


    return {
      syncHidden,
      updateValidity,

      validate() {
        syncHidden();

        updateValidity();

        const rows =
          getRows();

        const invalidSearch =
          rows
            .map(row =>
              row.querySelector(
                searchSelector
              )
            )
            .find(search =>
              search &&
              !search.disabled &&
              !search.checkValidity()
            );


        if (invalidSearch) {
          invalidSearch.reportValidity();

          return false;
        }


        return true;
      }
    };
  };


  const initOcForm = () => {
    const form =
      document.getElementById(
        "purchaseForm"
      );

    if (!form) {
      return;
    }


    const centroSource =
      document.querySelector(
        "[data-centro-custo-source]"
      );


    const centros =
      readOptionsFromSelect(
        centroSource
      );


    const naturezas =
      NATUREZAS_ORCAMENTARIAS
        .map(createOption)
        .filter(
          option =>
            option.value &&
            option.label
        );


    const centroCustoControl =
      initMultiSearchList({
        listSelector:
          "[data-centro-custo-list]",

        rowSelector:
          "[data-centro-custo-row]",

        searchSelector:
          "[data-centro-custo-search]",

        selectedSelector:
          "[data-centro-custo-selected-value]",

        dropdownSelector:
          "[data-centro-custo-dropdown]",

        addSelector:
          "[data-add-centro-custo]",

        removeSelector:
          "[data-remove-centro-custo]",

        hiddenSelector:
          "[data-centro-custo-value]",

        options:
          centros,

        emptyLabel:
          "Nenhum centro de custo encontrado.",

        requiredMessage:
          "Selecione pelo menos um Centro de Custo da lista."
      });


    const naturezaControl =
      initMultiSearchList({
        listSelector:
          "[data-natureza-list]",

        rowSelector:
          "[data-natureza-row]",

        searchSelector:
          "[data-natureza-search]",

        selectedSelector:
          "[data-natureza-selected-value]",

        dropdownSelector:
          "[data-natureza-dropdown]",

        addSelector:
          "[data-add-natureza]",

        removeSelector:
          "[data-remove-natureza]",

        hiddenSelector:
          "[data-natureza-value]",

        options:
          naturezas,

        emptyLabel:
          "Nenhuma natureza encontrada.",

        requiredMessage:
          "Selecione pelo menos uma Natureza Orçamentária da lista."
      });


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
              !wrapper ||
              wrapper.contains(
                event.target
              )
            ) {
              return;
            }


            const input =
              wrapper.querySelector(
                '[role="combobox"]'
              );


            closeMenu(
              input,
              menu
            );
          });
      }
    );


    const submitButton =
      document.querySelector(
        "[data-oc-submit]"
      );


    submitButton?.addEventListener(
      "click",
      event => {
        event.preventDefault();


        if (
          centroCustoControl &&
          !centroCustoControl.validate()
        ) {
          return;
        }


        if (
          naturezaControl &&
          !naturezaControl.validate()
        ) {
          return;
        }


        if (
          !form.reportValidity()
        ) {
          return;
        }


        enviarFormularioOC(
          document,
          submitButton.dataset.flowId,
          submitButton.dataset.stepId
        );
      }
    );


    window.validarCamposOc = () => {
      if (
        centroCustoControl &&
        !centroCustoControl.validate()
      ) {
        return false;
      }


      if (
        naturezaControl &&
        !naturezaControl.validate()
      ) {
        return false;
      }


      return true;
    };
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


  if (
    typeof window.validarCamposOc ===
      "function" &&
    !window.validarCamposOc()
  ) {
    return;
  }


  if (
    !form.reportValidity()
  ) {
    return;
  }


  return enviarFormulario(
    document,
    id_fluxo,
    id_etapa
  );
}