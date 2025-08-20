// src/modules/teacher/mySpace/context/MySpaceContext.ts
import { createContext } from "react";

// Vistas disponibles
export type MySpaceView = "usuario" | "estudiantes" | "estadisticas" | "notificaciones";

// Estructura de datos que manejará el contexto
export type MySpaceContextType = {
  view: MySpaceView;
  setView: (v: MySpaceView) => void;
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;
  resetMySpace: () => void;
};

// Creación del contexto
export const MySpaceContext = createContext<MySpaceContextType | null>(null);
