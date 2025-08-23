// src/modules/teacher/mySpace/components/SideBarMySpace.tsx
import { useState } from "react";
import {  FaUsers, FaBell } from "react-icons/fa";
import "../styles/sideBarMySpace.css";
import { useMySpace } from "../hooks/useMySpace";

export default function SideBarMySpace() {
  // Estado de abrir/cerrar menú
  const [navOpen, setNavOpen] = useState(false);

  // Contexto MySpace
  const { view, setView } = useMySpace();

  // Función para cambiar de vista y cerrar menú si está colapsado
  const handleChangeView = (newView: typeof view) => {
    setView(newView);
    setNavOpen(false);
  };

  return (
    <div id="nav-bar">
      {/* Toggle principal (colapsar/expandir sidebar) */}
      <input
        type="checkbox"
        id="nav-toggle"
        checked={navOpen}

        onChange={() => setNavOpen(v => !v)}
        hidden
      />

      {/* Header */}
      <div id="nav-header">
        <a id="nav-title" href="#" onClick={(e) => e.preventDefault()}>
          Mi Espacio
        </a>
        <label htmlFor="nav-toggle">
          <span id="nav-toggle-burger"></span>
        </label>
        <hr />
      </div>

      {/* Contenido */}
      <div id="nav-content">
        <div
          className={`nav-button ${view === "estudiantes" ? "active" : ""}`}
          onClick={() => handleChangeView("estudiantes")}
        >
          <FaUsers /> <span>Estudiantes</span>
        </div>



        <div
          className={`nav-button ${view === "notificaciones" ? "active" : ""}`}
          onClick={() => handleChangeView("notificaciones")}
        >
          <FaBell /> <span>Notificaciones</span>
        </div>

        {/* Highlight dinámico */}
        <div id="nav-content-highlight"></div>
      </div>
    </div>
  );
}
