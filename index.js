import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

app.post("/", async (req, res) => {
  const { cmd } = req.body.arguments;

  const response = await fetch("https://mvpcai-cloud.onrender.com/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cmd })
  });

  const data = await response.json();
  res.json({ output: data.output || data.error });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`run_shell tool listening on ${PORT}`));
