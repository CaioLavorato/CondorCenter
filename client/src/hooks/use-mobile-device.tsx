import { useState, useEffect } from 'react';
import { isNativeApp, getDeviceInfo } from '@/lib/capacitor';

export interface MobileDeviceInfo {
  isNative: boolean;
  platform?: string;
  osVersion?: string;
  model?: string;
  manufacturer?: string;
  isVirtual?: boolean;
  webViewVersion?: string;
}

export function useMobileDevice() {
  const [deviceInfo, setDeviceInfo] = useState<MobileDeviceInfo>({
    isNative: false
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function fetchDeviceInfo() {
      const isNativeDevice = isNativeApp();
      
      let info: MobileDeviceInfo = {
        isNative: isNativeDevice
      };
      
      if (isNativeDevice) {
        const deviceDetails = await getDeviceInfo();
        if (deviceDetails) {
          info = {
            ...info,
            platform: deviceDetails.platform,
            osVersion: deviceDetails.osVersion,
            model: deviceDetails.model,
            manufacturer: deviceDetails.manufacturer,
            isVirtual: deviceDetails.isVirtual,
            webViewVersion: deviceDetails.webViewVersion
          };
        }
      }
      
      setDeviceInfo(info);
      setIsLoading(false);
    }
    
    fetchDeviceInfo();
  }, []);
  
  return {
    deviceInfo,
    isLoading,
    isAndroid: deviceInfo.platform === 'android',
    isIOS: deviceInfo.platform === 'ios',
    isNativeApp: deviceInfo.isNative
  };
}