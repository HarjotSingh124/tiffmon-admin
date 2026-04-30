import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  query,
  orderBy,
  doc,
  updateDoc,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/config";
import AdminLayout from "../components/AdminLayout";

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
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Error updating subscription status:", error);
      alert("Could not update subscription status: " + error.message);
    }
  }

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
    };
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    let result = customers;

    if (statusFilter !== "all") {
      result = result.filter(
        (customer) =>
          (customer.subscriptionStatus || "active") === statusFilter
      );
    }

    if (paymentFilter !== "all") {
      result = result.filter(
        (customer) => (customer.paymentStatus || "unpaid") === paymentFilter
      );
    }

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();

      result = result.filter((customer) => {
        const customerName = customer.customerName?.toLowerCase() || "";
        const phone = customer.phone?.toLowerCase() || "";
        const city = customer.city?.toLowerCase() || "";
        const planName = customer.planName?.toLowerCase() || "";
        const subscriberId = customer.subscriberId?.toLowerCase() || "";

        return (
          customerName.includes(q) ||
          phone.includes(q) ||
          city.includes(q) ||
          planName.includes(q) ||
          subscriberId.includes(q)
        );
      });
    }

    return result;
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
        </div>
      </section>
    </AdminLayout>
  );
}