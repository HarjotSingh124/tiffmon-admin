import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import AdminLayout from "../components/AdminLayout";

export default function Subscriptions() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    period: "per week",
    type: "veg",
    description: "",
    features: "",
    badge: "",
    buttonText: "Subscribe",
    active: true,
    featured: false,
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "subscriptions"), (snapshot) => {
      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));
      setPlans(data);
    });

    return () => unsub();
  }, []);

  function resetForm() {
    setForm({
      name: "",
      price: "",
      period: "per week",
      type: "veg",
      description: "",
      features: "",
      badge: "",
      buttonText: "Subscribe",
      active: true,
      featured: false,
    });
    setEditingId(null);
  }

  function handleEdit(plan) {
    setEditingId(plan.id);
    setForm({
      name: plan.name || "",
      price: plan.price || "",
      period: plan.period || "per week",
      type: plan.type || "veg",
      description: plan.description || "",
      features: Array.isArray(plan.features) ? plan.features.join(", ") : "",
      badge: plan.badge || "",
      buttonText: plan.buttonText || "Subscribe",
      active: plan.active ?? true,
      featured: plan.featured ?? false,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      const planData = {
        name: form.name.trim(),
        price: Number(form.price),
        period: form.period,
        type: form.type,
        description: form.description.trim(),
        features: form.features
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        badge: form.badge.trim(),
        buttonText: form.buttonText.trim(),
        active: form.active,
        featured: form.featured,
      };

      if (editingId) {
        await updateDoc(doc(db, "subscriptions", editingId), {
          ...planData,
          updatedAt: Date.now(),
        });
      } else {
        await addDoc(collection(db, "subscriptions"), {
          ...planData,
          createdAt: Date.now(),
        });
      }

      resetForm();
    } catch (error) {
      console.error("Error saving subscription:", error);
      alert("Error saving subscription: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function deletePlan(id) {
    try {
      await deleteDoc(doc(db, "subscriptions", id));
      if (editingId === id) resetForm();
    } catch (error) {
      console.error("Error deleting subscription:", error);
      alert("Error deleting subscription: " + error.message);
    }
  }

  async function toggleActive(id, currentValue) {
    try {
      await updateDoc(doc(db, "subscriptions", id), {
        active: !currentValue,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Error updating plan status:", error);
      alert("Error updating plan status: " + error.message);
    }
  }

  return (
    <AdminLayout title="Subscriptions" subtitle="Plans Management">
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-head">
            <h2>{editingId ? "Edit Plan" : "Add New Plan"}</h2>
          </div>

          <form className="meal-form" onSubmit={handleSubmit}>
            <input
              placeholder="Plan name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />

            <input
              placeholder="Price"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />

            <select
              value={form.period}
              onChange={(e) => setForm({ ...form, period: e.target.value })}
            >
              <option value="per week">per week</option>
              <option value="per month">per month</option>
              <option value="per day">per day</option>
            </select>

            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="veg">Veg</option>
              <option value="non-veg">Non-Veg</option>
              <option value="mixed">Mixed</option>
            </select>

            <input
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />

            <input
              placeholder="Features (comma separated)"
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
            />

            <input
              placeholder="Badge text (POPULAR / BEST VALUE)"
              value={form.badge}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
            />

            <input
              placeholder="Button text"
              value={form.buttonText}
              onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
            />

            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm({ ...form, featured: e.target.checked })
                }
              />
              Featured Plan
            </label>

            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  setForm({ ...form, active: e.target.checked })
                }
              />
              Active
            </label>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading
                  ? editingId
                    ? "Updating..."
                    : "Adding..."
                  : editingId
                  ? "Update Plan"
                  : "Add Plan"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="danger-btn"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>All Plans</h2>
            <span className="count-pill">{plans.length} plans</span>
          </div>

          <div className="meal-list">
            {plans.map((plan) => (
              <div className="meal-row" key={plan.id}>
                <div className="meal-left">
                  <div className="meal-emoji">{plan.featured ? "⭐" : "📅"}</div>
                  <div>
                    <h4>{plan.name}</h4>
                    <p>
                      ₹{plan.price} • {plan.period} • {plan.type}
                    </p>
                  </div>
                </div>

                <div className="meal-actions">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={plan.active ?? true}
                      onChange={() => toggleActive(plan.id, plan.active ?? true)}
                    />
                    <span className="toggle-slider"></span>
                  </label>

                  <span className={plan.active ? "status-text on" : "status-text off"}>
                    {plan.active ? "Active" : "Hidden"}
                  </span>

                  <button
                    className="secondary-btn"
                    onClick={() => handleEdit(plan)}
                  >
                    Edit
                  </button>

                  <button
                    className="danger-btn"
                    onClick={() => deletePlan(plan.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {plans.length === 0 && (
              <div className="empty-state">No subscription plans found.</div>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}