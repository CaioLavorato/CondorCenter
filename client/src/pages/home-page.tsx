import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/hooks/use-cart";
import BottomNavigation from "@/components/navigation/bottom-navigation";
import BannerCarousel from "@/components/banner-carousel";
import QuickActionCard from "@/components/quick-action-card";
import RecentPurchaseItem from "@/components/recent-purchase-item";
import { Bell, User } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Order } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { user } = useAuth();
  const { getCartItemsCount } = useCart();
  
  const { data: notifications, isLoading: isLoadingNotifications } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });
  
  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });
  
  const unreadNotifications = notifications?.filter(notif => !notif.isRead).length || 0;
  
  // Banner images (in a real app, these would come from an API)
  const banners = [
    {
      id: 1,
      imageUrl: "https://images.unsplash.com/photo-1628102491629-778571d893a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      title: "Promoção de inauguração",
      description: "10% OFF em compras acima de R$50"
    },
    {
      id: 2,
      imageUrl: "https://images.unsplash.com/photo-1543168256-418811576931?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      title: "Novos produtos",
      description: "Conheça nossa seção de orgânicos"
    },
    {
      id: 3,
      imageUrl: "https://images.unsplash.com/photo-1556742031-c6961e8560b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      title: "Cashback em dobro",
      description: "Em todos os produtos da loja neste final de semana"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="px-4 py-3 flex justify-between items-center">
          <div>
            <p className="text-sm text-neutral-500">Olá,</p>
            <p className="font-semibold">{user?.name || "Visitante"}</p>
            <p className="text-xs text-neutral-500">{user?.building || "Edifício Montanha Azul"}</p>
          </div>
          
          <div className="flex items-center">
            <Link href="/notifications" className="relative p-2 mr-2">
              <Bell className="h-6 w-6 text-neutral-900" />
              {unreadNotifications > 0 && (
                <Badge variant="destructive" className="absolute top-1 right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full">
                  {unreadNotifications}
                </Badge>
              )}
            </Link>
            
            <Link href="/profile" className="relative">
              <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-neutral-500" />
              </div>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-16">
        {/* Banner Carousel */}
        <BannerCarousel banners={banners} />
        
        {/* Quick Actions */}
        <div className="px-4 mb-8">
          <h2 className="text-lg font-semibold mb-4">Compras rápidas</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/scan">
              <QuickActionCard 
                icon="qr_code_scanner" 
                label="Escanear produtos" 
              />
            </Link>
            <Link href="/cart">
              <QuickActionCard 
                icon="shopping_cart" 
                label="Meu carrinho" 
                badge={getCartItemsCount() > 0 ? getCartItemsCount().toString() : undefined}
              />
            </Link>
          </div>
        </div>
        
        {/* Recent Purchases */}
        <div className="px-4 mb-8">
          <h2 className="text-lg font-semibold mb-4">Compras recentes</h2>
          
          {isLoadingOrders ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-3">
              {orders.slice(0, 3).map((order) => (
                <RecentPurchaseItem
                  key={order.id}
                  orderId={order.id}
                  date={new Date(order.createdAt)}
                  total={order.total}
                  itemCount={3} // This would come from actual order items count
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-neutral-500">
              <p>Você ainda não realizou nenhuma compra</p>
            </div>
          )}
        </div>
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation activeItem="home" />
    </div>
  );
}
