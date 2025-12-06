import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useParams } from 'react-router-dom';

export default function Customers() {
  const { tenantId } = useParams();
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/${tenantId}/customers`);
        setCustomers(res.data || []);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch customers (see console)");
      }
    }
    load();
  }, [tenantId]);

  return (
    <div className="container glass-card text-white">
      <h3 className="mb-3">Customers</h3>
      <table className="table table-hover table-striped table-bordered shadow-sm glass-table">
        <thead className="table-dark">
          <tr>
            <th>S.No</th>
            <th>Name</th>
            <th>Email</th>
            <th>Spent</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c, i) => (
            <tr key={c.id || c.shopifyId}>
              <td>{i + 1}</td>
              <td>{(c.firstName || c.first_name || "") + ' ' + (c.lastName || c.last_name || "")}</td>
              <td>{c.email}</td>
              <td>${Number(c.totalSpent || c.total_spent || 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
