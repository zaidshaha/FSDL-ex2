require("dotenv").config();
const express = require("express");
const cors = require("cors");




const pool = require("./db");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(
cors({
origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
})
);
app.use(express.json());
// Validate a course ID from the URL.
function getValidId(value) {
const id = Number(value);
return Number.isInteger(id) && id > 0 ? id : null;
}
// Validate the course data for POST and PUT.
function validateCourse(body) {
const { title, duration } = body || {};
const errors = [];
if (typeof title !== "string" || title.trim().length < 3) {
errors.push("title must be a string with at least 3 characters");
}
if (!Number.isInteger(duration) || duration < 1 || duration > 100) {
errors.push("duration must be an integer from 1 to 100");
}
return {
errors,
title: typeof title === "string" ? title.trim() : "",
duration,
};
}
app.get("/", (req, res) => {
res.status(200).json({ message: "Course API is running" });
});
// GET all courses.
app.get("/api/courses", async (req, res, next) => {
try {
const result = await pool.query(
"SELECT id, title, duration FROM courses ORDER BY id ASC"
);
res.status(200).json({ data: result.rows });
} catch (err) {
next(err);
}
});





// GET one course by ID.
app.get("/api/courses/:id", async (req, res, next) => {
const id = getValidId(req.params.id);
if (id === null) {
return res.status(400).json({
error: "id must be a positive integer",
});
}
try {
const result = await pool.query(
"SELECT id, title, duration FROM courses WHERE id = $1",
[id]
);
if (result.rows.length === 0) {
return res.status(404).json({ error: "Course not found" });
}
res.status(200).json({ data: result.rows[0] });
} catch (err) {
next(err);
}
});
// POST a new course.
app.post("/api/courses", async (req, res, next) => {
const { errors, title, duration } = validateCourse(req.body);
if (errors.length) {
return res.status(400).json({
error: "Validation failed",
details: errors,
});
}
try {
const result = await pool.query(
`INSERT INTO courses (title, duration)
VALUES ($1, $2)
RETURNING id, title, duration`,
[title, duration]
);
res.status(201).json({
message: "Course created",
data: result.rows[0],
});





} catch (err) {
next(err);
}
});
// PUT: replace a course's title and duration.
app.put("/api/courses/:id", async (req, res, next) => {
const id = getValidId(req.params.id);
if (id === null) {
return res.status(400).json({
error: "id must be a positive integer",
});
}
const { errors, title, duration } = validateCourse(req.body);
if (errors.length) {
return res.status(400).json({
error: "Validation failed",
details: errors,
});
}
try {
const result = await pool.query(
`UPDATE courses
SET title = $1, duration = $2
WHERE id = $3
RETURNING id, title, duration`,
[title, duration, id]
);
if (result.rows.length === 0) {
return res.status(404).json({ error: "Course not found" });
}
res.status(200).json({
message: "Course updated",
data: result.rows[0],
});
} catch (err) {
next(err);
}
});
// DELETE a course.





app.delete("/api/courses/:id", async (req, res, next) => {
const id = getValidId(req.params.id);
if (id === null) {
return res.status(400).json({
error: "id must be a positive integer",
});
}
try {
const result = await pool.query(
`DELETE FROM courses
WHERE id = $1
RETURNING id, title, duration`,
[id]
);
if (result.rows.length === 0) {
return res.status(404).json({ error: "Course not found" });
}
res.status(200).json({
message: "Course deleted",
data: result.rows[0],
});
} catch (err) {
next(err);
}
});
// JSON response for unknown routes.
app.use((req, res) => {
res.status(404).json({
error: "Endpoint not found",
path: req.originalUrl,
});
});
// Final error handler.
app.use((err, req, res, next) => {
console.error(err);
res.status(500).json({ error: "Internal server error" });
});
// Verify the database connection before starting the server.
async function startServer() {
try {





await pool.query("SELECT 1");
console.log("Connected to PostgreSQL successfully.");
app.listen(PORT, () => {
console.log(`Course API running at http://localhost:${PORT}`);
});
} catch (err) {
console.error("Could not connect to PostgreSQL:", err.message);
process.exitCode = 1;
}
}
startServer();