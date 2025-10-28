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
function extrairNomeIngrediente(ingrediente) {
  // remove números, medidas e unidades comuns
  return ingrediente
    .replace(/\d+[.,]?\d*\s*(kg|g|l|ml|xícara|colher|pitada)?\s*/gi, '') // remove quantidade
    .trim()
    .toLowerCase();
}

// Função para mapear nomes de ingredientes para ids do banco
async function mapIngredientes(ingredientesRaw) {
  const todosIngredientes = await buscarIngredientesForm(); // [{id_ingrediente, nome}, ...]
  
  return ingredientesRaw.map(item => {
    const nomeLimpo = extrairNomeIngrediente(item);
    const encontrado = todosIngredientes.find(i => i.nome.toLowerCase() === nomeLimpo);
    if (!encontrado) throw new Error(`Ingrediente não encontrado na base: ${item}`);
    return {
      id_ingrediente: encontrado.id_ingrediente,
      quantidade: null,
      unidade: null
    };
  });
}


// ===================== ROTA /PUBLICAR =====================
router.post("/publicar", uploadReceita.single("imagem"), async (req, res) => {
  try {
    let {
      nome,
      descricao,               
      porcoes,
      custo,
      dificuldade,
      idCategoria,
      idIngredienteBase,
      tempoPreparo,
      ingredientes,
      utensilios,
      passos,
    } = req.body;

    // Validações básicas
    if (!nome || !descricao) return res.status(400).json({ success: false, message: "Nome e descrição são obrigatórios" });
    if (!idCategoria) return res.status(400).json({ success: false, message: "Selecione uma categoria" });

    // Conversões
    idCategoria = parseInt(idCategoria);
    idIngredienteBase = idIngredienteBase ? parseInt(idIngredienteBase) : null;
    porcoes = parseInt(porcoes) || 1;
    custo = parseFloat(custo) || 0;
    dificuldade = parseInt(dificuldade) || 1;
    tempoPreparo = parseInt(tempoPreparo) || 0;

    ingredientes = JSON.parse(ingredientes || "[]"); // array de nomes ou objetos {nome, quantidade, unidade}
    utensilios = JSON.parse(utensilios || "[]");
    passos = JSON.parse(passos || "[]");

    const imagem = req.file ? `/receitas/${req.file.filename}` : "/receitas/default.jpg";

    // Inserir receita
    const idNovaReceita = await incluirReceita({
      nome,
      descricao,
      porcoes,
      custo,
      dificuldade,
      idCategoria,
      idIngredienteBase,
      tempoPreparo,
      imagem,
    });

    // Mapear ingredientes para IDs
    if (ingredientes.length > 0) {
      const ingredientesMapeados = await mapIngredientes(ingredientes);
      await inserirIngredientes(idNovaReceita, ingredientesMapeados);
    }

    // Inserir utensílios e passos
    if (utensilios.length > 0) await inserirUtensilios(idNovaReceita, utensilios);
    if (passos.length > 0) await inserirPassos(idNovaReceita, passos);

    res.json({ success: true, message: "Receita cadastrada com sucesso", id: idNovaReceita });
  } catch (err) {
    console.error("Erro ao salvar receita:", err);
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


// ===============================
// 🌍 IMPORTAR RECEITA EXTERNA (API)
// ===============================
/* SEM USAR
  router.get("/api/importar-receita", async (req, res) => {
    try {
      const receita = await importarReceitaAleatoria();
      res.json(receita);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao importar receita externa" });
    }
  });
*/

export default router;
