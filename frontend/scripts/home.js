// TEMPORÁRIO: dados fixos só para montar o visual.
// Na FRONT-02 isto será trocado por um fetch em GET /api/products.
const MOCK = [
  { id: 1, artist: "Milton Nascimento & Lô Borges", name: "Clube da Esquina", price: 189.9, category: "Vinil", color: "#2b4a9e, #4a7fd6" },
  { id: 2, artist: "Novos Baianos", name: "Acabou Chorare", price: 169.9, category: "Vinil", color: "#0a6b4a, #22a878" },
  { id: 3, artist: "Pink Floyd", name: "The Dark Side of the Moon", price: 219.9, category: "Vinil", color: "#135a85, #2694c9" },
  { id: 4, artist: "Miles Davis", name: "Kind of Blue", price: 159.9, category: "Vinil", color: "#4a1a0a, #c2672a" },
];

const money = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function renderFeatured() {
  document.getElementById("featured").innerHTML = MOCK.map((p) => `
    <div class="col-12 col-sm-6 col-lg-3">
      <div class="card product-card h-100 p-3">
        <div class="cover" style="background: linear-gradient(135deg, ${p.color})">
          <small>${p.artist}</small>
          <strong>${p.name}</strong>
        </div>
        <div class="pt-3 d-flex flex-column flex-grow-1">
          <span class="tag align-self-start mb-2">${p.category}</span>
          <h3 class="h6 mb-0">${p.name}</h3>
          <p class="text-muted-2 small">${p.artist}</p>
          <div class="d-flex justify-content-between align-items-center mt-auto">
            <strong>${money(p.price)}</strong>
            <a class="btn btn-accent btn-sm" href="product.html?id=${p.id}"><i class="bi bi-plus-lg"></i> Carrinho</a>
          </div>
        </div>
      </div>
    </div>`).join("");
}

document.addEventListener("DOMContentLoaded", renderFeatured);