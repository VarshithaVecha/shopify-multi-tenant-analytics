import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useParams } from "react-router-dom";

export default function Products() {
  const { tenantId } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/${tenantId}/products`);
        setProducts(res.data || []);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch products (see console)");
      }
    }
    load();
  }, [tenantId]);

  return (
    <div className="container glass-card text-white">
      <h3 className="mb-3">Products</h3>
      <button
        className="btn btn-primary mb-3"
        onClick={async () => {
          try {
            await api.post(`/${tenantId}/products/dummy`);
            alert("Dummy products added!");
            window.location.reload();
          } catch (err) {
            console.error(err);
            alert("Failed to add dummy products");
          }
        }}
      >
        Create Dummy Products
      </button>

      <table className="table table-hover table-striped table-bordered shadow-sm glass-table">
        <thead className="table-dark">
          <tr>
            <th>S.No</th>
            <th>Title</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr key={p.id || p.shopifyId}>
              <td>{i + 1}</td>
              <td>{p.title}</td>
              <td>${p.price ?? p.variants?.[0]?.price ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
