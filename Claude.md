## Principios de desarrollo

Todo desarrollo en este proyecto debe adherirse estrictamente a los siguientes principios:

### Arquitectura y diseño
- **Feature-based architecture**: organizar el código por dominios de negocio (features), no por tipo técnico. Cada feature agrupa todo lo necesario para una capacidad del producto (controladores, casos de uso, entidades, repositorios y DTOs).
- **Estructura del proyecto**:
  ```
  src/
  ├── shared/                # Utilidades, excepciones, middlewares y tipos transversales
  ├── infrastructure/        # Configuración de BD, clientes HTTP, colas, logging
  └── features/
      ├── accounts/
      │   ├── domain/        # Entidades, value objects, interfaces de repositorio
      │   ├── application/   # Casos de uso, DTOs, mappers
      │   ├── infrastructure/# Implementación de repositorios, adaptadores externos
      │   └── presentation/  # Controladores, validadores de entrada, rutas
      └── transfers/
          └── ...
  ```
- **Reglas de features**:
  - Cada feature expone una API pública mínima (módulo o barrel); el resto del código es interno a la feature.
  - Las features no importan código interno de otras features; la comunicación entre features se hace vía contratos en `shared/`, eventos de dominio o servicios de aplicación orquestados desde `core/`.
  - `shared/` e `infrastructure/` no dependen de `features/`.
  - Dentro de cada feature, respetar la dirección de dependencias: `presentation` → `application` → `domain`; `infrastructure` implementa interfaces definidas en `domain`.
  - Los controladores no contienen lógica de negocio; delegan en casos de uso.
- **Clean Architecture** (por feature): separar dominio, aplicación, infraestructura y presentación dentro de cada feature.
- **Clean Code**: código legible, nombres descriptivos, clases y funciones pequeñas con una sola responsabilidad.
- **SOLID**:
  - **S** — Single Responsibility: cada clase/servicio tiene una única razón para cambiar.
  - **O** — Open/Closed: abierto para extensión (herencia, composición), cerrado para modificación.
  - **L** — Liskov Substitution: las implementaciones deben ser sustituibles por sus abstracciones.
  - **I** — Interface Segregation: interfaces pequeñas y específicas.
  - **D** — Dependency Inversion: las capas superiores dependen de abstracciones (interfaces), no de implementaciones concretas.
- **DRY**: evitar duplicación en validaciones, mappers y lógica de negocio; extraer a `shared/` solo cuando haya reutilización real entre features.
- **YAGNI**: no añadir funcionalidad especulativa ni abstracciones prematuras.

### Ciberseguridad

Al tratarse de un producto financiero (banca de empresas), toda contribución debe seguir estas prácticas:

- **Sin secretos en código**: nunca hardcodear credenciales, API keys, tokens o connection strings. Usar variables de entorno o el gestor de secretos del proyecto (Secret Manager, Vault, etc.). Verificar que no se filtren en logs, commits ni mensajes de error.
- **Validación de entradas**: validar y sanear toda entrada del usuario o de servicios externos (tipo, formato, longitud, rango) tanto en frontend como en backend. Nunca confiar solo en la validación del cliente.
- **Prevención OWASP Top 10**: especial atención a inyección (SQL/NoSQL/command), XSS, deserialización insegura, SSRF y control de acceso roto (broken access control). Usar consultas parametrizadas/ORM, escapar salida HTML, y nunca construir queries o comandos por concatenación de strings.
- **Autenticación y autorización**: verificar autorización en cada endpoint (no solo autenticación), aplicando el principio de mínimo privilegio. No confiar en controles de acceso implementados solo en el frontend.
- **Gestión de dependencias**: mantener dependencias actualizadas y revisar vulnerabilidades conocidas (`npm audit`, Dependabot/Snyk) antes de introducir librerías nuevas.
- **Comunicación segura**: forzar HTTPS/TLS en todas las integraciones; no deshabilitar validación de certificados.
- **Logging seguro**: no loguear información sensible (contraseñas, tokens, PII, datos financieros). Los logs deben ser auditables pero no exponer datos que faciliten un ataque.
- **Manejo de errores**: no exponer stack traces, rutas internas ni detalles de infraestructura en respuestas al cliente; devolver mensajes de error genéricos y registrar el detalle solo en logs internos.

### Tratamiento de datos

Dado que el sistema maneja datos de clientes y operaciones financieras de empresas, aplican los siguientes lineamientos:

- **Minimización de datos**: solicitar, procesar y almacenar únicamente los datos estrictamente necesarios para la funcionalidad. Evitar copiar datos sensibles a nuevos módulos "por si acaso".
- **Clasificación de datos sensibles**: tratar como sensibles (mínimo) datos de identificación de clientes/empresas, información financiera, saldos, transacciones y credenciales. Estos datos requieren cifrado en tránsito (TLS) y en reposo cuando aplique.
- **Enmascaramiento/anonimización**: en ambientes no productivos (dev, pruebas, demos) usar datos ficticios o anonimizados; no usar dumps de datos reales de clientes.
- **Control de acceso a datos**: exponer en APIs y UI solo los campos que el rol del usuario necesita ver; evitar sobre-exposición de datos en respuestas (no devolver objetos completos "por comodidad").
- **Trazabilidad**: los cambios sobre datos sensibles (creación, modificación, eliminación) deben quedar auditados con usuario y timestamp cuando la operación lo amerite.
- **Cumplimiento normativo**: seguir lineamientos de protección de datos aplicables al sector financiero (habeas data / normativa local de protección de datos personales); no implementar mecanismos que dificulten el derecho del titular a la consulta, corrección o eliminación de sus datos.