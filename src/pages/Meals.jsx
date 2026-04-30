import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import AdminLayout from "../components/AdminLayout";

export default function Meals() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "combo",
    emoji: "🍱",
    ingredients: "",
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "meals"), (snapshot) => {
      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));
      setMeals(data);
    });

    return () => unsub();
  }, []);

  function resetForm() {
    setForm({
      name: "",
      price: "",
      category: "combo",
      emoji: "🍱",
      ingredients: "",
    });
    setEditingId(null);
  }

  function handleEdit(meal) {
    setEditingId(meal.id);
    setForm({
      name: meal.name || "",
      price: meal.price || "",
      category: meal.category || "combo",
      emoji: meal.emoji || "🍱",
      ingredients: Array.isArray(meal.ingredients)
        ? meal.ingredients.join(", ")
        : "",
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      const mealData = {
        name: form.name.trim(),
        price: Number(form.price),
        category: form.category,
        emoji: form.emoji.trim(),
        ingredients: form.ingredients
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        available: true,
      };

      if (editingId) {
        await updateDoc(doc(db, "meals", editingId), {
          ...mealData,
          updatedAt: Date.now(),
        });
      } else {
        await addDoc(collection(db, "meals"), {
          ...mealData,
          createdAt: Date.now(),
        });
      }

      resetForm();
    } catch (error) {
      console.error("Error saving meal:", error);
      alert("Error saving meal: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteMeal(id) {
    try {
      await deleteDoc(doc(db, "meals", id));
      if (editingId === id) resetForm();
    } catch (error) {
      console.error("Error deleting meal:", error);
      alert("Error deleting meal: " + error.message);
    }
  }

  async function toggleAvailability(id, currentValue) {
    try {
      await updateDoc(doc(db, "meals", id), {
        available: !currentValue,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Error updating availability:", error);
      alert("Error updating availability: " + error.message);
    }
  }

  return (
    <AdminLayout title="Meals Management" subtitle="Menu Control">
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-head">
            <h2>{editingId ? "Edit Meal" : "Add New Meal"}</h2>
          </div>

          <form className="meal-form" onSubmit={handleSubmit}>
            <input
              placeholder="Meal name"
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
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="combo">Combo</option>
              <option value="main">Main Meal</option>
              <option value="paratha">Paratha</option>
              <option value="sides">Sides</option>
              <option value="dessert">Dessert</option>
            </select>

            <input
              placeholder="Emoji 🍱"
              value={form.emoji}
              onChange={(e) => setForm({ ...form, emoji: e.target.value })}
              required
            />

            <input
              placeholder="Ingredients (comma separated)"
              value={form.ingredients}
              onChange={(e) =>
                setForm({ ...form, ingredients: e.target.value })
              }
            />

            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading
                  ? editingId
                    ? "Updating..."
                    : "Adding..."
                  : editingId
                  ? "Update Meal"
                  : "Add Meal"}
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
            <h2>All Meals</h2>
            <span className="count-pill">{meals.length} meals</span>
          </div>

          <div className="meal-list">
            {meals.map((meal) => (
              <div className="meal-row" key={meal.id}>
                <div className="meal-left">
                  <div className="meal-emoji">{meal.emoji}</div>
                  <div>
                    <h4>{meal.name}</h4>
                    <p>
                      {meal.category} • ₹{meal.price}
                    </p>
                  </div>
                </div>

                <div className="meal-actions">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={meal.available ?? true}
                      onChange={() =>
                        toggleAvailability(meal.id, meal.available ?? true)
                      }
                    />
                    <span className="toggle-slider"></span>
                  </label>

                  <span
                    className={
                      meal.available ?? true
                        ? "status-text on"
                        : "status-text off"
                    }
                  >
                    {meal.available ?? true ? "Available" : "Hidden"}
                  </span>

                  <button
                    className="secondary-btn"
                    onClick={() => handleEdit(meal)}
                  >
                    Edit
                  </button>

                  <button
                    className="danger-btn"
                    onClick={() => deleteMeal(meal.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {meals.length === 0 && (
              <div className="empty-state">No meals found.</div>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}