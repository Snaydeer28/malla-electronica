let estados = ["pendiente", "cursando", "aprobado"];
let cursosData = [];
let progreso = JSON.parse(localStorage.getItem("progreso") || "{}");

fetch("cursos.json")
  .then(res => res.json())
  .then(data => {
    cursosData = data;
    renderMalla();
  });

function cambiarEstado(id) {
  const curso = cursosData.find(c => c.id === id);
  if (!cursoDesbloqueado(curso)) return;
  let estadoActual = progreso[id] || "pendiente";
  let index = estados.indexOf(estadoActual);
  progreso[id] = estados[(index + 1) % estados.length];
  localStorage.setItem("progreso", JSON.stringify(progreso));
  renderMalla();
}

function cursoDesbloqueado(curso) {
  return curso.prerrequisitos.every(pr => progreso[pr] === "aprobado");
}

function renderMalla() {
  const container = document.getElementById("ciclos-container");
  container.innerHTML = "";

  const ciclos = [...new Set(cursosData.map(c => c.ciclo))].sort((a, b) => a - b);
  ciclos.forEach(ciclo => {
    const div = document.createElement("div");
    div.className = "ciclo";
    const titulo = document.createElement("h3");
    titulo.textContent = `Ciclo ${ciclo}`;
    div.appendChild(titulo);

    cursosData.filter(c => c.ciclo === ciclo).forEach(curso => {
      const estado = progreso[curso.id] || "pendiente";
      const desbloqueado = cursoDesbloqueado(curso);
      const btn = document.createElement("div");
      btn.className = `curso ${estado} ${curso.area}`;
      btn.textContent = curso.nombre;
      if (desbloqueado) {
        btn.onclick = () => cambiarEstado(curso.id);
      } else {
        btn.style.opacity = 0.5;
        btn.title = "Curso bloqueado: requiere prerrequisitos aprobados";
      }
      div.appendChild(btn);
    });

    container.appendChild(div);
  });
}

function exportarProgreso() {
  const blob = new Blob([JSON.stringify(progreso)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "progreso.json";
  a.click();
}

function importarProgreso() {
  const file = document.getElementById("importar").files[0];
  const reader = new FileReader();
  reader.onload = () => {
    progreso = JSON.parse(reader.result);
    localStorage.setItem("progreso", JSON.stringify(progreso));
    renderMalla();
  };
  reader.readAsText(file);
}
