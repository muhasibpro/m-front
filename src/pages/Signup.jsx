import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("https://m-backend-byyk.onrender.com/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Kod emailingizga yuborildi!");
        localStorage.setItem("signupEmail", form.email);
        navigate("/verify");
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
      <h2>Ro‘yxatdan o‘tish</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Ism" value={form.name} onChange={handleChange} required />
        <input name="email" placeholder="Email" type="email" value={form.email} onChange={handleChange} required />
        <button type="submit" disabled={loading}>{loading ? "Yuborilmoqda..." : "Tasdiqlash kodini olish"}</button>
      </form>
      <div style={{ color: "red" }}>{msg}</div>
      <div style={{ marginTop: 16 }}>
        <span>Ro‘yxatdan o‘tganmisiz? </span>
        <Link to="/login">Kirish</Link>
      </div>
    </div>
  );
}

export default Signup;