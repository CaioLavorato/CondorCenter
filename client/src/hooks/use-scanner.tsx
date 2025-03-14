import { useState, useEffect, useCallback, useRef } from 'react';
import { captureImage } from '@/lib/capacitor';
import { BrowserMultiFormatReader } from '@zxing/library';

interface ScannerOptions {
  continuous?: boolean;
  onDetected?: (result: string) => void;
}

export function useScanner(options: ScannerOptions = {}) {
  const { continuous = false, onDetected } = options;
  
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  
  // Inicializa o leitor de código de barras
  useEffect(() => {
    try {
      codeReaderRef.current = new BrowserMultiFormatReader();
      return () => {
        stopScanner();
      };
    } catch (err) {
      console.error('Erro ao inicializar o leitor de código de barras:', err);
      setError('Não foi possível inicializar o scanner de código de barras.');
    }
  }, []);
  
  // Para o scanner quando o componente for desmontado
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);
  
  // Inicia o scanner
  const startScanner = useCallback(async () => {
    if (!codeReaderRef.current || !videoRef.current) {
      setError('Scanner não inicializado corretamente.');
      return false;
    }
    
    try {
      setScanning(true);
      setError(null);
      
      // Solicita permissão da câmera
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setPermissionGranted(true);
      
      // Decodifica continuamente da entrada de vídeo
      const controls = await codeReaderRef.current.decodeFromVideoDevice(
        null, 
        videoRef.current, 
        (result) => {
          if (result) {
            setLastResult(result.getText());
            
            if (onDetected) {
              onDetected(result.getText());
            }
            
            if (!continuous) {
              stopScanner();
            }
          }
        }
      );
      
      return true;
    } catch (err) {
      console.error('Erro ao iniciar o scanner:', err);
      setError('Não foi possível acessar a câmera. Verifique se você concedeu permissão.');
      setScanning(false);
      return false;
    }
  }, [continuous, onDetected]);
  
  // Para o scanner
  const stopScanner = useCallback(() => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      setScanning(false);
    }
  }, []);
  
  // Escaneia a partir da câmera do dispositivo (usando Capacitor)
  const scanWithCamera = useCallback(async () => {
    try {
      setScanning(true);
      setError(null);
      
      const imageUrl = await captureImage();
      
      if (imageUrl && codeReaderRef.current) {
        const result = await codeReaderRef.current.decodeFromImageUrl(imageUrl);
        setLastResult(result.getText());
        
        if (onDetected) {
          onDetected(result.getText());
        }
        
        setScanning(false);
        return true;
      } else {
        setError('Não foi possível obter uma imagem para escanear.');
        setScanning(false);
        return false;
      }
    } catch (err) {
      console.error('Erro ao escanear com a câmera:', err);
      setError('Não foi possível escanear o código de barras.');
      setScanning(false);
      return false;
    }
  }, [onDetected]);
  
  return {
    videoRef,
    scanning,
    lastResult,
    permissionGranted,
    error,
    startScanner,
    stopScanner,
    scanWithCamera
  };
}