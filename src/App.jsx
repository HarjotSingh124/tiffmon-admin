import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Meals from "./pages/Meals";
import Orders from "./pages/Orders";
import Subscriptions from "./pages/Subscriptions";
import SubscriptionCustomers from "./pages/SubscriptionCustomers";
import DailyDelivery from "./pages/DailyDelivery";
import DeliveryBoy from "./pages/DeliveryBoy";

export default function App() {
  return (
    <Routes>
      <Route path="/subscriptions" element={<Subscriptions />} />
      <Route path="/subscription-customers" element={<SubscriptionCustomers />} />
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/meals" element={<Meals />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/delivery" element={<DailyDelivery />} />
      <Route path="/delivery-boy" element={<DeliveryBoy />} />
    </Routes>
  );
}