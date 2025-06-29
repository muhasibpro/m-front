import React, { useEffect, useState } from "react";

function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://93.188.83.2:8088/api/products")
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  return (
    <div>
      <h2>Mahsulotlar ro‘yxati</h2>
      <ul>
        {products.map(pr => (
          <li key={pr._id}>
            <b>{pr.name}</b> - {pr.price} so‘m
            {pr.imgUrl && pr.imgUrl[0] && (
              <div>
                <img src={pr.imgUrl[0]} alt="" width={100} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductList;