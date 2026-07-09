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
