# Ordem de Arquivos para Desenvolvimento Mobile do Condor Center

Abaixo está a sequência recomendada de arquivos para entender e construir o aplicativo móvel Condor Center.

## 1. Documentação e Visão Geral

1. **README-CONDOR-MOBILE.md** - Documentação principal específica para o Condor Center
2. **MOBILE_APP_GUIDE.md** - Guia detalhado para construção e instalação do APK
3. **mobile-workflow.svg** - Diagrama visual do fluxo de trabalho

## 2. Configuração do Ambiente

4. **capacitor.config.ts** - Configuração principal do Capacitor
5. **android-permissions.xml** - Permissões necessárias para Android
6. **prepare-mobile-environment.sh** - Script para verificar o ambiente de desenvolvimento

## 3. Recursos Visuais

7. **resources/icon.svg** - Ícone do aplicativo
8. **resources/splash.svg** - Tela de splash
9. **mobile-assets.sh** - Script para gerar os assets nos tamanhos corretos

## 4. Integração Nativa

10. **client/src/lib/capacitor.ts** - Funções para acesso a recursos nativos
11. **client/src/hooks/use-mobile-device.tsx** - Hook React para informações do dispositivo

## 5. Build e Instalação

12. **capacitor-build.sh** - Script para construir e preparar o aplicativo
13. **install-mobile-apps.sh** - Script para instalar o APK em dispositivos

## 6. Projetos Nativos (criados automaticamente)

14. **android/** - Projeto Android Studio (criado pelo capacitor-build.sh)
15. **ios/** - Projeto Xcode (criado pelo capacitor-build.sh em macOS)

## Ordem de Execução dos Scripts

Para o desenvolvimento e compilação do APK, execute os scripts na seguinte ordem:

1. `./prepare-mobile-environment.sh` - Para verificar o ambiente de desenvolvimento
2. `./capacitor-build.sh` - Para construir o aplicativo
3. `npx cap open android` - Para abrir no Android Studio e compilar o APK
4. `./install-mobile-apps.sh` - Para instalar o APK em dispositivos conectados