import Sidebar from './Sidebar';
import Topbar from "./Topbar";

export default function AdminLayout({ title, subtitle, children }) {
  return (
    <div className="admin-shell">
      <Sidebar />

      <main className="admin-main">
        <Topbar title={title} subtitle={subtitle} />
        {children}
      </main>
    </div>
  );
}