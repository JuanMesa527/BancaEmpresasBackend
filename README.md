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
cp .env.example .env
npm install
npm run dev
```

Health: `GET /health`
