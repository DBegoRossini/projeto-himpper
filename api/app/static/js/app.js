const flowCatalog = [
    {
        title: "Abrir Ordem de Compra",
        description:
            "Inicie pedidos de compra com dados do fornecedor, centro de custo e aprovação financeira.",
        category: "Suprimentos",
        eta: "2 a 5 min",
        href: "#"
    },
    {
        title: "Solicitação de Contrato",
        description:
            "Formalize uma nova contratação com escopo, vigência, anexos e responsáveis pela validação.",
        category: "Jurídico",
        eta: "4 a 8 min",
        href: "#"
    },
    {
        title: "Requisição de Pagamento",
        description:
            "Encaminhe pagamentos eventuais com comprovantes, classificação contábil e trilha de aprovação.",
        category: "Financeiro",
        eta: "3 a 6 min",
        href: "#"
    },
    {
        title: "Solicitação de Aditivo",
        description:
            "Registre alterações de escopo ou prazo em contratos vigentes com justificativa e documentos de suporte.",
        category: "Contratos",
        eta: "5 a 7 min",
        href: "#"
    }
];

const flowCards = document.getElementById("flowCards");
const flowCountBadge = document.getElementById("flowCountBadge");
const flowHighlights = document.getElementById("flowHighlights");
const flowEmptyState = document.getElementById("flowEmptyState");

function pluralizeFlows(count) {
    return count === 1 ? "1 fluxo" : `${count} fluxos`;
}

function renderHighlights(flows) {
    const categories = new Set(flows.map(flow => flow.category)).size;

    flowHighlights.innerHTML = `
        <article class="imp-stat">
            <div class="imp-stat__icon">＋</div>
            <div>
                <span class="imp-stat__label">Fluxos disponíveis</span>
                <strong class="imp-stat__value">${flows.length}</strong>
            </div>
        </article>
        <article class="imp-stat">
            <div class="imp-stat__icon">▥</div>
            <div>
                <span class="imp-stat__label">Categorias</span>
                <strong class="imp-stat__value">${categories}</strong>
            </div>
        </article>
        <article class="imp-stat">
            <div class="imp-stat__icon">◷</div>
            <div>
                <span class="imp-stat__label">Tempo médio</span>
                <strong class="imp-stat__value">5 min</strong>
            </div>
        </article>
        <article class="imp-stat">
            <div class="imp-stat__icon">✓</div>
            <div>
                <span class="imp-stat__label">Acesso direto</span>
                <strong class="imp-stat__value">100%</strong>
            </div>
        </article>
    `;
}

function renderFlowCards(flows) {
    flowCountBadge.textContent = pluralizeFlows(flows.length);

    if (!flows.length) {
        flowCards.innerHTML = "";
        flowHighlights.innerHTML = "";
        flowEmptyState.classList.remove("imp-hidden");
        return;
    }

    flowEmptyState.classList.add("imp-hidden");
    renderHighlights(flows);

    flowCards.innerHTML = flows
        .map(
            flow => `
                <article class="imp-card imp-request-card">
                    <header class="imp-card__header">
                        <div>
                            <div class="imp-request-card__meta">
                                <span>${flow.category}</span>
                                <span>${flow.eta}</span>
                            </div>
                            <h3 class="imp-card__title">${flow.title}</h3>
                        </div>
                    </header>

                    <div class="imp-card__body">
                        <p class="imp-request-card__description">
                            ${flow.description}
                        </p>
                    </div>

                    <footer class="imp-card__footer">
                        <a class="imp-btn" href="${flow.href}">
                            Acessar fluxo
                        </a>
                    </footer>
                </article>
            `
        )
        .join("");
}

renderFlowCards(flowCatalog);