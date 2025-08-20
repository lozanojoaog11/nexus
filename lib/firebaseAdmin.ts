// Caminho: /lib/firebaseAdmin.ts
import admin from "firebase-admin";

export function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return;
  }

  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!base64) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 não definida nas variáveis de ambiente.");
  }

  // Decodifica o JSON inteiro da Service Account
  const serviceAccount = JSON.parse(
    Buffer.from(base64, "base64").toString("utf8")
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  });

  console.log("✅ Firebase Admin inicializado com sucesso!");
}
