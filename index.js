const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { exec } = require("child_process");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(morgan("combined"));
app.use(express.json());

app.get("/health", (_req, res) => res.sendStatus(200));

app.post("/exec", (req, res) => {
  const { cmd } = req.body || {};

  // ✅ Log every incoming command
  console.log("🔁 Received command:", cmd);

  if (!cmd) {
    console.log("❌ No command received.");
    return res.status(400).json({ error: "cmd required" });
  }

  exec(cmd, { timeout: 15000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
    if (err) {
      console.log("❌ Shell error:", stderr || err.message);
      return res.status(500).json({ error: stderr || err.message });
    }

    console.log("✅ Shell output:", stdout);
    res.json({ output: stdout });
  });
});

app.get("/", (_req, res) => res.send("MYPCAI API running"));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
