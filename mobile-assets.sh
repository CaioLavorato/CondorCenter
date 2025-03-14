#!/bin/bash

# Esse script gera assets otimizados para o aplicativo móvel
# Requer o ImageMagick instalado no sistema

# Verifica se o ImageMagick está instalado
if ! command -v convert &> /dev/null; then
  echo "ImageMagick não encontrado. Por favor, instale-o para continuar."
  echo "No Ubuntu/Debian: sudo apt-get install imagemagick"
  echo "No macOS: brew install imagemagick"
  exit 1
fi

echo "Gerando ícones e splash screens para aplicativos Android e iOS..."

# Cria diretórios se não existirem
mkdir -p resources/android/icon
mkdir -p resources/android/splash
mkdir -p resources/ios/icon
mkdir -p resources/ios/splash

# Função para gerar ícones Android
generate_android_icons() {
  echo "Gerando ícones para Android..."
  
  # Tamanhos de ícones para Android
  # mipmap-hdpi: 72x72
  convert -background none resources/icon.svg -resize 72x72 resources/android/icon/drawable-hdpi-icon.png
  # mipmap-mdpi: 48x48
  convert -background none resources/icon.svg -resize 48x48 resources/android/icon/drawable-mdpi-icon.png
  # mipmap-xhdpi: 96x96
  convert -background none resources/icon.svg -resize 96x96 resources/android/icon/drawable-xhdpi-icon.png
  # mipmap-xxhdpi: 144x144
  convert -background none resources/icon.svg -resize 144x144 resources/android/icon/drawable-xxhdpi-icon.png
  # mipmap-xxxhdpi: 192x192
  convert -background none resources/icon.svg -resize 192x192 resources/android/icon/drawable-xxxhdpi-icon.png
  
  echo "Ícones Android gerados com sucesso!"
}

# Função para gerar splash screens Android
generate_android_splash() {
  echo "Gerando splash screens para Android..."
  
  # Tamanhos de splash para Android
  convert resources/splash.svg -resize 320x480 resources/android/splash/drawable-port-ldpi-screen.png
  convert resources/splash.svg -resize 480x800 resources/android/splash/drawable-port-mdpi-screen.png
  convert resources/splash.svg -resize 720x1280 resources/android/splash/drawable-port-hdpi-screen.png
  convert resources/splash.svg -resize 960x1600 resources/android/splash/drawable-port-xhdpi-screen.png
  convert resources/splash.svg -resize 1280x1920 resources/android/splash/drawable-port-xxhdpi-screen.png
  convert resources/splash.svg -resize 1920x2560 resources/android/splash/drawable-port-xxxhdpi-screen.png
  
  echo "Splash screens Android gerados com sucesso!"
}

# Função para gerar ícones iOS
generate_ios_icons() {
  echo "Gerando ícones para iOS..."
  
  # Tamanhos de ícones para iOS
  convert -background none resources/icon.svg -resize 20x20 resources/ios/icon/icon-20.png
  convert -background none resources/icon.svg -resize 40x40 resources/ios/icon/icon-20@2x.png
  convert -background none resources/icon.svg -resize 60x60 resources/ios/icon/icon-20@3x.png
  convert -background none resources/icon.svg -resize 29x29 resources/ios/icon/icon-29.png
  convert -background none resources/icon.svg -resize 58x58 resources/ios/icon/icon-29@2x.png
  convert -background none resources/icon.svg -resize 87x87 resources/ios/icon/icon-29@3x.png
  convert -background none resources/icon.svg -resize 40x40 resources/ios/icon/icon-40.png
  convert -background none resources/icon.svg -resize 80x80 resources/ios/icon/icon-40@2x.png
  convert -background none resources/icon.svg -resize 120x120 resources/ios/icon/icon-40@3x.png
  convert -background none resources/icon.svg -resize 120x120 resources/ios/icon/icon-60@2x.png
  convert -background none resources/icon.svg -resize 180x180 resources/ios/icon/icon-60@3x.png
  convert -background none resources/icon.svg -resize 76x76 resources/ios/icon/icon-76.png
  convert -background none resources/icon.svg -resize 152x152 resources/ios/icon/icon-76@2x.png
  convert -background none resources/icon.svg -resize 167x167 resources/ios/icon/icon-83.5@2x.png
  convert -background none resources/icon.svg -resize 1024x1024 resources/ios/icon/icon-1024.png
  
  echo "Ícones iOS gerados com sucesso!"
}

# Função para gerar splash screens iOS
generate_ios_splash() {
  echo "Gerando splash screens para iOS..."
  
  # Tamanhos de splash para iOS
  convert resources/splash.svg -resize 640x1136 resources/ios/splash/Default-568h@2x~iphone.png
  convert resources/splash.svg -resize 750x1334 resources/ios/splash/Default-667h.png
  convert resources/splash.svg -resize 1242x2208 resources/ios/splash/Default-736h.png
  convert resources/splash.svg -resize 2208x1242 resources/ios/splash/Default-Landscape-736h.png
  convert resources/splash.svg -resize 2732x2732 resources/ios/splash/Default-Landscape@~ipadpro.png
  convert resources/splash.svg -resize 2732x2732 resources/ios/splash/Default-Portrait@~ipadpro.png
  convert resources/splash.svg -resize 2048x1536 resources/ios/splash/Default-Landscape@2x~ipad.png
  convert resources/splash.svg -resize 1024x768 resources/ios/splash/Default-Landscape~ipad.png
  convert resources/splash.svg -resize 1536x2048 resources/ios/splash/Default-Portrait@2x~ipad.png
  convert resources/splash.svg -resize 768x1024 resources/ios/splash/Default-Portrait~ipad.png
  convert resources/splash.svg -resize 640x960 resources/ios/splash/Default@2x~iphone.png
  convert resources/splash.svg -resize 320x480 resources/ios/splash/Default~iphone.png
  convert resources/splash.svg -resize 2732x2732 resources/ios/splash/Default@2x~universal~anyany.png
  
  echo "Splash screens iOS gerados com sucesso!"
}

# Executa as funções
echo "======= INICIALIZANDO GERAÇÃO DE RECURSOS MÓVEIS ======="
generate_android_icons
generate_android_splash
generate_ios_icons
generate_ios_splash
echo "======= GERAÇÃO DE RECURSOS CONCLUÍDA ======="
echo "Os ícones e splash screens foram gerados com sucesso!"
echo "Verifique as pastas resources/android e resources/ios"