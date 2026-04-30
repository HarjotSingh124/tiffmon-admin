import { useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase/config";
import AdminLayout from "../components/AdminLayout";
import NotificationPopup from "../components/NotificationPopup";
import notificationSound from "../assets/notification.mp3";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [newOrder, setNewOrder] = useState(null);

  const prevCount = useRef(0);
  const newestOrderRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      if (data.length > 0) {
        newestOrderRef.current = data[0];
      }

      if (snapshot.size > prevCount.current && prevCount.current !== 0) {
        const newestOrder = data[0];
        setNewOrder(newestOrder);

        const audio = new Audio(notificationSound);
        audio.play().catch((err) => {
          console.log("Audio autoplay blocked:", err);
        });

        setTimeout(() => {
          setNewOrder(null);
        }, 5000);

        setTimeout(() => {
          const latestCard = document.getElementById(`order-${newestOrder.id}`);
          if (latestCard) {
            latestCard.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 300);
      }

      prevCount.current = snapshot.size;
      setOrders(data);
    });

    return () => unsub();
  }, []);

  async function updateStatus(id, status) {
    try {
      await updateDoc(doc(db, "orders", id), {
        status,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Could not update status: " + error.message);
    }
  }

  function formatDate(timestamp) {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString();
  }

  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => (o.status || "pending") === "pending").length,
      preparing: orders.filter((o) => o.status === "preparing").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (activeFilter !== "all") {
      result = result.filter(
        (order) => (order.status || "pending") === activeFilter
      );
    }

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();

      result = result.filter((order) => {
        const shortId = order.id?.slice(0, 6).toLowerCase() || "";
        const fullId = order.id?.toLowerCase() || "";
        const customerName = order.customerName?.toLowerCase() || "";
        const phone = order.phone?.toLowerCase() || "";
        const city = order.city?.toLowerCase() || "";

        return (
          shortId.includes(q) ||
          fullId.includes(q) ||
          customerName.includes(q) ||
          phone.includes(q) ||
          city.includes(q)
        );
      });
    }

    return result;
  }, [orders, activeFilter, searchTerm]);

  return (
    <AdminLayout title="Orders" subtitle="Customer Orders">
      <NotificationPopup order={newOrder} />

      <section className="panel">
        <div className="panel-head">
          <h2>All Orders</h2>
          <span className="count-pill">{filteredOrders.length} orders</span>
        </div>

        <div className="orders-toolbar">
          <div className="orders-filter-bar">
            <button
              className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
              onClick={() => setActiveFilter("all")}
            >
              All ({counts.all})
            </button>

            <button
              className={`filter-btn ${activeFilter === "pending" ? "active" : ""}`}
              onClick={() => setActiveFilter("pending")}
            >
              Pending ({counts.pending})
            </button>

            <button
              className={`filter-btn ${activeFilter === "preparing" ? "active" : ""}`}
              onClick={() => setActiveFilter("preparing")}
            >
              Preparing ({counts.preparing})
            </button>

            <button
              className={`filter-btn ${activeFilter === "delivered" ? "active" : ""}`}
              onClick={() => setActiveFilter("delivered")}
            >
              Delivered ({counts.delivered})
            </button>
          </div>

          <input
            className="orders-search"
            type="text"
            placeholder="Search by name, phone, city, order ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="orders-list">
          {filteredOrders.map((order) => (
            <div
              className={`order-card ${
                newOrder?.id === order.id ? "new-order-highlight" : ""
              }`}
              key={order.id}
              id={`order-${order.id}`}
            >
              <div className="order-top">
                <div>
                  <h3>Order #{order.id.slice(0, 6).toUpperCase()}</h3>
                  <p className="order-meta">{formatDate(order.createdAt)}</p>
                </div>

                <span
                  className={`order-status status-${order.status || "pending"}`}
                >
                  {order.status || "pending"}
                </span>
              </div>

              <div className="order-section">
                <h4>Customer</h4>
                <p>
                  <strong>{order.customerName}</strong>
                </p>
                <p>{order.phone}</p>
              </div>

              <div className="order-section">
                <h4>Address</h4>
                <p>{order.addressLine1}</p>
                {order.addressLine2 ? <p>{order.addressLine2}</p> : null}
                <p>
                  {order.city} - {order.pincode}
                </p>
              </div>

              <div className="order-section">
                <h4>Items</h4>
                <div className="order-items">
                  {(order.items || []).map((item, index) => (
                    <div className="order-item-row" key={index}>
                      <span>
                        {item.emoji} {item.name} x{item.qty}
                      </span>
                      <span>₹{item.price * item.qty}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-bottom">
                <div className="order-total">Total: ₹{order.total || 0}</div>

                <div className="order-actions">
                  <button
                    className="secondary-btn"
                    onClick={() => updateStatus(order.id, "pending")}
                  >
                    Pending
                  </button>

                  <button
                    className="primary-btn"
                    onClick={() => updateStatus(order.id, "preparing")}
                  >
                    Preparing
                  </button>

                  <button
                    className="success-btn"
                    onClick={() => updateStatus(order.id, "delivered")}
                  >
                    Delivered
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="empty-state">No orders found.</div>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}