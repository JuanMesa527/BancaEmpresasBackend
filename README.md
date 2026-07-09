# Banca Empresas Backend

Pipeline de venta de tarjetas de crédito con human-in-the-loop.

## Stack

- TypeScript + Express
- Supabase (Postgres)
- Fonema.ia (llamadas agenticas de venta y seguimiento)
- Resend (correos de activación)

## Flujo

```
file-matching (base potencial × CEC)
  → sales-calls (Fonema.ia)
  → power-apps (HITL / POST a correos)
  → activation-email (Resend)
  → activation-follow-up (Fonema.ia)
```

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Health: `GET /health`

## Documentación API (OpenAPI)

| Recurso | URL |
|---------|-----|
| Especificación OAS 3.0 | [`docs/openapi.yaml`](docs/openapi.yaml) |
| Swagger UI (local) | http://localhost:3000/docs |

Importa `docs/openapi.yaml` en Bruno, Postman, Insomnia o cualquier cliente compatible con OpenAPI.

### Power App (simulador)

`POST /api/power-apps/submit` — valida solicitud de TC LATAM Business y retorna `APROBADO`, `DEVUELTO` o `RECHAZADO` con detalle de campos incorrectos (incluye detección de NIT/cédula invertidos).
