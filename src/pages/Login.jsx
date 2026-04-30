import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, provider, db } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";

const ALLOWED_ADMIN_EMAIL = "harjothari2006@gmail.com";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (loading) return;

    try {
      setLoading(true);

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user) {
        alert("No user returned from login.");
        return;
      }

      if (user.email !== ALLOWED_ADMIN_EMAIL) {
        alert("Access denied.");
        return;
      }

      await setDoc(
        doc(db, "admins", user.uid),
        {
          email: user.email || "harjothari2006@gmail.com",
          name: user.displayName || "Admin",
          email: user.email || "",
          role: "admin",
        },
        { merge: true }
      );

      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-badge">Secure Admin Access</div>
        <h1>Tiffmon Admin</h1>
        <p>Manage meals, orders, users and subscriptions from one dashboard.</p>

        <button className="primary-btn login-btn" onClick={handleLogin}>
          {loading ? "Signing in..." : "Continue with Google"}
        </button>
      </div>
    </div>
  );
}