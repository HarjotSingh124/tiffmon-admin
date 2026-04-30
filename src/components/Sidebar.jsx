import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="brand">
          <div className="brand-icon">🍛</div>
          <div>
            <h2>Tiffmon</h2>
            <p>Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="nav-link">
          📊 Dashboard
        </NavLink>

        <NavLink to="/meals" className="nav-link">
          🍱 Meals
        </NavLink>

        <NavLink to="/orders" className="nav-link">
          🧾 Orders
        </NavLink>
        <NavLink to="/subscriptions" className="nav-link">
  📅 Subscriptions
</NavLink>

        <button className="nav-link disabled-link">👥 Users</button>
     <NavLink to="/subscription-customers" className="nav-link">
  👤 Subscription Customers
</NavLink>
<<<<<<< HEAD
<NavLink to="/delivery" className="nav-link">
  🚚 Daily Delivery
</NavLink>
<NavLink to="/delivery-boy" className="nav-link">
  🛵 Delivery Boy
</NavLink>
=======
>>>>>>> a6d09a5bc5c8ea7eea4f4e2e65eb0300f4d429e1
      </nav>
    </aside>
  );
}