
import { useEffect, useState } from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem } from '../ui/sidebar';
import { LineChart, BarChart, PieChart } from './Charts';

export default function DashboardLayout() {
  const [sales, setSales] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const response = await fetch('/api/dashboard/stats');
    const data = await response.json();
    setSales(data.sales);
    setTotalRevenue(data.totalRevenue);
    setTotalOrders(data.totalOrders);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar>
        <SidebarHeader className="p-4">
          <h2 className="text-xl font-bold">Admin Dashboard</h2>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>Vendas</SidebarMenuItem>
            <SidebarMenuItem>Produtos</SidebarMenuItem>
            <SidebarMenuItem>Clientes</SidebarMenuItem>
            <SidebarMenuItem>Relatórios</SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Receita Total</h3>
            <p className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Pedidos</h3>
            <p className="text-2xl font-bold">{totalOrders}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Média por Pedido</h3>
            <p className="text-2xl font-bold">
              R$ {totalOrders ? (totalRevenue / totalOrders).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Vendas por Período</h3>
            <LineChart data={sales} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Produtos Mais Vendidos</h3>
            <BarChart data={sales} />
          </div>
        </div>
      </main>
    </div>
  );
}
