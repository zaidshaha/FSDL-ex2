const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require("cors");
app.use(cors({ origin: "http://localhost:5173"}));
app.use(express.json());
// Sample in-memory data; resets after a server restart.
let courses = [
{ id: 1, title: "REST API Fundamentals", duration: 4 },
{ id: 2, title: "Node.js Basics", duration: 6 }
];
let nextId = 3;
app.get("/", (req, res) => {
res.status(200).json({ message: "Course API is running" });
});
app.get("/api/courses", (req, res) => {
res.status(200).json({ data: courses });
});
app.get("/api/courses/:id", (req, res) => {
const id = Number(req.params.id);
if (!Number.isInteger(id) || id <= 0)
return res.status(400).json({ error: "id must be a positive integer" });
const course = courses.find(c => c.id === id);
if (!course) return res.status(404).json({ error: "Course not found" });
res.status(200).json({ data: course });
});
app.post("/api/courses", (req, res) => {
const { title, duration } = req.body || {};
const errors = [];

if (typeof title !== "string" || title.trim().length < 3)
errors.push("title must be a string with at least 3 characters");
if (!Number.isInteger(duration) || duration < 1 || duration > 100)
errors.push("duration must be an integer from 1 to 100");
if (errors.length)
return res.status(400).json({ error: "Validation failed", details: errors });
const course = { id: nextId++, title: title.trim(), duration };
courses.push(course);
res.status(201).json({ message: "Course created", data: course });
});
app.put("/api/courses/:id", (req, res) => {
const id = Number(req.params.id);
if (!Number.isInteger(id) || id <= 0)
return res.status(400).json({ error: "id must be a positive integer" });
const course = courses.find(c => c.id === id);
if (!course) return res.status(404).json({ error: "Course not found" });
const { title, duration } = req.body || {};
const errors = [];
if (typeof title !== "string" || title.trim().length < 3)
errors.push("title must be a string with at least 3 characters");
if (!Number.isInteger(duration) || duration < 1 || duration > 100)
errors.push("duration must be an integer from 1 to 100");
if (errors.length)
return res.status(400).json({ error: "Validation failed", details: errors });
course.title = title.trim();
course.duration = duration;
res.status(200).json({ message: "Course updated", data: course });
});
app.delete("/api/courses/:id", (req, res) => {
const id = Number(req.params.id);
if (!Number.isInteger(id) || id <= 0)
return res.status(400).json({ error: "id must be a positive integer" });
const index = courses.findIndex(c => c.id === id);
if (index === -1) return res.status(404).json({ error: "Course not found" });
const deleted = courses.splice(index, 1)[0];
res.status(200).json({ message: "Course deleted", data: deleted });
});
// Return a JSON 404 for unknown routes.
app.use((req, res) => {
res.status(404).json({ error: "Endpoint not found", path: req.originalUrl });
});
// Final error handler.
app.use((err, req, res, next) => {
console.error(err);
res.status(500).json({ error: "Internal server error" });
});
app.listen(PORT, () => {
console.log(`Course API running at http://localhost:${3000}`);
});