import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CartItem, Product } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

interface CartItemWithProduct extends CartItem {
  product: Product;
}

interface CartContextType {
  items: CartItemWithProduct[];
  isLoading: boolean;
  addItem: (productId: number, quantity?: number) => void;
  updateItemQuantity: (itemId: number, quantity: number) => void;
  removeItem: (itemId: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isPending: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { data: items = [], isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });
  
  const addItemMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: number; quantity: number }) => {
      const res = await apiRequest("POST", "/api/cart", { productId, quantity });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item adicionado",
        description: "Item adicionado ao carrinho",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Erro ao adicionar item: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      const res = await apiRequest("PUT", `/api/cart/${itemId}`, { quantity });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar item: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiRequest("DELETE", `/api/cart/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removido",
        description: "Item removido do carrinho",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Erro ao remover item: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/cart");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Carrinho limpo",
        description: "Todos os itens foram removidos do carrinho",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Erro ao limpar carrinho: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  
  const addItem = (productId: number, quantity = 1) => {
    addItemMutation.mutate({ productId, quantity });
  };
  
  const updateItemQuantity = (itemId: number, quantity: number) => {
    updateItemMutation.mutate({ itemId, quantity });
  };
  
  const removeItem = (itemId: number) => {
    removeItemMutation.mutate(itemId);
  };
  
  const clearCart = () => {
    clearCartMutation.mutate();
  };
  
  const isPending = 
    addItemMutation.isPending || 
    updateItemMutation.isPending || 
    removeItemMutation.isPending || 
    clearCartMutation.isPending;
  
  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        addItem,
        updateItemQuantity,
        removeItem,
        clearCart,
        total,
        itemCount,
        isPending,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
