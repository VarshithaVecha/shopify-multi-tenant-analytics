import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function NavBar() {
  const token = localStorage.getItem("token");
  const tenantId = localStorage.getItem("tenantId");
  const nav = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tenantId");
    nav("/login");
  };

  if (!token || !tenantId) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm mb-4">
      <div className="container">

        {/* Brand */}
        <Link className="navbar-brand" to={`/dashboard/${tenantId}`}>
          Shopify Insights
        </Link>

        {/* Hamburger Button */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Links */}
        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
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

          {/* Profile + Logout */}
          <div className="d-flex align-items-center gap-3 text-white">
            <Link className="nav-link" to={`/profile/${tenantId}`}>
              Profile
            </Link>

            <button
              className="btn btn-outline-light btn-sm"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
