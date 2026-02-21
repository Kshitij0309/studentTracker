const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

let students = [];

// Get all students
app.get("/students", (req, res) => {
    res.json(students);
});

// Add student
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

// Mark attendance
app.put("/students/:id/attendance", (req, res) => {
    const student = students.find(s => s.id == req.params.id);

    const record = {
        date: req.body.date,
        subject: req.body.subject,
        status: req.body.status
    };

    student.attendance.push(record);

    res.json(student);
});

// Add study hours
app.put("/students/:id/study", (req, res) => {
    const student = students.find(s => s.id == req.params.id);
    student.studyHours += Number(req.body.hours);
    res.json(student);
});
app.delete("/students/:id", (req, res) => {
    students = students.filter(s => s.id != req.params.id);
    res.json({ message: "Student deleted" });
});
const PORT = process.env.PORT || 3000;

// If running locally → start server
if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`Server running locally on port ${PORT}`);
    });
}

// Export for Vercel
module.exports = app;