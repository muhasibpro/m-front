import React, { useState } from "react";

function ProductForm({ token }) {
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    color: "",
    limit: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Inputlarni boshqarish
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Fayl input
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Formani yuborish
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("color", form.color);
      formData.append("limit", form.limit);
      formData.append("description", form.description);
      if (file) {
        formData.append("image", file); // "image" nomi backendga mos
      }

      const response = await fetch("http://93.188.83.2:8088/api/products", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + token
          // Content-Type yozmang!
        },
        body: formData
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Xatolik yuz berdi");
      }

      const data = await response.json();
      setMessage("Mahsulot muvaffaqiyatli qo‘shildi!");
      setForm({ name: "", price: "", color: "", limit: "", description: "" });
      setFile(null);
    } catch (error) {
      setMessage("Xatolik: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "0 auto" }}>
      <h2>Yangi mahsulot qo‘shish</h2>
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
        onChange={handleFileChange}
        required
      /><br /><br />
      <button type="submit" disabled={loading}>
        {loading ? "Yuklanmoqda..." : "Qo‘shish"}
      </button>
      <br />
      <span style={{ color: message.startsWith("Xatolik") ? "red" : "green" }}>{message}</span>
    </form>
  );
}

export default ProductForm;