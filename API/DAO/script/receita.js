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
    // Divide os termos por vírgula ou espaço
    const termos = termo
      .split(/[, ]+/) // separa por vírgulas e/ou espaços
      .map(t => t.trim())
      .filter(t => t.length > 0);

    if (termos.length === 0) {
      await conn.end();
      return [];
    }

    // Cria as condições dinâmicas para cada termo (usando LIKE)
    const condicoes = termos
      .map(() => "(nome LIKE ? OR descricao LIKE ?)")
      .join(" OR ");

    // Cria os parâmetros de busca duplicando cada termo
    const params = termos.flatMap(t => [`%${t}%`, `%${t}%`]);

    const sql = `
      SELECT id_receitas, nome, descricao
      FROM receitas
      WHERE ${condicoes}
    `;

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

    const [ingredientes] = await conn.execute(
      `SELECT i.nome, ri.quantidade, ri.unidade 
       FROM receita_ingredientes ri 
       JOIN ingredientes i ON i.id_ingrediente = ri.id_ingrediente 
       WHERE ri.id_receitas = ?`,
      [id]
    );

    const [utensilios] = await conn.execute(
      `SELECT u.nome 
       FROM receita_utensilios ru 
       JOIN utensilios u ON u.id_utensilio = ru.id_utensilio 
       WHERE ru.id_receitas = ?`,
      [id]
    );

    const [passos] = await conn.execute(
      "SELECT descricao FROM receita_passos WHERE id_receitas = ? ORDER BY ordem",
      [id]
    );

    await conn.end();

    const autor = receitas[0].autor || "NutriChef";

    return {
      ...receitas[0],
      autor,
      ingredientes: ingredientes.map(i => {
        const qtd = i.quantidade % 1 === 0 ? i.quantidade : i.quantidade.toFixed(2);
        return `${qtd} ${i.unidade} ${i.nome}`;
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
// 📋 BUSCAR CATEGORIAS E INGREDIENTES (Formulário)
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
// ⚡ INCLUIR RECEITA 
// ===============================
export async function incluirReceita(dados) {
  const {
    nome, descricao, porcoes, custo, dificuldade, idCategoria = 1,
    idIngredienteBase = 1, tempoPreparo, imagem = "default.jpg"
  } = dados;

  const sql = `CALL spInsere_Receita(?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const conn = await conexao();

  try {
    const [results] = await conn.query(sql, [
      nome, descricao, porcoes, custo, dificuldade,
      idCategoria, idIngredienteBase, tempoPreparo, imagem
    ]);

    if (!results || !results[0] || !results[0][0]) {
      throw new Error("Procedure não retornou o ID da nova receita");
    }

    const idNovaReceita = results[0][0].id_receitas;
    await conn.end();
    return idNovaReceita;
  } catch (err) {
    await conn.end();
    throw new Error(err.sqlMessage || err.message);
  }
}

// Inserir Ingredientes (id_ingrediente, quantidade, unidade)
export async function inserirIngredientes(idReceita, ingredientes) {
  const conn = await conexao();
  try {
    for (const item of ingredientes) {
      await conn.execute(
        `INSERT INTO receita_ingredientes (id_receitas, id_ingrediente, quantidade, unidade) VALUES (?, ?, ?, ?)`,
        [
          idReceita,
          item.id_ingrediente ?? null,
          item.quantidade ?? null,
          item.unidade ?? null
        ]
      );
    }
    await conn.end();
  } catch (err) {
    await conn.end();
    throw err;
  }
}

// Inserir Utensílios
export async function inserirUtensilios(idReceita, utensilios) {
  const conn = await conexao();
  try {
    for (const u of utensilios) {
      await conn.execute(
        `INSERT INTO receita_utensilios (id_receitas, id_utensilio) VALUES (?, ?)`,
        [idReceita, u] // u = id_utensilio
      );
    }
    await conn.end();
  } catch (err) {
    await conn.end();
    throw err;
  }
}

// Inserir Passos
export async function inserirPassos(idReceita, passos) {
  const conn = await conexao();
  try {
    for (let i = 0; i < passos.length; i++) {
      await conn.execute(
        `INSERT INTO receita_passos (id_receitas, descricao, ordem) VALUES (?, ?, ?)`,
        [idReceita, passos[i], i + 1]
      );
    }
    await conn.end();
  } catch (err) {
    await conn.end();
    throw err;
  }
}

