(() => {
  "use strict";


  const normalize = value =>
    String(value ?? "")
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .toLowerCase()
      .trim();

  const getOriginalOrder = row => {
    const value =
      Number(
        row.dataset.originalOrder
      );

    return Number.isNaN(value)
      ? Number.MAX_SAFE_INTEGER
      : value;
  };

  const getSortDatasetKey = key => {
    if (!key) {
      return "";
    }

    return (
      "sort" +
      key.charAt(0).toUpperCase() +
      key.slice(1)
    );
  };

  const getSortValue = (
    row,
    key
  ) => {
    const datasetKey =
      getSortDatasetKey(key);

    return row.dataset[
      datasetKey
    ] ?? "";
  };

  const getSortType = key => {
    if (key === "protocolo") {
      return "number";
    }

    if (
      key === "recebida" ||
      key === "prazo"
    ) {
      return "date";
    }

    return "text";
  };

  const parseSortValue = (
    value,
    type
  ) => {
    const raw =
      String(value ?? "").trim();


    if (!raw) {
      return {
        empty: true,
        value: null
      };
    }

    if (type === "number") {
      const numericValue =
        Number(raw);

      return {
        empty: false,
        value: Number.isNaN(
          numericValue
        )
          ? normalize(raw)
          : numericValue
      };
    }

    if (type === "date") {
      const timestamp =
        Date.parse(raw);

      return {
        empty:
          Number.isNaN(timestamp),

        value:
          Number.isNaN(timestamp)
            ? null
            : timestamp
      };
    }

    return {
      empty: false,
      value: normalize(raw)
    };
  };

  const compareRows = (
    rowA,
    rowB,
    key,
    direction
  ) => {
    const type =
      getSortType(key);


    const parsedA =
      parseSortValue(
        getSortValue(
          rowA,
          key
        ),
        type
      );


    const parsedB =
      parseSortValue(
        getSortValue(
          rowB,
          key
        ),
        type
      );

    if (
      parsedA.empty &&
      parsedB.empty
    ) {
      return (
        getOriginalOrder(rowA) -
        getOriginalOrder(rowB)
      );
    }


    if (parsedA.empty) {
      return 1;
    }


    if (parsedB.empty) {
      return -1;
    }


    let result = 0;


    if (
      typeof parsedA.value ===
        "number" &&
      typeof parsedB.value ===
        "number"
    ) {
      result =
        parsedA.value -
        parsedB.value;
    } else {
      result =
        String(
          parsedA.value
        ).localeCompare(
          String(parsedB.value),
          "pt-BR",
          {
            numeric: true,
            sensitivity: "base"
          }
        );
    }

    if (result === 0) {
      result =
        getOriginalOrder(rowA) -
        getOriginalOrder(rowB);
    }


    return direction === "desc"
      ? -result
      : result;
  };

  const sortContainer = (
    container,
    sortState
  ) => {
    if (!container) {
      return;
    }


    const items =
      Array.from(
        container.children
      ).filter(element =>
        element.matches(
          "[data-request-row]"
        )
      );

    if (!sortState.key) {

      items.sort(
        (a, b) =>
          getOriginalOrder(a) -
          getOriginalOrder(b)
      );

    } else {

      items.sort(
        (a, b) =>
          compareRows(
            a,
            b,
            sortState.key,
            sortState.direction
          )
      );

    }


    items.forEach(item => {
      container.appendChild(item);
    });
  };

  const updateSortHeaders =
    sortState => {

      document
        .querySelectorAll(
          "[data-sort-header]"
        )
        .forEach(header => {

          const key =
            header.dataset.sortHeader;


          const indicator =
            header.querySelector(
              "[data-sort-indicator]"
            );


          if (
            key === sortState.key
          ) {

            const ascending =
              sortState.direction ===
              "asc";


            header.setAttribute(
              "aria-sort",
              ascending
                ? "ascending"
                : "descending"
            );


            if (indicator) {
              indicator.textContent =
                ascending
                  ? "↑"
                  : "↓";
            }

          } else {

            header.setAttribute(
              "aria-sort",
              "none"
            );


            if (indicator) {
              indicator.textContent =
                "↕";
            }

          }

        });
    };


  const initSolicitacoesPage =
    () => {

      const searchField =
        document.querySelector(
          "[data-request-search]"
        );


      const requesterFilter =
        document.querySelector(
          "[data-request-requester-filter]"
        );


      const ownerFilter =
        document.querySelector(
          "[data-request-owner-filter]"
        );


      const statusFilter =
        document.querySelector(
          "[data-request-status-filter]"
        );

      const flowFilter =
        document.querySelector(
          "[data-request-flow-filter]"
        );

      const stepFilter =
        document.querySelector(
          "[data-request-step-filter]"
        );

      const stepStartDateFilter =
        document.querySelector(
          "[data-step-start-date-filter]"
        );

      const stepEndDateFilter =
        document.querySelector(
          "[data-step-end-date-filter]"
        );

      const stepExecutorFilter =
        document.querySelector(
          "[data-request-executor-step-filter]"
        );

      const requestStartDateFilter =
        document.querySelector(
          "[data-request-start-date-filter]"
        );

      const requestEndDateFilter =
        document.querySelector(
          "[data-request-end-date-filter]"
        );


      if (!searchField) {
        return;
      }


      const rows =
        Array.from(
          document.querySelectorAll(
            "[data-request-row]"
          )
        );

      const executionsByRow =
        new Map(
          rows.map(row => [
            row,
            JSON.parse(
              row.dataset.requestExecutions || "[]"
            )
          ])
        );


      const emptyState =
        document.querySelector(
          "[data-request-empty]"
        );


      const totalOutput =
        document.querySelector(
          "[data-summary-total]"
        );


      const visibleOutput =
        document.querySelector(
          "[data-summary-visible]"
        );


      const mineOutput =
        document.querySelector(
          "[data-summary-mine]"
        );


      const tableBody =
        document.querySelector(
          "[data-request-table] tbody"
        );


      const mobileList =
        document.querySelector(
          "[data-request-mobile-list]"
        );

      const sortState = {
        key: null,
        direction: "asc"
      };

      const getUniqueCount =
        predicate => {

          const ids =
            new Set();


          rows.forEach(row => {

            if (!predicate(row)) {
              return;
            }


            const id =
              row.dataset.requestId ||
              row.dataset.search;


            if (id) {
              ids.add(id);
            }

          });


          return ids.size;
        };


      const applySort = () => {

        sortContainer(
          tableBody,
          sortState
        );


        sortContainer(
          mobileList,
          sortState
        );


        updateSortHeaders(
          sortState
        );
      };


      const sync = () => {

        const searchTerm =
          normalize(
            searchField.value
          );


        const requesterTerm =
          normalize(
            requesterFilter?.value
          );


        const selectedOwner =
          normalize(
            ownerFilter?.value
          );


        const selectedStatus =
          normalize(
            statusFilter?.value
          );

        const selectedFlow =
          flowFilter?.value || "";

        const selectedStep =
          stepFilter?.value || "";

        const selectedStepExecutor =
          stepExecutorFilter?.value || "";

        const stepStartDate =
          stepStartDateFilter?.value || "";

        const stepEndDate =
          stepEndDateFilter?.value || "";

        const requestStartDate =
          requestStartDateFilter?.value || "";

        const requestEndDate =
          requestEndDateFilter?.value || "";


        rows.forEach(row => {

          const haystack =
            normalize(
              row.dataset.search
            );


          const requester =
            normalize(
              row.dataset.requester
            );


          const owner =
            normalize(
              row.dataset.owner
            );


          const status =
            normalize(
              row.dataset.status
            );


          const matchesSearch =
            !searchTerm ||
            haystack.includes(
              searchTerm
            );


          const matchesRequester =
            !requesterTerm ||
            requester.includes(
              requesterTerm
            );


          const matchesOwner =
            !selectedOwner ||
            owner ===
              selectedOwner;


          const matchesStatus =
            !selectedStatus ||
            status ===
              selectedStatus;

          const matchesFlow =
            !selectedFlow ||
            row.dataset.requestFlow === selectedFlow;

          const requestDate =
            row.dataset.requestDate?.slice(0, 10) || "";

          const matchesRequestDate =
            (!requestStartDate ||
              (requestDate && requestDate >= requestStartDate)) &&
            (!requestEndDate ||
              (requestDate && requestDate <= requestEndDate));

          const matchesStep =
            !selectedStep ||
            (executionsByRow.get(row) || []).some(execution => {
              const startedDate =
                execution.iniciada_em?.slice(0, 10) || "";

              const finishedDate =
                execution.finalizada_em?.slice(0, 10) || "";

              return (
                String(execution.id_etapa) === selectedStep &&
                (!selectedStepExecutor ||
                  execution.executor === selectedStepExecutor) &&
                (!stepStartDate ||
                  (startedDate && startedDate >= stepStartDate)) &&
                (!stepEndDate ||
                  (finishedDate && finishedDate <= stepEndDate))
              );
            });


          const visible =
            matchesSearch &&
            matchesRequester &&
            matchesOwner &&
            matchesStatus &&
            matchesFlow &&
            matchesRequestDate &&
            matchesStep;


          row.hidden =
            !visible;
        });

        applySort();


        const visibleCount =
          getUniqueCount(
            row => !row.hidden
          );


        const totalCount =
          getUniqueCount(
            () => true
          );


        const mineCount =
          getUniqueCount(
            row =>
              normalize(
                row.dataset.owner
              ) === "mine"
          );


        if (visibleOutput) {
          visibleOutput.textContent =
            String(
              visibleCount
            );
        }


        if (totalOutput) {
          totalOutput.textContent =
            String(
              totalCount
            );
        }


        if (mineOutput) {
          mineOutput.textContent =
            String(
              mineCount
            );
        }


        if (emptyState) {

          emptyState.classList.toggle(
            "imp-hidden",
            visibleCount > 0
          );

        }

      };

      document
        .querySelectorAll(
          "[data-request-sort-key]"
        )
        .forEach(button => {

          button.addEventListener(
            "click",
            () => {

              const key =
                button.dataset
                  .requestSortKey;


              if (!key) {
                return;
              }
              if (
                sortState.key === key
              ) {

                sortState.direction =
                  sortState.direction ===
                    "asc"
                    ? "desc"
                    : "asc";

              } else {
                sortState.key =
                  key;

                sortState.direction =
                  "asc";
              }


              applySort();

            }
          );

        });

      searchField.addEventListener(
        "input",
        sync
      );

      requesterFilter
        ?.addEventListener(
          "input",
          sync
        );

      ownerFilter
        ?.addEventListener(
          "change",
          sync
        );

      statusFilter
        ?.addEventListener(
          "change",
          sync
        );

      [
        stepStartDateFilter,
        stepEndDateFilter,
        stepExecutorFilter,
        requestStartDateFilter,
        requestEndDateFilter
      ].forEach(filter => {
        filter?.addEventListener(
          "change",
          sync
        );
      });

      document.addEventListener(
        "request-filters-change",
        sync
      );

      sync();
    };


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initSolicitacoesPage
    );

  } else {

    initSolicitacoesPage();

  }

})();

function filterRequests() {
const fluxo = document.getElementById('requestFlowFilter').value;
const etapa = document.getElementById('requestStepFilter');
opcond = etapas.filter(
            (etapa) => String(etapa["id_flow"]) === String(fluxo)
        )

    etapa.innerHTML = '';
    const optTodos = document.createElement('option');
    optTodos.value = '';
    optTodos.textContent = 'Todos';
    etapa.appendChild(optTodos);
    for (const cont of opcond) {
            const option = document.createElement('option');
            const codEtapa = cont["id"];

            option.value = codEtapa;
            option.textContent = cont["nome"];
            etapa.appendChild(option);
        }

    showStepFilter();
};
function showStepFilter() {
    const etapa = document.getElementById('requestStepFilter').value;
    const iniData = document.getElementById('stepStartDateFilter');
    const endData = document.getElementById('stepEndDateFilter');
    const exec = document.getElementById('requestExecStepFilter');

    const iniContainer = iniData.closest('div');
    const endContainer = endData.closest('div');
    const execStepContainer = exec.closest('div');

    const visivel = etapa !== '';

    iniContainer.hidden = !visivel;
    endContainer.hidden = !visivel;
    execStepContainer.hidden = !visivel;

    opExec = execSteps.filter(
        (execucao) => String(execucao["id_etapa"]) === String(etapa)
    );
    exec.innerHTML = '';
    const optTodos = document.createElement('option');
    optTodos.value = '';
    optTodos.textContent = 'Todos';
    exec.appendChild(optTodos);
    for (const cont of opExec) {
            const option = document.createElement('option');
            const codEtapa = cont["execID"];

            option.value = codEtapa;
            option.textContent = cont["executor"];
            exec.appendChild(option);
        }
    document.dispatchEvent(new Event('request-filters-change'));
};