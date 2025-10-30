const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');
const fetch = require('node-fetch')
const session = require('express-session');


const app = express();
app.use(cors());
app.use(express.json());

// Serve arquivos estáticos (CSS, JS, imagens)
app.use(express.static(path.join(__dirname)));

// Conexão com o banco NutriChef
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234', // coloque sua senha
    database: 'NutriChef'
});


app.use(session({
  secret: 'segredo_supersecreto', // muda para algo seguro
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // true se usar HTTPS
}));

// Rota raiz: serve o HTML do dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'DashboardADM.html'));
});

app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, 'cadastro.html'));
});


app.get('/api/usuario-logado', (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ error: 'Não logado' });
    }
});



// Rota para estatísticas do dashboard
app.get('/api/stats', async (req, res) => {
    try {
        const [receitas] = await db.query('SELECT COUNT(*) AS total FROM receitas');
        const [usuarios] = await db.query('SELECT COUNT(*) AS total FROM usuarios');
        const [comentarios] = await db.query('SELECT COUNT(*) AS total FROM avaliacoes');
        res.json({
            receitas: receitas[0].total,
            usuarios: usuarios[0].total,
            comentarios: comentarios[0].total
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { nome, senha } = req.body;
        if (!nome || !senha) return res.status(400).json({ error: 'Preencha todos os campos.' });

        const [rows] = await db.query('SELECT * FROM adm WHERE nome = ? AND senha = ?', [nome, senha]);

        if (rows.length > 0) {
            // salva na sessão
            req.session.user = { id: rows[0].id_adm, nome: rows[0].nome, tipo: 'Admin' };
            res.json({ success: true, message: 'Login realizado com sucesso!' });
        } else {
            res.status(401).json({ success: false, error: 'Nome ou senha incorretos.' });
        }
    } catch (err) {
        console.error('Erro no login:', err);
        res.status(500).json({ error: 'Erro ao processar login.' });
    }
});


// ===== CADASTRO DE ADMINISTRADORES =====
app.post('/api/adm/cadastro', async (req, res) => {
    try {
        const { nome, senha } = req.body;
        if (!nome || !senha) return res.status(400).json({ error: 'Nome e senha são obrigatórios.' });

        const conn = await db.getConnection();
        try {
            await conn.query('CALL spInsere_Adm(?, ?)', [nome, senha]);
            res.json({ message: 'Administrador cadastrado com sucesso!' });
        } catch (err) {
            if (err.sqlState === '45000') {
                res.status(400).json({ error: err.sqlMessage });
            } else {
                throw err;
            }
        } finally {
            conn.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao cadastrar administrador.' });
    }
});

// ===== ROTAS DE ADMINISTRADORES (CRUD) =====
app.get('/api/adm', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM adm');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar administradores' });
    }
});

app.put('/api/adm/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, senha } = req.body;
        if (!nome || !senha) return res.status(400).json({ error: 'Nome e senha são obrigatórios.' });

        const [result] = await db.query('UPDATE adm SET nome = ?, senha = ? WHERE id_adm = ?', [nome, senha, id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Administrador não encontrado.' });

        res.json({ message: 'Administrador atualizado com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar administrador' });
    }
});

app.delete('/api/adm/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM adm WHERE id_adm = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Administrador não encontrado.' });

        res.json({ message: 'Administrador excluído com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao excluir administrador' });
    }
});

// ===== ROTAS DE RECEITAS =====
app.get('/api/receitas', async (req, res) => {
  try {
    const q = req.query.q ? `%${req.query.q}%` : '%';

    const [rows] = await db.query(`
  SELECT 
    r.id_receitas AS id,
    r.nome,
    r.descricao,
    r.porcoes,
    r.custo_aproximado,
    d.nome AS dificuldade,
    c.nome AS categoria,
    i.nome AS ingrediente_base,
    r.tempo_preparo,
    r.imagem
  FROM receitas r
  LEFT JOIN categorias c ON r.id_categoria = c.id_categorias
  LEFT JOIN ingredientes i ON r.id_ingrediente_base = i.id_ingrediente
  LEFT JOIN dificuldade d ON r.idDificuldade = d.idDificuldade
  WHERE r.nome LIKE ?
  ORDER BY r.id_receitas DESC
`, [q]);


    console.log("📦 Dados de receitas retornados:", rows);
    res.json(rows);
  } catch (err) {
    console.error('❌ Erro ao buscar receitas:', err);
    res.status(500).json({ error: 'Erro ao buscar receitas' });
  }
});


// Deletar receita (rota atualizada)
app.delete('/api/receitas/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  console.log("🧾 Tentando deletar receita ID:", id);

  try {
    // Criar uma transação para garantir integridade
    const conn = await db.getConnection();
    await conn.beginTransaction();

    try {
      // 1️⃣ Deletar filhos de cada tabela que referencia receitas
      const tabelasDependentes = [
        'avaliacoes',
        'receita_ingredientes',
        'receita_passos',
        'receita_utensilios' // 🔥 adiciona a tabela que estava faltando
      ];
      
      for (const tabela of tabelasDependentes) {
        await conn.query(`DELETE FROM ${tabela} WHERE id_receitas = ?`, [id]);
      }

      // 2️⃣ Deletar a receita
      const [result] = await conn.query('DELETE FROM receitas WHERE id_receitas = ?', [id]);

      if (result.affectedRows === 0) {
        await conn.rollback();
        return res.status(404).json({ error: 'Receita não encontrada' });
      }

      await conn.commit();
      res.json({ message: 'Receita excluída com sucesso!' });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('❌ Erro ao excluir receita:', err);
    res.status(500).json({ error: 'Erro ao excluir receita' });
  }
});


// 🔍 ROTA PARA LISTAR "DENÚNCIAS" (avaliacoes)
app.get('/api/denuncias', async (req, res) => {
  try {
    const q = req.query.q ? `%${req.query.q}%` : '%';

    const [rows] = await db.query(`
      SELECT 
        a.id_avaliacoes AS id,
        u.nome AS usuario,
        u.email,
        r.nome AS receita,
        a.nota,
        a.comentario AS motivo,
        DATE_FORMAT(a.data, '%d/%m/%Y') AS data,
        IFNULL(a.status, 'Pendente') AS status
      FROM avaliacoes a
      JOIN usuarios u ON u.id_usuarios = a.id_usuarios
      JOIN receitas r ON r.id_receitas = a.id_receitas
      WHERE u.nome LIKE ? OR r.nome LIKE ? OR a.comentario LIKE ?
      ORDER BY a.id_avaliacoes DESC
    `, [q, q, q]);

    console.log(rows[0]);
    res.json(rows);
  } catch (err) {
    console.error('❌ Erro ao buscar denúncias:', err);
    res.status(500).json({ error: 'Erro ao buscar denúncias' });
  }
});

// ✅ Atualiza o status de uma denúncia (marcar como atendida)
app.put('/api/denuncias/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [result] = await db.query('UPDATE avaliacoes SET status = ? WHERE id_avaliacoes = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Denúncia não encontrada.' });
    }

    res.json({ message: 'Status atualizado com sucesso!' });
  } catch (err) {
    console.error('❌ Erro ao atualizar status:', err);
    res.status(500).json({ error: 'Erro ao atualizar status da denúncia.' });
  }
});

// ===== ROTAS DE USUÁRIOS =====
app.get('/api/usuarios', async (req, res) => {
    try {
        const q = req.query.q ? `%${req.query.q}%` : '%';
        const [rows] = await db.query(
            'SELECT id_usuarios, nome, email, foto FROM usuarios WHERE nome LIKE ? ORDER BY nome ASC LIMIT 100',
            [q]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});

app.delete('/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM usuarios WHERE id_usuarios = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
        res.json({ mensagem: 'Usuário deletado com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
});

// ===== ROTAS DE DENÚNCIAS (exemplo) =====
app.get('/api/denuncias', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT u.nome AS usuario, 'Receita' AS tipo, 'Informação errada' AS motivo, u.email, NOW() AS data, 'Em andamento' AS status
            FROM usuarios u
            LIMIT 10
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar denúncias' });
    }
});

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

// ====================================================
// ROTA: Importar receita aleatória da API TheMealDB (somente saudáveis)
// ====================================================
// Função para mapear os ingredientes da API externa (TheMealDB)
function mapIngredientesAPI(meal) {
  const ingredientes = [];
  for (let i = 1; i <= 20; i++) {
    const nome = meal[`strIngredient${i}`];
    const quantidade = meal[`strMeasure${i}`];
    if (nome && nome.trim() !== "") {
      ingredientes.push({
        nome: nome.trim(),
        quantidade: quantidade ? quantidade.trim() : "",
        unidade: ""
      });
    }
  }
  return ingredientes;
}

// ====================================================
// FUNÇÕES AUXILIARES PARA INSERIR RECEITAS E INGREDIENTES
// ====================================================

// Insere uma nova receita no banco e retorna o ID gerado
async function incluirReceita({ nome, descricao, porcoes, custo, dificuldade, idCategoria, idIngredienteBase, tempoPreparo, imagem }) {
  try {
    const [result] = await db.query(
      `INSERT INTO receitas (nome, descricao, porcoes, custo_aproximado, idDificuldade, id_categoria, id_ingrediente_base, tempo_preparo, imagem)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, descricao, porcoes, custo, dificuldade, idCategoria, idIngredienteBase, tempoPreparo, imagem]
    );
    return result.insertId; // retorna o ID da nova receita
  } catch (err) {
    console.error('❌ Erro ao inserir receita:', err);
    throw err;
  }
}

// Relaciona ingredientes a uma receita
async function inserirIngredientes(idReceita, ingredientes) {
  try {
    for (const item of ingredientes) {
      await db.query(
        `INSERT IGNORE INTO receita_ingredientes (id_receitas, id_ingrediente, quantidade, unidade)
         VALUES (?, ?, ?, ?)`,
        [idReceita, item.id_ingrediente, item.quantidade, item.unidade]
      );
    }
  } catch (err) {
    console.error('❌ Erro ao inserir ingredientes:', err);
    throw err;
  }
}



app.get('/api/importar-receita', async (req, res) => {
  try {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const data = await response.json();
    const meal = data.meals?.[0];
    if (!meal) return res.status(404).json({ error: 'Receita não encontrada.' });

    // Mapeia ingredientes usando a função criada
    const ingredientes = mapIngredientesAPI(meal);

    // Tradução dos campos principais
    const nome = await traduzirTexto(meal.strMeal || 'Receita sem nome');
    const descricao = await traduzirTexto(meal.strInstructions || 'Sem instruções');
    const categoriaNome = await traduzirTexto(meal.strCategory || 'Sem categoria');

    // Buscar id da categoria no banco ou criar se não existir
    const conn = await db.getConnection();
    let [rows] = await conn.query('SELECT id_categorias FROM categorias WHERE nome = ?', [categoriaNome]);
    let idCategoria;
    if (rows.length > 0) {
      idCategoria = rows[0].id_categorias;
    } else {
      const [result] = await conn.query('INSERT INTO categorias (nome) VALUES (?)', [categoriaNome]);
      idCategoria = result.insertId;
    }

    // Inserir receita
    const idNovaReceita = await incluirReceita({
      nome,
      descricao,
      porcoes: 1,
      custo: 0,
      dificuldade: 1,
      idCategoria,
      idIngredienteBase: 1,
      tempoPreparo: 30,
      imagem: meal.strMealThumb || 'default.jpg'
    });

    // Inserir ingredientes
    for (const item of ingredientes) {
      // Se ingrediente já existe, pega id, senão cria
      [rows] = await conn.query('SELECT id_ingrediente FROM ingredientes WHERE nome = ?', [item.nome]);
      let idIngrediente;
      if (rows.length > 0) {
        idIngrediente = rows[0].id_ingrediente;
      } else {
        const [result] = await conn.query('INSERT INTO ingredientes (nome) VALUES (?)', [item.nome]);
        idIngrediente = result.insertId;
      }

      await inserirIngredientes(idNovaReceita, [{
        id_ingrediente: idIngrediente,
        quantidade: item.quantidade || null,
        unidade: item.unidade || ''
      }]);
    }

    conn.release();
    res.json({ success: true, message: 'Receita importada com sucesso!', id: idNovaReceita });

  } catch (err) {
    console.error('Erro ao importar receita:', err);
    res.status(500).json({ error: 'Erro ao importar receita.' });
  }
});


// ====================================================
// ROTA: Atualizar receita existente (usada pelo ADM)
// ====================================================
app.post('/api/atualizar-receita', async (req, res) => {
  try {
    const { id, nome, categoria, origem, ingredientes, instrucoes } = req.body;

    if (!id || !nome) {
      return res.status(400).json({ success: false, message: 'ID e nome são obrigatórios.' });
    }

    // Atualiza os dados principais
    await db.query(
      `UPDATE receitas SET nome = ?, descricao = ?, info = ? WHERE id_receitas = ?`,
      [nome, instrucoes, origem, id]
    );

    // Apaga ingredientes antigos e reinsere os novos
    await db.query(`DELETE FROM receita_ingredientes WHERE id_receitas = ?`, [id]);

    for (const item of ingredientes) {
      await db.query(
        `INSERT INTO receita_ingredientes (id_receitas, descricao) VALUES (?, ?)`,
        [id, item]
      );
    }

    res.json({ success: true, message: 'Receita atualizada com sucesso!' });
  } catch (err) {
    console.error('Erro ao atualizar receita:', err);
    res.status(500).json({ success: false, message: 'Erro ao atualizar receita.' });
  }
});

// Inicia o servidor
const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
