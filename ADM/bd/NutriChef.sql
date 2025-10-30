-- ========================================
-- Banco de Dados NutriChef
-- ========================================
CREATE DATABASE IF NOT EXISTS NutriChef;
USE NutriChef;

-- ========================================
-- TABELAS
-- ========================================

CREATE TABLE IF NOT EXISTS categorias (
    id_categorias INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS caracteristicas (
    id_caracteristicas INT AUTO_INCREMENT PRIMARY KEY,
    caracteristica VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS ingredientes (
    id_ingrediente INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50),
    custo_ingrediente DECIMAL(10,2),
    id_caracteristica INT,
    FOREIGN KEY (id_caracteristica) REFERENCES caracteristicas(id_caracteristicas)
);

CREATE TABLE IF NOT EXISTS utensilios (
    id_utensilio INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuarios INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    foto VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS adm (
    id_adm INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    senha VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS dificuldade (
    idDificuldade INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS receitas (
    id_receitas INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    porcoes INT,
    custo_aproximado DECIMAL(10,2),
    idDificuldade INT,
    id_categoria INT,
    id_ingrediente_base INT,
    tempo_preparo INT,
    imagem VARCHAR(255) DEFAULT 'default.jpg',
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categorias),
    FOREIGN KEY (id_ingrediente_base) REFERENCES ingredientes(id_ingrediente),
    FOREIGN KEY (idDificuldade) REFERENCES dificuldade(idDificuldade)
);

CREATE TABLE IF NOT EXISTS receita_ingredientes (
    id_ingrediente INT,
    id_receitas INT,
    quantidade DECIMAL(10,2),
    unidade VARCHAR(50),
    PRIMARY KEY (id_ingrediente, id_receitas),
    FOREIGN KEY (id_ingrediente) REFERENCES ingredientes(id_ingrediente),
    FOREIGN KEY (id_receitas) REFERENCES receitas(id_receitas)
);

ALTER TABLE receita_ingredientes 
MODIFY quantidade VARCHAR(50);


CREATE TABLE IF NOT EXISTS receita_utensilios (
    id_receitas INT,
    id_utensilio INT,
    PRIMARY KEY (id_receitas, id_utensilio),
    FOREIGN KEY (id_receitas) REFERENCES receitas(id_receitas),
    FOREIGN KEY (id_utensilio) REFERENCES utensilios(id_utensilio)
);

CREATE TABLE IF NOT EXISTS receita_passos (
    id_passos INT AUTO_INCREMENT PRIMARY KEY,
    id_receitas INT,
    descricao TEXT,
    ordem INT,
    FOREIGN KEY (id_receitas) REFERENCES receitas(id_receitas)
);

CREATE TABLE IF NOT EXISTS receitas_caracteristicas (
    id_receitas INT,
    id_caracteristicas INT,
    PRIMARY KEY (id_receitas, id_caracteristicas),
    FOREIGN KEY (id_receitas) REFERENCES receitas(id_receitas),
    FOREIGN KEY (id_caracteristicas) REFERENCES caracteristicas(id_caracteristicas)
);

CREATE TABLE IF NOT EXISTS avaliacoes (
    id_avaliacoes INT AUTO_INCREMENT PRIMARY KEY,
    id_usuarios INT,
    id_receitas INT,
    nota INT,
    comentario TEXT,
    data DATE,
    FOREIGN KEY (id_usuarios) REFERENCES usuarios(id_usuarios),
    FOREIGN KEY (id_receitas) REFERENCES receitas(id_receitas)
);

select * from avaliacoes;

ALTER TABLE avaliacoes ADD COLUMN status VARCHAR(30) DEFAULT 'Pendente';

-- ========================================
-- INSERTS DE TESTE
-- ========================================

-- Usuários
INSERT INTO usuarios (nome, email, senha) VALUES
('João leila', 'ghggjmgj@gmail.com', '560789'),
('João Silva', 'joao@exemplo.com', '1234'),
('Maria Oliveira', 'maria@exemplo.com', 'abcd'),
('Carlos Souza', 'carlos@exemplo.com', 'senha123');

-- Adm
INSERT INTO adm (nome, senha) VALUES
('Vittor Nascimento', '1234'),
('Gustavo Quintanilia', 'abcd'),
('Carlos Eduardo', 'senha123');

-- Categorias
INSERT INTO categorias (nome) VALUES
('Bolos'),('Massas'),('Saladas');

-- Ingredientes
INSERT INTO ingredientes (nome, tipo, custo_ingrediente) VALUES
('Cenoura', 'Legume', 5.00),
('Carne Moída', 'Carne', 25.00),
('Frango', 'Carne', 20.00),
('Leite Condensado', 'Laticínio', 8.00),
('Açúcar', 'Açúcar', 3.00),
('Ovos', 'Ovo', 4.00),
('Arroz', 'Grão', 10.00),
('Alface', 'Folha', 3.00);

-- Utensílios
INSERT INTO utensilios (nome) VALUES
('Forma de pudim'),('Panela'),('Liquidificador'),('Espátula');

-- Dificuldades
INSERT INTO dificuldade (nome) VALUES
('Muito Fácil'), ('Fácil'), ('Médio'), ('Difícil'), ('Muito Difícil');

-- Receitas
INSERT INTO receitas (nome, descricao, porcoes, custo_aproximado, idDificuldade, id_categoria, id_ingrediente_base, tempo_preparo, imagem)
SELECT 'Pudim de Microondas',
       'Uma sobremesa clássica, prática e deliciosa: o pudim de microondas é perfeito para qualquer ocasião.',
       6, 15.00, d.idDificuldade, c.id_categorias, i.id_ingrediente, 140,
       'https://www.receiteria.com.br/wp-content/uploads/receitas-de-pudim-de-leite-condensado.jpg'
FROM categorias c
JOIN ingredientes i ON i.nome = 'Leite Condensado'
JOIN dificuldade d ON d.nome = 'Fácil'
WHERE c.nome = 'Bolos';

INSERT INTO receitas (nome, descricao, porcoes, custo_aproximado, idDificuldade, id_categoria, id_ingrediente_base, tempo_preparo, imagem)
SELECT 'Bolo de Cenoura',
       'Bolo caseiro de cenoura com cobertura de chocolate.',
       8, 15.50, d.idDificuldade, c.id_categorias, i.id_ingrediente, 60,
       'https://www.receiteria.com.br/wp-content/uploads/bolo-de-cenoura.jpg'
FROM categorias c
JOIN ingredientes i ON i.nome = 'Cenoura'
JOIN dificuldade d ON d.nome = 'Médio'
WHERE c.nome = 'Bolos';

INSERT INTO receitas (nome, descricao, porcoes, custo_aproximado, idDificuldade, id_categoria, id_ingrediente_base, tempo_preparo, imagem)
SELECT 'Lasanha à Bolonhesa',
       'Lasanha tradicional com carne moída e molho de tomate.',
       6, 45.00, d.idDificuldade, c.id_categorias, i.id_ingrediente, 90,
       'https://static.itdg.com.br/images/360-240/ec2a5e38702c60bf1ace0b5f1c8e9415/shutterstock-739787011.jpg'
FROM categorias c
JOIN ingredientes i ON i.nome = 'Carne Moída'
JOIN dificuldade d ON d.nome = 'Difícil'
WHERE c.nome = 'Massas';

INSERT INTO receitas (nome, descricao, porcoes, custo_aproximado, idDificuldade, id_categoria, id_ingrediente_base, tempo_preparo, imagem)
SELECT 'Salada Caesar',
       'Salada clássica com alface, molho especial, croutons e frango grelhado.',
       2, 18.00, d.idDificuldade, c.id_categorias, i.id_ingrediente, 20,
       'https://p2.trrsf.com/image/fget/cf/1200/900/middle/images.terra.com/2023/02/28/whatsapp-image-2023-02-28-at-01-53-47-(1)-1iyhprrq5e9tc.jpeg'
FROM categorias c
JOIN ingredientes i ON i.nome = 'Frango'
JOIN dificuldade d ON d.nome = 'Fácil'
WHERE c.nome = 'Saladas';

-- Ingredientes das receitas
INSERT INTO receita_ingredientes (id_ingrediente, id_receitas, quantidade, unidade)
SELECT i.id_ingrediente, r.id_receitas, 1, 'lata'
FROM ingredientes i JOIN receitas r
WHERE i.nome = 'Leite Condensado' AND r.nome = 'Pudim de Microondas';

INSERT INTO receita_ingredientes (id_ingrediente, id_receitas, quantidade, unidade)
SELECT i.id_ingrediente, r.id_receitas, 1, 'lata'
FROM ingredientes i JOIN receitas r
WHERE i.nome = 'Açúcar' AND r.nome = 'Pudim de Microondas';

INSERT INTO receita_ingredientes (id_ingrediente, id_receitas, quantidade, unidade)
SELECT i.id_ingrediente, r.id_receitas, 3, 'unidades'
FROM ingredientes i JOIN receitas r
WHERE i.nome = 'Ovos' AND r.nome = 'Pudim de Microondas';

INSERT INTO receita_ingredientes (id_ingrediente, id_receitas, quantidade, unidade)
SELECT i.id_ingrediente, r.id_receitas, 3, 'unidades'
FROM ingredientes i JOIN receitas r
WHERE i.nome = 'Cenoura' AND r.nome = 'Bolo de Cenoura';

INSERT INTO receita_ingredientes (id_ingrediente, id_receitas, quantidade, unidade)
SELECT i.id_ingrediente, r.id_receitas, 3, 'unidades'
FROM ingredientes i JOIN receitas r
WHERE i.nome = 'Ovos' AND r.nome = 'Bolo de Cenoura';

INSERT INTO receita_ingredientes (id_ingrediente, id_receitas, quantidade, unidade)
SELECT i.id_ingrediente, r.id_receitas, 2, 'xícaras'
FROM ingredientes i JOIN receitas r
WHERE i.nome = 'Açúcar' AND r.nome = 'Bolo de Cenoura';

INSERT INTO receita_ingredientes (id_ingrediente, id_receitas, quantidade, unidade)
SELECT i.id_ingrediente, r.id_receitas, 500, 'gramas'
FROM ingredientes i JOIN receitas r
WHERE i.nome = 'Carne Moída' AND r.nome = 'Lasanha à Bolonhesa';

-- Utensílios da receita Pudim
INSERT INTO receita_utensilios (id_receitas, id_utensilio)
SELECT r.id_receitas, u.id_utensilio
FROM receitas r JOIN utensilios u
WHERE r.nome = 'Pudim de Microondas' AND u.nome = 'Forma de pudim';

INSERT INTO receita_utensilios (id_receitas, id_utensilio)
SELECT r.id_receitas, u.id_utensilio
FROM receitas r JOIN utensilios u
WHERE r.nome = 'Pudim de Microondas' AND u.nome = 'Panela';

INSERT INTO receita_utensilios (id_receitas, id_utensilio)
SELECT r.id_receitas, u.id_utensilio
FROM receitas r JOIN utensilios u
WHERE r.nome = 'Pudim de Microondas' AND u.nome = 'Liquidificador';

INSERT INTO receita_utensilios (id_receitas, id_utensilio)
SELECT r.id_receitas, u.id_utensilio
FROM receitas r JOIN utensilios u
WHERE r.nome = 'Pudim de Microondas' AND u.nome = 'Espátula';

-- Passos da receita Pudim
INSERT INTO receita_passos (id_receitas, descricao, ordem)
SELECT r.id_receitas, 'Bata no liquidificador o leite condensado, leite e ovos até formar um creme homogêneo.', 1
FROM receitas r WHERE r.nome = 'Pudim de Microondas';

INSERT INTO receita_passos (id_receitas, descricao, ordem)
SELECT r.id_receitas, 'Em uma panela, derreta o açúcar até formar caramelo e adicione água.', 2
FROM receitas r WHERE r.nome = 'Pudim de Microondas';

INSERT INTO receita_passos (id_receitas, descricao, ordem)
SELECT r.id_receitas, 'Despeje a calda em uma forma e espalhe bem.', 3
FROM receitas r WHERE r.nome = 'Pudim de Microondas';

INSERT INTO receita_passos (id_receitas, descricao, ordem)
SELECT r.id_receitas, 'Coloque a mistura do liquidificador sobre a calda.', 4
FROM receitas r WHERE r.nome = 'Pudim de Microondas';

INSERT INTO receita_passos (id_receitas, descricao, ordem)
SELECT r.id_receitas, 'Leve ao micro-ondas por 10 minutos.', 5
FROM receitas r WHERE r.nome = 'Pudim de Microondas';

INSERT INTO receita_passos (id_receitas, descricao, ordem)
SELECT r.id_receitas, 'Deixe esfriar, leve à geladeira por 2 horas e desenforme.', 6
FROM receitas r WHERE r.nome = 'Pudim de Microondas';

-- Utensílios Bolo de Cenoura
INSERT INTO receita_utensilios (id_receitas, id_utensilio)
SELECT r.id_receitas, u.id_utensilio
FROM receitas r JOIN utensilios u
WHERE r.nome = 'Bolo de Cenoura' AND u.nome = 'Liquidificador';

INSERT INTO receita_utensilios (id_receitas, id_utensilio)
SELECT r.id_receitas, u.id_utensilio
FROM receitas r JOIN utensilios u
WHERE r.nome = 'Bolo de Cenoura' AND u.nome = 'Forma de pudim';

-- Passos Bolo de Cenoura
INSERT INTO receita_passos (id_receitas, descricao, ordem)
SELECT r.id_receitas, 'Bata no liquidificador as cenouras, ovos e óleo até formar um creme.', 1
FROM receitas r WHERE r.nome = 'Bolo de Cenoura';

INSERT INTO receita_passos (id_receitas, descricao, ordem)
SELECT r.id_receitas, 'Adicione açúcar e farinha peneirada, misture bem.', 2
FROM receitas r WHERE r.nome = 'Bolo de Cenoura';

INSERT INTO receita_passos (id_receitas, descricao, ordem)
SELECT r.id_receitas, 'Despeje em forma untada e leve ao forno preaquecido a 180°C por 40 minutos.', 3
FROM receitas r WHERE r.nome = 'Bolo de Cenoura';

-- Avaliações
INSERT INTO avaliacoes (id_usuarios, id_receitas, nota, comentario, data)
SELECT u.id_usuarios, r.id_receitas, 5, 'Bolo delicioso, bem fofinho!', '2025-09-01'
FROM usuarios u JOIN receitas r
WHERE u.nome = 'João Silva' AND r.nome = 'Bolo de Cenoura';

-- ========================================
-- PROCEDURES
-- ========================================

DELIMITER //

CREATE PROCEDURE spInsere_Usuario (
    IN emailUser VARCHAR(100),
    IN senhaUser VARCHAR(255),
    IN nomeUser VARCHAR(100),
    IN fotoUser VARCHAR(255)
)
BEGIN
    IF EXISTS (SELECT 1 FROM usuarios WHERE email = emailUser) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Não é possível fazer cadastro! Email já cadastrado!';
    ELSE
        INSERT INTO usuarios (email, senha, nome, foto)
        VALUES (emailUser, senhaUser, nomeUser, fotoUser);
    END IF;
END;
//

CREATE PROCEDURE spInsere_Categoria (
    IN nomeCategoria VARCHAR(100)
)
BEGIN
    IF EXISTS (SELECT 1 FROM categorias WHERE nome = nomeCategoria) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Categoria já cadastrada!';
    ELSE
        INSERT INTO categorias (nome) VALUES (nomeCategoria);
    END IF;
END;
//

CREATE PROCEDURE spInsere_Caracteristica (
    IN descCaracteristica VARCHAR(100)
)
BEGIN
    INSERT INTO caracteristicas (caracteristica) VALUES (descCaracteristica);
END;
//

CREATE PROCEDURE spInsere_Ingrediente (
    IN nomeIngrediente VARCHAR(100),
    IN tipoIngrediente VARCHAR(50),
    IN custo DECIMAL(10,2),
    IN idCaracteristica INT
)
BEGIN
    IF EXISTS (SELECT 1 FROM ingredientes WHERE nome = nomeIngrediente) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ingrediente já cadastrado!';
    ELSE
        INSERT INTO ingredientes (nome, tipo, custo_ingrediente, id_caracteristica)
        VALUES (nomeIngrediente, tipoIngrediente, custo, idCaracteristica);
    END IF;
END;
//

CREATE PROCEDURE spInsere_Receita(
    IN p_nome VARCHAR(255),
    IN p_descricao TEXT,
    IN p_porcoes INT,
    IN p_custo DECIMAL(10,2),
    IN p_dificuldade INT,
    IN p_idCategoria INT,
    IN p_idIngredienteBase INT,
    IN p_tempoPreparo INT,
    IN p_imagem VARCHAR(255)
)
BEGIN
    INSERT INTO receitas (
        nome, descricao, porcoes, custo_aproximado, idDificuldade,
        id_categoria, id_ingrediente_base, tempo_preparo, imagem
    )
    VALUES (
        p_nome, p_descricao, p_porcoes, p_custo, p_dificuldade,
        p_idCategoria, p_idIngredienteBase, p_tempoPreparo, p_imagem
    );

    SELECT LAST_INSERT_ID() AS id_receitas;
END;
//

CREATE PROCEDURE spInsere_Adm (
    IN nomeAdm VARCHAR(100),
    IN senhaAdm VARCHAR(255)
)
BEGIN
    IF EXISTS (SELECT 1 FROM adm WHERE nome = nomeAdm) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Não é possível fazer cadastro! Nome já cadastrado!';
    ELSE
        INSERT INTO adm (nome, senha) VALUES (nomeAdm, senhaAdm);
    END IF;
END;
//

DELIMITER ;
