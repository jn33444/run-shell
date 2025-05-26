import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

app.post("/", async (req, res) => {
  const { cmd } = req.body.arguments;
  console.log("Received cmd from OpenAI:", cmd);

  const response = await fetch("https://mvpcai-cloud.onrender.com/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cmd })
  });

  const data = await response.json();
  console.log("Shell result:", data);
  res.json(data);
});

const PORT = parseInt(process.env.PORT || "10000", 10);
app.listen(PORT, () => {
  console.log(`run_shell listening on port ${PORT}`);
});
