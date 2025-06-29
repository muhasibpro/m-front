import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Verify() {
  const [form, setForm] = useState({ code: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const email = localStorage.getItem("signupEmail") || "";

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("https://m-backend-byyk.onrender.com/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...form })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Ro‘yxatdan o‘tish muvaffaqiyatli!");
        localStorage.removeItem("signupEmail");
        navigate("/login");
      } else {
        setMsg(data.message);
      }
    } catch (err) {
      setMsg("Xatolik: " + err.message);
    }
    setLoading(false);
  };

  if (!email) {
    return <div>Email topilmadi. <a href="/signup">Signup</a></div>;
  }

  return (
    <div>
      <h2>Kodni tasdiqlash</h2>
      <form onSubmit={handleSubmit}>
        <input name="code" placeholder="Tasdiqlash kodi" value={form.code} onChange={handleChange} required />
        <input name="password" placeholder="Yangi parol" type="password" value={form.password} onChange={handleChange} required />
        <button type="submit" disabled={loading}>{loading ? "Yuborilmoqda..." : "Tasdiqlash"}</button>
      </form>
      <div style={{ color: "red" }}>{msg}</div>
    </div>
  );
}

export default Verify;