# Bootstrap + Impper

## Objetivo

Este documento define como o frontend do projeto deve ser construído agora que o Bootstrap faz parte da base da interface.

O objetivo e evitar:

- criar CSS customizado para componentes que o Bootstrap ja resolve nativamente
- criar JavaScript proprio para comportamentos que o Bootstrap ja fornece
- duplicar responsabilidades entre classes `imp-*` e classes do Bootstrap
- perder o visual atual do sistema ao adotar componentes nativos

A regra do projeto agora e simples:

- Bootstrap e a camada estrutural e comportamental padrao
- Impper e a camada visual, semantica e de componentes especializados do negocio

## Ordem de carregamento

O carregamento base acontece em [api/app/templates/index.html](../api/app/templates/index.html):

1. `vendor/bootstrap/css/bootstrap.min.css`
2. `dist/impper-ui.css`
3. `dist/impper-bootstrap.css`
4. `vendor/bootstrap/js/bootstrap.bundle.min.js`
5. `dist/impper-ui.js`

Isso significa:

- o Bootstrap fornece a base nativa
- `impper-ui.css` fornece o sistema visual original da Impper
- `impper-bootstrap.css` adapta o Bootstrap para o visual da Impper
- `impper-ui.js` so deve complementar o que o Bootstrap nao resolve ou o que e especifico do sistema

## Principio de decisao

Antes de criar qualquer CSS ou JS novo, siga esta ordem:

1. O Bootstrap ja possui um componente nativo para isso?
2. O Bootstrap ja possui utilitarios suficientes para isso?
3. O comportamento pode ser resolvido com `data-bs-*` sem JS customizado?
4. O visual pode ser ajustado no adaptador [api/app/static/dist/impper-bootstrap.css](../api/app/static/dist/impper-bootstrap.css)?
5. So se a resposta for nao para tudo acima, crie uma solucao `imp-*` nova.

## O que agora usa Bootstrap nativo

### Base do layout

Em [api/app/templates/index.html](../api/app/templates/index.html), o Bootstrap passou a ser base oficial do frontend.

Recursos usados:

- `dropdown`
- `dropdown-toggle`
- `dropdown-menu`
- `dropdown-menu-end`
- `data-bs-toggle="dropdown"`
- `data-bs-auto-close="outside"`
- `d-grid`
- `btn`

Impacto:

- os menus de notificacoes e usuario nao dependem mais do JS antigo `topbar-user.js`
- abertura, fechamento, foco e estado agora sao responsabilidade do Bootstrap

### Modal de permissoes

Em [api/app/templates/permissoes.html](../api/app/templates/permissoes.html), o popup foi migrado para modal nativa.

Recursos usados:

- `modal`
- `fade`
- `modal-dialog`
- `modal-dialog-centered`
- `modal-lg`
- `modal-dialog-scrollable`
- `modal-content`
- `modal-header`
- `modal-body`
- `btn-close`
- `data-bs-dismiss="modal"`
- `bootstrap.Modal.getOrCreateInstance(...).show()`
- `bootstrap.Modal.getOrCreateInstance(...).hide()`

Impacto:

- nao criar mais popup customizado para janelas padrao do sistema
- usar modal Bootstrap sempre que a interface pedir dialogo, overlay ou edicao contextual

### Toasts

Em [api/app/static/dist/impper-ui.js](../api/app/static/dist/impper-ui.js), a funcao de notificacao passou a usar toast nativa.

Recursos usados:

- `toast-container`
- `toast`
- `toast-body`
- `btn-close`
- `bootstrap.Toast`

Impacto:

- nao criar mais componente de toast independente
- se uma nova notificacao for necessaria, ela deve sair de `ImpperUI.toast(...)`

### Cards

Os seguintes arquivos passaram a usar estrutura nativa de card:

- [api/app/templates/home.html](../api/app/templates/home.html)
- [api/app/templates/novasolicitacao.html](../api/app/templates/novasolicitacao.html)
- [api/app/templates/solicitacoes.html](../api/app/templates/solicitacoes.html)
- [api/app/templates/caixaentrada.html](../api/app/templates/caixaentrada.html)
- [api/app/templates/permissoes.html](../api/app/templates/permissoes.html)
- [api/app/static/js/app.js](../api/app/static/js/app.js)

Recursos usados:

- `card`
- `card-header`
- `card-body`
- `card-footer`

Impacto:

- nao criar mais wrappers equivalentes a card so com `div` e CSS novo
- manter `imp-card` apenas como camada visual complementar quando preciso

### Buttons

Os seguintes arquivos passaram a usar botoes Bootstrap:

- [api/app/templates/index.html](../api/app/templates/index.html)
- [api/app/templates/home.html](../api/app/templates/home.html)
- [api/app/templates/novasolicitacao.html](../api/app/templates/novasolicitacao.html)
- [api/app/templates/solicitacoes.html](../api/app/templates/solicitacoes.html)
- [api/app/templates/caixaentrada.html](../api/app/templates/caixaentrada.html)
- [api/app/templates/permissoes.html](../api/app/templates/permissoes.html)
- [api/app/templates/fluxos/fluxo_aberturaOC.html](../api/app/templates/fluxos/fluxo_aberturaOC.html)
- [api/app/templates/fluxos/POC_n8n.html](../api/app/templates/fluxos/POC_n8n.html)
- [api/app/static/js/app.js](../api/app/static/js/app.js)

Recursos usados:

- `btn`
- `btn-primary`
- `btn-warning`
- `btn-outline-primary`
- `btn-sm`
- `btn-neutral` como extensao visual do projeto

Impacto:

- nao criar mais classes novas equivalentes a botoes padrao
- variacoes visuais devem ser feitas preferencialmente por extensao de `.btn` dentro de [api/app/static/dist/impper-bootstrap.css](../api/app/static/dist/impper-bootstrap.css)

### Form controls

Os seguintes arquivos passaram a usar inputs nativos do Bootstrap:

- [api/app/templates/solicitacoes.html](../api/app/templates/solicitacoes.html)
- [api/app/templates/caixaentrada.html](../api/app/templates/caixaentrada.html)
- [api/app/templates/permissoes.html](../api/app/templates/permissoes.html)
- [api/app/templates/fluxos/fluxo_aberturaOC.html](../api/app/templates/fluxos/fluxo_aberturaOC.html)
- [api/app/templates/fluxos/POC_n8n.html](../api/app/templates/fluxos/POC_n8n.html)

Recursos usados:

- `form-control`
- `form-select`

Impacto:

- nao criar mais `imp-input`, `imp-select` ou `imp-textarea` para uso comum
- foco, borda, placeholder, disabled e altura devem ser ajustados no adaptador Bootstrap

### Tables

Os seguintes arquivos passaram a usar tabelas nativas:

- [api/app/templates/home.html](../api/app/templates/home.html)
- [api/app/templates/solicitacoes.html](../api/app/templates/solicitacoes.html)
- [api/app/templates/caixaentrada.html](../api/app/templates/caixaentrada.html)
- [api/app/templates/permissoes.html](../api/app/templates/permissoes.html)

Recursos usados:

- `table`
- `table-responsive`
- `align-middle`
- `mb-0`

Impacto:

- nao criar mais tabela base so com `imp-table` quando a estrutura for tabular padrao
- usar `imp-table` apenas como complemento visual ou regra muito especifica da tela

### Badges

Os seguintes arquivos passaram a usar badge nativa:

- [api/app/templates/home.html](../api/app/templates/home.html)
- [api/app/templates/novasolicitacao.html](../api/app/templates/novasolicitacao.html)
- [api/app/templates/solicitacoes.html](../api/app/templates/solicitacoes.html)
- [api/app/templates/caixaentrada.html](../api/app/templates/caixaentrada.html)
- [api/app/templates/permissoes.html](../api/app/templates/permissoes.html)

Recursos usados:

- `badge`
- `rounded-pill`

Impacto:

- nao criar mais badge base nova para status simples
- manter as variantes `imp-badge--*` so para aplicar identidade visual e cor de negocio

### Utilitarios Bootstrap

Ja estao sendo usados utilitarios nativos em pontos do sistema, principalmente em [api/app/templates/permissoes.html](../api/app/templates/permissoes.html) e [api/app/templates/index.html](../api/app/templates/index.html):

- `d-grid`
- `d-flex`
- `gap-2`
- `justify-content-end`
- `w-100`
- `p-0`
- `pb-2`
- `mb-0`
- `mb-4`
- `border-bottom`

Impacto:

- antes de criar classe de espacamento, alinhamento ou display, verificar se um utilitario Bootstrap resolve

## Mapa de equivalencias

Use a tabela abaixo como referencia para novas implementacoes.

| Legado Impper | Padrao atual | Observacao |
| --- | --- | --- |
| `imp-btn` | `btn` | Base de botao |
| `imp-btn--neutral` | `btn btn-neutral` | Variacao visual do projeto |
| `imp-btn--outline` | `btn btn-outline-primary` | Acao secundaria |
| `imp-btn--accent` | `btn btn-warning` | Acao de destaque com cor Impper |
| `imp-btn--sm` | `btn btn-sm` | Tamanho reduzido |
| `imp-input` | `form-control` | Input padrao |
| `imp-textarea` | `form-control` | Textarea padrao |
| `imp-select` | `form-select` | Select padrao |
| `imp-card` estrutural | `card` | Card base |
| `imp-card__header` estrutural | `card-header` | Cabecalho |
| `imp-card__body` estrutural | `card-body` | Corpo |
| `imp-card__footer` estrutural | `card-footer` | Rodape |
| `imp-table` estrutural | `table` | Tabela base |
| `imp-table-wrap` estrutural | `table-responsive` | Responsividade |
| `imp-badge` estrutural | `badge rounded-pill` | Badge base |
| popup customizado | `modal` | Dialogos e janelas |
| menu customizado | `dropdown` | Menus de acao |
| toast customizado | `toast` | Notificacoes |

## Quando usar Bootstrap diretamente

Use Bootstrap diretamente quando o problema for:

- botao
- select
- input
- textarea
- badge
- card
- tabela
- menu dropdown
- modal
- toast
- layout simples com utilitarios de display, gap, margin, padding e alinhamento

### Exemplo de botao

```html
<a class="btn btn-primary" href="#">Salvar</a>
<button class="btn btn-outline-primary" type="button">Cancelar</button>
```

### Exemplo de formulario

```html
<label class="imp-field" for="nome">
  <span class="imp-label">Nome</span>
  <input id="nome" class="form-control" type="text">
</label>

<label class="imp-field" for="tipo">
  <span class="imp-label">Tipo</span>
  <select id="tipo" class="form-select">
    <option>Selecione</option>
  </select>
</label>
```

### Exemplo de card

```html
<article class="card imp-card">
  <header class="card-header imp-card__header">
    <h3 class="imp-card__title">Titulo</h3>
  </header>
  <div class="card-body imp-card__body">
    Conteudo
  </div>
  <footer class="card-footer imp-card__footer">
    <button class="btn btn-primary" type="button">Acao</button>
  </footer>
</article>
```

### Exemplo de modal

```html
<button class="btn btn-primary" type="button" data-bs-toggle="modal" data-bs-target="#exemploModal">
  Abrir modal
</button>

<div id="exemploModal" class="modal fade" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="imp-card__title imp-m-0">Titulo</h2>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
      </div>
      <div class="modal-body">
        Conteudo
      </div>
    </div>
  </div>
</div>
```

## Quando manter o modelo Impper

Continue usando componentes `imp-*` quando o Bootstrap nao cobre bem o problema ou quando o componente ja representa uma regra de negocio do sistema.

Hoje isso vale principalmente para:

- `imp-shell`
- `imp-sidebar`
- `imp-topbar`
- `imp-stat`
- `imp-choice-grid`
- `imp-choice`
- `imp-upload`
- `imp-form-message`
- `imp-request-*`
- `imp-form-*`

Esses componentes continuam validos porque nao sao apenas esteticos; varios deles carregam semantica de fluxo, layout corporativo ou interacao especifica do produto.

## Quando NAO criar CSS novo

Nao crie CSS novo se o problema for apenas:

- deixar um botao em largura total: use `w-100`
- alinhar itens horizontalmente: use `d-flex`
- transformar conteudo em grade simples: tente `row`, `col-*` ou utilitarios primeiro
- criar espacamento pequeno ou medio: use `gap-*`, `mb-*`, `mt-*`, `pb-*`, `pt-*` quando o valor nativo resolver
- criar cabecalho e rodape de card: use `card-header` e `card-footer`
- dar responsividade a tabela: use `table-responsive`

Se ainda assim o visual final nao ficar correto, ajuste o Bootstrap em [api/app/static/dist/impper-bootstrap.css](../api/app/static/dist/impper-bootstrap.css), nao criando um componente paralelo.

## Quando NAO criar JS novo

Nao crie JS novo se o problema for:

- abrir ou fechar menu contextual: use `dropdown`
- abrir ou fechar janela modal: use `modal`
- mostrar notificacao: use `bootstrap.Toast` via `ImpperUI.toast(...)`
- fechar componentes dismissiveis: prefira comportamento Bootstrap quando existir

So crie JS proprio quando a necessidade for:

- logica de negocio
- integracao com backend
- mascaras e validacoes especificas
- sincronizacao de campos
- filtros de listas e tabelas do sistema
- componentes proprietarios do produto sem equivalente direto no Bootstrap

## Arquivos centrais da convencao atual

- [api/app/templates/index.html](../api/app/templates/index.html): ponto de entrada do Bootstrap no projeto
- [api/app/static/dist/impper-bootstrap.css](../api/app/static/dist/impper-bootstrap.css): adaptador visual do Bootstrap para o estilo Impper
- [api/app/static/dist/impper-ui.css](../api/app/static/dist/impper-ui.css): base visual propia da Impper
- [api/app/static/dist/impper-ui.js](../api/app/static/dist/impper-ui.js): helpers de UI ainda necessarios
- [api/app/static/js/app.js](../api/app/static/js/app.js): markup dinamico que tambem deve seguir Bootstrap quando gerar componentes genericos

## Regras para novas telas

Ao criar uma nova tela:

1. use Bootstrap para componentes base
2. mantenha classes `imp-*` apenas quando agregarem identidade visual ou semantica
3. se um componente visual do Bootstrap precisar parecer Impper, ajuste o adaptador e nao o HTML da tela inteira
4. evite duplicar um componente nativo com uma versao `imp-*` paralela
5. se existir duvida, prefira a estrutura do Bootstrap e complemente com classes Impper

## Checklist rapido antes de implementar

- Preciso mesmo de JS ou `data-bs-*` resolve?
- Preciso mesmo de CSS novo ou uma classe Bootstrap resolve?
- Estou criando um componente que ja existe como `btn`, `card`, `table`, `modal`, `dropdown`, `toast`, `form-control` ou `form-select`?
- O ajuste deveria ir no HTML da tela ou em [api/app/static/dist/impper-bootstrap.css](../api/app/static/dist/impper-bootstrap.css)?
- Estou preservando o visual Impper sem reimplementar o Bootstrap?

Se a resposta indicar que o Bootstrap ja cobre o caso, use o Bootstrap.