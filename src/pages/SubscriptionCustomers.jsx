import { useEffect, useMemo, useState } from "react";
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

export default function SubscriptionCustomers() {
  const [customers, setCustomers] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "customerSubscriptions"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));
      setCustomers(data);
    });

    return () => unsub();
  }, []);

  async function updateStatus(id, status) {
    try {
      await updateDoc(doc(db, "customerSubscriptions", id), {
        status,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Error updating subscription status:", error);
      alert("Could not update subscription status: " + error.message);
    }
  }

  function formatDate(value) {
    if (!value) return "N/A";
    return new Date(value).toLocaleDateString();
  }

  const counts = useMemo(() => {
    return {
      all: customers.length,
      active: customers.filter((c) => (c.status || "active") === "active").length,
      paused: customers.filter((c) => c.status === "paused").length,
      cancelled: customers.filter((c) => c.status === "cancelled").length,
    };
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    let result = customers;

    if (activeFilter !== "all") {
      result = result.filter(
        (customer) => (customer.status || "active") === activeFilter
      );
    }

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();

      result = result.filter((customer) => {
        const customerName = customer.customerName?.toLowerCase() || "";
        const phone = customer.phone?.toLowerCase() || "";
        const city = customer.city?.toLowerCase() || "";
        const planName = customer.planName?.toLowerCase() || "";

        return (
          customerName.includes(q) ||
          phone.includes(q) ||
          city.includes(q) ||
          planName.includes(q)
        );
      });
    }

    return result;
  }, [customers, activeFilter, searchTerm]);

  return (
    <AdminLayout title="Subscription Customers" subtitle="Manage Subscribers">
      <section className="panel">
        <div className="panel-head">
          <h2>All Subscribers</h2>
          <span className="count-pill">{filteredCustomers.length} customers</span>
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
              className={`filter-btn ${activeFilter === "active" ? "active" : ""}`}
              onClick={() => setActiveFilter("active")}
            >
              Active ({counts.active})
            </button>

            <button
              className={`filter-btn ${activeFilter === "paused" ? "active" : ""}`}
              onClick={() => setActiveFilter("paused")}
            >
              Paused ({counts.paused})
            </button>

            <button
              className={`filter-btn ${activeFilter === "cancelled" ? "active" : ""}`}
              onClick={() => setActiveFilter("cancelled")}
            >
              Cancelled ({counts.cancelled})
            </button>
          </div>

          <input
            className="orders-search"
            type="text"
            placeholder="Search by customer, phone, city, plan"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="orders-list">
          {filteredCustomers.map((customer) => (
            <div className="order-card" key={customer.id}>
              <div className="order-top">
                <div>
                  <h3>{customer.customerName}</h3>
                  <p className="order-meta">{customer.phone}</p>
                </div>

                <span className={`order-status status-${customer.status || "active"}`}>
                  {customer.status || "active"}
                </span>
              </div>

              <div className="order-section">
                <h4>Plan</h4>
                <p>
                  <strong>{customer.planName}</strong>
                </p>
                <p>
                  ₹{customer.price || 0} • {customer.period || ""}
                </p>
              </div>

              <div className="order-section">
                <h4>Address</h4>
                <p>{customer.addressLine1}</p>
                {customer.addressLine2 ? <p>{customer.addressLine2}</p> : null}
                <p>
                  {customer.city} - {customer.pincode}
                </p>
              </div>

              <div className="order-section">
                <h4>Subscription Details</h4>
                <p>Start Date: {customer.startDate || "N/A"}</p>
                <p>Created: {formatDate(customer.createdAt)}</p>
              </div>

              <div className="order-bottom">
                <div className="order-total">
                  {customer.type ? `Type: ${customer.type}` : "Subscription"}
                </div>

                <div className="order-actions">
                  <button
                    className="primary-btn"
                    onClick={() => updateStatus(customer.id, "active")}
                  >
                    Active
                  </button>

                  <button
                    className="secondary-btn"
                    onClick={() => updateStatus(customer.id, "paused")}
                  >
                    Pause
                  </button>

                  <button
                    className="danger-btn"
                    onClick={() => updateStatus(customer.id, "cancelled")}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredCustomers.length === 0 && (
            <div className="empty-state">No subscription customers found.</div>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}