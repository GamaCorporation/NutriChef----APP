import { Router } from "express";

// DAO
import {
  buscarReceitaPorId,
  buscarReceitas,
  buscarReceitasPorCategoria,
  incluirReceita,
  inserirIngredientes,
  inserirPassos,
  inserirUtensilios,
  buscarCategoriasForm,
  buscarIngredientesForm,
} from "../DAO/script/receita.js";

import {
  buscarUserPorEmailSenha,
  deletarUser,
  buscarUsers,
  incluirUser,
} from "../DAO/script/user.js";

import { alterUser } from "../DAO/script/alterUser.js";

// Middleware de upload
import { uploadReceita, uploadPerfil } from "../middleware/script.js";

const router = Router();

// ===============================
// 🍳 ROTAS DE RECEITA
// ===============================

router.get("/receitas", async (req, res) => {
  try {
    const receitas = await buscarReceitas();
    res.json(receitas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar receitas" });
  }
});

router.get("/receitaDet/:id", async (req, res) => {
  try {
    const receita = await buscarReceitaPorId(req.params.id);
    if (!receita) return res.status(404).json({ message: "Receita não encontrada" });
    res.json(receita);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao carregar receita" });
  }
});

router.get("/categoria/:nome", async (req, res) => {
  try {
    const receitas = await buscarReceitasPorCategoria(req.params.nome);
    res.json({ categoria: req.params.nome, receitas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar receitas por categoria" });
  }
});

router.get("/categorias", async (req, res) => {
  try {
    const categorias = await buscarCategoriasForm();
    res.json(categorias);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar categorias" });
  }
});

router.get("/ingredientes", async (req, res) => {
  try {
    const ingredientes = await buscarIngredientesForm();
    res.json(ingredientes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar ingredientes" });
  }
});

router.get("/resultados", async (req, res) => {
  const termo = req.query.q || "";
  try {
    const receitas = await buscarReceitas(termo);
    res.json({ receitas, termo });
  } catch (err) {
    console.error("Erro na rota /resultados:", err);
    res.status(500).json({ erro: "Erro ao buscar receitas" });
  }
});

// -------------------
// PARTE DE RECEITAS
// -------------------

// ====================================================
// FUNÇÃO DE TRADUÇÃO — DeepL API
// ====================================================
async function traduzirTexto(texto, target = 'PT') {
  if (!texto) return '';
  try {
    const API_KEY = '19690adc-e128-4198-bb80-7c728e4ae045:fx';
    const url = `https://api-free.deepl.com/v2/translate`;

    const params = new URLSearchParams();
    params.append('auth_key', API_KEY);
    params.append('text', texto);
    params.append('target_lang', target);

    const res = await fetch(url, {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const text = await res.text(); // ler como texto primeiro
    if (!text) return texto;       // evita erro se veio vazio
    const data = JSON.parse(text); // parse manual
    return data.translations?.[0]?.text || texto;
  } catch (err) {
    console.error('Erro ao traduzir:', err);
    return texto;
  }
}

// Mapear categoria da API para seu banco
function mapCategoriaAPI(apiCategory) {
  const categoria = apiCategory.toLowerCase();
  if (categoria.includes("cake") || categoria.includes("bolo")) return 1; // Bolos
  if (categoria.includes("pasta") || categoria.includes("massa")) return 2; // Massas
  if (categoria.includes("salad") || categoria.includes("salada")) return 3; // Saladas
  return 4; // Diversos
}

function mapIngredientesAPI(meal) {
  const ingredientes = [];
  for (let i = 1; i <= 20; i++) {
    const nome = meal[`strIngredient${i}`];
    const quantidade = meal[`strMeasure${i}`];
    if (nome && nome.trim() !== "") {
      ingredientes.push({
        id_ingrediente: null,
        nome: nome.trim(),
        quantidade: quantidade ? quantidade.trim() : "",
        unidade: ""
      });
    }
  }
  return ingredientes;
}

// -------------------
// ROTA: IMPORTAR RECEITA ALEATÓRIA (API externa)
router.get("/importar", async (req, res) => {
  try {
    const totalReceitas = 80;
    const importadas = [];

    for (let i = 0; i < totalReceitas; i++) {
      const response = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
      const data = await response.json();

      if (!data.meals || data.meals.length === 0) continue;

      const meal = data.meals[0];

      // Mapear ingredientes
      const ingredientesMapeados = mapIngredientesAPI(meal);

      // Montar objeto da receita
      const receitaParaPublicar = {
        nome: meal.strMeal || "Sem nome",
        descricao: meal.strInstructions || "Sem descrição",
        porcoes: 1,
        dificuldade: 2,
        idCategoria: mapCategoriaAPI(meal.strCategory), // agora retorna o ID correto
        tempoPreparo: 30,
        imagem: meal.strMealThumb || "default.jpg",
      };

      // Inserir receita
      const idNovaReceita = await incluirReceita(receitaParaPublicar);
      if (!idNovaReceita) continue;

      // Inserir ingredientes
      const ingredientesParaInserir = ingredientesMapeados.map((ing, idx) => ({
        id_ingrediente: ing.id_ingrediente,
        quantidade: ing.quantidade || "",
        unidade: ing.unidade || "",
        nome: ing.nome || `Ingrediente ${idx + 1}`
      }));
      await inserirIngredientes(idNovaReceita, ingredientesParaInserir);

      importadas.push(idNovaReceita);
    }

    res.json({ success: true, totalImportadas: importadas.length, importadas });
  } catch (err) {
    console.error("Erro ao importar receitas:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// ===============================
// 👤 ROTAS DE USUÁRIO
// ===============================

router.get("/nutrichef/1.0.0/usuarios", async (req, res) => {
  try {
    const usuarios = await buscarUsers();
    res.json(usuarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro ao buscar usuários" });
  }
});

router.post("/nutrichef/1.0.0/usuario", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ success: false, message: "Campos obrigatórios ausentes" });

    const infos = [email, senha, nome];
    const result = await incluirUser(infos);

    res.json({ success: true, message: "Usuário cadastrado com sucesso", result });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
});

router.post("/nutrichef/1.0.0/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ success: false, message: "E-mail e senha são obrigatórios" });

    const usuario = await buscarUserPorEmailSenha(email, senha);
    if (!usuario) return res.status(401).json({ success: false, message: "E-mail ou senha incorretos" });

    req.session.usuarioLogado = {
      id_usuarios: usuario.id_usuarios || usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      foto: usuario.foto || null,
    };

    req.session.save(err => {
      if (err) return res.status(500).json({ success: false, message: "Erro ao criar sessão" });
      res.json({ success: true, message: "Login realizado com sucesso", usuario: req.session.usuarioLogado });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro interno no login" });
  }
});

router.post("/nutrichef/1.0.0/logout", (req, res) => {
  if (!req.session.usuarioLogado) return res.status(200).json({ success: true, message: "Usuário já deslogado" });

  req.session.destroy(err => {
    if (err) return res.status(500).json({ success: false, message: "Erro ao encerrar sessão" });
    res.clearCookie("connect.sid", { path: "/" });
    res.json({ success: true, message: "Logout realizado com sucesso" });
  });
});

// Perfil
router.get("/perfil", (req, res) => {
  const usuario = req.session.usuarioLogado;
  if (!usuario) return res.status(401).json({ success: false, message: "Usuário não logado" });
  res.json({ success: true, usuario });
});

router.put("/perfil", async (req, res) => {
  try {
    const usuario = req.session.usuarioLogado;
    if (!usuario) return res.status(401).json({ success: false, message: "Usuário não logado" });

    const { nome, email, senha } = req.body;
    await alterUser.atualizarParcial(usuario.id_usuarios, { nome, email, senha });
    req.session.usuarioLogado = { ...usuario, nome, email, senha };

    res.json({ success: true, message: "Perfil atualizado com sucesso", usuario: req.session.usuarioLogado });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro ao atualizar perfil" });
  }
});

router.post("/perfil/foto", uploadPerfil.single("foto"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Nenhuma foto enviada" });

    const usuario = req.session.usuarioLogado;
    if (!usuario) return res.status(401).json({ success: false, message: "Usuário não logado" });

    const caminhoFoto = "/usuarios/" + req.file.filename;
    await alterUser.atualizarParcial(usuario.id_usuarios, { foto: caminhoFoto });
    req.session.usuarioLogado.foto = caminhoFoto;

    res.json({ success: true, message: "Foto atualizada", foto: caminhoFoto });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Erro ao atualizar foto" });
  }
});

router.delete("/perfil", async (req, res) => {
  try {
    const usuario = req.session.usuarioLogado;
    if (!usuario) return res.status(401).json({ success: false, message: "Usuário não logado" });

    await deletarUser(usuario.id_usuarios);
    req.session.destroy(err => {
      if (err) return res.status(500).json({ success: false, message: "Erro ao encerrar sessão" });
      res.json({ success: true, message: "Conta deletada com sucesso" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro ao deletar conta" });
  }
});

export default router;
