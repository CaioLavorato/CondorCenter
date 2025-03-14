#!/bin/bash

# Script para compilar e preparar o projeto para o Capacitor

# Verificar se o capacitor está instalado
if ! command -v npx cap &> /dev/null; then
  echo "Capacitor CLI não encontrado. Verifique se @capacitor/cli está instalado."
  exit 1
fi

# Cores para saída
GREEN="\033[0;32m"
BLUE="\033[0;34m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
NC="\033[0m" # No Color

echo -e "${BLUE}=== INICIANDO PROCESSO DE BUILD PARA APLICATIVO CONDOR CENTER ===${NC}"

# Etapa 1: Construir a aplicação web
echo -e "${YELLOW}[1/5]${NC} Compilando aplicação web..."
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}Erro ao compilar a aplicação web. Verifique os logs acima.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Aplicação web compilada com sucesso!${NC}"

# Etapa 2: Copiar o build para o diretório do Capacitor
echo -e "${YELLOW}[2/5]${NC} Sincronizando arquivos com o Capacitor..."
npx cap sync
if [ $? -ne 0 ]; then
  echo -e "${RED}Erro ao sincronizar com o Capacitor. Verifique os logs acima.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Arquivos sincronizados com o Capacitor!${NC}"

# Etapa 3: Preparar aplicação Android (opcional)
if [ -d "android" ]; then
  echo -e "${YELLOW}[3/5]${NC} Atualizando projeto Android..."
  
  # Se o ImageMagick estiver disponível, gera automaticamente o ícone adaptativo para Android
  if command -v convert &> /dev/null; then
    echo "Gerando ícones adaptativos para Android..."
    if [ -f "resources/icon.svg" ]; then
      mkdir -p android/app/src/main/res/mipmap-anydpi-v26
      ./mobile-assets.sh
    fi
  fi
  
  npx cap update android
  if [ $? -ne 0 ]; then
    echo -e "${RED}Erro ao atualizar o projeto Android. Verifique os logs acima.${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ Projeto Android atualizado!${NC}"
else
  echo -e "${YELLOW}[3/5]${NC} Adicionando plataforma Android..."
  npx cap add android
  if [ $? -ne 0 ]; then
    echo -e "${RED}Erro ao adicionar a plataforma Android. Verifique os logs acima.${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ Plataforma Android adicionada!${NC}"
fi

# Etapa 4: Preparar aplicação iOS (opcional)
if [ -d "ios" ]; then
  echo -e "${YELLOW}[4/5]${NC} Atualizando projeto iOS..."
  npx cap update ios
  if [ $? -ne 0 ]; then
    echo -e "${RED}Erro ao atualizar o projeto iOS. Verifique os logs acima.${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ Projeto iOS atualizado!${NC}"
else
  echo -e "${YELLOW}[4/5]${NC} Adicionando plataforma iOS..."
  npx cap add ios
  if [ $? -ne 0 ]; then
    echo -e "${RED}Erro ao adicionar a plataforma iOS. Verifique os logs acima.${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ Plataforma iOS adicionada!${NC}"
fi

# Etapa 5: Abrir IDEs nativas (opcional)
echo -e "${YELLOW}[5/5]${NC} Próximos passos:"
echo -e "  Para abrir o projeto Android Studio: ${BLUE}npx cap open android${NC}"
echo -e "  Para abrir o projeto Xcode: ${BLUE}npx cap open ios${NC}"
echo -e "  Para executar em Android: ${BLUE}npx cap run android${NC}"
echo -e "  Para executar em iOS: ${BLUE}npx cap run ios${NC}"

echo -e "\n${GREEN}=== BUILD CONCLUÍDO COM SUCESSO! ===${NC}"
echo -e "O Condor Center está pronto para ser compilado como aplicativo nativo."