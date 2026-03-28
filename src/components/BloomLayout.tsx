import React from "react";
import BloomSidebar from "./BloomSidebar";

const BloomLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen w-full">
      <BloomSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default BloomLayout;
