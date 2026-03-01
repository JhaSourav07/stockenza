'use client';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import AppLayout from '../../components/layout/AppLayout';
import OrderStats from '../../app/orders/OrderStats';
import OrderHistoryTable from '../../app/orders/OrderHistoryTable';

export default function OrdersPage() {
  const [inventory, setInventory] = useState([]);
  const [orders,    setOrders]    = useState([]);
  const [loaded,    setLoaded]    = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [invRes, ordRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/orders'),
      ]);
      setInventory(invRes.data);
      setOrders(ordRes.data);
    } catch (e) { console.error(e); }
    finally     { setLoaded(true); }
  };

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
  const todayOrders  = orders.filter((o) => {
    const d = new Date(o.createdAt), n = new Date();
    return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  }).length;

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Orders &amp; Transactions</h1>
        <p className="text-sm text-zinc-600 mt-0.5">
          View your order history — use the{' '}
          <a href="/pos" className="text-indigo-400 hover:underline">Point of Sale</a> page to create new orders.
        </p>
      </div>

      <OrderStats
        orders={orders}
        totalRevenue={totalRevenue}
        todayOrders={todayOrders}
        inventory={inventory}
        loaded={loaded}
      />

      <div className="mt-6">
        <OrderHistoryTable
          orders={orders}
          loaded={loaded}
          totalRevenue={totalRevenue}
          successId={null}
          fmtDate={fmtDate}
        />
      </div>
    </AppLayout>
  );
}