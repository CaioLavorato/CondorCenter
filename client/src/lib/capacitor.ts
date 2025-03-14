import { App } from '@capacitor/app';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Device } from '@capacitor/device';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { SplashScreen } from '@capacitor/splash-screen';

// Verifica se a aplicação está rodando como app nativo
export const isNativeApp = () => {
  return window.location.protocol === 'capacitor:';
};

// Inicializa o app nativo, oculta a splash screen, etc.
export const initApp = async () => {
  if (isNativeApp()) {
    try {
      // Oculta a splash screen após carregar o app
      await SplashScreen.hide();
      
      // Configura listeners para eventos do app
      App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active: ', isActive);
      });
      
      App.addListener('backButton', () => {
        console.log('Back button pressed');
        // Você pode adicionar uma lógica personalizada para o botão voltar
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao inicializar aplicativo nativo:', error);
      return false;
    }
  }
  return false;
};

// Solicita permissão para enviar notificações 
export const requestNotificationPermission = async () => {
  if (isNativeApp()) {
    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissão para notificações:', error);
      return false;
    }
  }
  return false;
};

// Envia uma notificação local
export const sendLocalNotification = async (title: string, body: string) => {
  if (isNativeApp()) {
    try {
      const notifOptions: ScheduleOptions = {
        notifications: [
          {
            title,
            body,
            id: new Date().getTime(),
            schedule: { at: new Date(Date.now() + 1000) },
            sound: undefined,
            attachments: undefined,
            actionTypeId: "",
            extra: null
          }
        ]
      };
      
      await LocalNotifications.schedule(notifOptions);
      return true;
    } catch (error) {
      console.error('Erro ao enviar notificação local:', error);
      return false;
    }
  }
  return false;
};

// Captura imagem da câmera ou galeria
export const captureImage = async () => {
  if (isNativeApp()) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt
      });
      
      return image.webPath;
    } catch (error) {
      console.error('Erro ao capturar imagem:', error);
      return null;
    }
  }
  return null;
};

// Obtém informações do dispositivo
export const getDeviceInfo = async () => {
  if (isNativeApp()) {
    try {
      const info = await Device.getInfo();
      return info;
    } catch (error) {
      console.error('Erro ao obter informações do dispositivo:', error);
      return null;
    }
  }
  return null;
};