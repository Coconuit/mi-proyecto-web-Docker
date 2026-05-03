// ============================================
// Mini app Express para validar el stack:
//   Nginx (proxy) -> Web (Node) -> Postgres + Redis
// ============================================

const express = require("express");
const { Pool } = require("pg");
const { createClient } = require("redis");

const app = express();
const PORT = process.env.PORT || 3000;

// --------------------------------------------
// Conexión a Postgres
// La URL se inyecta desde docker-compose:
//   postgres://app:${DB_PASSWORD}@db:5432/midb
// --------------------------------------------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// --------------------------------------------
// Conexión a Redis
// La URL se inyecta desde docker-compose:
//   redis://cache:6379
// --------------------------------------------
const redis = createClient({ url: process.env.REDIS_URL });
redis.on("error", (err) => console.error("Redis error:", err.message));

// Conectamos a Redis al arrancar (reintentos los gestiona el cliente)
(async () => {
  try {
    await redis.connect();
    console.log("Conectado a Redis");
  } catch (err) {
    console.error("No se pudo conectar a Redis:", err.message);
  }
})();

// --------------------------------------------
// Rutas
// --------------------------------------------

// Página raíz: confirma que la app está viva
app.get("/", (_req, res) => {
  res.send(`
    <h1>Mi proyecto web</h1>
    <p>La app Express funciona correctamente.</p>
    <ul>
      <li><a href="/health">/health</a> — comprobación de salud</li>
      <li><a href="/db">/db</a> — consulta a Postgres</li>
      <li><a href="/cache">/cache</a> — contador en Redis</li>
    </ul>
  `);
});

// Health check usado por el healthcheck del docker-compose
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// Lee de Postgres (tabla "saludos" creada por init.sql)
app.get("/db", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, mensaje, creado_en FROM saludos ORDER BY id"
    );
    res.json({ ok: true, filas: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Incrementa un contador en Redis y lo devuelve
app.get("/cache", async (_req, res) => {
  try {
    const visitas = await redis.incr("visitas");
    res.json({ ok: true, visitas });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// --------------------------------------------
// Arranque del servidor
// --------------------------------------------
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

// Cierre limpio al recibir señales del orquestador (docker stop)
const cerrar = async () => {
  console.log("Cerrando conexiones...");
  try { await redis.quit(); } catch (_) {}
  try { await pool.end(); } catch (_) {}
  process.exit(0);
};
process.on("SIGTERM", cerrar);
process.on("SIGINT", cerrar);
