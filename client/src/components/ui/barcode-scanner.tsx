import { useEffect, useRef } from "react";
import { Scan } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isScanning: boolean;
}

export function BarcodeScanner({ onScan, isScanning }: BarcodeScannerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Efeito visual de escaneamento
  useEffect(() => {
    if (!isScanning || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Configuração inicial
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    let scanLineY = 0;
    let direction = 1; // 1 para baixo, -1 para cima
    let animationFrameId: number;
    
    // Função de animação
    const animate = () => {
      // Limpa o canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Desenha retângulo de alvo para escaneamento
      const targetWidth = canvas.width * 0.7;
      const targetHeight = canvas.height * 0.5;
      const targetX = (canvas.width - targetWidth) / 2;
      const targetY = (canvas.height - targetHeight) / 2;
      
      // Desenha cantos
      const cornerSize = 20;
      ctx.strokeStyle = "#6200EE";
      ctx.lineWidth = 4;
      
      // Canto superior esquerdo
      ctx.beginPath();
      ctx.moveTo(targetX, targetY + cornerSize);
      ctx.lineTo(targetX, targetY);
      ctx.lineTo(targetX + cornerSize, targetY);
      ctx.stroke();
      
      // Canto superior direito
      ctx.beginPath();
      ctx.moveTo(targetX + targetWidth - cornerSize, targetY);
      ctx.lineTo(targetX + targetWidth, targetY);
      ctx.lineTo(targetX + targetWidth, targetY + cornerSize);
      ctx.stroke();
      
      // Canto inferior esquerdo
      ctx.beginPath();
      ctx.moveTo(targetX, targetY + targetHeight - cornerSize);
      ctx.lineTo(targetX, targetY + targetHeight);
      ctx.lineTo(targetX + cornerSize, targetY + targetHeight);
      ctx.stroke();
      
      // Canto inferior direito
      ctx.beginPath();
      ctx.moveTo(targetX + targetWidth - cornerSize, targetY + targetHeight);
      ctx.lineTo(targetX + targetWidth, targetY + targetHeight);
      ctx.lineTo(targetX + targetWidth, targetY + targetHeight - cornerSize);
      ctx.stroke();
      
      // Desenha linha de escaneamento
      const scanLine = targetY + scanLineY;
      const gradient = ctx.createLinearGradient(0, scanLine - 5, 0, scanLine + 5);
      gradient.addColorStop(0, "rgba(98, 0, 238, 0)");
      gradient.addColorStop(0.5, "rgba(98, 0, 238, 0.8)");
      gradient.addColorStop(1, "rgba(98, 0, 238, 0)");
      
      ctx.fillStyle = gradient;
      ctx.fillRect(targetX, scanLine - 2, targetWidth, 4);
      
      // Atualiza posição da linha de escaneamento
      scanLineY += 2 * direction;
      
      // Inverte direção ao atingir os limites
      if (scanLineY > targetHeight || scanLineY < 0) {
        direction *= -1;
      }
      
      // Continua animação se ainda estiver escaneando
      if (isScanning) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    // Inicia animação
    animationFrameId = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isScanning]);
  
  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {isScanning ? (
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <Scan className="h-12 w-12 text-primary animate-pulse" />
        </div>
      )}
    </div>
  );
}