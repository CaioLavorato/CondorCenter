import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PaymentMethod } from "@shared/schema";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, CreditCard, MoreVertical, ChevronsUpDown, Check, ArrowUpRight } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const creditCardSchema = z.object({
  type: z.literal("creditCard"),
  cardNumber: z.string().min(16, "Número de cartão inválido").max(19),
  cardholderName: z.string().min(3, "Nome inválido"),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Formato inválido (MM/YY)"),
  brand: z.string().min(1, "Selecione a bandeira"),
  isPreferred: z.boolean().default(false),
});

type CreditCardFormValues = z.infer<typeof creditCardSchema>;

export default function PaymentMethodsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);

  const { data: paymentMethods = [], isLoading } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/payment-methods"],
  });

  const form = useForm<CreditCardFormValues>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      type: "creditCard",
      cardNumber: "",
      cardholderName: "",
      expiryDate: "",
      brand: "",
      isPreferred: false,
    },
  });

  const addCardMutation = useMutation({
    mutationFn: async (data: CreditCardFormValues) => {
      const res = await apiRequest("POST", "/api/payment-methods", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      setAddCardOpen(false);
      form.reset();
      toast({
        title: "Cartão adicionado",
        description: "Seu cartão foi adicionado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao adicionar cartão",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const setPreferredMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PUT", `/api/payment-methods/${id}/preferred`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      toast({
        title: "Cartão preferencial atualizado",
        description: "Seu cartão preferencial foi atualizado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar cartão preferencial",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/payment-methods/${id}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
      setDeleteDialogOpen(false);
      toast({
        title: "Cartão removido",
        description: "Seu cartão foi removido com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover cartão",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreditCardFormValues) => {
    addCardMutation.mutate(data);
  };

  const confirmDelete = () => {
    if (selectedMethodId !== null) {
      deleteCardMutation.mutate(selectedMethodId);
    }
  };

  const handleCardOptions = (id: number) => {
    setSelectedMethodId(id);
    setDeleteDialogOpen(true);
  };

  const handleSetPreferred = (id: number) => {
    setPreferredMutation.mutate(id);
  };

  const creditCards = paymentMethods.filter(method => method.type === "creditCard");
  const pixMethods = paymentMethods.filter(method => method.type === "pix");

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-primary px-4 py-4 shadow-sm">
        <div className="flex justify-between items-center">
          <button onClick={() => navigate("/profile")} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold text-white">Métodos de Pagamento</h1>
          <div className="w-6"></div>
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="p-4">
          {/* Credit Cards */}
          <Card className="shadow mb-4">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Cartões de Crédito</h2>
                <Button 
                  variant="ghost" 
                  className="text-primary font-medium"
                  onClick={() => setAddCardOpen(true)}
                >
                  + Adicionar
                </Button>
              </div>

              {creditCards.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Nenhum cartão adicionado</p>
                </div>
              ) : (
                creditCards.map((card) => (
                  <div 
                    key={card.id} 
                    className={`${
                      card.isPreferred 
                        ? "bg-gradient-to-r from-primary to-purple-500 text-white" 
                        : "bg-gray-200 text-gray-700"
                    } rounded-xl p-4 mb-3`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm opacity-80">{card.brand}</p>
                        <p className="font-medium">•••• •••• •••• {card.cardNumber?.slice(-4)}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {card.isPreferred && (
                          <span className="text-xs border border-white rounded-full px-2 py-0.5">
                            Preferido
                          </span>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-inherit"
                          onClick={() => handleCardOptions(card.id)}
                        >
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm opacity-80 mt-2">Validade: {card.expiryDate}</p>
                    
                    {!card.isPreferred && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-xs hover:bg-white/20"
                        onClick={() => handleSetPreferred(card.id)}
                      >
                        Definir como preferido
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* PIX */}
          <Card className="shadow mb-4">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">PIX</h2>
                <Button variant="ghost" className="text-primary font-medium">
                  Gerenciar
                </Button>
              </div>
              <div className="flex items-center p-2">
                <div className="bg-amber-100 rounded-full p-2 mr-3">
                  <ArrowUpRight className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium">PIX disponível</p>
                  <p className="text-sm text-gray-600">Gerado no momento do pagamento</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Card Dialog */}
      <Dialog open={addCardOpen} onOpenChange={setAddCardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Cartão de Crédito</DialogTitle>
            <DialogDescription>
              Adicione os dados do seu cartão para facilitar suas compras.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do Cartão</FormLabel>
                    <FormControl>
                      <Input placeholder="0000 0000 0000 0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cardholderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Titular</FormLabel>
                    <FormControl>
                      <Input placeholder="Como está no cartão" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Validade</FormLabel>
                      <FormControl>
                        <Input placeholder="MM/YY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bandeira</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="">Selecione</option>
                          <option value="Visa">Visa</option>
                          <option value="Mastercard">Mastercard</option>
                          <option value="American Express">American Express</option>
                          <option value="Elo">Elo</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isPreferred"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 text-primary"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Definir como método preferido
                    </FormLabel>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setAddCardOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={addCardMutation.isPending}
                >
                  {addCardMutation.isPending ? (
                    <>
                      <LoadingSpinner size="small" className="mr-2" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Cartão"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover cartão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover este cartão?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteCardMutation.isPending}
            >
              {deleteCardMutation.isPending ? (
                <>
                  <LoadingSpinner size="small" className="mr-2" />
                  Removendo...
                </>
              ) : (
                "Remover"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  );
}
