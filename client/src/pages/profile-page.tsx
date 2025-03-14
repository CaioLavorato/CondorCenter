import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, CreditCard, LogOut, Settings, User, ShoppingBag, DollarSign } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useQuery } from "@tanstack/react-query";
import { Purchase } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

export default function ProfilePage() {
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const { data: purchaseCount = 0 } = useQuery<number>({
    queryKey: ["/api/purchases/count"],
    queryFn: async () => {
      const res = await fetch("/api/purchases");
      const data = await res.json() as Purchase[];
      return data.length;
    }
  });
  
  const handleLogout = () => {
    if (confirm("Tem certeza que deseja sair?")) {
      logoutMutation.mutate();
    }
  };

  if (!user) {
    return <LoadingSpinner fullScreen />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-primary px-4 py-4 shadow-sm">
        <div className="flex justify-between items-center">
          <button onClick={() => navigate("/")} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold text-white">Meu Perfil</h1>
          <div className="w-6"></div>
        </div>
      </header>
      
      {/* Profile Info */}
      <div className="p-4">
        <div className="bg-white rounded-xl shadow p-4 mb-4 flex items-center">
          <Avatar className="w-16 h-16 mr-4">
            <AvatarFallback className="bg-primary text-white text-xl">
              {user.fullName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold text-lg">{user.fullName}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
      </div>
      
      {/* Profile Stats */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-xl shadow p-4 grid grid-cols-2 gap-4">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-primary">{purchaseCount}</h3>
            <p className="text-gray-600 text-sm">Compras feitas</p>
          </div>
          <div className="text-center">
            <h3 className="text-3xl font-bold text-amber-500">{formatCurrency(user.cashbackBalance)}</h3>
            <p className="text-gray-600 text-sm">Cashback disponível</p>
          </div>
        </div>
      </div>
      
      {/* Profile Menu */}
      <div className="px-4 pb-20">
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <User className="h-5 w-5 text-primary mr-3" />
              <span>Editar Dados Pessoais</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
          
          <button 
            className="w-full flex items-center justify-between p-4 border-b border-gray-200"
            onClick={() => navigate("/profile/payment-methods")}
          >
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-primary mr-3" />
              <span>Métodos de Pagamento</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
          
          <button className="w-full flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <ShoppingBag className="h-5 w-5 text-primary mr-3" />
              <span>Histórico de Compras</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
          
          <button className="w-full flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-primary mr-3" />
              <span>Meu Cashback</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
          
          <button className="w-full flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <Settings className="h-5 w-5 text-primary mr-3" />
              <span>Configurações</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
          
          <Button 
            variant="ghost"
            className="w-full flex items-center justify-between p-4 rounded-none"
            onClick={handleLogout}
          >
            <div className="flex items-center">
              <LogOut className="h-5 w-5 text-red-600 mr-3" />
              <span className="text-red-600">Sair</span>
            </div>
            {logoutMutation.isPending && <LoadingSpinner size="small" />}
          </Button>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
}
