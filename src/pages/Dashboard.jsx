import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase/config";
import AdminLayout from "../components/AdminLayout";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalMeals: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    todaysOrders: 0,
    todaysRevenue: 0,
    todaysPendingOrders: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const unsubMeals = onSnapshot(collection(db, "meals"), (snapshot) => {
      setStats((prev) => ({
        ...prev,
        totalMeals: snapshot.size,
      }));
    });

    const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const orders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      orders.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));

      const pendingOrders = orders.filter(
        (order) => (order.status || "pending") === "pending"
      ).length;

      const deliveredOrders = orders.filter(
        (order) => order.status === "delivered"
      ).length;

      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      ).getTime();

      const endOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      ).getTime();

      const todaysOrdersList = orders.filter((order) => {
        const createdAt = Number(order.createdAt || 0);
        return createdAt >= startOfToday && createdAt < endOfToday;
      });

      const todaysRevenue = todaysOrdersList.reduce(
        (sum, order) => sum + Number(order.total || 0),
        0
      );

      const todaysPendingOrders = todaysOrdersList.filter(
        (order) => (order.status || "pending") === "pending"
      ).length;

      setStats((prev) => ({
        ...prev,
        totalOrders: orders.length,
        pendingOrders,
        deliveredOrders,
        todaysOrders: todaysOrdersList.length,
        todaysRevenue,
        todaysPendingOrders,
      }));

      setRecentOrders(orders.slice(0, 5));
    });

    return () => {
      unsubMeals();
      unsubOrders();
    };
  }, []);

  function formatDate(timestamp) {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString();
  }

  return (
    <AdminLayout title="Dashboard" subtitle="Overview">
      <section className="stats-grid">
        <StatCard icon="🍱" label="Total Meals" value={stats.totalMeals} />
        <StatCard icon="🧾" label="Total Orders" value={stats.totalOrders} />
        <StatCard icon="⏳" label="Pending Orders" value={stats.pendingOrders} />
        <StatCard icon="✅" label="Delivered Orders" value={stats.deliveredOrders} />
        <StatCard icon="📅" label="Today's Orders" value={stats.todaysOrders} />
        <StatCard icon="💰" label="Today's Revenue" value={`₹${stats.todaysRevenue}`} />
        <StatCard icon="🚨" label="Today's Pending" value={stats.todaysPendingOrders} />
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-head">
            <h2>Quick Actions</h2>
          </div>

          <div className="quick-actions">
            <Link to="/meals" className="action-btn">
              Manage Meals
            </Link>
            <Link to="/orders" className="action-btn">
              Manage Orders
            </Link>
            <button className="action-btn disabled-link">Users</button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>Live Summary</h2>
          </div>

          <div className="status-list">
            <div className="status-row">
              <span>Meals Available</span>
              <span className="status-badge ok">{stats.totalMeals}</span>
            </div>
            <div className="status-row">
              <span>Total Orders</span>
              <span className="status-badge ok">{stats.totalOrders}</span>
            </div>
            <div className="status-row">
              <span>Pending Orders</span>
              <span className="status-badge ok">{stats.pendingOrders}</span>
            </div>
            <div className="status-row">
              <span>Delivered Orders</span>
              <span className="status-badge ok">{stats.deliveredOrders}</span>
            </div>
            <div className="status-row">
              <span>Today's Orders</span>
              <span className="status-badge ok">{stats.todaysOrders}</span>
            </div>
            <div className="status-row">
              <span>Today's Revenue</span>
              <span className="status-badge ok">₹{stats.todaysRevenue}</span>
            </div>
            <div className="status-row">
              <span>Today's Pending</span>
              <span className="status-badge ok">{stats.todaysPendingOrders}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 20 }}>
        <div className="panel-head">
          <h2>Recent Orders</h2>
          <Link to="/orders" className="action-btn">
            View All
          </Link>
        </div>

        <div className="recent-orders-list">
          {recentOrders.length === 0 && (
            <div className="empty-state">No recent orders found.</div>
          )}

          {recentOrders.map((order) => (
            <div className="recent-order-row" key={order.id}>
              <div>
                <h4>#{order.id.slice(0, 6).toUpperCase()} · {order.customerName}</h4>
                <p>{formatDate(order.createdAt)}</p>
              </div>

              <div className="recent-order-right">
                <span className={`order-status status-${order.status || "pending"}`}>
                  {order.status || "pending"}
                </span>
                <strong>₹{order.total || 0}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AdminLayout>
  );
}