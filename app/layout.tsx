import type { Metadata } from "next";
import WorkspaceApp from "../components/workspace-app";
// @ts-ignore - Next.js resolves global CSS imports during its build; the current editor setup lacks the CSS type declaration.
import "./globals.css";
export const metadata: Metadata = {
  title: "Chez Harneet — French preparation",
  description: "Your calm, structured path to French confidence.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <WorkspaceApp />
        {children}
      </body>
    </html>
  );
}
