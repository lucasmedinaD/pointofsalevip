# LinkMonitor.io - Boilerplate

**Elevator Pitch:** "Deja de perder dinero por enlaces de afiliados que ya no funcionan."

Este es un código base listo para desplegar para LinkMonitor.io, un SaaS que alerta automáticamente a bloggers y creadores de contenido cuando sus enlaces de afiliados están rotos (404) o cuando los productos están fuera de stock.

## Stack Tecnológico

*   **Frontend**: Next.js + TailwindCSS
*   **Backend**: Node.js + Express
*   **Base de Datos**: Supabase (PostgreSQL + Auth)
*   **Jobs en Segundo Plano**: BullMQ con Redis
*   **Integraciones**:
    *   **Email**: Nodemailer (con Ethereal para pruebas)
    *   **Notificaciones**: Slack
    *   **Pagos**: Stripe

## Estructura del Proyecto

```
/
├── backend/         # Node.js, Express, Workers, etc.
├── frontend/        # Next.js, React, TailwindCSS
├── db/              # Scripts SQL para el esquema de Supabase
├── integrations/    # Módulos para servicios de terceros (Stripe, Slack, etc.)
└── README.md
```

## Cómo Empezar

### Prerrequisitos

*   Node.js (v18 o superior)
*   npm
*   Una cuenta de [Supabase](https://supabase.com/)
*   Una instancia de Redis (local o en la nube)
*   Credenciales para Stripe, Slack (opcional)

### 1. Configuración de la Base de Datos (Supabase)

1.  Crea un nuevo proyecto en Supabase.
2.  Ve al **Editor SQL** en el dashboard de tu proyecto.
3.  Copia el contenido de `db/schema.sql` y ejecútalo para crear las tablas necesarias.
4.  Guarda las credenciales de tu API de Supabase (URL del Proyecto y clave `anon`). Las necesitarás para el frontend.

### 2. Configuración del Backend

1.  Navega al directorio `backend`:
    ```bash
    cd backend
    ```
2.  Crea un archivo `.env` a partir del ejemplo:
    ```bash
    cp .env.example .env
    ```
    Y rellénalo con tus credenciales. Necesitarás como mínimo las de Redis.
    ```
    # .env
    PORT=3001
    REDIS_HOST=localhost
    REDIS_PORT=6379
    ```
3.  Instala las dependencias:
    ```bash
    npm install
    ```
4.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```
    (Nota: tendrás que añadir el script `dev` a `package.json`: `"dev": "nodemon index.js"`)

### 3. Configuración del Frontend

1.  Navega al directorio `frontend`:
    ```bash
    cd frontend
    ```
2.  Crea un archivo `.env.local` con las credenciales de tu API de Supabase:
    ```
    # .env.local
    NEXT_PUBLIC_SUPABASE_URL=TU_URL_DE_PROYECTO_SUPABASE
    NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_ANON_DE_SUPABASE
    ```
3.  Instala las dependencias:
    ```bash
    npm install
    ```
4.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```
    El frontend estará disponible en `http://localhost:3000`.

## Scripts Útiles

*   **Backend**:
    *   `npm start`: Inicia el servidor en producción.
    *   `npm run dev`: Inicia el servidor con `nodemon` para desarrollo.
*   **Frontend**:
    *   `npm run dev`: Inicia el servidor de desarrollo de Next.js.
    *   `npm run build`: Compila la aplicación para producción.
    *   `npm run start`: Inicia el servidor de producción de Next.js.
