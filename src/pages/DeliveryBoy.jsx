import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";

export default function DeliveryBoy() {
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
        map[`${data.subscriptionId}_${data.mealSlot}`] = {
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
      console.error(error);
      alert("Could not update delivery");
    }
  }

  return (
    <div className="delivery-boy-page">
      <div className="delivery-boy-header">
        <h1>🚚 Delivery Mode</h1>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="delivery-boy-date"
        />
      </div>

      <div className="delivery-boy-list">
        {customers.map((customer) => (
          <div className="delivery-boy-card" key={customer.id}>
            <div className="delivery-boy-top">
              <h3>{customer.customerName}</h3>
              <p>{customer.planName}</p>
            </div>

            <div className="delivery-boy-actions">
              <button
                className={`delivery-btn ${
                  dayMeals[`${customer.id}_lunch`] ? "done" : ""
                }`}
                onClick={() => toggleMeal(customer, "lunch")}
              >
                Lunch {dayMeals[`${customer.id}_lunch`] ? "✔" : ""}
              </button>

              <button
                className={`delivery-btn ${
                  dayMeals[`${customer.id}_dinner`] ? "done" : ""
                }`}
                onClick={() => toggleMeal(customer, "dinner")}
              >
                Dinner {dayMeals[`${customer.id}_dinner`] ? "✔" : ""}
              </button>
            </div>
          </div>
        ))}

        {customers.length === 0 && (
          <div className="delivery-boy-empty">No active subscribers found.</div>
        )}
      </div>
    </div>
  );
}