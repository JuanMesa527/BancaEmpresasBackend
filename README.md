# Banca Empresas Backend

Backend del pipeline de venta de **Tarjeta de Crédito LATAM Business** (Banca Empresas — Banco de Bogotá).

## Stack

- TypeScript + Express
- Supabase (Postgres)
- Fonema.ia · Resend

## Inicio rápido

```bash
cp .env.example .env
npm install
npm run dev
```

Servicio en `http://localhost:3000`.

## API expuesta

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/power-apps/submit` | Simulador Power App — comprobación de campos |

Documentación interactiva: **http://localhost:3000/docs**  
Especificación: [`docs/openapi.yaml`](docs/openapi.yaml)

Importa el OAS en Bruno, Postman o Insomnia para generar la colección de pruebas.

### Power App — respuestas

| Decisión | HTTP | Significado |
|----------|------|-------------|
| `APROBADO` | 201 | Solicitud válida; genera radicado GOPTC |
| `DEVUELTO` | 422 | Campos corregibles (`issues[]` con sugerencias) |
| `RECHAZADO` | 400 / 422 | Formato inválido o regla de negocio bloqueante |

## Flujo operativo (contexto)

```
file-matching → sales-calls → power-apps → operaciones
  → gerente de relaciones → gerente de la empresa solicitante
  → delivery-confirmation → activation-follow-up
```

**Entrega física:** operaciones arma la carpeta y la entrega al gerente de relaciones; este entrega las tarjetas al gerente de la empresa solicitante.

El bloque `entrega` del submit captura la logística acordada al radicar (`tipo`, `ciudad`, `direccion`, `fechaAgendamiento`). No modela el tracking posterior de la carpeta.

## Otras etapas (código interno, sin API pública aún)

`file-matching`, `sales-calls`, `delivery-confirmation`, `activation-follow-up`.  
Scripts y esquema de BD: `scripts/`, `supabase/schema.sql`.
