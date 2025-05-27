import express from "express";
import cors from "cors";
import morgan from "morgan";
import { exec } from "child_process";

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

const PORT = process.env.PORT || 10000;

app.get("/health", (_req, res) => res.send("OK"));

app.post("/exec", (req, res) => {
  const { cmd } = req.body || {};
  if (!cmd) return res.status(400).json({ error: "missing cmd" });

  exec(cmd, { shell: "/bin/bash" }, (err, stdout, stderr) => {
    if (err) return res.status(500).type("text/plain").send(stderr);
    res.type("text/plain").send(stdout);
  });
});

app.listen(PORT, () => {
  console.log(`🌐 Using port: ${PORT}`);
  console.log(`🚀 Tool relay server listening on port ${PORT}`);
});
