const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB Error:", err));

/* =======================
   SCHEMAS
======================= */

// Student Schema
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  attendance: [{
    date: String,
    subject: String,
    status: String
  }],
  studyHours: { type: Number, default: 0 }
});

const Student = mongoose.model("Student", studentSchema);

// Subject Schema
const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});

const Subject = mongoose.model("Subject", subjectSchema);

/* =======================
   STUDENT ROUTES
======================= */

app.get("/api/students", async (req, res) => {
  const students = await Student.find();
  res.json(students.map(s => ({ ...s.toObject(), id: s._id })));
});

app.post("/api/students", async (req, res) => {
  const student = new Student({
    name: req.body.name,
    attendance: [],
    studyHours: 0
  });
  const saved = await student.save();
  res.json({ ...saved.toObject(), id: saved._id });
});

app.put("/api/students/:id/attendance", async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ message: "Not found" });

  student.attendance.push({
    date: req.body.date,
    subject: req.body.subject,
    status: req.body.status
  });

  const updated = await student.save();
  res.json({ ...updated.toObject(), id: updated._id });
});

app.delete("/api/students/:id", async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

/* =======================
   SUBJECT ROUTES
======================= */

app.get("/api/subjects", async (req, res) => {
  const subjects = await Subject.find();
  res.json(subjects);
});

app.post("/api/subjects", async (req, res) => {
  try {
    const subject = new Subject({ name: req.body.name });
    await subject.save();
    res.json(subject);
  } catch {
    res.status(400).json({ message: "Subject already exists" });
  }
});

/* =======================
   SERVER
======================= */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});