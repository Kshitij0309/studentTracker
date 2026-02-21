let allStudents = [];
function getAllSubjects() {
    const subjects = new Set();

    allStudents.forEach(student => {
        student.attendance.forEach(a => subjects.add(a.subject));
    });

    return Array.from(subjects);
}
function toggleDarkMode() {
    document.body.classList.toggle("dark");
}
async function fetchStudents() {
    const res = await fetch("/students");
    const students = await res.json();

    allStudents = students;   // store full dataset

    updateSubjectFilter(allStudents);
    updateSummary(allStudents);
    displayStudents(allStudents);
}

async function addStudent() {
    const nameInput = document.getElementById("studentName");
    const name = nameInput.value;

    if (!name) {
        alert("Enter student name");
        return;
    }

    await fetch("/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    });

    nameInput.value = "";
    fetchStudents();
}

async function markAttendance(id, status) {

    const dateInput = document.getElementById(`date-${id}`);
    const subjectSelect = document.getElementById(`subject-${id}`);
    const newSubjectInput = document.getElementById(`newsubject-${id}`);

    const date = dateInput.value;

    let subject = subjectSelect.value;

    if (subject === "__new__") {
        subject = newSubjectInput.value;
    }

    if (!date || !subject) {
        alert("Please select date and subject.");
        return;
    }

    await fetch(`/students/${id}/attendance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, subject, date })
    });

    // Clear inputs
    dateInput.value = "";
    subjectSelect.value = "";
    newSubjectInput.value = "";
    newSubjectInput.style.display = "none";

    fetchStudents();
}
async function addStudyHours(id) {
    const hours = prompt("Enter study hours:");

    if (!hours) return;

    await fetch(`/students/${id}/study`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours })
    });

    fetchStudents();
}

function displayStudents(students) {
    const container = document.getElementById("studentList");
    container.innerHTML = "";

    students.forEach(student => {
        const total = student.attendance.length;
const present = student.attendance.filter(a => a.status === "present").length;

const attendancePercent =
    total === 0 ? 0 : ((present / total) * 100).toFixed(1);

        const statusMessage =
            attendancePercent >= 75
                ? "Good Attendance"
                : "Needs Improvement";

        const statusColor =
            attendancePercent >= 75 ? "green" : "red";

        const div = document.createElement("div");
        div.className = "student-card";
const subjects = getAllSubjects();
        div.innerHTML = `
            <h3>${student.name}</h3>

            <p>Attendance: ${present}/${total} (${attendancePercent}%)</p>

            <div class="progress-bar">
                <div class="progress-fill" style="width:${attendancePercent}%"></div>
            </div>

            <p>Study Hours: ${student.studyHours}</p>
<p><strong>Attendance Records:</strong></p>
<ul>
    ${student.attendance.map(a => 
        `<li>${a.date} - ${a.subject} - ${a.status}</li>`
    ).join("")}
</ul>
            <p style="color:${statusColor}; font-weight:bold;">
                Status: ${statusMessage}
            </p>


<div class="attendance-inputs">
    <input type="date" id="date-${student.id}">

    <select id="subject-${student.id}" onchange="handleSubjectChange(${student.id})">
        <option value="">Select Subject</option>
        ${subjects.map(sub =>
            `<option value="${sub}">${sub}</option>`
        ).join("")}
        <option value="__new__">+ Add New Subject</option>
    </select>

    <input type="text"
           placeholder="Enter New Subject"
           id="newsubject-${student.id}"
           style="display:none;">
</div>
            <button onclick="markAttendance(${student.id}, 'present')">Present</button>
            <button onclick="markAttendance(${student.id}, 'absent')">Absent</button>
            <button onclick="addStudyHours(${student.id})">Add Study Hours</button>
            <button onclick="deleteStudent(${student.id})" style="background:#e74c3c;">Delete</button>
        `;

        container.appendChild(div);
    });
}

fetchStudents();

function searchStudents() {
    const searchValue = document.getElementById("searchInput").value.toLowerCase();

    const filtered = allStudents.filter(s =>
        s.name.toLowerCase().includes(searchValue)
    );

    displayStudents(filtered);
}
function updateSubjectFilter(students) {
    const subjects = new Set();

    students.forEach(student => {
        student.attendance.forEach(a => subjects.add(a.subject));
    });

    const select = document.getElementById("subjectFilter");
    select.innerHTML = `<option value="">Filter by Subject</option>`;

    subjects.forEach(sub => {
        select.innerHTML += `<option value="${sub}">${sub}</option>`;
    });
}
function updateSummary(students) {
    const totalStudents = students.length;

    let totalAttendance = 0;
    let totalPresent = 0;
    let totalStudyHours = 0;

    students.forEach(student => {
        totalAttendance += student.attendance.length;
        totalPresent += student.attendance.filter(a => a.status === "present").length;
        totalStudyHours += student.studyHours;
    });

    const overallPercent =
        totalAttendance === 0
            ? 0
            : ((totalPresent / totalAttendance) * 100).toFixed(1);

    const summaryDiv = document.getElementById("summarySection");

    summaryDiv.innerHTML = `
        <div class="student-card">
            <h3>Class Summary</h3>
            <p>Total Students: ${totalStudents}</p>
            <p>Overall Attendance: ${overallPercent}%</p>
            <p>Total Study Hours: ${totalStudyHours}</p>
        </div>
    `;
}
function filterBySubject() {
    const selected = document.getElementById("subjectFilter").value;

    if (!selected) {
        displayStudents(allStudents);
        return;
    }

    const filtered = allStudents.map(student => {
        return {
            ...student,
            attendance: student.attendance.filter(a => a.subject === selected)
        };
    });

    displayStudents(filtered);
}
function exportData() {
    fetch("/students")
        .then(res => res.json())
        .then(data => {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "attendance_data.json";
            link.click();
        });
}
async function deleteStudent(id) {
    await fetch(`/students/${id}`, {
        method: "DELETE"
    });

    fetchStudents();
}
function handleSubjectChange(id) {
    const select = document.getElementById(`subject-${id}`);
    const newInput = document.getElementById(`newsubject-${id}`);

    if (select.value === "__new__") {
        newInput.style.display = "inline-block";
    } else {
        newInput.style.display = "none";
    }
}