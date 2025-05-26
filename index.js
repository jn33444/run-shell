app.post("/exec", (req, res) => {
  const { cmd } = req.body || {};
  console.log("🔁 Received command:", cmd);

  if (!cmd) {
    console.log("❌ No command received.");
    return res.status(400).json({ error: "cmd required" });
  }

  exec(cmd, { timeout: 15000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
    if (err) {
      console.log("❌ Shell error (raw):", err);
      console.log("❌ Shell stderr:", stderr);
      return res.status(500).json({ error: stderr || err.message });
    }

    console.log("✅ Shell output:", stdout);
    res.json({ output: stdout });
  });
});
