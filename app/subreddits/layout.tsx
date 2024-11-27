import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1>Subreddit Finder</h1>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
