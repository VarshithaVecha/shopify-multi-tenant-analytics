import React, { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import TopStatsCard from "../components/TopStatsCard";
import { useParams } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const { tenantId } = useParams();
  const [overview, setOverview] = useState({
    customers: 0,
    orders: 0,
    revenue: 0,
  });
  const [ordersByDate, setOrdersByDate] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const chartOptions = {
    plugins: {
      legend: {
        labels: {
          color: "white", // legend text color
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "white", // X-axis label color
        },
        grid: {
          color: "rgba(255,255,255,0.2)", // optional soft grid lines
        },
      },
      y: {
        ticks: {
          color: "white", // Y-axis label color
        },
        grid: {
          color: "rgba(255,255,255,0.2)",
        },
      },
    },
  };

  const loadData = useCallback(async () => {
    try {
      const r1 = await api.get(`/${tenantId}/overview`);
      setOverview(r1.data);
    } catch (err) {
      console.error(err);
    }

    try {
      const from = new Date();
      from.setDate(from.getDate() - 30);
      const to = new Date();
      const r2 = await api.get(
        `/${tenantId}/revenue?from=${from.toISOString().slice(0, 10)}&to=${to
          .toISOString()
          .slice(0, 10)}`
      );
      setOrdersByDate(
        (r2.data || []).map((d) => ({
          date: d.date,
          revenue: Number(d.revenue || 0),
        }))
      );
    } catch (err) {
      console.error(err);
    }

    try {
      const r3 = await api.get(`/${tenantId}/top-customers?limit=5`);
      setTopCustomers(
        (r3.data || []).map((c) => ({
          id: c.id,
          name: c.name,
          total: Number(c.total || 0),
        }))
      );
    } catch (err) {
      console.error(err);
    }
  }, [tenantId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "orders_updated") loadData();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [loadData]);

  const chartData = {
    labels: ordersByDate.map((o) => o.date),
    datasets: [
      {
        label: "Revenue",
        data: ordersByDate.map((o) => o.revenue),
        fill: false,
        borderColor: "white",
        pointBorderColor: "yellow",
        pointBackgroundColor: "white",
        pointHoverRadius: 6,
        pointRadius: 4,
        tension : 0.3,
      },
    ],
  };

  return (
    <div className="container text-white">
      <h3 className="mb-4">Tenant: {tenantId} — Dashboard</h3>
      <div className="row mb-4">
        <TopStatsCard title="Customers" value={overview.customers} />
        <TopStatsCard title="Orders" value={overview.orders} />
        <TopStatsCard
          title="Revenue"
          value={Number(overview.revenue || 0).toFixed(2)}
        />
      </div>

      <div className="glass-card mb-4 p-3 shadow-sm">
        <h5>Revenue Last 30 Days</h5>
        <Line data={chartData} options={chartOptions}/>
      </div>

      <div className="glass-card p-3 shadow-sm">
        <h5>Top 5 Customers</h5>
        <ul className="list-group">
          {topCustomers.length === 0 ? (
            <li className="list-group-item">No customers yet</li>
          ) : (
            topCustomers.map((c) => (
              <li
                className="list-group-item d-flex justify-content-between"
                key={c.id}
              >
                <span>{c.name}</span>
                <span>₹{c.total.toFixed(2)}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
