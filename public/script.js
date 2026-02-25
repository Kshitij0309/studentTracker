let allStudents = [];
let allSubjects = [];

/* ======================
   FETCH DATA
====================== */

async function fetchSubjects() {
  const res = await fetch("/api/subjects");
  allSubjects = await res.json();
}

async function fetchStudents() {
  const res = await fetch("/api/students");
  allStudents = await res.json();
  displayStudents(allStudents);
}

/* ======================
   ADD SUBJECT
====================== */

async function addSubject() {
  const input = document.getElementById("newSubjectName");
  const name = input.value.trim();
  if (!name) return;

  await fetch("/api/subjects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });

  input.value = "";
  await fetchSubjects();
  displayStudents(allStudents);
}

/* ======================
   ADD STUDENT
====================== */

async function addStudent() {
  const input = document.getElementById("studentName");
  const name = input.value.trim();
  if (!name) return;

  await fetch("/api/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });

  input.value = "";
  await fetchStudents();
}

/* ======================
   DISPLAY STUDENTS
====================== */

function displayStudents(students) {
  const list = document.getElementById("studentList");
  list.innerHTML = "";

  students.forEach(student => {
    const div = document.createElement("div");
    div.className = "student-card";

    const subjectOptions = allSubjects
      .map(s => `<option value="${s.name}">${s.name}</option>`)
      .join("");

    div.innerHTML = `
      <h3>${student.name}</h3>
      
      <div class="attendance-inputs">
        <input type="date" id="date-${student.id}">
        
        <select id="subject-${student.id}">
          <option value="">Select Subject</option>
          ${subjectOptions}
        </select>

        <select id="status-${student.id}">
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
        </select>

        <button onclick="markAttendance('${student.id}')">Mark</button>
<button onclick="deleteStudent('${student.id}')">Delete</button>
    `;

    list.appendChild(div);
  });
}

/* ======================
   MARK ATTENDANCE
====================== */

async function markAttendance(id) {
  const date = document.getElementById(`date-${id}`).value;
  const subject = document.getElementById(`subject-${id}`).value;
  const status = document.getElementById(`status-${id}`).value;

  if (!date || !subject) return alert("Fill all fields");

  await fetch(`/api/students/${id}/attendance`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, subject, status })
  });

  await fetchStudents();
}

/* ======================
   DELETE STUDENT
====================== */

async function deleteStudent(id) {
  await fetch(`/api/students/${id}`, { method: "DELETE" });
  await fetchStudents();
}

/* ======================
   INIT
====================== */

async function init() {
  await fetchSubjects();
  await fetchStudents();
}

init();