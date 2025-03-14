import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Camera, X } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isScanning: boolean;
}

export function BarcodeScanner({ onScan, isScanning }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Start camera stream
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCamera(false);
      setErrorMessage("Seu dispositivo não suporta acesso à câmera");
      return;
    }

    let stream: MediaStream | null = null;

    async function setupCamera() {
      try {
        const constraints = {
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsVideoPlaying(true);
          };
        }
      } catch (err) {
        setHasCamera(false);
        setErrorMessage("Não foi possível acessar a câmera");
        console.error("Error accessing camera:", err);
      }
    }

    if (isScanning) {
      setupCamera();
    }

    // Cleanup
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setIsVideoPlaying(false);
    };
  }, [isScanning]);

  // Mock barcode recognition - in a real app, you'd use a barcode scanning library
  useEffect(() => {
    if (!isScanning || !isVideoPlaying) return;

    // In a real implementation, you would connect to a barcode scanning library
    // For demonstration, we'll simulate a barcode scan after a short delay
    const timeout = setTimeout(() => {
      // Generate a random barcode from our sample products
      const sampleBarcodes = [
        "7891234567890", // Refrigerante Cola 2L
        "7891234567891", // Pão de Forma Integral
        "7891234567892", // Leite Integral 1L
        "7891234567893", // Café em Pó 500g
        "7891234567894", // Arroz Branco 5kg
      ];
      
      const randomBarcode = sampleBarcodes[Math.floor(Math.random() * sampleBarcodes.length)];
      onScan(randomBarcode);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [isScanning, isVideoPlaying, onScan]);

  if (!hasCamera) {
    return (
      <div className="bg-black rounded-xl w-full h-72 flex items-center justify-center text-white p-4 text-center">
        <div>
          <X className="h-12 w-12 mx-auto mb-2 text-red-500" />
          <p>{errorMessage}</p>
          <Button 
            variant="outline"
            className="mt-4 bg-white text-primary border-white" 
            onClick={() => onScan("7891234567890")}
          >
            Simular escaneamento
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-black rounded-xl overflow-hidden h-72 w-full">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Viewfinder overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        {!isVideoPlaying ? (
          <LoadingSpinner size="large" className="text-white" />
        ) : (
          <div className="relative">
            <div className="w-48 h-48 border-2 border-white rounded-lg"></div>
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-secondary rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-secondary rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-secondary rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-secondary rounded-br-lg"></div>
          </div>
        )}
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-white text-sm font-medium">
          Posicione o código de barras do produto
        </p>
      </div>
    </div>
  );
}
