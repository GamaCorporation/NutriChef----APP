document.getElementById('cadastroAdmForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nome = document.getElementById('nome').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const confirmaSenha = document.getElementById('confirmaSenha').value.trim();
    const errorMsg = document.getElementById('errorMsg');
    const successMsg = document.getElementById('successMsg');

    errorMsg.textContent = '';
    successMsg.textContent = '';

    if (senha !== confirmaSenha) {
        errorMsg.textContent = 'As senhas não conferem!';
        return;
    }

    try {
        const res = await fetch('http://localhost:3000/api/adm/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, senha })
        });

        const data = await res.json();

        if (res.ok) {
            successMsg.textContent = 'Administrador cadastrado com sucesso!';
            document.getElementById('cadastroAdmForm').reset();
        } else {
            errorMsg.textContent = data.error || 'Erro ao cadastrar.';
        }
    } catch (err) {
        console.error(err);
        errorMsg.textContent = 'Erro ao conectar com o servidor.';
    }
});