const http = require("http");
const fs = require("fs");

const PORT = 3000;
const DATA_FILE = "notes.json";

// Ensure file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "[]");
}

function getStudents() {
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data);
}

function saveStudents(students) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2));
}

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // GET all students
  if (req.method === "GET" && req.url === "/students") {
    const students = getStudents();
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(students));
  }

  // ADD student
  if (req.method === "POST" && req.url === "/students") {
    let body = "";

    req.on("data", chunk => body += chunk);

    req.on("end", () => {
      const newStudent = JSON.parse(body);
      const students = getStudents();

      newStudent.id = Date.now();
      students.push(newStudent);

      saveStudents(students);

      res.end(JSON.stringify({ message: "Student added" }));
    });
    return;
  }

  // DELETE student
  if (req.method === "DELETE" && req.url.startsWith("/students/")) {
    const id = parseInt(req.url.split("/")[2]);

    let students = getStudents();
    students = students.filter(s => s.id !== id);

    saveStudents(students);

    return res.end(JSON.stringify({ message: "Deleted" }));
  }

  // UPDATE student
  if (req.method === "PUT" && req.url.startsWith("/students/")) {
    const id = parseInt(req.url.split("/")[2]);

    let body = "";

    req.on("data", chunk => body += chunk);

    req.on("end", () => {
      const updated = JSON.parse(body);
      let students = getStudents();

      students = students.map(s =>
        s.id === id ? { ...s, ...updated } : s
      );

      saveStudents(students);

      res.end(JSON.stringify({ message: "Updated" }));
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
