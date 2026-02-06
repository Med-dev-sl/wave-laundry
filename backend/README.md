# Wave Laundry Backend

Backend API for Wave Laundry application built with Node.js, Express, and MySQL.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update database credentials and configuration:
     ```
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_password
     DB_NAME=wave_laundry
     DB_PORT=3306
     PORT=3000
     NODE_ENV=development
     ```

3. **Create database:**
   - Run the provided `schema.sql` file in your MySQL client:
     ```bash
     mysql -u root -p < schema.sql
     ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:3000`

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production build
- `npm test` - Run tests

## API Endpoints

### Health Check
- `GET /api/health` - Server health status
- `GET /api/db-test` - Test database connection

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts       # MySQL connection pool
│   ├── controllers/
│   │   └── userController.ts # Business logic for users
│   ├── routes/
│   │   └── userRoutes.ts     # API routes
│   └── server.ts             # Express app setup
├── package.json
├── tsconfig.json
├── .env.example
└── schema.sql               # Database schema
```

## Technologies

- **Express** - Web framework
- **MySQL2** - MySQL database driver
- **TypeScript** - Type-safe JavaScript
- **Nodemon** - Auto-reload during development
- **CORS** - Cross-origin resource sharing

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=wave_laundry
DB_PORT=3306
PORT=3000
NODE_ENV=development
```
