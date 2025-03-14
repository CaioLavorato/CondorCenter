import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { useLocation } from "wouter";
import { Bell, Home, MessageSquare } from "lucide-react";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import NotificationOverlay from "@/components/notification-overlay";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { Purchase } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function HomePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const { data: purchases = [] } = useQuery<Purchase[]>({
    queryKey: ["/api/purchases"],
  });
  
  const recentPurchases = purchases.slice(0, 2);
  
  // Banner data
  const banners = [
    {
      id: 1,
      imageUrl: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      alt: "Promoção de feriado"
    },
    {
      id: 2,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      alt: "Novos produtos"
    },
    {
      id: 3,
      imageUrl: "https://images.unsplash.com/photo-1582142261284-ada79916042d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      alt: "Produtos em destaque"
    }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white px-4 py-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-sm text-gray-600 font-medium">Olá,</h2>
            <h1 className="text-lg font-bold text-primary">{user?.fullName}</h1>
            <p className="text-xs text-gray-600">{user?.building || "Adicione seu prédio em Perfil"}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              className="relative p-2" 
              onClick={() => setNotificationsOpen(true)}
            >
              <Bell className="h-6 w-6 text-gray-600" />
              {user?.notificationsCount ? (
                <span className="absolute top-0 right-0 bg-amber-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {user.notificationsCount}
                </span>
              ) : null}
            </button>
            <button onClick={() => navigate("/profile")}>
              <Avatar className="w-10 h-10 border-2 border-white shadow">
                <AvatarFallback className="bg-primary text-white">
                  {user?.fullName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
        </div>
      </header>
      
      {/* Banner Carousel */}
      <div className="py-4 px-4">
        <div className="w-full overflow-hidden">
          <div className="flex overflow-x-auto snap-x scrollbar-hide space-x-4 pb-2">
            {banners.map((banner) => (
              <div 
                key={banner.id} 
                className="snap-start shrink-0 w-full h-36 rounded-xl overflow-hidden shadow-md"
              >
                <img 
                  src={banner.imageUrl} 
                  alt={banner.alt} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2 space-x-1">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="px-4 py-2">
        <h2 className="text-lg font-semibold mb-3">Acesso rápido</h2>
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="bg-white rounded-xl shadow h-auto p-4 flex flex-col items-center hover:bg-gray-50"
            onClick={() => navigate("/scanner")}
          >
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <span className="text-gray-700 font-medium">Escanear Produtos</span>
          </Button>
          
          <a 
            href="https://wa.me/5500000000000" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white rounded-xl shadow p-4 flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-2">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <span className="text-gray-700 font-medium">Suporte WhatsApp</span>
          </a>
        </div>
      </div>
      
      {/* Recent Purchases */}
      <div className="px-4 py-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Compras Recentes</h2>
          <a href="#" className="text-primary text-sm font-medium">Ver todas</a>
        </div>
        <div className="space-y-3">
          {recentPurchases.length > 0 ? (
            recentPurchases.map((purchase) => (
              <Card key={purchase.id} className="shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">
                        {format(new Date(purchase.date), "dd/MM/yyyy", { locale: ptBR })}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {/* Normally this would come from purchase items count */}
                        {Math.floor(Math.random() * 5) + 1} itens
                      </p>
                    </div>
                    <span className="font-bold text-lg">{formatCurrency(purchase.total)}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow p-4 text-center text-gray-500">
              <p>Você ainda não fez nenhuma compra</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Cashback Status */}
      <div className="px-4 py-2">
        <div className="bg-gradient-to-r from-primary to-purple-500 rounded-xl shadow p-4 text-white">
          <h2 className="text-lg font-semibold mb-1">Seu Cashback</h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-80">Saldo disponível</p>
              <p className="text-2xl font-bold">{formatCurrency(user?.cashbackBalance || 0)}</p>
            </div>
            <Button 
              className="bg-white text-primary hover:bg-gray-100" 
              disabled={!user?.cashbackBalance}
            >
              Usar
            </Button>
          </div>
        </div>
      </div>
      
      <BottomNavigation />
      <NotificationOverlay 
        isOpen={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />
    </div>
  );
}
