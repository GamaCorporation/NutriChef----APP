import { conexao } from "../conexao.js";

// ===============================
// 🍳 BUSCAR TODAS AS RECEITAS (Resumo)
// ===============================
export async function buscarTodasReceitas() {
  const conn = await conexao();
  try {
    const [rows] = await conn.execute(
      "SELECT id_receitas, nome, tempo_preparo, imagem FROM receitas"
    );
    await conn.end();
    return rows;
  } catch (err) {
    console.error("Erro ao buscar todas as receitas:", err);
    await conn.end();
    return [];
  }
}

// ===============================
// 🔎 BUSCAR RECEITAS PELOS TERMOS (vários ingredientes)
// ===============================
export async function buscarReceitas(termo) {
  const conn = await conexao();
  try {
    const termos = termo
      .split(/[, ]+/)
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (termos.length === 0) {
      await conn.end();
      return [];
    }

    const condicoes = termos
      .map(() => "(nome LIKE ? OR descricao LIKE ?)")
      .join(" OR ");
    const params = termos.flatMap(t => [`%${t}%`, `%${t}%`]);

    const sql = `SELECT id_receitas, nome, descricao FROM receitas WHERE ${condicoes}`;
    const [rows] = await conn.execute(sql, params);
    await conn.end();
    return rows;
  } catch (err) {
    console.error("Erro ao buscar receitas:", err);
    await conn.end();
    return [];
  }
}

// ===============================
// 📂 BUSCAR RECEITAS POR CATEGORIA
// ===============================
export async function buscarReceitasPorCategoria(nomeCategoria) {
  const sql = `
    SELECT r.* 
    FROM receitas r
    INNER JOIN categorias c ON r.id_categoria = c.id_categorias
    WHERE c.nome = ?
  `;
  const conn = await conexao();
  try {
    const [rows] = await conn.execute(sql, [nomeCategoria]);
    await conn.end();
    return rows;
  } catch (err) {
    console.error("Erro ao buscar receitas por categoria:", err);
    await conn.end();
    return [];
  }
}

// ===============================
// 📌 BUSCAR RECEITA COMPLETA PELO ID
// ===============================
export async function buscarReceitaPorId(id) {
  const conn = await conexao();
  try {
    const [receitas] = await conn.execute(
      "SELECT * FROM receitas WHERE id_receitas = ?",
      [id]
    );
    if (receitas.length === 0) return null;

    const [ingredientesRaw] = await conn.execute(
      `SELECT i.nome, ri.quantidade, ri.unidade 
       FROM receita_ingredientes ri 
       JOIN ingredientes i ON i.id_ingrediente = ri.id_ingrediente 
       WHERE ri.id_receitas = ?`,
      [id]
    );

    const ingredientes = Array.isArray(ingredientesRaw) ? ingredientesRaw : [];

    const [utensiliosRaw] = await conn.execute(
      `SELECT u.nome 
       FROM receita_utensilios ru 
       JOIN utensilios u ON u.id_utensilio = ru.id_utensilio 
       WHERE ru.id_receitas = ?`,
      [id]
    );

    const utensilios = Array.isArray(utensiliosRaw) ? utensiliosRaw : [];

    const [passosRaw] = await conn.execute(
      "SELECT descricao FROM receita_passos WHERE id_receitas = ? ORDER BY ordem",
      [id]
    );

    const passos = Array.isArray(passosRaw) ? passosRaw : [];

    await conn.end();

    const autor = receitas[0].autor || "NutriChef";

    return {
      ...receitas[0],
      autor,
      ingredientes: ingredientes.map(i => {
        const qtd = i.quantidade % 1 === 0 ? i.quantidade : i.quantidade.toFixed(2);
        return `${qtd} ${i.unidade || ""} ${i.nome}`;
      }),
      utensilios: utensilios.map(u => u.nome),
      passos: passos.map(p => p.descricao)
    };
  } catch (err) {
    console.error("Erro ao buscar receita por ID:", err);
    await conn.end();
    return null;
  }
}

// ===============================
// 📋 BUSCAR CATEGORIAS (Formulário)
// ===============================
export async function buscarCategoriasForm() {
  const conn = await conexao();
  try {
    const [rows] = await conn.execute("SELECT id_categorias, nome FROM categorias");
    await conn.end();
    return rows;
  } catch (err) {
    console.error("Erro ao buscar categorias:", err);
    await conn.end();
    return [];
  }
}

// ===============================
// 📋 BUSCAR INGREDIENTES (Formulário)
// ===============================
export async function buscarIngredientesForm() {
  const conn = await conexao();
  try {
    const [rows] = await conn.execute("SELECT id_ingrediente, nome FROM ingredientes");
    await conn.end();
    return rows;
  } catch (err) {
    console.error("Erro ao buscar ingredientes:", err);
    await conn.end();
    return [];
  }
}

// ===============================
// 🍳 INCLUIR RECEITA
// ===============================
export async function incluirReceita(dados) {
  const {
    nome,
    descricao,
    porcoes = 1,
    custo_aproximado = 0,
    dificuldade = 1,
    idCategoria = 1,
    idIngredienteBase = null,
    tempoPreparo = 30,
    imagem = "default.jpg",
  } = dados;

  const conn = await conexao();
  try {
    const sql = `INSERT INTO receitas 
      (nome, descricao, porcoes, custo_aproximado, idDificuldade, id_categoria, id_ingrediente_base, tempo_preparo, imagem)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await conn.execute(sql, [
      nome, descricao, porcoes, custo_aproximado, dificuldade,
      idCategoria, idIngredienteBase, tempoPreparo, imagem
    ]);

    await conn.end();
    return result.insertId;
  } catch (err) {
    await conn.end();
    throw new Error(err.sqlMessage || err.message);
  }
}

// Inserir ingredientes
export async function inserirIngredientes(idReceita, ingredientes) {
  const conn = await conexao();
  try {
    const listaIngredientes = Array.isArray(ingredientes) ? ingredientes : [];
    for (const item of listaIngredientes.filter(i => i && i.id_ingrediente)) {
      const quantidadeNum = parseFloat(item.quantidade) || 0;
      await conn.execute(
        `INSERT INTO receita_ingredientes (id_receitas, id_ingrediente, quantidade, unidade) 
         VALUES (?, ?, ?, ?)`,
        [idReceita, item.id_ingrediente, quantidadeNum, item.unidade || null]
      );
    }
    await conn.end();
  } catch (err) {
    await conn.end();
    throw err;
  }
}

// Inserir utensílios
export async function inserirUtensilios(idReceita, utensilios) {
  const conn = await conexao();
  try {
    const listaUtensilios = Array.isArray(utensilios) ? utensilios : [];
    for (const u of listaUtensilios) {
      await conn.execute(
        `INSERT INTO receita_utensilios (id_receitas, id_utensilio) VALUES (?, ?)`,
        [idReceita, u]
      );
    }
    await conn.end();
  } catch (err) {
    await conn.end();
    throw err;
  }
}

// Inserir passos
export async function inserirPassos(idReceita, passos) {
  const conn = await conexao();
  try {
    const listaPassos = Array.isArray(passos) ? passos : [];
    for (let i = 0; i < listaPassos.length; i++) {
      await conn.execute(
        `INSERT INTO receita_passos (id_receitas, descricao, ordem) VALUES (?, ?, ?)`,
        [idReceita, listaPassos[i], i + 1]
      );
    }
    await conn.end();
  } catch (err) {
    await conn.end();
    throw err;
  }
}
