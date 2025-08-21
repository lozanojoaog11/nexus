/// api/mcp.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import admin from "firebase-admin";

// 🔥 Inicialização do Firebase Admin direto no mesmo arquivo
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) return;

  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!base64) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 não definida nas variáveis de ambiente.");
  }

  // Decodifica o JSON inteiro do service account
  const serviceAccount = JSON.parse(
    Buffer.from(base64, "base64").toString("utf8")
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  });

  console.log("✅ Firebase Admin inicializado com sucesso!");
}

// 🔥 Função para criar hábito
async function createHabit(params: any) {
  const { userId, name, category, frequency } = params;
  if (!userId || !name || !category || !frequency) {
    throw new Error("Parâmetros inválidos para criar hábito.");
  }

  const db = admin.database();
  const habitsRef = db.ref(`users/${userId}/habits`);
  const newHabitRef = habitsRef.push();
  const newHabitId = newHabitRef.key;

  if (!newHabitId) {
    throw new Error("Não foi possível gerar um ID para o novo hábito no Firebase.");
  }

  const newHabitData = {
    id: newHabitId,
    name,
    category,
    frequency,
    bestStreak: 0,
    currentStreak: 0,
  };

  await newHabitRef.set(newHabitData);
  return `Hábito '${name}' criado com sucesso!`;
}

// 🔥 Handler principal da API
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });

  try {
    initializeFirebaseAdmin();

    const { tool, params } = req.body;
    let result;

    switch (tool) {
      case "habits.create":
        result = await createHabit(params);
        break;
      default:
        throw new Error(`Ferramenta desconhecida: '${tool}'`);
    }

    return res.status(200).json({ result });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido.";
    console.error("ERRO GERAL NA FUNÇÃO:", errorMessage);
    return res
      .status(500)
      .json({ error: `Falha na execução da função: ${errorMessage}` });
  }
}
