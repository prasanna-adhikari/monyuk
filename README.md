AimHi Backend (Node.js + Express + MongoDB)

Yarning Space API backend powering the React Native (Expo) app.
Provides REST endpoints, authentication, and integrations (e.g., Gemini API).

✨ Features
	•	Express 5 server with security middlewares (helmet, cors, rate-limit)
	•	MongoDB with Mongoose models/schemas
	•	JWT auth (+ bcryptjs for password hashing)
	•	Request logging via morgan
	•	ID helpers (uuid, nanoid)
	•	Optional Gemini API integration via @google/generative-ai

🧱 Tech Stack
	•	Node.js ≥ 18.18.0
	•	Express 5
	•	MongoDB / Mongoose
	•	Dotenv for configuration
	•	(Optional) Google Generative AI

⸻

✅ Prerequisites
	•	Node.js v18.18.0 or newer: node -v
	•	npm (bundled with Node): npm -v
	•	MongoDB:
	•	Use MongoDB Atlas (recommended), or
	•	Local MongoDB instance
	•	A .env file in the project root (see below)


📦 Installation

# from the backend project root
npm install

⚙️ Configuration

Create a .env file in the backend root with the following variables:

# Server
PORT=5001

# Database (MongoDB Atlas or local)
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/aimhi

# Auth
JWT_SECRET=change_me_to_a_long_random_string

# CORS — list allowed origins (comma-separated)
# During development include Expo web + your LAN dev URL
CORS_ORIGINS=http://localhost:19006,http://192.168.1.15:19006,exp://*

# (Optional) Gemini API
GEMINI_API_KEY=your_gemini_key_here

Expo note: In your frontend .env, set
EXPO_PUBLIC_API_BASE=http://<your-mac-LAN-IP>:5001
(e.g., http://192.168.1.15:5001). Make sure this port matches PORT above.


🚀 Running the Server

Development (auto-reload)

npm run dev

Runs nodemon src/server.js.

Production

npm start

Runs node src/server.js.

The server will start on http://localhost:5001 (or the PORT you set).
It binds to 0.0.0.0 so devices on your LAN can reach it.

🩺 Quick Health Check

If you have a health route (e.g., /v1/health):

curl http://localhost:5001/v1/health
# → {"ok":true}

From another device on the same Wi-Fi:

curl http://<your-mac-LAN-IP>:5001/v1/health


🔌 Typical Project Structure

src/
  server.js            # Express app bootstrap (loads env, CORS, routes, Mongo)
  routes/              # Route definitions (e.g., /v1/auth, /v1/users)
  controllers/         # Route handlers / business logic
  models/              # Mongoose schemas & models
  middleware/          # Auth (JWT), error handlers, validators
  services/            # External integrations (e.g., Gemini)
README.md
package.json
.env                   # ← not committed

🧭 Scripts

Defined in package.json:
	•	npm run dev — start with nodemon
	•	npm start — start with node

🔐 CORS & Frontend (Expo)
	•	Backend must allow the frontend origins:
	•	Expo web: http://localhost:19006
	•	LAN dev URL: http://<your-mac-LAN-IP>:19006
	•	Optionally: exp://* (quick dev)
	•	Set them in .env as a comma-separated list: CORS_ORIGINS=...
	•	In the app, use EXPO_PUBLIC_API_BASE to point to the backend.

🗄️ Database (MongoDB Atlas Tips)
	•	In Atlas, add your IP to Network Access (or 0.0.0.0/0 for dev only).
	•	Use the connection string as MONGO_URI.
	•	Ensure the user has read/write permissions on your database.

🧪 Example Requests

Login

curl -X POST http://localhost:5001/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secret"}'

