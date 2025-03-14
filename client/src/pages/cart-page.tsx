import { useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import BottomNavigation from "@/components/navigation/bottom-navigation";
import CartItem from "@/components/cart/cart-item";
import OrderSummary from "@/components/cart/order-summary";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const [, navigate] = useLocation();
  const { cartItems, loading, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      return;
    }
    navigate("/checkout");
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-neutral-200 p-4 flex items-center">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Meu carrinho</h1>
      </header>
      
      <main className="flex-1 p-4 pb-20">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Seu carrinho está vazio</h3>
            <p className="text-neutral-500 mb-6">Adicione produtos para começar suas compras</p>
            <Button onClick={() => navigate("/scan")}>
              Escanear produtos
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  product={item.product}
                  quantity={item.quantity}
                  onRemove={() => removeFromCart(item.id)}
                  onQuantityChange={(newQuantity) => updateQuantity(item.id, newQuantity)}
                />
              ))}
            </div>
            
            <Separator className="my-6" />
            
            {/* Order Summary */}
            <OrderSummary
              subtotal={cartTotal}
              cashbackRate={0.05}
              showCheckoutButton={false}
            />
            
            <Button 
              className="w-full mt-6" 
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
            >
              Finalizar compra
            </Button>
          </>
        )}
      </main>
      
      <BottomNavigation activeItem="cart" />
    </div>
  );
}
