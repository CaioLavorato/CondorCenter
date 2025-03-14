import { useState } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatCurrency } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CartPage() {
  const [, navigate] = useLocation();
  const { items, updateItemQuantity, total, isLoading, isPending } = useCart();
  const { toast } = useToast();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("creditCard");
  
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/purchases", { 
        paymentMethod: selectedPaymentMethod 
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Compra realizada",
        description: "Sua compra foi processada com sucesso!",
      });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao finalizar compra",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione itens ao carrinho para finalizar a compra",
        variant: "destructive",
      });
      return;
    }
    
    checkoutMutation.mutate();
  };
  
  // Calculate cashback (5% of total)
  const cashbackRate = 0.05;
  const cashbackAmount = total * cashbackRate;
  
  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className="bg-primary px-4 py-4 shadow-sm">
        <div className="flex justify-between items-center">
          <button onClick={() => navigate("/")} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold text-white">Meu Carrinho</h1>
          <div className="w-6"></div>
        </div>
      </header>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <LoadingSpinner />
        </div>
      ) : items.length === 0 ? (
        <div className="p-4">
          <Card className="shadow">
            <CardContent className="p-6 text-center">
              <h3 className="font-medium text-lg mb-2">Seu carrinho está vazio</h3>
              <p className="text-gray-600 mb-4">Adicione produtos escaneando o código de barras</p>
              <Button 
                className="bg-primary" 
                onClick={() => navigate("/scanner")}
              >
                Escanear produtos
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="p-4">
          {/* Cart Items */}
          {items.map((item) => (
            <Card key={item.id} className="mb-4 shadow">
              <CardContent className="p-4">
                <div className="flex">
                  <img 
                    src={item.product.imageUrl || "https://via.placeholder.com/64"} 
                    alt={item.product.name} 
                    className="w-16 h-16 object-cover rounded-lg mr-3"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-primary font-bold">{formatCurrency(item.product.price)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="w-8 h-8 rounded-full"
                      onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                      disabled={isPending}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="w-8 h-8 rounded-full"
                      onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                      disabled={isPending}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Payment Method Selection */}
      {items.length > 0 && (
        <div className="px-4 mb-4">
          <Card className="shadow">
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Método de Pagamento</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="paymentMethod"
                    value="creditCard"
                    checked={selectedPaymentMethod === "creditCard"}
                    onChange={() => setSelectedPaymentMethod("creditCard")}
                    className="h-4 w-4 text-primary"
                  />
                  <span>Cartão de Crédito</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="paymentMethod"
                    value="pix"
                    checked={selectedPaymentMethod === "pix"}
                    onChange={() => setSelectedPaymentMethod("pix")}
                    className="h-4 w-4 text-primary"
                  />
                  <span>PIX</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Cart Summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-xl max-w-md mx-auto mb-16">
        <div className="p-4 border-t border-neutral-200">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span className="text-gray-600">Cashback</span>
            <span className="font-medium text-amber-500">+ {formatCurrency(cashbackAmount)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg mb-4">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <Button 
            className="w-full bg-primary"
            onClick={handleCheckout}
            disabled={items.length === 0 || checkoutMutation.isPending}
          >
            {checkoutMutation.isPending ? (
              <>
                <LoadingSpinner size="small" className="mr-2" />
                Processando...
              </>
            ) : (
              "Finalizar Compra"
            )}
          </Button>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
}
