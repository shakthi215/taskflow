# TaskFlow

A full stack task management dashboard with authentication, task CRUD, status tracking, filters, stats, and light/dark themes.

## Features

- Register and login pages
- Authenticated task dashboard
- Create, view, edit, update status, and delete tasks
- Task fields: title, description, status, due date, priority, and tags
- Kanban board and list view
- Stats for total, todo, in progress, completed, and overdue tasks
- Light and dark theme toggle
- Plain system font across the app
- Responsive layout

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Axios, date-fns, react-hot-toast |
| Backend | Node.js, Express, express-validator |
| Database | MongoDB Atlas with Mongoose |
| Auth | Custom token auth with Node crypto password hashing |
| Styling | Plain CSS and CSS custom properties |

Note: the original screening brief asks for a relational database provider. This implementation currently uses MongoDB Atlas because the existing project was already built around Mongoose.

## AI Tools Used

- OpenAI Codex was used to inspect the project, add authentication, add theme support, normalize typography, and update documentation.

## Project Structure

```text
taskflow/
  backend/
    middleware/auth.js
    models/Task.js
    models/User.js
    routes/auth.js
    routes/tasks.js
    server.js
  frontend/
    src/components/
    src/hooks/useTasks.js
    src/utils/api.js
    src/styles/globals.css
    src/App.jsx
```

## Setup

### Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas connection string

### Install

```bash
npm run install:all
```

Or install separately:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### Backend Environment

Create `backend/.env` from `backend/.env.example`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/taskflow?retryWrites=true&w=majority
PORT=5000
CLIENT_URL=http://localhost:3000
AUTH_SECRET=replace-with-a-long-random-secret
```

### Frontend Environment

The frontend can use the CRA proxy by default. If needed, create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Run

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm start
```

Open `http://localhost:3000`.

## Build

```bash
cd frontend
npm run build
```

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/tasks` | List current user's tasks |
| GET | `/api/tasks/stats` | Current user's task stats |
| GET | `/api/tasks/:id` | Get one task |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| PATCH | `/api/tasks/:id/status` | Update task status |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/health` | Server health check |
