# Fontes

O kit usa:

- **Montserrat** para títulos, chamadas e navegação.
- **Daikon Light / Daikon Family** para textos e campos.

Os arquivos da família Daikon não estão incluídos. Use os arquivos licenciados
da empresa e configure-os em um CSS próprio antes de importar o kit.

Exemplo:

```css
@font-face {
  font-family: "Daikon";
  src:
    url("./Daikon-Light.woff2") format("woff2");
  font-style: normal;
  font-weight: 300;
  font-display: swap;
}

@font-face {
  font-family: "Daikon";
  src:
    url("./Daikon-Regular.woff2") format("woff2");
  font-style: normal;
  font-weight: 400;
  font-display: swap;
}
```

Montserrat pode ser carregada pelo Google Fonts:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link
  href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&display=swap"
  rel="stylesheet"
>
```
