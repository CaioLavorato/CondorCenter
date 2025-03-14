#!/bin/bash

# Script para verificar e preparar o ambiente de desenvolvimento mobile
# para o Condor Center App

# Cores para melhor visualização
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

echo -e "${BLUE}===== VERIFICANDO AMBIENTE PARA DESENVOLVIMENTO MOBILE =====${NC}"

# Verifica se Node.js está instalado
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js instalado: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js não encontrado. Por favor, instale Node.js 16+ antes de continuar.${NC}"
    exit 1
fi

# Verifica se NPM está instalado
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓ NPM instalado: $NPM_VERSION${NC}"
else
    echo -e "${RED}✗ NPM não encontrado. Por favor, instale NPM 7+ antes de continuar.${NC}"
    exit 1
fi

# Verifica pacotes Capacitor
echo -e "\n${YELLOW}Verificando pacotes do Capacitor...${NC}"

CAPACITOR_PACKAGES=(
    "@capacitor/core"
    "@capacitor/cli"
    "@capacitor/android"
    "@capacitor/ios"
    "@capacitor/camera"
    "@capacitor/app"
    "@capacitor/device"
    "@capacitor/local-notifications"
    "@capacitor/splash-screen"
)

MISSING_PACKAGES=()

for package in "${CAPACITOR_PACKAGES[@]}"; do
    if npm list "$package" 2>/dev/null | grep -q "$package"; then
        echo -e "${GREEN}✓ $package instalado${NC}"
    else
        echo -e "${RED}✗ $package não encontrado${NC}"
        MISSING_PACKAGES+=("$package")
    fi
done

# Instala pacotes faltantes se necessário
if [ ${#MISSING_PACKAGES[@]} -gt 0 ]; then
    echo -e "\n${YELLOW}Pacotes faltantes detectados. Deseja instalar agora? (s/n)${NC}"
    read -r RESPOSTA
    if [[ $RESPOSTA =~ ^[Ss]$ ]]; then
        echo -e "${BLUE}Instalando pacotes Capacitor faltantes...${NC}"
        npm install "${MISSING_PACKAGES[@]}"
    else
        echo -e "${YELLOW}Você precisará instalar esses pacotes manualmente antes de compilar o aplicativo.${NC}"
    fi
fi

# Verifica se ImageMagick está instalado (para geração de assets)
if command -v convert &> /dev/null; then
    IMAGEMAGICK_VERSION=$(convert --version | head -n 1)
    echo -e "\n${GREEN}✓ ImageMagick instalado: $IMAGEMAGICK_VERSION${NC}"
else
    echo -e "\n${YELLOW}⚠ ImageMagick não encontrado. É recomendado para geração de assets.${NC}"
    echo -e "${YELLOW}  No Ubuntu/Debian: sudo apt-get install imagemagick${NC}"
    echo -e "${YELLOW}  No macOS: brew install imagemagick${NC}"
fi

# Verifica os recursos necessários
echo -e "\n${YELLOW}Verificando recursos (assets) necessários...${NC}"

RESOURCES_DIR="./resources"
if [ -d "$RESOURCES_DIR" ]; then
    echo -e "${GREEN}✓ Diretório de recursos encontrado${NC}"
    
    if [ -f "$RESOURCES_DIR/icon.svg" ]; then
        echo -e "${GREEN}✓ Ícone encontrado${NC}"
    else
        echo -e "${RED}✗ Arquivo de ícone não encontrado ($RESOURCES_DIR/icon.svg)${NC}"
        echo -e "${YELLOW}  Você precisará criar um ícone antes de compilar o aplicativo.${NC}"
    fi
    
    if [ -f "$RESOURCES_DIR/splash.svg" ]; then
        echo -e "${GREEN}✓ Splash screen encontrada${NC}"
    else
        echo -e "${RED}✗ Arquivo de splash screen não encontrado ($RESOURCES_DIR/splash.svg)${NC}"
        echo -e "${YELLOW}  Você precisará criar uma splash screen antes de compilar o aplicativo.${NC}"
    fi
else
    echo -e "${RED}✗ Diretório de recursos não encontrado ($RESOURCES_DIR)${NC}"
    mkdir -p "$RESOURCES_DIR"
    echo -e "${GREEN}✓ Diretório de recursos criado${NC}"
    echo -e "${YELLOW}  Você precisará adicionar os arquivos icon.svg e splash.svg neste diretório.${NC}"
fi

# Verifica scripts de build
echo -e "\n${YELLOW}Verificando scripts de build...${NC}"

if [ -f "capacitor-build.sh" ]; then
    echo -e "${GREEN}✓ Script capacitor-build.sh encontrado${NC}"
    if [ ! -x "capacitor-build.sh" ]; then
        echo -e "${YELLOW}  Adicionando permissão de execução...${NC}"
        chmod +x capacitor-build.sh
    fi
else
    echo -e "${RED}✗ Script capacitor-build.sh não encontrado${NC}"
fi

if [ -f "mobile-assets.sh" ]; then
    echo -e "${GREEN}✓ Script mobile-assets.sh encontrado${NC}"
    if [ ! -x "mobile-assets.sh" ]; then
        echo -e "${YELLOW}  Adicionando permissão de execução...${NC}"
        chmod +x mobile-assets.sh
    fi
else
    echo -e "${RED}✗ Script mobile-assets.sh não encontrado${NC}"
fi

# Verifica a existência de projetos Android e iOS
echo -e "\n${YELLOW}Verificando projetos nativos...${NC}"

if [ -d "android" ]; then
    echo -e "${GREEN}✓ Projeto Android encontrado${NC}"
else
    echo -e "${YELLOW}⚠ Projeto Android não encontrado.${NC}"
    echo -e "${YELLOW}  Será criado quando você executar ./capacitor-build.sh${NC}"
fi

if [ -d "ios" ]; then
    echo -e "${GREEN}✓ Projeto iOS encontrado${NC}"
else
    echo -e "${YELLOW}⚠ Projeto iOS não encontrado.${NC}"
    echo -e "${YELLOW}  Será criado quando você executar ./capacitor-build.sh${NC}"
    if [ "$(uname)" != "Darwin" ]; then
        echo -e "${YELLOW}  NOTA: Desenvolvimento iOS requer macOS${NC}"
    fi
fi

# Verifica a configuração do Capacitor
echo -e "\n${YELLOW}Verificando configuração do Capacitor...${NC}"

if [ -f "capacitor.config.ts" ]; then
    echo -e "${GREEN}✓ Arquivo de configuração encontrado${NC}"
else
    echo -e "${RED}✗ Arquivo capacitor.config.ts não encontrado${NC}"
fi

# Instruções finais
echo -e "\n${BLUE}===== PRÓXIMOS PASSOS =====${NC}"
echo -e "1. Certifique-se de que todos os recursos necessários estão presentes"
echo -e "2. Execute ${GREEN}./capacitor-build.sh${NC} para compilar o aplicativo"
echo -e "3. Para construir o APK no Android Studio, execute ${GREEN}npx cap open android${NC}"
echo -e "4. Para abrir o projeto no Xcode, execute ${GREEN}npx cap open ios${NC}"

echo -e "\n${BLUE}===== VERIFICAÇÃO CONCLUÍDA =====${NC}"