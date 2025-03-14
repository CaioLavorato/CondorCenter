import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Device } from '@capacitor/device';

// Verifica se estamos em ambiente Capacitor (aplicativo nativo)
export const isNativeApp = () => {
  return typeof window !== 'undefined' && 
         'Capacitor' in window && 
         (window as any).Capacitor?.isNative;
};

// Inicializa o app e oculta a splash screen
export const initApp = async () => {
  if (isNativeApp()) {
    // Adiciona listener para o botão de voltar do Android
    App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        App.exitApp();
      } else {
        window.history.back();
      }
    });

    // Oculta a splash screen após a inicialização
    await SplashScreen.hide();
  }
};

// Solicita permissão para notificações
export const requestNotificationPermission = async () => {
  if (isNativeApp()) {
    const permissionStatus = await LocalNotifications.requestPermissions();
    return permissionStatus.display === 'granted';
  }
  return false;
};

// Envia uma notificação local
export const sendLocalNotification = async (title: string, body: string) => {
  if (isNativeApp()) {
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: new Date().getTime(),
          sound: undefined,
          schedule: { at: new Date(Date.now() + 1000) }
        }
      ]
    });
  }
};

// Captura uma imagem da câmera (pode ser usada para escanear códigos de barras)
export const captureImage = async () => {
  if (isNativeApp()) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        correctOrientation: true
      });
      
      return image.webPath;
    } catch (e) {
      console.error('Erro ao capturar imagem:', e);
      return null;
    }
  }
  return null;
};

// Obter informações do dispositivo
export const getDeviceInfo = async () => {
  if (isNativeApp()) {
    try {
      const info = await Device.getInfo();
      return info;
    } catch (e) {
      console.error('Erro ao obter informações do dispositivo:', e);
      return null;
    }
  }
  return null;
};