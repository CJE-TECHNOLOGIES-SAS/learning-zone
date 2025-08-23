// src/modules/teacher/mySpace/context/MySpaceProvider.tsx
import React, { useState } from "react";
import { MySpaceContext, type MySpaceView } from "./MySpaceContext";

type Props = { children: React.ReactNode };

export const MySpaceProvider = ({ children }: Props) => {
  const [view, setView] = useState<MySpaceView>("estudiantes");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const resetMySpace = () => {
    setView("estudiantes");
    setSelectedId(null);
  };

  return (
    <MySpaceContext.Provider
      value={{
        view,
        setView,
        selectedId,
        setSelectedId,
        resetMySpace,
      }}
    >
      {children}
    </MySpaceContext.Provider>
  );
};
