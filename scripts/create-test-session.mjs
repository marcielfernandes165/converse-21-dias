#!/usr/bin/env node

/**
 * Script para criar uma sessão de teste no banco de dados
 * Uso: node scripts/create-test-session.mjs
 * 
 * Este script:
 * 1. Cria um usuário de teste
 * 2. Cria uma sessão com um token válido
 * 3. Exibe a URL de acesso para testar
 */

import mysql from "mysql2/promise";
import { nanoid } from "nanoid";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ Erro: DATABASE_URL não está configurada");
  process.exit(1);
}

async function createTestSession() {
  let connection;

  try {
    console.log("🔌 Conectando ao banco de dados...");

    // Parse DATABASE_URL
    const url = new URL(DATABASE_URL);
    const config = {
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      port: url.port || 3306,
      ssl: {}, // Habilitar SSL para TiDB
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };

    // Usar pool para melhor gerenciamento de conexão
    const pool = mysql.createPool(config);
    connection = await pool.getConnection();

    console.log("✅ Conectado ao banco de dados!");

    // 1. Criar usuário de teste
    const testUserId = "test-user-" + nanoid(10);
    const testUserEmail = `test-${Date.now()}@converse21dias.test`;
    const testUserName = "Usuário de Teste";

    console.log("\n📝 Criando usuário de teste...");

    const insertUserQuery = `
      INSERT INTO users (openId, email, name, loginMethod, role, createdAt, updatedAt, lastSignedIn)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW())
    `;

    const [userResult] = await connection.execute(insertUserQuery, [
      testUserId,
      testUserEmail,
      testUserName,
      "test",
      "user",
    ]);

    const userId = userResult.insertId;
    console.log(`✅ Usuário criado com ID: ${userId}`);

    // 2. Criar sessão com token
    const token = nanoid(32);
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    console.log("\n🔐 Criando sessão com token...");

    const insertSessionQuery = `
      INSERT INTO sessions (userId, token, startDate, consentGiven, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;

    const [sessionResult] = await connection.execute(insertSessionQuery, [
      userId,
      token,
      startDate,
      false,
    ]);

    const sessionId = sessionResult.insertId;
    console.log(`✅ Sessão criada com ID: ${sessionId}`);

    // 3. Criar alguns dias de progresso para teste
    console.log("\n📅 Criando progresso de dias para teste...");

    const insertDayProgressQuery = `
      INSERT INTO dayProgress (sessionId, dayNumber, completed, completedAt, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;

    // Marcar dias 1-3 como concluídos para ter algo para visualizar
    for (let i = 1; i <= 3; i++) {
      const completedDate = new Date();
      completedDate.setDate(completedDate.getDate() - (4 - i));

      await connection.execute(insertDayProgressQuery, [
        sessionId,
        i,
        true,
        completedDate,
      ]);
    }

    console.log("✅ Dias de progresso criados!");

    // 4. Criar aprendizados para os dias concluídos
    console.log("\n📚 Criando aprendizados de teste...");

    const insertLearningQuery = `
      INSERT INTO learnings (sessionId, dayNumber, defaultLearning, customLearning, createdAt)
      VALUES (?, ?, ?, ?, NOW())
    `;

    const learnings = [
      {
        day: 1,
        default:
          "Não estou no centro da atenção das outras pessoas – elas até olham, mas isso é diferente de encarar.",
        custom:
          "Realmente percebi que as pessoas estão mais focadas em suas próprias vidas.",
      },
      {
        day: 2,
        default:
          "A maioria das conversas não são fascinantes. As pessoas apenas jogam conversa fora, coisas banais.",
        custom: "Isso me ajudou a relaxar e não esperar tanto das interações.",
      },
      {
        day: 3,
        default: "As pessoas são menos hostis e menos reativas do que eu imagino.",
        custom: "Fiz contato visual e ninguém reagiu negativamente. Muito bom!",
      },
    ];

    for (const learning of learnings) {
      await connection.execute(insertLearningQuery, [
        sessionId,
        learning.day,
        learning.default,
        learning.custom,
      ]);
    }

    console.log("✅ Aprendizados criados!");

    // 5. Exibir informações de acesso
    console.log("\n" + "=".repeat(70));
    console.log("🎉 SESSÃO DE TESTE CRIADA COM SUCESSO!");
    console.log("=".repeat(70));

    console.log("\n📋 Informações da Sessão:");
    console.log(`   ID da Sessão: ${sessionId}`);
    console.log(`   ID do Usuário: ${userId}`);
    console.log(`   Email: ${testUserEmail}`);
    console.log(`   Token: ${token}`);
    console.log(`   Data de Início: ${startDate.toISOString().split("T")[0]}`);

    console.log("\n🌐 URL de Acesso:");
    const accessUrl = `http://localhost:3000/?token=${token}`;
    console.log(`   ${accessUrl}`);

    console.log("\n📱 Para testar:");
    console.log(`   1. Copie a URL acima`);
    console.log(`   2. Abra em seu navegador`);
    console.log(`   3. Você verá os 3 primeiros dias concluídos e o dia 4 disponível`);
    console.log(`   4. Clique em um dia para ver o fluxo completo`);

    console.log("\n💡 Dicas:");
    console.log(
      `   - Para testar outro dia, mude a data de início no banco de dados`
    );
    console.log(`   - Para resetar, delete a sessão: DELETE FROM sessions WHERE id = ${sessionId}`);
    console.log(`   - Para testar checkpoints, complete até o dia 8, 15 ou 21`);

    console.log("\n" + "=".repeat(70) + "\n");

    await connection.release();
    await pool.end();
  } catch (error) {
    console.error("❌ Erro:", error.message);
    process.exit(1);
  }
}

createTestSession();
