import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useParams } from "react-router-dom";

// Updated OrderRow with Delete button
function OrderRow({ o, onDelete }) {
  return (
    <tr>
      <td>{o.id}</td>
      <td>
        {o.customer?.firstName
          ? `${o.customer.firstName} ${o.customer.lastName}`
          : o.customer?.email || "—"}
      </td>
      <td>${Number(o.totalPrice || 0).toFixed(2)}</td>
      <td>
        <span
          className={`badge bg-${
            o.status === "Completed"
              ? "success"
              : o.status === "Cancelled"
              ? "danger"
              : "warning"
          }`}
        >
          {o.status}
        </span>
      </td>
      <td>{o.createdAt ? new Date(o.createdAt).toLocaleString() : "—"}</td>
      <td>
        <button
          className="btn btn-sm btn-danger"
          onClick={() => onDelete(o.id)}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

export default function Orders() {
  const { tenantId } = useParams();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  // modal
  const [showModal, setShowModal] = useState(false);
  const [selCustomer, setSelCustomer] = useState("");
  const [orderItems, setOrderItems] = useState([
    { productId: "", quantity: 1 },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [oRes, cRes, pRes] = await Promise.all([
          api.get(`/${tenantId}/orders`),
          api.get(`/${tenantId}/customers`),
          api.get(`/${tenantId}/products`),
        ]);
        setOrders(oRes.data || []);
        setCustomers(cRes.data || []);
        setProducts(pRes.data || []);
      } catch (error) {
        console.error("loadData error:", error);
        alert("Failed to load. Check backend (see console).");
      }
    }
    loadData();
  }, [tenantId]);

  const addItemRow = () =>
    setOrderItems((prev) => [...prev, { productId: "", quantity: 1 }]);

  const removeItemRow = (idx) =>
    setOrderItems((prev) => prev.filter((_, i) => i !== idx));

  const updateItem = (idx, key, val) =>
    setOrderItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [key]: val } : it))
    );

  const computeTotal = () => {
    let total = 0;
    for (let it of orderItems) {
      const prod = products.find((p) => p.id === Number(it.productId));
      if (prod) total += Number(prod.price || 0) * Number(it.quantity || 0);
    }
    return total.toFixed(2);
  };

  const submitOrder = async () => {
    if (!selCustomer) return alert("Select a customer");
    if (orderItems.some((it) => !it.productId)) return alert("Select products");

    setLoading(true);
    try {
      const payload = {
        customerId: Number(selCustomer),
        items: orderItems.map((it) => ({
          productId: Number(it.productId),
          quantity: Number(it.quantity),
        })),
      };

      const res = await api.post(`/${tenantId}/orders`, payload);
      setOrders((prev) => [res.data, ...prev]);
      localStorage.setItem("orders_updated", Date.now().toString());

      setShowModal(false);
      setSelCustomer("");
      setOrderItems([{ productId: "", quantity: 1 }]);
    } catch (err) {
      console.error("create order err:", err);
      alert(err.response?.data?.error || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  // DELETE order function
  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      const token = localStorage.getItem("token");
      console.log("TOKEN:", token);
      await api.delete(`/${tenantId}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      window.localStorage.setItem("orders_updated", Date.now().toString());
    } catch (err) {
      console.error("deleteOrder error:", err);
      alert(err.response?.data?.error || "Failed to delete order");
    }
  };

  return (
    <div className="container glass-card mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3 text-white">
        <h3>Orders</h3>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowModal(true);
          }}
        >
          Create Order
        </button>
      </div>

      <div className="table-responsive shadow-sm">
        <table className="table table-striped table-bordered align-middle glass-table">
          <thead className="table-dark">
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center">
                  No orders found
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <OrderRow key={o.id} o={o} onDelete={deleteOrder} />
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ height: "100vh" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header glass-card">
                <h5>Create Order</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                <label className="form-label">Customer</label>
                <select
                  className="form-select mb-3"
                  value={selCustomer}
                  onChange={(e) => setSelCustomer(e.target.value)}
                >
                  <option value="">Select customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName || c.first_name} {c.lastName || c.last_name}{" "}
                      — {c.email}
                    </option>
                  ))}
                </select>

                <h6>Items</h6>
                {orderItems.map((it, idx) => (
                  <div className="row g-2 mb-2" key={idx}>
                    <div className="col-md-7">
                      <select
                        className="form-select"
                        value={it.productId}
                        onChange={(e) =>
                          updateItem(idx, "productId", e.target.value)
                        }
                      >
                        <option value="">Select product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title} — ${p.price} ({p.inventory} stock)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        value={it.quantity}
                        onChange={(e) =>
                          updateItem(idx, "quantity", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-md-2">
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => removeItemRow(idx)}
                        disabled={orderItems.length === 1}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button className="btn btn-link" onClick={addItemRow}>
                  + Add Item
                </button>
                <div className="mt-3 fs-5">
                  <strong>Total:</strong> ${computeTotal()}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  disabled={loading}
                  onClick={submitOrder}
                >
                  {loading ? "Creating..." : "Create Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
