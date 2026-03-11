export default function Topbar({ title, subtitle = "Admin Panel" }) {
  return (
    <div className="topbar">
      <div>
        <p className="topbar-subtitle">{subtitle}</p>
        <h1>{title}</h1>
      </div>

      <div className="topbar-user">
        <div className="user-avatar">H</div>
        <div>
          <strong>Harjot</strong>
          <p>Administrator</p>
        </div>
      </div>
    </div>
  );
}