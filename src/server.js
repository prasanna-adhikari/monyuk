require("dotenv").config();
const http = require("http");
const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 5001;

(async () => {
  await connectDB();
  http.createServer(app).listen(PORT, () => {
    console.log(`✅ API running at http://localhost:${PORT}`);
  });
})();
