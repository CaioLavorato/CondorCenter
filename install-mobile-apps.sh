#!/bin/bash

# Script para instalar o APK do Condor Center em dispositivos conectados

# Cores para melhor visualização
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

echo -e "${BLUE}===== INSTALAÇÃO DO APK CONDOR CENTER =====${NC}"

# Verifica se o ADB está instalado (Android Debug Bridge)
if ! command -v adb &> /dev/null; then
    echo -e "${RED}ADB (Android Debug Bridge) não encontrado.${NC}"
    echo -e "${YELLOW}Por favor, instale o Android SDK Platform Tools:${NC}"
    echo -e "  - Ubuntu/Debian: sudo apt-get install adb"
    echo -e "  - macOS: brew install android-platform-tools"
    echo -e "  - Windows: Instale o Android Studio ou baixe as Platform Tools em:"
    echo -e "    https://developer.android.com/studio/releases/platform-tools"
    exit 1
fi

# Verifica se existe o arquivo APK
APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
if [ ! -f "$APK_PATH" ]; then
    echo -e "${RED}APK não encontrado em $APK_PATH${NC}"
    echo -e "${YELLOW}Execute primeiro ./capacitor-build.sh e compile o APK no Android Studio${NC}"
    echo -e "${YELLOW}ou tente executar:${NC}"
    echo -e "  cd android && ./gradlew assembleDebug"
    exit 1
fi

# Verifica dispositivos conectados
echo -e "${YELLOW}Verificando dispositivos Android conectados...${NC}"
ADB_DEVICES=$(adb devices | grep -v "List" | grep "device$")

if [ -z "$ADB_DEVICES" ]; then
    echo -e "${RED}Nenhum dispositivo Android encontrado.${NC}"
    echo -e "${YELLOW}Verifique se:${NC}"
    echo -e "  1. Seu dispositivo está conectado via USB"
    echo -e "  2. A depuração USB está ativada no dispositivo"
    echo -e "  3. Você autorizou o computador no dispositivo"
    exit 1
fi

# Mostra dispositivos disponíveis
echo -e "${GREEN}Dispositivos encontrados:${NC}"
adb devices | grep -v "List"

# Instala o APK em todos os dispositivos conectados
echo -e "\n${YELLOW}Instalando o APK em todos os dispositivos conectados...${NC}"
adb devices | grep -v "List" | grep "device$" | cut -f1 | while read -r device; do
    echo -e "${BLUE}Instalando em: $device${NC}"
    adb -s "$device" install -r "$APK_PATH"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Instalação concluída em $device${NC}"
    else
        echo -e "${RED}✗ Falha na instalação em $device${NC}"
    fi
done

echo -e "\n${BLUE}===== INSTALAÇÃO CONCLUÍDA =====${NC}"
echo -e "${YELLOW}Se a instalação foi bem-sucedida, procure por 'Condor Center' nos aplicativos do seu dispositivo.${NC}"