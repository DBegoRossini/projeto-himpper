document.addEventListener("DOMContentLoaded", () => {
  const search = document.querySelector("#explicativos-search");
  const list = document.querySelector("#explicativos-list");
  const noResults = document.querySelector("#explicativos-no-results");

  if (!(search instanceof HTMLInputElement) || !list || !noResults) {
    return;
  }

  const items = Array.from(list.querySelectorAll(".explicativo-item"));
  const normalize = value =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLocaleLowerCase();

  search.addEventListener("input", () => {
    const query = normalize(search.value);
    let visibleItems = 0;

    for (const item of items) {
      const title = item.querySelector("h2")?.textContent ?? "";
      const matches = normalize(title).includes(query);
      item.hidden = !matches;
      visibleItems += Number(matches);
    }

    noResults.hidden = visibleItems > 0;
  });
});
