import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("https://m-backend-byyk.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        login({ token: data.token, role: data.role });
        navigate("/");
      } else {
        setMsg(data.message);
      }
    } catch (err) {
      setMsg("Xatolik: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Kirish</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" placeholder="Email" type="email" value={form.email} onChange={handleChange} required />
        <input name="password" placeholder="Parol" type="password" value={form.password} onChange={handleChange} required />
        <button type="submit" disabled={loading}>{loading ? "Tekshirilmoqda..." : "Kirish"}</button>
      </form>
      <div style={{ color: "red" }}>{msg}</div>
      <div style={{ marginTop: 16 }}>
        <span>Ro‘yxatdan o‘tmaganmisiz? </span>
        <Link to="/signup">Ro‘yxatdan o‘tish</Link>
      </div>
    </div>
  );
}

export default Login;