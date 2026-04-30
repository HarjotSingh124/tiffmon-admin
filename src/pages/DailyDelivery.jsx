import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import AdminLayout from "../components/AdminLayout";

export default function DailyDelivery() {
  const [customers, setCustomers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dayMeals, setDayMeals] = useState({});

  useEffect(() => {
    const q = query(
      collection(db, "customerSubscriptions"),
      where("subscriptionStatus", "==", "active")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setCustomers(data);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "subscriptionMealHistory"),
      where("mealDate", "==", selectedDate)
    );

    const unsub = onSnapshot(q, (snap) => {
      const map = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        const key = `${data.subscriptionId}_${data.mealSlot}`;
        map[key] = {
          docId: d.id,
          ...data,
        };
      });
      setDayMeals(map);
    });

    return () => unsub();
  }, [selectedDate]);

  async function toggleMeal(customer, slot) {
    const key = `${customer.id}_${slot}`;
    const existing = dayMeals[key];

    try {
      if (existing) {
        await deleteDoc(doc(db, "subscriptionMealHistory", existing.docId));

        await updateDoc(doc(db, "customerSubscriptions", customer.id), {
          mealsTaken: Math.max((customer.mealsTaken || 0) - 1, 0),
          updatedAt: Date.now(),
        });
      } else {
        await addDoc(collection(db, "subscriptionMealHistory"), {
          subscriptionId: customer.id,
          customerName: customer.customerName,
          planName: customer.planName,
          mealDate: selectedDate,
          mealSlot: slot,
          createdAt: Date.now(),
        });

        await updateDoc(doc(db, "customerSubscriptions", customer.id), {
          mealsTaken: (customer.mealsTaken || 0) + 1,
          updatedAt: Date.now(),
        });
      }
    } catch (error) {
      console.error("Meal toggle error:", error);
      alert("Could not update meal: " + error.message);
    }
  }

  return (
    <AdminLayout title="Daily Delivery" subtitle="Mark meals by date">
      <section className="panel" style={{ marginBottom: "18px" }}>
        <div className="panel-head">
          <h2>Delivery Controls</h2>
        </div>

        <div className="delivery-toolbar">
          <div className="delivery-date-box">
            <label>Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="sheet-select"
            />
          </div>
        </div>
      </section>

      <div className="sheet-wrap">
        <table className="subscribers-sheet">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Plan</th>
              <th>Lunch</th>
              <th>Dinner</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.customerName}</td>
                <td>{c.planName}</td>

                <td>
                  <input
                    type="checkbox"
                    checked={!!dayMeals[`${c.id}_lunch`]}
                    onChange={() => toggleMeal(c, "lunch")}
                  />
                </td>

                <td>
                  <input
                    type="checkbox"
                    checked={!!dayMeals[`${c.id}_dinner`]}
                    onChange={() => toggleMeal(c, "dinner")}
                  />
                </td>
              </tr>
            ))}

            {customers.length === 0 && (
              <tr>
                <td colSpan="4">No active subscribers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}