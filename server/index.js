require("dotenv").config();

const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "..", "public")));

const goalSchema = new mongoose.Schema({
  category: { type: String, enum: ["College", "GATE", "Internship"], required: true },
  subject: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  targetDate: { type: String, default: "" },
  priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
  createdAt: { type: Date, default: Date.now }
});
const testSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: ["College", "GATE", "Internship"], required: true },
  score: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0.1 },
  review: { type: String, default: "" },
  attemptedAt: { type: Date, default: Date.now }
});
const taskSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  done: { type: Boolean, default: false },
  dateKey: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Goal = mongoose.model("Goal", goalSchema);
const Test = mongoose.model("Test", testSchema);
const Task = mongoose.model("Task", taskSchema);

app.get("/api/health", (req,res) => res.json({ ok: true, database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" }));
app.get("/api/dashboard", async (req,res) => {
  try {
    const dateKey = String(req.query.date || new Date().toISOString().slice(0,10));
    const [goals, tests, tasks] = await Promise.all([
      Goal.find().sort({ createdAt: -1 }).lean(),
      Test.find().sort({ attemptedAt: -1 }).limit(30).lean(),
      Task.find({ dateKey }).sort({ createdAt: 1 }).lean()
    ]);
    res.json({ goals, tests, tasks, dateKey });
  } catch(e) { res.status(500).json({ error: "Could not load dashboard." }); }
});
app.post("/api/goals", async (req,res) => {
  try {
    const goal = await Goal.create(req.body);
    res.status(201).json(goal);
  } catch(e) { res.status(400).json({ error: e.message }); }
});
app.patch("/api/goals/:id", async (req,res) => {
  try {
    const goal = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!goal) return res.status(404).json({ error: "Goal not found." });
    res.json(goal);
  } catch(e) { res.status(400).json({ error: e.message }); }
});
app.delete("/api/goals/:id", async (req,res) => {
  try { await Goal.findByIdAndDelete(req.params.id); res.status(204).end(); }
  catch(e) { res.status(400).json({ error: "Invalid goal id." }); }
});
app.post("/api/tests", async (req,res) => {
  try {
    if (Number(req.body.score) > Number(req.body.total)) return res.status(400).json({ error: "Score cannot exceed total marks." });
    const test = await Test.create(req.body);
    res.status(201).json(test);
  } catch(e) { res.status(400).json({ error: e.message }); }
});
app.delete("/api/tests/:id", async (req,res) => {
  try { await Test.findByIdAndDelete(req.params.id); res.status(204).end(); }
  catch(e) { res.status(400).json({ error: "Invalid test id." }); }
});
app.post("/api/tasks", async (req,res) => {
  try { const task = await Task.create(req.body); res.status(201).json(task); }
  catch(e) { res.status(400).json({ error: e.message }); }
});
app.patch("/api/tasks/:id", async (req,res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, { done: !!req.body.done }, { new: true });
    if (!task) return res.status(404).json({ error: "Task not found." });
    res.json(task);
  } catch(e) { res.status(400).json({ error: "Invalid task id." }); }
});
app.delete("/api/tasks/:id", async (req,res) => {
  try { await Task.findByIdAndDelete(req.params.id); res.status(204).end(); }
  catch(e) { res.status(400).json({ error: "Invalid task id." }); }
});
app.get("*", (req,res) => res.sendFile(path.join(__dirname, "..", "public", "index.html")));

const PORT = process.env.PORT || 3000;
if (!process.env.MONGODB_URI) {
  console.error("Missing MONGODB_URI. Copy .env.example to .env and add your MongoDB Atlas connection string.");
  process.exit(1);
}
mongoose.connect(process.env.MONGODB_URI)
  .then(() => app.listen(PORT, () => console.log(`ParthPrep AI running at http://localhost:${PORT}`)))
  .catch(err => { console.error("MongoDB connection failed:", err.message); process.exit(1); });
