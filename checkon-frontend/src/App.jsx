import { useState } from "react";
import './App.css';

function App() {
  const [employee, setEmployee] = useState("");
  const [pin, setPin] = useState("");
  const [project, setProject] = useState("");

  const handleAction = async (type) => {
    if (!employee || !pin || !project) {
      alert("Por favor completa todos los campos.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: employee, pin, project, action: type }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setPin("");
      } else {
        alert(data.error);
      }
    } catch {
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 400, margin: "auto" }}>
      <h1>CheckOn</h1>
      <label>Empleado</label>
      <select onChange={(e) => setEmployee(e.target.value)} value={employee}>
        <option value="">Selecciona un empleado</option>
        <option value="Juan Perez">Juan Perez</option>
        <option value="Maria Gomez">Maria Gomez</option>
        <option value="Carlos Ruiz">Carlos Ruiz</option>
      </select>
      <label>PIN</label>
      <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} />
      <label>Proyecto</label>
      <select onChange={(e) => setProject(e.target.value)} value={project}>
        <option value="">Selecciona un proyecto</option>
        <option value="Techo A">Techo A</option>
        <option value="Reparación B">Reparación B</option>
        <option value="Pintura C">Pintura C</option>
      </select>
      <div style={{ marginTop: "1rem" }}>
        <button onClick={() => handleAction("Entrada")}>Entrar</button>
        <button onClick={() => handleAction("Salida")}>Salir</button>
      </div>
    </div>
  );
}

export default App;
