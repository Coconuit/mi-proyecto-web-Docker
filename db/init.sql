-- ============================================
-- Script de inicialización de la base de datos
-- ============================================
-- Postgres ejecuta automáticamente cualquier .sql que esté
-- montado en /docker-entrypoint-initdb.d/ la PRIMERA vez
-- que se crea el volumen de datos.
-- ============================================

CREATE TABLE IF NOT EXISTS saludos (
    id          SERIAL PRIMARY KEY,
    mensaje     TEXT NOT NULL,
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insertamos algunas filas de prueba para que /db devuelva algo
INSERT INTO saludos (mensaje) VALUES
    ('Hola desde Postgres'),
    ('La base de datos funciona'),
    ('Mensaje de prueba número 3')
ON CONFLICT DO NOTHING;
