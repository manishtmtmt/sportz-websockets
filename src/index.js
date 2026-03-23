import express from "express";
import { matchRouter } from "./routes/matches.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/v1/matches", matchRouter);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
