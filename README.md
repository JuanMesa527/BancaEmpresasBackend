# Banca Empresas Backend

Pipeline de venta de tarjetas de crédito con human-in-the-loop.

## Stack

- TypeScript + Express
- Supabase (Postgres)
- Fonema.ia (llamadas agenticas de venta y seguimiento)
- Resend (correos de confirmación de entrega)

## Flujo

```
file-matching (base potencial × CEC)
  → sales-calls (Fonema.ia)
  → power-apps (HITL)
  → delivery-confirmation (Resend → gerente confirma entrega física)
  → activation-follow-up (Fonema.ia — beneficio / inducción a activación)
```

### delivery-confirmation

1. Se emula ~3–4 días desde el envío físico de la tarjeta.
2. Se envía un correo **por tarjeta** a el/los gerentes (emails en Supabase).
3. El gerente abre una página del frontend y elige:
   - entregó al titular → avanza pipeline a `activation-follow-up`
   - no llegó / titular ausente / devolver al banco → reintento de correo a +1 día

## Setup

```bash
cp .env.example .env   # completar SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev
```

Health: `GET /health`

## Despliegue

### Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Aplica el esquema (elige una opción):
   - **CLI**: `supabase link --project-ref <ref>` y luego `supabase db push`
   - **SQL Editor**: ejecuta [`supabase/schema.sql`](supabase/schema.sql) de una vez
3. Copia `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` al entorno de Vercel.

### Vercel

1. Importa el repo en [vercel.com](https://vercel.com) (Framework: **Other**, Build Command: vacío).
2. Configura las variables de [`.env.example`](.env.example) en **Settings → Environment Variables**.
3. En producción usa `TIME_COMPRESSION_DAY_MS=86400000` (1 día real).
4. Deploy. El cron de `vercel.json` procesa correos de delivery-confirmation cada 5 min (requiere plan Pro para frecuencia menor a 1/día).

Health en producción: `GET https://<tu-app>.vercel.app/health`

## API expuesta actualmente

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Health check del servicio |
| `POST` | `/api/power-apps/submit` | Simulador de Power App con comprobación de campos |

Otras etapas del pipeline se irán exponiendo conforme se implementen.

## Documentación API (OpenAPI)

| Recurso | URL |
|---------|-----|
| Especificación OAS 3.0 | [`docs/openapi.yaml`](docs/openapi.yaml) |
| Swagger UI | http://localhost:3000/docs (también en producción) |

Importa `docs/openapi.yaml` en Bruno, Postman, Insomnia o cualquier cliente compatible con OpenAPI.

### Power App (simulador)

`POST /api/power-apps/submit` — comprobación integral de campos de la solicitud de TC LATAM Business y retorna `APROBADO`, `DEVUELTO` o `RECHAZADO` con detalle por campo (`issues[]`: código, mensaje, sugerencia).

## Otras etapas del pipeline (en desarrollo)

Las siguientes etapas existen en el código pero aún no están expuestas en la API pública:

- **file-matching** — cruce de fuentes (Base Potencial × CEC × SG)
- **sales-calls** — llamadas de venta (Fonema.ia)
- **delivery-confirmation** — confirmación de entrega física (Resend)
- **activation-follow-up** — seguimiento post-entrega (Fonema.ia)

### file-matching (referencia interna)

### 1. Crear las tablas

Ejecutar [`supabase/schema.sql`](supabase/schema.sql) en el SQL Editor de Supabase, o `supabase db push` si usas la CLI.

### 2. Precargar las fuentes desde Excel

En producción las fuentes llegan de un sistema externo; para pruebas se precargan desde los
Excel de `docs/` (no versionados — contienen datos reales de clientes):

```bash
npm run seed              # parsea y sube las 3 fuentes a Supabase
npm run seed -- --dry-run # solo parsea y muestra conteos, sin tocar la base
```

### 3. Ejecutar el cruce

```bash
curl -X POST localhost:3000/api/file-matching/run
```

Genera dos listas y las persiste (regenerándolas por completo en cada corrida):

| Lista | Tabla | Condiciones |
|---|---|---|
| Validación completa | `clientes_finales` | gestionable + sin TC (base potencial) + cupo disponible (CEC) + pagaré activo |
| Validación sin pagaré | `clientes_finales_sin_pagare` | gestionable + sin TC (base potencial) + cupo disponible (CEC) |

La respuesta trae solo conteos (sin datos de clientes). Para consultar las listas:

```bash
curl localhost:3000/api/file-matching/clientes-finales
curl localhost:3000/api/file-matching/clientes-finales-sin-pagare
```
