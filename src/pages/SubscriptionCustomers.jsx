import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
<<<<<<< HEAD
  addDoc,
  query,
  orderBy,
  doc,
  updateDoc,
  where,
  getDocs,
=======
  doc,
  updateDoc,
  orderBy,
  query,
>>>>>>> a6d09a5bc5c8ea7eea4f4e2e65eb0300f4d429e1
} from "firebase/firestore";
import { db } from "../firebase/config";
import AdminLayout from "../components/AdminLayout";

<<<<<<< HEAD
const initialForm = {
  customerName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  pincode: "",
  planName: "",
  price: "",
  period: "month",
  totalMeals: "",
  mealsTaken: 0,
  subscriptionStatus: "active",
  paymentStatus: "paid",
  subscriberId: "",
  password: "",
  startDate: "",
};

export default function SubscriptionCustomers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
=======
export default function SubscriptionCustomers() {
  const [customers, setCustomers] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
>>>>>>> a6d09a5bc5c8ea7eea4f4e2e65eb0300f4d429e1
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

<<<<<<< HEAD
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm(initialForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const cleanSubscriberId = form.subscriberId.trim().toUpperCase();
    const cleanPassword = form.password.trim();

    if (!cleanSubscriberId) {
      alert("Subscriber ID is required.");
      return;
    }

    if (!cleanPassword) {
      alert("Password is required.");
      return;
    }

    try {
      const existingQuery = query(
        collection(db, "customerSubscriptions"),
        where("subscriberId", "==", cleanSubscriberId)
      );

      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        alert("This Subscriber ID already exists. Please use a different ID.");
        return;
      }

      await addDoc(collection(db, "customerSubscriptions"), {
        ...form,
        subscriberId: cleanSubscriberId,
        password: cleanPassword,
        price: Number(form.price || 0),
        totalMeals: Number(form.totalMeals || 0),
        mealsTaken: Number(form.mealsTaken || 0),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      alert("Subscriber added successfully.");
      resetForm();
    } catch (error) {
      console.error("Error adding subscriber:", error);
      alert("Could not add subscriber: " + error.message);
    }
  }

  async function updateSubscriptionStatus(id, status) {
    try {
      await updateDoc(doc(db, "customerSubscriptions", id), {
        subscriptionStatus: status,
=======
  async function updateStatus(id, status) {
    try {
      await updateDoc(doc(db, "customerSubscriptions", id), {
        status,
>>>>>>> a6d09a5bc5c8ea7eea4f4e2e65eb0300f4d429e1
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Error updating subscription status:", error);
      alert("Could not update subscription status: " + error.message);
    }
  }

<<<<<<< HEAD
  async function updatePaymentStatus(id, status) {
    try {
      await updateDoc(doc(db, "customerSubscriptions", id), {
        paymentStatus: status,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("Could not update payment status: " + error.message);
    }
  }

  async function changeMealsTaken(customer, delta) {
    try {
      const totalMeals = Number(customer.totalMeals || 0);
      const currentTaken = Number(customer.mealsTaken || 0);

      let nextTaken = currentTaken + delta;

      if (nextTaken < 0) nextTaken = 0;
      if (totalMeals > 0 && nextTaken > totalMeals) nextTaken = totalMeals;

      await updateDoc(doc(db, "customerSubscriptions", customer.id), {
        mealsTaken: nextTaken,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Error updating meals taken:", error);
      alert("Could not update meals: " + error.message);
    }
  }

  async function updateCredentials(customer) {
    try {
      const subscriberId = prompt(
        "Enter Subscriber ID:",
        customer.subscriberId || ""
      );
      if (!subscriberId) return;

      const cleanSubscriberId = subscriberId.trim().toUpperCase();

      const duplicateQuery = query(
        collection(db, "customerSubscriptions"),
        where("subscriberId", "==", cleanSubscriberId)
      );

      const duplicateSnapshot = await getDocs(duplicateQuery);

      const duplicateExists = duplicateSnapshot.docs.some(
        (item) => item.id !== customer.id
      );

      if (duplicateExists) {
        alert("This Subscriber ID already exists. Please use a different ID.");
        return;
      }

      const password = prompt("Enter Password:", customer.password || "");
      if (!password) return;

      await updateDoc(doc(db, "customerSubscriptions", customer.id), {
        subscriberId: cleanSubscriberId,
        password: password.trim(),
        updatedAt: Date.now(),
      });

      alert("Subscriber login credentials saved successfully.");
    } catch (error) {
      console.error("Error updating credentials:", error);
      alert("Failed to update credentials: " + error.message);
    }
  }

  function formatDate(value) {
    if (!value) return "N/A";
    if (typeof value === "string") return value;
    return new Date(value).toLocaleDateString();
  }

  const stats = useMemo(() => {
    return {
      total: customers.length,
      active: customers.filter(
        (c) => (c.subscriptionStatus || "active") === "active"
      ).length,
      paused: customers.filter((c) => c.subscriptionStatus === "paused").length,
      paid: customers.filter(
        (c) => (c.paymentStatus || "unpaid") === "paid"
      ).length,
=======
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
>>>>>>> a6d09a5bc5c8ea7eea4f4e2e65eb0300f4d429e1
    };
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    let result = customers;

<<<<<<< HEAD
    if (statusFilter !== "all") {
      result = result.filter(
        (customer) =>
          (customer.subscriptionStatus || "active") === statusFilter
      );
    }

    if (paymentFilter !== "all") {
      result = result.filter(
        (customer) => (customer.paymentStatus || "unpaid") === paymentFilter
=======
    if (activeFilter !== "all") {
      result = result.filter(
        (customer) => (customer.status || "active") === activeFilter
>>>>>>> a6d09a5bc5c8ea7eea4f4e2e65eb0300f4d429e1
      );
    }

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();

      result = result.filter((customer) => {
        const customerName = customer.customerName?.toLowerCase() || "";
        const phone = customer.phone?.toLowerCase() || "";
        const city = customer.city?.toLowerCase() || "";
        const planName = customer.planName?.toLowerCase() || "";
<<<<<<< HEAD
        const subscriberId = customer.subscriberId?.toLowerCase() || "";
=======
>>>>>>> a6d09a5bc5c8ea7eea4f4e2e65eb0300f4d429e1

        return (
          customerName.includes(q) ||
          phone.includes(q) ||
          city.includes(q) ||
<<<<<<< HEAD
          planName.includes(q) ||
          subscriberId.includes(q)
=======
          planName.includes(q)
>>>>>>> a6d09a5bc5c8ea7eea4f4e2e65eb0300f4d429e1
        );
      });
    }

    return result;
<<<<<<< HEAD
  }, [customers, statusFilter, paymentFilter, searchTerm]);

  return (
    <AdminLayout
      title="Subscribed Customers"
      subtitle="Track subscribers, meals, and login credentials"
    >
      <section className="panel" style={{ marginBottom: "18px" }}>
        <div className="panel-head">
          <h2>Add Subscriber Manually</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid-form">
          <input
            name="customerName"
            placeholder="Customer Name *"
            value={form.customerName}
            onChange={handleChange}
            required
          />
          <input
            name="phone"
            placeholder="Phone *"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <input
            name="addressLine1"
            placeholder="Address Line 1 *"
            value={form.addressLine1}
            onChange={handleChange}
            required
          />

          <input
            name="addressLine2"
            placeholder="Address Line 2"
            value={form.addressLine2}
            onChange={handleChange}
          />
          <input
            name="city"
            placeholder="City *"
            value={form.city}
            onChange={handleChange}
            required
          />
          <input
            name="pincode"
            placeholder="Pincode *"
            value={form.pincode}
            onChange={handleChange}
            required
          />

          <input
            name="planName"
            placeholder="Plan Name *"
            value={form.planName}
            onChange={handleChange}
            required
          />
          <input
            name="price"
            type="number"
            placeholder="Price *"
            value={form.price}
            onChange={handleChange}
            required
          />
          <select name="period" value={form.period} onChange={handleChange}>
            <option value="month">per month</option>
            <option value="week">per week</option>
            <option value="day">per day</option>
          </select>

          <input
            name="totalMeals"
            type="number"
            placeholder="Total Meals *"
            value={form.totalMeals}
            onChange={handleChange}
            required
          />
          <input
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            required
          />
          <input
            name="subscriberId"
            placeholder="Subscriber ID *"
            value={form.subscriberId}
            onChange={handleChange}
            required
          />

          <input
            name="password"
            placeholder="Password *"
            value={form.password}
            onChange={handleChange}
            required
          />
          <select
            name="subscriptionStatus"
            value={form.subscriptionStatus}
            onChange={handleChange}
          >
            <option value="active">active</option>
            <option value="paused">paused</option>
            <option value="cancelled">cancelled</option>
          </select>
          <select
            name="paymentStatus"
            value={form.paymentStatus}
            onChange={handleChange}
          >
            <option value="paid">paid</option>
            <option value="unpaid">unpaid</option>
            <option value="overdue">overdue</option>
          </select>

          <div className="form-actions">
            <button type="submit" className="primary-btn">
              Add Subscriber
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={resetForm}
            >
              Reset
            </button>
          </div>
        </form>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div>
            <p>Total Subscribers</p>
            <h3>{stats.total}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div>
            <p>Active</p>
            <h3>{stats.active}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏸️</div>
          <div>
            <p>Paused</p>
            <h3>{stats.paused}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div>
            <p>Paid</p>
            <h3>{stats.paid}</h3>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Subscribers Sheet</h2>
          <span className="count-pill">{filteredCustomers.length} rows</span>
        </div>

        <div className="subscribers-toolbar">
          <input
            className="orders-search"
            type="text"
            placeholder="Search by customer, phone, city, plan, subscriber ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="subscribers-filters">
            <select
              className="sheet-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              className="sheet-select"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        <div className="sheet-wrap">
          <table className="subscribers-sheet">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Plan</th>
                <th>Start Date</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total Meals</th>
                <th>Meals Taken</th>
                <th>Remaining</th>
                <th>Subscriber ID</th>
                <th>Password</th>
                <th>City</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map((customer) => {
                const totalMeals = Number(customer.totalMeals || 0);
                const mealsTaken = Number(customer.mealsTaken || 0);
                const remainingMeals =
                  totalMeals > 0 ? Math.max(totalMeals - mealsTaken, 0) : 0;

                return (
                  <tr key={customer.id}>
                    <td>
                      <div className="sheet-name">
                        <strong>{customer.customerName || "Unnamed"}</strong>
                        <span>{customer.addressLine1 || ""}</span>
                      </div>
                    </td>

                    <td>{customer.phone || "N/A"}</td>

                    <td>
                      <div className="sheet-name">
                        <strong>{customer.planName || "No Plan"}</strong>
                        <span>
                          ₹{customer.price || 0} • {customer.period || ""}
                        </span>
                      </div>
                    </td>

                    <td>{formatDate(customer.startDate)}</td>

                    <td>
                      <span
                        className={`order-status status-${
                          customer.subscriptionStatus || "active"
                        }`}
                      >
                        {customer.subscriptionStatus || "active"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`order-status payment-${
                          customer.paymentStatus || "unpaid"
                        }`}
                      >
                        {customer.paymentStatus || "unpaid"}
                      </span>
                    </td>

                    <td>{totalMeals}</td>

                    <td>
                      <div className="meal-counter">
                        <button
                          className="meal-mini-btn"
                          onClick={() => changeMealsTaken(customer, -1)}
                        >
                          −
                        </button>
                        <span>{mealsTaken}</span>
                        <button
                          className="meal-mini-btn"
                          onClick={() => changeMealsTaken(customer, 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td>{remainingMeals}</td>
                    <td>{customer.subscriberId || "—"}</td>
                    <td>{customer.password || "—"}</td>
                    <td>{customer.city || "N/A"}</td>

                    <td>
                      <div className="sheet-actions">
                        <button
                          className="mini-btn"
                          onClick={() => updateCredentials(customer)}
                        >
                          Set Login
                        </button>

                        <button
                          className="mini-btn primary-btn"
                          onClick={() =>
                            updateSubscriptionStatus(customer.id, "active")
                          }
                        >
                          Active
                        </button>

                        <button
                          className="mini-btn secondary-btn"
                          onClick={() =>
                            updateSubscriptionStatus(customer.id, "paused")
                          }
                        >
                          Pause
                        </button>

                        <button
                          className="mini-btn danger-btn"
                          onClick={() =>
                            updateSubscriptionStatus(customer.id, "cancelled")
                          }
                        >
                          Cancel
                        </button>

                        <button
                          className="mini-btn success-btn"
                          onClick={() =>
                            updatePaymentStatus(customer.id, "paid")
                          }
                        >
                          Paid
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="13">
                    <div className="empty-state">
                      No subscribed customers found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
=======
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
>>>>>>> a6d09a5bc5c8ea7eea4f4e2e65eb0300f4d429e1
        </div>
      </section>
    </AdminLayout>
  );
}