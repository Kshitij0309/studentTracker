const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

let students = [];

// API routes
app.get("/students", (req, res) => {
  res.json(students);
});

app.post("/students", (req, res) => {
  const student = {
    id: Date.now(),
    name: req.body.name,
    attendance: [],
    studyHours: 0
  };
  students.push(student);
  res.json(student);
});

app.put("/students/:id/attendance", (req, res) => {
  const student = students.find(s => s.id == req.params.id);
  if (!student) return res.status(404).json({ message: "Not found" });

  student.attendance.push({
    date: req.body.date,
    subject: req.body.subject,
    status: req.body.status
  });

  res.json(student);
});

app.delete("/students/:id", (req, res) => {
  students = students.filter(s => s.id != req.params.id);
  res.json({ message: "Deleted" });
});

// Serve homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

module.exports = app;