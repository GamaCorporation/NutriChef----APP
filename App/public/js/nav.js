const menuToggle = document.querySelector('.menu-toggle');
const navbar = document.querySelector('.navbar');

menuToggle.addEventListener('click', () => {
  navbar.classList.toggle('active');
});

// Barra de Pesquisa
const inputBusca = document.getElementById("txtBusca");

inputBusca.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        e.preventDefault(); // impede de recarregar a página sem controle
        const termo = inputBusca.value.trim();
        if (termo) {
            window.location.href = `/resultados?q=${encodeURIComponent(termo)}`;
        }
    }
});