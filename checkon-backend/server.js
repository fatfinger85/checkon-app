const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database("checkon.db");

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS employees (name TEXT PRIMARY KEY, pin TEXT NOT NULL)");

  db.run("CREATE TABLE IF NOT EXISTS records (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, project TEXT, action TEXT, timestamp TEXT)");

  db.run("INSERT OR IGNORE INTO employees (name, pin) VALUES ('Juan Perez', '1234'), ('Maria Gomez', '5678'), ('Carlos Ruiz', '9012')");
});

app.post("/api/register", (req, res) => {
  const { name, pin, project, action } = req.body;
  if (!name || !pin || !project || !action) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  db.get("SELECT * FROM employees WHERE name = ? AND pin = ?", [name, pin], (err, row) => {
    if (err) return res.status(500).json({ error: "Error en la base de datos" });
    if (!row) return res.status(401).json({ error: "PIN incorrecto" });

    const timestamp = new Date().toISOString();
    db.run("INSERT INTO records (name, project, action, timestamp) VALUES (?, ?, ?, ?)",
      [name, project, action, timestamp],
      (err) => {
        if (err) return res.status(500).json({ error: "Error al registrar" });
        res.json({ success: true, message: action + " registrada" });
      });
  });
});

app.get("/api/records", (req, res) => {
  db.all("SELECT * FROM records ORDER BY timestamp DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: "Error al obtener registros" });
    res.json(rows);
  });
});

app.get("/api/export", (req, res) => {
  db.all("SELECT * FROM records ORDER BY timestamp DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: "Error al exportar" });

    const csv = ["Nombre,Proyecto,Accion,FechaHora"].concat(
      rows.map(r => r.name + "," + r.project + "," + r.action + "," + r.timestamp)
    ).join("\n");

    fs.writeFileSync("historial.csv", csv);
    res.download("historial.csv");
  });
});

app.listen(PORT, () => console.log("CheckOn backend corriendo en puerto " + PORT));
