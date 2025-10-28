import fetch from "node-fetch";

/* ===============================
 🧠 TRADUZ TEXTO (LIBRETRANSLATE)
=============================== */
export async function traduzirTexto(texto, source = "en", target = "pt") {
  if (!texto || texto.trim() === "") return "";
  try {
    const res = await fetch("https://libretranslate.com/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: texto,
        source,
        target,
        format: "text",
      }),
    });

    const data = await res.json();
    return data.translatedText || texto;
  } catch (err) {
    console.error("Erro na tradução:", err);
    return texto;
  }
}

/* ===============================
 🍽️ BUSCAR RECEITA ALEATÓRIA (THEMEALDB)
=============================== */
export async function importarReceitaAleatoria() {
  try {
    const res = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    const data = await res.json();
    const meal = data.meals?.[0];

    if (!meal) throw new Error("Nenhuma receita retornada pela API externa.");

    // Traduz campos principais
    const nomePT = await traduzirTexto(meal.strMeal);
    const instrucoesPT = await traduzirTexto(meal.strInstructions);

    // Monta lista de ingredientes traduzidos
    const ingredientes = [];
    for (let i = 1; i <= 20; i++) {
      const nomeIng = meal[`strIngredient${i}`];
      const medidaIng = meal[`strMeasure${i}`];
      if (nomeIng && nomeIng.trim() !== "") {
        const texto = `${medidaIng || ""} ${nomeIng}`.trim();
        const traduzido = await traduzirTexto(texto);
        ingredientes.push(traduzido);
      }
    }

    return {
      nomeOriginal: meal.strMeal,
      nome: nomePT,
      categoria: meal.strCategory || "Sem categoria",
      origem: meal.strArea || "Desconhecida",
      instrucoesOriginal: meal.strInstructions,
      instrucoes: instrucoesPT,
      ingredientes,
      imagem: meal.strMealThumb,
    };
  } catch (err) {
    console.error("Erro ao importar receita externa:", err);
    throw err;
  }
}
