import React, { useState, useEffect } from "react";

// API base url
const API_URL = "http://93.188.83.2:8088/api/products";

// tokenni localStorage yoki props orqali oling (bu misolda localStorage)
const getToken = () => localStorage.getItem("token") || "";

function ProductCRUD() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    color: "",
    limit: "",
    description: "",
    image: null,
  });
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Mahsulotlarni olish
  const fetchProducts = () => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setProducts(data));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Forma inputlari
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Fayl input
  const handleFile = (e) => {
    setForm({
      ...form,
      image: e.target.files[0],
    });
  };

  // Forma submit (qo'shish yoki tahrirlash)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("color", form.color);
      formData.append("limit", form.limit);
      formData.append("description", form.description);

      if (form.image) {
        formData.append("image", form.image);
      }

      let url = API_URL;
      let method = "POST";

      if (editId) {
        url += "/" + editId;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: "Bearer " + getToken(),
        },
        body: formData,
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
      setMessage("Xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // O'chirish
  const handleDelete = async (id) => {
    if (!window.confirm("O‘chirasizmi?")) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(API_URL + "/" + id, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + getToken(),
        },
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setMessage("Mahsulot o‘chirildi");
      fetchProducts();
    } catch (err) {
      setMessage("Xatolik: " + err.message);
    } finally {
      setLoading(false);
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
      image: null, // eski rasm o‘zgarmasa yangi file yuborilmidi
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

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <form onSubmit={handleSubmit}>
        <h2>{editId ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo‘shish"}</h2>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Mahsulot nomi"
          required
        />
        <br />
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Narxi"
          required
        />
        <br />
        <input
          type="text"
          name="color"
          value={form.color}
          onChange={handleChange}
          placeholder="Rangi"
        />
        <br />
        <input
          type="number"
          name="limit"
          value={form.limit}
          onChange={handleChange}
          placeholder="Ombordagi soni"
        />
        <br />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Tavsif"
        />
        <br />
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          /* required={!editId} // tahrirda rasm majburiymas */
        />
        <br />
        <button type="submit" disabled={loading}>
          {loading
            ? "Yuklanmoqda..."
            : editId
            ? "Saqlash"
            : "Qo‘shish"}
        </button>
        {editId && (
          <button type="button" onClick={handleCancel} disabled={loading}>
            Bekor qilish
          </button>
        )}
      </form>
      {message && (
        <p style={{ color: message.startsWith("Xatolik") ? "red" : "green" }}>
          {message}
        </p>
      )}
      <hr />
      <h2>Mahsulotlar</h2>
      <table border={1} cellPadding={8} width="100%">
        <thead>
          <tr>
            <th>Rasm</th>
            <th>Nomi</th>
            <th>Narxi</th>
            <th>Rangi</th>
            <th>Ombor</th>
            <th>Tavsif</th>
            <th>Amallar</th>
          </tr>
        </thead>
        <tbody>
          {products.map((pr) => (
            <tr key={pr._id}>
              <td>
                {pr.imgUrl && pr.imgUrl[0] && (
                  <img
                    src={pr.imgUrl[0]}
                    alt={pr.name}
                    width={60}
                    style={{ objectFit: "cover" }}
                  />
                )}
              </td>
              <td>{pr.name}</td>
              <td>{pr.price}</td>
              <td>{pr.color}</td>
              <td>{pr.limit}</td>
              <td>{pr.description}</td>
              <td>
                <button onClick={() => handleEdit(pr)} disabled={loading}>
                  Tahrirlash
                </button>{" "}
                <button
                  onClick={() => handleDelete(pr._id)}
                  disabled={loading}
                  style={{ color: "red" }}
                >
                  O‘chirish
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductCRUD;