import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function NavBar() {
  const token = localStorage.getItem("token");
  const tenantId = localStorage.getItem("tenantId"); // 👈 get current tenant
  const nav = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tenantId"); // 👈 clear tenant on logout
    nav("/login");
  };

  if (!token) return null; // Hide NavBar if not logged in

  // Safety: if somehow tenantId is missing, fall back to login
  if (!tenantId) {
    return null;
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow-sm">
      <div className="container">
        <Link className="navbar-brand" to={`/dashboard/${tenantId}`}>
          Shopify Insights
        </Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to={`/dashboard/${tenantId}`}>
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={`/orders/${tenantId}`}>
                Orders
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={`/customers/${tenantId}`}>
                Customers
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={`/products/${tenantId}`}>
                Products
              </Link>
            </li>
          </ul>
          <div className="d-flex align-items-center gap-3 text-white">
            <li className="nav-item" style={{ listStyle: "none" }}>
              <Link
                className="nav-link"
                to={`/profile/${localStorage.getItem("tenantId")}`}
              >
                Profile
              </Link>
            </li>
            <button className="btn btn-outline-light btn-sm" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
