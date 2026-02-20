# Subscription Management Dashboard

A full-stack application to track and manage your recurring subscriptions, visualize costs, and monitor renewal dates.

## 🚀 Technology Stack

### Frontend (`sub-manager-ui`)
- **React**: UI library
- **Vite**: Build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client

### Backend (`sub-manager-sql`)
- **Node.js**: Runtime environment
- **Express**: Web framework
- **Sequelize**: ORM for MySQL
- **MySQL**: Relational database
- **Passport.js**: Authentication (Google OAuth)
- **Node-Cron**: Scheduled tasks

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MySQL](https://www.mysql.com/)

## 🛠️ Setup Instructions

### 1. Database Setup
The project uses **MySQL**. You need to create a database named `submanager_db`.

> **Note**: The database configuration currently uses hardcoded credentials (`root` / `Gsaisagar@1909`) in `sub-manager-sql/config/database.js`. You may need to update this file to match your local MySQL setup.

```sql
CREATE DATABASE submanager_db;
```

### 2. Backend Setup (`sub-manager-sql`)

1. Navigate to the backend directory:
   ```bash
   cd sub-manager-sql
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `sub-manager-sql` directory with the following variables:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   SESSION_SECRET=your_session_secret
   CLIENT_URL=http://localhost:5173
   # DB_HOST=localhost  # Optional, defaults to localhost
   ```

4. Start the server:
   ```bash
   node server.js
   ```
   The backend will run on `http://localhost:3000`.

### 3. Frontend Setup (`sub-manager-ui`)

1. Navigate to the frontend directory:
   ```bash
   cd sub-manager-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

## 🔌 API Endpoints

### Authentication
- `GET /auth/google`: Initiate Google OAuth login.
- `GET /auth/google/callback`: OAuth callback handling.
- `GET /auth/logout`: Logout user.
- `GET /api/user`: Get current authenticated user details.

### Subscriptions (`/api/subscriptions`)
- `GET /`: List all subscriptions for the logged-in user.
- `POST /`: Create a new subscription.
- `DELETE /:id`: Delete a subscription.

## 🐳 Docker (Optional)
A `docker-compose.yml` file is included in the root directory. However, you may need to adjust the configuration (specifically database connection strings and context paths) to ensure it works correctly with the current code structure.
