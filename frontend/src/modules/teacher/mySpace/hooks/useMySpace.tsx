// src/modules/teacher/mySpace/context/useMySpace.ts

import { useContext } from "react";
import { MySpaceContext } from "../context/MySpaceContext";

/**
 * Hook para acceder al contexto de MySpace.
 * Garantiza que siempre se use dentro del <MySpaceProvider>.
 */
export const useMySpace = () => {
  const context = useContext(MySpaceContext);

  if (!context) {
    throw new Error("useMySpace debe usarse dentro de un MySpaceProvider");
  }

  return context;
};
