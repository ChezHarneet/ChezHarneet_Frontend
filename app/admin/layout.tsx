import CmsApp from "../../components/cms-app";
import "./admin.css";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <CmsApp />
      {children}
    </>
  );
}
