export default function NotificationPopup({ order }) {
  if (!order) return null;

  return (
    <div className="order-notification">
      <div className="notification-icon">🔔</div>

      <div>
        <strong>New Order Received</strong>
        <p>
          {order.customerName} · ₹{order.total}
        </p>
      </div>
    </div>
  );
}