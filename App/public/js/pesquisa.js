export function ativarBotoesSugestoes(inputId, gridClass) {
  const inputBusca = document.getElementById(inputId);
  const sugestoes = document.querySelectorAll(`${gridClass} button`);

  if (!inputBusca) return;

  sugestoes.forEach((botao) => {
    botao.addEventListener("click", () => {
      let valorAtual = inputBusca.value.trim();

      if (valorAtual !== "" && !valorAtual.endsWith(",")) {
        valorAtual += ", ";
      }

      inputBusca.value = valorAtual + botao.textContent;
      inputBusca.focus();
    });
  });
}
