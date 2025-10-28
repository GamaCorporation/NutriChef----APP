// =====================
// Card de Usuários (DashboardADM)
// =====================

let userSearchTimeout = null;
const usersListEl = document.getElementById('users-list');
const noUsersMsgEl = document.getElementById('no-users-msg');
const userSearchInput = document.getElementById('user-search');

async function fetchUsuarios(query = '') {
  try {
    const url = query
      ? `http://localhost:3000/api/usuarios?q=${encodeURIComponent(query)}`
      : 'http://localhost:3000/api/usuarios';

    const res = await fetch(url);
    if (!res.ok) {
      console.error('Erro ao buscar usuários', res.status);
      return;
    }

    const users = await res.json();

    // Atualiza contador
    const inlineCounter = document.getElementById('users-count-inline');
    inlineCounter.textContent = users.length + (users.length === 1 ? ' usuário' : ' usuários');

    // Atualiza total na seção principal
    const totalUsuarios = document.getElementById('total-usuarios');
    if (totalUsuarios) totalUsuarios.textContent = users.length;

    // Mostra ou esconde mensagem
    if (!users || users.length === 0) {
      usersListEl.innerHTML = '';
      noUsersMsgEl.style.display = 'block';
      return;
    } else {
      noUsersMsgEl.style.display = 'none';
    }

    // Renderiza lista
    usersListEl.innerHTML = '';
    users.forEach(u => {
      const avatar = (u.foto && u.foto.length)
        ? `<img src="${u.foto}" alt="${u.nome}" style="width:36px;height:36px;border-radius:8px;object-fit:cover" />`
        : `<div class="avatar-sm">${(u.nome || '?')[0]}</div>`;

      usersListEl.innerHTML += `
        <div class="user-row">
          <div class="user-left">
            ${avatar}
            <div>
              <div style="font-weight:700">${u.nome}</div>
              <div class="meta-muted">${u.email}</div>
            </div>
          </div>
          <div class="meta-muted">ID: ${u.id_usuarios}</div>
        </div>
      `;
    });
  } catch (err) {
    console.error('Erro fetchUsuarios', err);
    usersListEl.innerHTML = '';
    noUsersMsgEl.style.display = 'block';
    noUsersMsgEl.textContent = 'Erro ao buscar usuários.';
  }
}

// Debounce da busca
userSearchInput.addEventListener('input', e => {
  const q = e.target.value.trim();
  if (userSearchTimeout) clearTimeout(userSearchTimeout);
  userSearchTimeout = setTimeout(() => fetchUsuarios(q), 250);
});

// Também atualiza ao digitar no campo global
document.getElementById('global-search').addEventListener('input', e => {
  const q = e.target.value.trim();
  fetchUsuarios(q);
});

// Inicialização
fetchUsuarios();
