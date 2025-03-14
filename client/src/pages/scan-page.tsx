import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useScanner } from "@/hooks/use-scanner";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useMobileDevice } from "@/hooks/use-mobile-device";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { BarcodeScanner } from "@/components/ui/barcode-scanner";
import { getQueryFn } from "@/lib/queryClient";
import { ChevronLeft, Scan, ShoppingCart } from "lucide-react";
import { Product } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

export default function ScanPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { deviceInfo } = useMobileDevice();
  const { addItem } = useCart();
  const [barcode, setBarcode] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // Hook personalizado para scanner de códigos de barras
  const { videoRef, scanning, startScanner, stopScanner, scanWithCamera } = useScanner({
    continuous: false,
    onDetected: (result) => setBarcode(result)
  });
  
  // Consulta o produto com base no código de barras escaneado
  const { 
    data: product, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery<Product | undefined, Error>({
    queryKey: ['/api/products/barcode', barcode],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!barcode
  });
  
  // Inicia o scanner quando o componente é montado
  useEffect(() => {
    if (deviceInfo.isNative) {
      // Em ambiente nativo, use a câmera nativa
      scanWithCamera();
    } else {
      // Em ambiente web, use o scanner baseado em vídeo
      startScanner();
    }
    
    return () => {
      stopScanner();
    };
  }, [deviceInfo.isNative, startScanner, stopScanner, scanWithCamera]);
  
  // Limpa o código de barras quando se desmonta o componente
  useEffect(() => {
    return () => {
      setBarcode(null);
    };
  }, []);
  
  // Adiciona o produto ao carrinho
  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    
    try {
      await addItem(product.id, 1);
      toast({
        title: "Produto adicionado",
        description: `${product.name} foi adicionado ao seu carrinho.`,
      });
      
      // Opcional: redireciona para o carrinho após adicionar o produto
      navigate("/cart");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o produto ao carrinho.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  // Reinicia o scanner
  const handleScanAgain = () => {
    setBarcode(null);
    if (deviceInfo.isNative) {
      scanWithCamera();
    } else {
      startScanner();
    }
  };
  
  return (
    <div className="container max-w-md mx-auto py-6 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold flex-1 text-center">Escanear Produto</h1>
      </div>
      
      {!barcode ? (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="aspect-square relative rounded-md overflow-hidden bg-secondary">
                {scanning ? (
                  <>
                    <BarcodeScanner onScan={setBarcode} isScanning={scanning} />
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      muted
                      autoPlay
                      playsInline
                    />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Scan className="h-12 w-12 text-primary mb-2" />
                    <p className="text-center text-sm text-muted-foreground">
                      Scanner parado. Clique para iniciar.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={scanning ? stopScanner : startScanner}
              >
                {scanning ? "Parar Scanner" : "Iniciar Scanner"}
              </Button>
            </CardFooter>
          </Card>
          
          {deviceInfo.isNative && (
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={scanWithCamera}
            >
              Usar Câmera do Dispositivo
            </Button>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Produto Escaneado</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="medium" />
              </div>
            ) : isError ? (
              <div className="text-center py-8">
                <p className="text-destructive mb-4">
                  Produto não encontrado ou erro ao carregar informações.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Código: {barcode}
                </p>
                <Button variant="outline" onClick={() => refetch()}>
                  Tentar Novamente
                </Button>
              </div>
            ) : product ? (
              <div className="space-y-4">
                {product.imageUrl && (
                  <div className="aspect-square rounded-md overflow-hidden bg-background">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium">{product.name}</h3>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(product.price)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Código: {product.barcode}
                  </p>
                  {product.description && (
                    <p className="text-sm mt-2">{product.description}</p>
                  )}
                </div>
              </div>
            ) : null}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              className="w-full"
              disabled={isLoading || isError || isAddingToCart || !product}
              onClick={handleAddToCart}
            >
              {isAddingToCart ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Adicionar ao Carrinho
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleScanAgain}
            >
              Escanear Outro Produto
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}