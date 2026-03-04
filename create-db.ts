import "dotenv/config";
import { Client } from "pg";
import * as readline from "node:readline/promises";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  console.log("🔧 Creando base de datos sysccom_db...\n");

  const postgresPassword = await rl.question("Ingresa tu contraseña de PostgreSQL (usuario postgres): ");

  const client = new Client({
    connectionString: `postgresql://postgres:${encodeURIComponent(postgresPassword)}@localhost:5432/postgres`,
  });

  try {
    await client.connect();
    console.log("✅ Conectado correctamente a PostgreSQL!");

    await client.query(`CREATE DATABASE "sysccom_db";`);
    console.log('🎉 ¡Base de datos "sysccom_db" creada exitosamente!');

    console.log("\n👉 Ahora copia esta misma contraseña en tu archivo .env:");
    console.log('   DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA_AQUÍ@localhost:5432/sysccom_db?schema=public"');

  } catch (error: any) {
    if (error.code === "42P04") {
      console.log("ℹ️ La base de datos 'sysccom_db' ya existía (todo bien).");
    } else if (error.code === "28P01") {
      console.error("❌ Contraseña incorrecta. Vuelve a ejecutar el comando e ingresa la contraseña correcta.");
    } else {
      console.error("❌ Error:", error.message);
    }
  } finally {
    await client.end();
    rl.close();
  }
}

main().catch(console.error);