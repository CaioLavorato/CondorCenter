#!/bin/bash

# Script para gerar assets para aplicativo mobile Condor Center
# Gera ícones e splash screens em vários tamanhos para Android e iOS

# Cores para melhor visualização
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

echo -e "${BLUE}===== GERAÇÃO DE ASSETS PARA CONDOR CENTER =====${NC}"

# Verificar se o ImageMagick está instalado
if ! command -v convert &> /dev/null; then
    echo -e "${RED}ImageMagick não encontrado. Este script requer ImageMagick para gerar assets.${NC}"
    echo -e "${YELLOW}Por favor, instale o ImageMagick:${NC}"
    echo -e "  - Ubuntu/Debian: sudo apt-get install imagemagick"
    echo -e "  - macOS: brew install imagemagick"
    echo -e "  - Windows: Faça o download em https://imagemagick.org/script/download.php"
    exit 1
fi

# Verificar se os arquivos SVG de origem existem
ICON_SVG="./resources/icon.svg"
SPLASH_SVG="./resources/splash.svg"

if [ ! -f "$ICON_SVG" ]; then
    echo -e "${RED}Arquivo de ícone não encontrado: $ICON_SVG${NC}"
    exit 1
fi

if [ ! -f "$SPLASH_SVG" ]; then
    echo -e "${RED}Arquivo de splash screen não encontrado: $SPLASH_SVG${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Arquivos SVG de origem encontrados${NC}"

# Criar diretórios de destino
echo -e "${YELLOW}Criando diretórios para assets...${NC}"

ANDROID_RES="./android/app/src/main/res"
IOS_RES="./ios/App/App/Assets.xcassets"

# Se os diretórios de projeto nativo não existirem, criar temporariamente
if [ ! -d "./android" ]; then
    echo -e "${YELLOW}⚠ Projeto Android não encontrado. Assets serão gerados em ./android-assets${NC}"
    ANDROID_RES="./android-assets"
    mkdir -p "$ANDROID_RES"
fi

if [ ! -d "./ios" ]; then
    echo -e "${YELLOW}⚠ Projeto iOS não encontrado. Assets serão gerados em ./ios-assets${NC}"
    IOS_RES="./ios-assets"
    mkdir -p "$IOS_RES"
fi

# Gerar ícones para Android
echo -e "${YELLOW}Gerando ícones para Android...${NC}"

# Mapeamento das densidades de tela do Android
declare -A ANDROID_ICONS=(
    ["mipmap-mdpi"]=48
    ["mipmap-hdpi"]=72
    ["mipmap-xhdpi"]=96
    ["mipmap-xxhdpi"]=144
    ["mipmap-xxxhdpi"]=192
)

for DIR in "${!ANDROID_ICONS[@]}"; do
    SIZE=${ANDROID_ICONS[$DIR]}
    echo -e "  Gerando ícone ${SIZE}x${SIZE} para $DIR"
    mkdir -p "${ANDROID_RES}/${DIR}"
    convert -background none -resize ${SIZE}x${SIZE} "$ICON_SVG" "${ANDROID_RES}/${DIR}/ic_launcher.png"
    convert -background none -resize ${SIZE}x${SIZE} "$ICON_SVG" "${ANDROID_RES}/${DIR}/ic_launcher_round.png"
    convert -background none -resize ${SIZE}x${SIZE} "$ICON_SVG" "${ANDROID_RES}/${DIR}/ic_launcher_foreground.png"
done

echo -e "${GREEN}✓ Ícones Android gerados${NC}"

# Gerar ícone para a Play Store
echo -e "${YELLOW}Gerando ícone para a Play Store...${NC}"
mkdir -p "${ANDROID_RES}/../playstore"
convert -background none -resize 512x512 "$ICON_SVG" "${ANDROID_RES}/../playstore/icon.png"

# Gerar ícones para iOS
if [ "$(uname)" == "Darwin" ] || [ -d "./ios" ]; then
    echo -e "${YELLOW}Gerando ícones para iOS...${NC}"
    
    mkdir -p "${IOS_RES}/AppIcon.appiconset"
    
    # Mapeamento dos tamanhos de ícone iOS
    declare -A IOS_ICONS=(
        ["Icon-App-20x20@1x.png"]=20
        ["Icon-App-20x20@2x.png"]=40
        ["Icon-App-20x20@3x.png"]=60
        ["Icon-App-29x29@1x.png"]=29
        ["Icon-App-29x29@2x.png"]=58
        ["Icon-App-29x29@3x.png"]=87
        ["Icon-App-40x40@1x.png"]=40
        ["Icon-App-40x40@2x.png"]=80
        ["Icon-App-40x40@3x.png"]=120
        ["Icon-App-60x60@2x.png"]=120
        ["Icon-App-60x60@3x.png"]=180
        ["Icon-App-76x76@1x.png"]=76
        ["Icon-App-76x76@2x.png"]=152
        ["Icon-App-83.5x83.5@2x.png"]=167
        ["ItunesArtwork@2x.png"]=1024
    )
    
    for ICON_NAME in "${!IOS_ICONS[@]}"; do
        SIZE=${IOS_ICONS[$ICON_NAME]}
        echo -e "  Gerando ícone ${SIZE}x${SIZE} para iOS: $ICON_NAME"
        convert -background none -resize ${SIZE}x${SIZE} "$ICON_SVG" "${IOS_RES}/AppIcon.appiconset/${ICON_NAME}"
    done
    
    # Criar arquivo Contents.json para o catálogo de ícones
    cat > "${IOS_RES}/AppIcon.appiconset/Contents.json" << EOL
{
  "images" : [
    {
      "size" : "20x20",
      "idiom" : "iphone",
      "filename" : "Icon-App-20x20@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "20x20",
      "idiom" : "iphone",
      "filename" : "Icon-App-20x20@3x.png",
      "scale" : "3x"
    },
    {
      "size" : "29x29",
      "idiom" : "iphone",
      "filename" : "Icon-App-29x29@1x.png",
      "scale" : "1x"
    },
    {
      "size" : "29x29",
      "idiom" : "iphone",
      "filename" : "Icon-App-29x29@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "29x29",
      "idiom" : "iphone",
      "filename" : "Icon-App-29x29@3x.png",
      "scale" : "3x"
    },
    {
      "size" : "40x40",
      "idiom" : "iphone",
      "filename" : "Icon-App-40x40@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "40x40",
      "idiom" : "iphone",
      "filename" : "Icon-App-40x40@3x.png",
      "scale" : "3x"
    },
    {
      "size" : "60x60",
      "idiom" : "iphone",
      "filename" : "Icon-App-60x60@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "60x60",
      "idiom" : "iphone",
      "filename" : "Icon-App-60x60@3x.png",
      "scale" : "3x"
    },
    {
      "size" : "20x20",
      "idiom" : "ipad",
      "filename" : "Icon-App-20x20@1x.png",
      "scale" : "1x"
    },
    {
      "size" : "20x20",
      "idiom" : "ipad",
      "filename" : "Icon-App-20x20@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "29x29",
      "idiom" : "ipad",
      "filename" : "Icon-App-29x29@1x.png",
      "scale" : "1x"
    },
    {
      "size" : "29x29",
      "idiom" : "ipad",
      "filename" : "Icon-App-29x29@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "40x40",
      "idiom" : "ipad",
      "filename" : "Icon-App-40x40@1x.png",
      "scale" : "1x"
    },
    {
      "size" : "40x40",
      "idiom" : "ipad",
      "filename" : "Icon-App-40x40@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "76x76",
      "idiom" : "ipad",
      "filename" : "Icon-App-76x76@1x.png",
      "scale" : "1x"
    },
    {
      "size" : "76x76",
      "idiom" : "ipad",
      "filename" : "Icon-App-76x76@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "83.5x83.5",
      "idiom" : "ipad",
      "filename" : "Icon-App-83.5x83.5@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "1024x1024",
      "idiom" : "ios-marketing",
      "filename" : "ItunesArtwork@2x.png",
      "scale" : "1x"
    }
  ],
  "info" : {
    "version" : 1,
    "author" : "xcode"
  }
}
EOL
    
    echo -e "${GREEN}✓ Ícones iOS gerados${NC}"
else
    echo -e "${YELLOW}Sistema não é macOS ou projeto iOS não encontrado. Ícones iOS não serão gerados.${NC}"
fi

# Gerar splash screens para Android
echo -e "${YELLOW}Gerando splash screens para Android...${NC}"

# Criar splashes em diferentes resoluções para Android
declare -A ANDROID_SPLASHES=(
    ["drawable-land-mdpi"]=480x320
    ["drawable-land-hdpi"]=800x480
    ["drawable-land-xhdpi"]=1280x720
    ["drawable-land-xxhdpi"]=1600x960
    ["drawable-land-xxxhdpi"]=1920x1280
    ["drawable-port-mdpi"]=320x480
    ["drawable-port-hdpi"]=480x800
    ["drawable-port-xhdpi"]=720x1280
    ["drawable-port-xxhdpi"]=960x1600
    ["drawable-port-xxxhdpi"]=1280x1920
)

for DIR in "${!ANDROID_SPLASHES[@]}"; do
    SIZE=${ANDROID_SPLASHES[$DIR]}
    echo -e "  Gerando splash ${SIZE} para $DIR"
    mkdir -p "${ANDROID_RES}/${DIR}"
    convert -background none -resize ${SIZE} -gravity center -extent ${SIZE} "$SPLASH_SVG" "${ANDROID_RES}/${DIR}/splash.png"
done

echo -e "${GREEN}✓ Splash screens Android geradas${NC}"

# Gerar splash screens para iOS
if [ "$(uname)" == "Darwin" ] || [ -d "./ios" ]; then
    echo -e "${YELLOW}Gerando splash screens para iOS...${NC}"
    
    mkdir -p "${IOS_RES}/LaunchImage.imageset"
    
    # Tamanhos para splash screens do iOS
    declare -A IOS_SPLASHES=(
        ["LaunchImage.png"]=2732x2732
        ["LaunchImage@2x.png"]=2732x2732
        ["LaunchImage@3x.png"]=2732x2732
    )
    
    for SPLASH_NAME in "${!IOS_SPLASHES[@]}"; do
        SIZE=${IOS_SPLASHES[$SPLASH_NAME]}
        echo -e "  Gerando splash ${SIZE} para iOS: $SPLASH_NAME"
        convert -background none -resize ${SIZE} -gravity center -extent ${SIZE} "$SPLASH_SVG" "${IOS_RES}/LaunchImage.imageset/${SPLASH_NAME}"
    done
    
    # Criar arquivo Contents.json para o catálogo de splash screens
    cat > "${IOS_RES}/LaunchImage.imageset/Contents.json" << EOL
{
  "images" : [
    {
      "idiom" : "universal",
      "filename" : "LaunchImage.png",
      "scale" : "1x"
    },
    {
      "idiom" : "universal",
      "filename" : "LaunchImage@2x.png",
      "scale" : "2x"
    },
    {
      "idiom" : "universal",
      "filename" : "LaunchImage@3x.png",
      "scale" : "3x"
    }
  ],
  "info" : {
    "version" : 1,
    "author" : "xcode"
  }
}
EOL
    
    echo -e "${GREEN}✓ Splash screens iOS geradas${NC}"
else
    echo -e "${YELLOW}Sistema não é macOS ou projeto iOS não encontrado. Splash screens iOS não serão geradas.${NC}"
fi

# Gerar um ícone para a web
echo -e "${YELLOW}Gerando ícone para a web...${NC}"
convert -background none -resize 512x512 "$ICON_SVG" "generated-icon.png"
echo -e "${GREEN}✓ Ícone web gerado${NC}"

echo -e "\n${BLUE}===== GERAÇÃO DE ASSETS CONCLUÍDA =====${NC}"
echo -e "${GREEN}Todos os assets necessários foram gerados com sucesso!${NC}"

# Instruções para uso dos assets temporários
if [ ! -d "./android" ] || [ ! -d "./ios" ]; then
    echo -e "\n${YELLOW}Nota: Alguns assets foram gerados em diretórios temporários porque os projetos nativos ainda não existem.${NC}"
    echo -e "${YELLOW}Quando executar 'npx cap add android' ou 'npx cap add ios', esses assets terão que ser copiados manualmente.${NC}"
fi