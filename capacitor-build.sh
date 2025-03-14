#!/bin/bash

# Script para construir o aplicativo Condor Center para Android e iOS usando Capacitor

# Cores para melhor visualização
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

echo -e "${BLUE}===== CONSTRUÇÃO DO APLICATIVO CONDOR CENTER =====${NC}"

# Verifica se as dependências do Capacitor estão instaladas
if ! npm list @capacitor/core &> /dev/null; then
    echo -e "${RED}O Capacitor não está instalado. Execute primeiro ./prepare-mobile-environment.sh${NC}"
    exit 1
fi

# Passo 1: Compilar a aplicação web
echo -e "${YELLOW}Compilando aplicação web...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}Falha na compilação da aplicação web. Verifique os erros acima.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Compilação da aplicação web concluída${NC}"

# Passo 2: Copiar recursos (ícones e splash screens) para diretório dist
echo -e "${YELLOW}Copiando recursos...${NC}"
RESOURCES_DIR="./resources"
DIST_RESOURCES="./dist/resources"

if [ -d "$RESOURCES_DIR" ]; then
    mkdir -p "$DIST_RESOURCES"
    cp -r "$RESOURCES_DIR"/* "$DIST_RESOURCES"
    echo -e "${GREEN}✓ Recursos copiados para dist${NC}"
else
    echo -e "${RED}Diretório de recursos não encontrado. Execute ./prepare-mobile-environment.sh${NC}"
    exit 1
fi

# Passo 3: Executar script de assets (se existir)
if [ -f "./mobile-assets.sh" ]; then
    echo -e "${YELLOW}Gerando assets para dispositivos móveis...${NC}"
    ./mobile-assets.sh
    if [ $? -ne 0 ]; then
        echo -e "${RED}Falha na geração de assets. Verifique os erros acima.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Assets gerados com sucesso${NC}"
else
    echo -e "${YELLOW}Script mobile-assets.sh não encontrado. Os assets não serão gerados automaticamente.${NC}"
fi

# Passo 4: Verificar e adicionar as plataformas se não existirem
echo -e "${YELLOW}Verificando e configurando plataformas...${NC}"

# Verificar se o diretório Android existe
if [ ! -d "./android" ]; then
    echo -e "${YELLOW}Adicionando plataforma Android...${NC}"
    npx cap add android
    if [ $? -ne 0 ]; then
        echo -e "${RED}Falha ao adicionar plataforma Android. Verifique os erros acima.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Plataforma Android adicionada${NC}"
else
    echo -e "${GREEN}✓ Plataforma Android já existe${NC}"
fi

# Verificar se o diretório iOS existe (apenas no macOS)
if [ "$(uname)" == "Darwin" ]; then
    if [ ! -d "./ios" ]; then
        echo -e "${YELLOW}Adicionando plataforma iOS...${NC}"
        npx cap add ios
        if [ $? -ne 0 ]; then
            echo -e "${RED}Falha ao adicionar plataforma iOS. Verifique os erros acima.${NC}"
            exit 1
        fi
        echo -e "${GREEN}✓ Plataforma iOS adicionada${NC}"
    else
        echo -e "${GREEN}✓ Plataforma iOS já existe${NC}"
    fi
else
    echo -e "${YELLOW}Sistema não é macOS, a plataforma iOS não será adicionada.${NC}"
fi

# Passo 5: Sincronizar alterações com os projetos nativos
echo -e "${YELLOW}Sincronizando alterações com os projetos nativos...${NC}"
npx cap sync

if [ $? -ne 0 ]; then
    echo -e "${RED}Falha na sincronização. Verifique os erros acima.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Sincronização com projetos nativos concluída${NC}"

# Passo 6: Atualizar permissões do Android
if [ -d "./android" ] && [ -f "./android-permissions.xml" ]; then
    echo -e "${YELLOW}Verificando permissões do Android...${NC}"
    
    ANDROID_MANIFEST="./android/app/src/main/AndroidManifest.xml"
    
    # Aqui seria necessário um script mais complexo para analisar e modificar o XML
    # Como é complexo manipular XML em um script shell, exibiremos apenas instruções
    echo -e "${YELLOW}⚠ Para adicionar permissões ao Android, copie manualmente as permissões de android-permissions.xml para $ANDROID_MANIFEST${NC}"
    echo -e "${YELLOW}  Este processo precisará ser feito manualmente no Android Studio.${NC}"
else
    echo -e "${YELLOW}Arquivo android-permissions.xml não encontrado. Verifique as permissões manualmente.${NC}"
fi

# Passo 7: Configuração para produção
echo -e "${YELLOW}Verificando configuração para produção...${NC}"

# Verificar se existe um ícone gerado
if [ -f "./generated-icon.png" ]; then
    echo -e "${GREEN}✓ Ícone para produção encontrado${NC}"
else
    echo -e "${YELLOW}Gerando ícone para produção...${NC}"
    
    # Gerar um ícone simplificado se ImageMagick estiver instalado
    if command -v convert &> /dev/null; then
        convert -size 1024x1024 -background "#6200EE" -fill white -gravity center -font Arial-Bold -pointsize 200 label:"CC" generated-icon.png
        echo -e "${GREEN}✓ Ícone para produção gerado${NC}"
    else
        echo -e "${YELLOW}⚠ ImageMagick não encontrado. O ícone para produção não será gerado automaticamente.${NC}"
    fi
fi

# Passo 8: Instruções finais
echo -e "\n${BLUE}===== CONSTRUÇÃO CONCLUÍDA =====${NC}"
echo -e "${GREEN}O aplicativo foi construído com sucesso!${NC}"
echo -e "\n${YELLOW}Próximos passos:${NC}"

echo -e "${BLUE}Para Android:${NC}"
echo -e "1. Abra o projeto no Android Studio: ${GREEN}npx cap open android${NC}"
echo -e "2. Construa o APK no Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s)"
echo -e "3. Ou via linha de comando: ${GREEN}cd android && ./gradlew assembleDebug${NC}"
echo -e "4. O APK estará disponível em: ${GREEN}android/app/build/outputs/apk/debug/app-debug.apk${NC}"
echo -e "5. Para instalar em dispositivos conectados: ${GREEN}./install-mobile-apps.sh${NC}"

if [ "$(uname)" == "Darwin" ]; then
    echo -e "\n${BLUE}Para iOS:${NC}"
    echo -e "1. Abra o projeto no Xcode: ${GREEN}npx cap open ios${NC}"
    echo -e "2. Configure seu time de desenvolvimento no Xcode"
    echo -e "3. Conecte um dispositivo iOS ou selecione um simulador"
    echo -e "4. Clique em 'Run' no Xcode"
fi

echo -e "\n${BLUE}Para mais informações, consulte:${NC}"
echo -e "- ${GREEN}README-CONDOR-MOBILE.md${NC} para documentação completa"
echo -e "- ${GREEN}MOBILE_APP_GUIDE.md${NC} para um guia detalhado de construção e instalação"
echo -e "- ${GREEN}passos-instalacao-apk.html${NC} para instruções visuais simplificadas"