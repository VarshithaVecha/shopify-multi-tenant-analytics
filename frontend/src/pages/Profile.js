import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useParams } from "react-router-dom";

export default function Profile() {
  const { tenantId } = useParams();
  const [email, setEmail] = useState("");
  const [shopifyStore, setShopifyStore] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/auth/me/${tenantId}`);
        setEmail(res.data.email);
        setShopifyStore(res.data.shopifyStore);
      } catch (err) {
        console.error(err);
        alert("Failed to load profile");
      }
    }
    load();
  }, [tenantId]);

  async function updateProfile() {
    try {
      await api.put(`/auth/me/${tenantId}`, { email, shopifyStore, password });
      alert("Profile updated!");
    } catch (err) {
      console.error(err);
      alert("Update failed!");
    }
  }

  return (
    <div className="container glass-card text-white mt-5">
      <h3>My Profile</h3>

      <div className="glass-card p-4 shadow-sm mt-3 text-black">
        <label>Update Email</label>
        <input
          className="form-control mb-3 glass-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Update Shopify Store name</label>
        <input
          className="form-control mb-3 glass-input"
          value={shopifyStore}
          onChange={(e) => setShopifyStore(e.target.value)}
        />

        <label>New Password</label>
        <input
          className="form-control mb-3 glass-input"
          type="password"
          placeholder="Leave empty to keep same"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn btn-primary" onClick={updateProfile}>
          Update Profile
        </button>
      </div>
    </div>
  );
}
