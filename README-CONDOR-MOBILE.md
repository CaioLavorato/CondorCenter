# Condor Center - Aplicativo Mobile

Este documento contém informações específicas para o desenvolvimento e instalação do aplicativo móvel Condor Center, atendendo aos requisitos do Step One - Fase 1 conforme especificações.

## Visão Geral do Projeto

O Condor Center é um aplicativo mobile multiplataforma que permite aos moradores de condomínios realizar compras no minimercado através do escaneamento de códigos de barras, gerenciar métodos de pagamento e receber notificações.

## Características da Fase 1

### Cadastro e Login
- Campos obrigatórios:
  - Nome completo
  - Telefone (com verificação por código SMS)
  - E-mail
  - Aceite de termos e condições
- Login via e-mail/CPF e senha
- Recuperação de senha

### Tela Inicial (Home)
- Identificação do usuário e do prédio
- Banners/carrossel promocional
- Atalho para escanear produtos
- Acesso ao suporte via WhatsApp
- Notificações com contador
- Acesso ao perfil/configurações

### Fluxo de Compra
- Escaneamento de código de barras
- Visualização de detalhes do produto
- Carrinho de compras
- Métodos de pagamento (PIX e cartão de crédito)
- Confirmação de compra
- Histórico de compras

### Tecnologias Utilizadas
- Frontend: React / TypeScript
- Mobile: Capacitor (Android e iOS)
- Estilização: Tailwind CSS / Shadcn UI

## Requisitos Técnicos

### Dispositivos Suportados
- **Android**: Versão 7.0 (Nougat) ou superior
- **iOS**: Versão 13.0 ou superior
- **Web**: Navegadores modernos com suporte a ES6

### Permissões Necessárias
- Câmera (para escaneamento)
- Internet
- Local Notifications
- Armazenamento (para cache offline)
- Localização (opcional, para identificação do prédio)

## Estrutura de Arquivos Mobile

```
/
├── android/                       # Projeto Android
├── ios/                           # Projeto iOS (apenas macOS)
├── resources/                     # Ícones e splashscreens
│   ├── icon.svg                   # Ícone principal do app
│   └── splash.svg                 # Splash screen
├── capacitor.config.ts            # Configuração do Capacitor
├── capacitor-build.sh             # Script para build do app
├── mobile-assets.sh               # Script para gerar assets
├── prepare-mobile-environment.sh  # Verificação do ambiente
├── install-mobile-apps.sh         # Instalação em dispositivos
├── android-permissions.xml        # Lista de permissões Android
├── client/src/lib/capacitor.ts    # Integrações nativas
└── client/src/hooks/use-mobile-device.tsx  # Hook de dispositivo
```

## Configuração do Ambiente de Desenvolvimento

### Requisitos Globais
- Node.js 16+
- NPM 7+
- Git
- ImageMagick (opcional, para assets)

### Para Android
- Android Studio
- JDK 11+
- Dispositivo Android físico ou emulador

### Para iOS (apenas macOS)
- Xcode 13+
- CocoaPods
- Dispositivo iOS físico ou simulador

## Passos para Iniciar o Desenvolvimento

### 1. Preparação
```bash
# Dar permissão de execução aos scripts
chmod +x *.sh

# Verificar o ambiente de desenvolvimento
./prepare-mobile-environment.sh
```

### 2. Compilação e Construção
```bash
# Construir o aplicativo
./capacitor-build.sh
```

### 3. Desenvolvimento Android
```bash
# Abrir no Android Studio
npx cap open android

# Executar em dispositivo/emulador
npx cap run android
```

### 4. Desenvolvimento iOS (apenas macOS)
```bash
# Abrir no Xcode
npx cap open ios

# Executar em dispositivo/simulador
npx cap run ios
```

## Instalação do APK em Dispositivos

### Método via Script
```bash
# Para dispositivos conectados via USB
./install-mobile-apps.sh
```

### Método Manual
1. Compile o APK no Android Studio
2. Localize o APK em `android/app/build/outputs/apk/debug/app-debug.apk`
3. Transfira para o dispositivo via cabo, e-mail ou serviço de compartilhamento
4. No dispositivo, instale o APK (ative "Fontes desconhecidas" se necessário)

## Padrões de Design

### Estilo Visual
- Cores principais: roxo (#6200EE) e laranja (cores da marca Condor)
- Interface limpa e minimalista
- Botões e elementos interativos amplos para facilitar o toque
- Feedback visual para ações do usuário

### Experiência do Usuário
- Navegação simplificada com máximo 2-3 cliques
- Foco na funcionalidade de escaneamento
- Feedback imediato após ações importantes
- Sistema de notificações para promoções e status de pagamentos

## Solução de Problemas Comuns

### Problemas com a Câmera
- Verifique se as permissões foram concedidas no dispositivo
- No Android: verifique o AndroidManifest.xml
- No iOS: verifique Info.plist

### Problemas de Compilação
- Android: execute `cd android && ./gradlew clean`
- iOS: execute `cd ios/App && pod install`

### Problemas com o Capacitor
- Execute `npx cap sync` para sincronizar as alterações
- Verifique se a versão do Capacitor está atualizada

## Documentação Adicional

Para mais detalhes sobre o desenvolvimento e outras funcionalidades, consulte:
- [Guia de Instalação do APK](./MOBILE_APP_GUIDE.md)
- [Documentação do Capacitor](https://capacitorjs.com/docs)
- [README de Desenvolvimento Mobile](./README-mobile.md)