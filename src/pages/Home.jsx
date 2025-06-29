import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// JWT token decoding uchun funksiya
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

const API_URL = "https://m-backend-byyk.onrender.com/api/products";

// Remote serverga (http://93.188.83.2:8088/greenleaf/gg/uploads/) rasm yuklash funktsiyasi
async function uploadRemoteImage(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const resp = await fetch("https://muhasib.pro/uploads/", {
      method: "POST",
      body: formData,
    });
    if (!resp.ok) {
      const text = await resp.text();
      console.error("Remote upload error:", resp.status, text);
      throw new Error("Remote upload failed: " + resp.status);
    }
    const data = await resp.json();
    console.log("Remote upload javobi:", data);
    return data.url || ("https://muhasib.pro/uploads/" + data.filename);
  } catch (err) {
    console.error("uploadRemoteImage xatolik:", err);
    throw err;
  }
}

function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // CRUD uchun state
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    color: "",
    limit: "",
    description: "",
    image: null,
  });
  const [editId, setEditId] = useState(null);

  // Foydalanuvchini olish va token yo'q bo'lsa login pagega redirect qilish
  useEffect(() => {
    if (!user?.token) {
      navigate("/login");
      return;
    }
    const decoded = parseJwt(user.token);
    if (!decoded?.userId) {
      logout();
      navigate("/login");
      return;
    }

    fetch(`https://m-backend-byyk.onrender.com/api/users/user/${decoded.userId}`, {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    })
      .then(res => {
        if (res.status === 401) throw new Error("Token xato yoki muddati o'tgan.");
        return res.json();
      })
      .then(data => {
        setUserInfo(data);
        setLoading(false);
      })
      .catch(() => {
        setUserInfo(null);
        setLoading(false);
        logout();
        navigate("/login");
      });
    // eslint-disable-next-line
  }, [user, logout, navigate]);

  // Productlarni olish
  const fetchProducts = () => {
    setLoadingProducts(true);
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setProducts(data))
      .finally(() => setLoadingProducts(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Forma inputlari
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Fayl input
  const handleFile = (e) => {
    setForm({ ...form, image: e.target.files[0] });
  };

  // Qo‘shish yoki tahrirlash
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      let imgUrlArr = [];
      if (form.image) {
        const remoteUrl = await uploadRemoteImage(form.image); // remote serverga yuklash
        imgUrlArr.push(remoteUrl);
      }

      const payload = {
        name: form.name,
        price: form.price,
        color: form.color,
        limit: form.limit,
        description: form.description,
        imgUrl: imgUrlArr,
      };

      let url = API_URL;
      let method = "POST";
      if (editId) {
        url += "/" + editId;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + user.token,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error((await res.json()).message);
      setMessage(editId ? "Mahsulot tahrirlandi" : "Mahsulot qo‘shildi");
      setForm({
        name: "",
        price: "",
        color: "",
        limit: "",
        description: "",
        image: null,
      });
      setEditId(null);
      fetchProducts();
    } catch (err) {
      setMessage("Xatolik 400$ berdi: " + err.message);
    }
  };

  // O'chirish
  const handleDelete = async (id) => {
    if (!window.confirm("O‘chirasizmi?")) return;
    setMessage("");
    try {
      const res = await fetch(API_URL + "/" + id, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + user.token,
        },
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setMessage("Mahsulot o‘chirildi");
      fetchProducts();
    } catch (err) {
      setMessage("Xatolik: " + err.message);
    }
  };

  // Tahrirlash uchun formani to‘ldirish
  const handleEdit = (product) => {
    setEditId(product._id);
    setForm({
      name: product.name,
      price: product.price,
      color: product.color,
      limit: product.limit,
      description: product.description,
      image: null,
    });
    window.scrollTo(0, 0);
  };

  // Forma cancel
  const handleCancel = () => {
    setEditId(null);
    setForm({
      name: "",
      price: "",
      color: "",
      limit: "",
      description: "",
      image: null,
    });
    setMessage("");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) return <div>Yuklanmoqda...</div>;
  if (!userInfo) return <div>Foydalanuvchi ma’lumotlari topilmadi</div>;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <h2>Home Page</h2>
      {userInfo.role === 99 ? (
        <div>
          <div style={{ color: "red" }}>Siz admin siz</div>
        </div>
      ) : (
        <div>Siz usersiz</div>
      )}
      <div>
        <b>Ism:</b> {userInfo.name} <br />
        <b>Email:</b> {userInfo.email}
      </div>
      <button onClick={handleLogout} style={{ marginBottom: 30 }}>Chiqish</button>

      {/* Mahsulot qo'shish/tahrirlash forma */}
      {userInfo.role === 99 && (
        <div style={{ marginTop: 40 }}>
          <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
            <h3>{editId ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo‘shish"}</h3>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Mahsulot nomi"
              required
            /><br />
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Narxi"
              required
            /><br />
            <input
              type="text"
              name="color"
              value={form.color}
              onChange={handleChange}
              placeholder="Rangi"
            /><br />
            <input
              type="number"
              name="limit"
              value={form.limit}
              onChange={handleChange}
              placeholder="Ombordagi soni"
            /><br />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Tavsif"
            /><br />
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
            /><br />
            <button type="submit">
              {editId ? "Saqlash" : "Qo‘shish"}
            </button>
            {editId && (
              <button type="button" onClick={handleCancel}>Bekor qilish</button>
            )}
          </form>
          {message && (
            <p style={{ color: message.startsWith("Xatolik") ? "red" : "green" }}>
              {message}
            </p>
          )}
        </div>
      )}

      {/* Mahsulotlar card ko‘rinishda */}
      <h2 style={{ marginTop: 40, marginBottom: 20 }}>Mahsulotlar</h2>
      {loadingProducts ? (
        <div>Mahsulotlar yuklanmoqda...</div>
      ) : (
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "24px"
        }}>
          {products.length === 0 && <div>Mahsulot topilmadi</div>}
          {products.map(pr => (
            <div
              key={pr._id}
              style={{
                width: 250,
                border: "1px solid #e0e0e0",
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                padding: 16,
                background: "#fff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative"
              }}
            >
              {pr.imgUrl && pr.imgUrl[0] ? (
                <img
                  src={pr.imgUrl[0]}
                  alt={pr.name}
                  style={{
                    width: 150,
                    height: 150,
                    objectFit: "cover",
                    borderRadius: 8,
                    marginBottom: 10,
                    background: "#fafafa"
                  }}
                />
              ) : (
                <div style={{
                  width: 150,
                  height: 150,
                  borderRadius: 8,
                  background: "#f3f3f3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#aaa",
                  marginBottom: 10
                }} >No Image</div>
              )}
              <h3 style={{ margin: "10px 0 4px 0", fontSize: 20 }}>{pr.name}</h3>
              <div style={{ fontWeight: "bold", color: "#098", marginBottom: 8 }}>{pr.price} so'm</div>
              <div style={{ color: "#555" }}>
                <b>Rang:</b> {pr.color || "-"}
              </div>
              <div style={{ color: "#555" }}>
                <b>Ombor:</b> {pr.limit || 0}
              </div>
              <div style={{
                fontSize: 14,
                color: "#666",
                marginTop: 10,
                textAlign: "center"
              }}>
                {pr.description || "-"}
              </div>
              {/* Faqat admin uchun tahrirlash va o'chirish */}
              {userInfo.role === 99 && (
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <button onClick={() => handleEdit(pr)}>Tahrirlash</button>
                  <button
                    onClick={() => handleDelete(pr._id)}
                    style={{ color: "red" }}
                  >
                    O‘chirish
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;