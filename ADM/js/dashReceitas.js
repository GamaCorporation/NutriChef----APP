const receitasContainer = document.getElementById("receitas-container");
const deleteModal = document.getElementById("delete-modal");
const confirmDeleteBtn = document.getElementById("confirm-delete");
const cancelDeleteBtn = document.getElementById("cancel-delete");
const searchInput = document.getElementById("search-receita");

let receitaIdParaExcluir = null;

// Função para buscar receitas (com suporte à pesquisa)
async function fetchReceitas(query = "") {
  try {
    const url = query ? `http://localhost:3000/api/receitas?q=${encodeURIComponent(query)}` : "http://localhost:3000/api/receitas";
    const res = await fetch(url);
    const receitas = await res.json();

    receitasContainer.innerHTML = "";

    if (receitas.length === 0) {
      receitasContainer.innerHTML = "<p>Nenhuma receita encontrada.</p>";
      return;
    }

    receitas.forEach((r) => {
      const card = document.createElement("div");
      card.classList.add("receita-card");
      card.innerHTML = `
        <div class="receita-info">
          <img src="${r.imagem || 'placeholder.jpg'}" alt="${r.nome}">
          <div>
            <h4>${r.nome}</h4>
            <p><strong>Categoria:</strong> ${r.categoria || 'Sem categoria'}</p>
            <p><strong>Ingrediente base:</strong> ${r.ingrediente_base || 'Não informado'}</p>
            <p><strong>Dificuldade:</strong> ${r.dificuldade || '—'}</p>
            <p><strong>Tempo:</strong> ${r.tempo_preparo || 0} min</p>
          </div>
        </div>
        <button class="btn-excluir" data-id="${r.id}">Excluir</button>
      `;
      receitasContainer.appendChild(card);
    });

    // Adiciona eventos de exclusão
    document.querySelectorAll(".btn-excluir").forEach((btn) => {
      btn.addEventListener("click", () => {
        receitaIdParaExcluir = btn.getAttribute("data-id");
        deleteModal.style.display = "flex";
      });
    });
  } catch (err) {
    console.error("Erro ao buscar receitas:", err);
  }
}

// Confirma exclusão
confirmDeleteBtn.addEventListener("click", async () => {
  if (!receitaIdParaExcluir) return;

  try {
    const res = await fetch(`http://localhost:3000/api/receitas/${receitaIdParaExcluir}`, {
      method: "DELETE",
    });
    const data = await res.json();
    alert(data.message || "Receita excluída!");
    deleteModal.style.display = "none";
    receitaIdParaExcluir = null;
    fetchReceitas(searchInput.value); // Atualiza a lista mantendo pesquisa
  } catch (err) {
    console.error("Erro ao excluir receita:", err);
    alert("Erro ao excluir receita");
  }
});

// Cancela exclusão
cancelDeleteBtn.addEventListener("click", () => {
  receitaIdParaExcluir = null;
  deleteModal.style.display = "none";
});

// Pesquisa ao digitar
searchInput.addEventListener("input", () => {
  fetchReceitas(searchInput.value);
});

// Carrega todas as receitas ao abrir a aba
fetchReceitas();
