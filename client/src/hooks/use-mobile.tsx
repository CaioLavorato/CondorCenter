import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Função para verificar se o dispositivo é móvel
    const checkMobile = () => {
      // Verifica a largura da tela (considere dispositivos com largura < 768px como móveis)
      const isMobileWidth = window.innerWidth < 768;
      
      // Verifica se o navegador tem características de dispositivos móveis
      const hasTouchScreen = 
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 || 
        (navigator as any).msMaxTouchPoints > 0;
      
      // Verifica se o user agent indica dispositivo móvel
      const userAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      
      // Consideramos mobile se a largura for pequena E (tiver tela touch OU o user agent indicar mobile)
      setIsMobile(isMobileWidth && (hasTouchScreen || userAgentMobile));
    };

    // Verifica inicialmente
    checkMobile();

    // Verifica quando a tela mudar de tamanho
    window.addEventListener('resize', checkMobile);

    // Limpeza
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return isMobile;
}