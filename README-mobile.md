# Condor Center - Aplicativo Mobile

Este documento contém informações sobre a versão mobile do aplicativo Condor Center, incluindo recursos específicos para Android e iOS, guias de configuração e dicas de desenvolvimento.

## Visão Geral

O Condor Center Mobile é uma aplicação híbrida construída com React/TypeScript para o frontend e Node.js/Express para o backend, utilizando o framework Capacitor para transformar a aplicação web em aplicativos nativos para Android e iOS.

## Requisitos

- Node.js 16+
- NPM 7+
- Android Studio (para desenvolvimento Android)
- Xcode 13+ (para desenvolvimento iOS, apenas macOS)
- CocoaPods (para iOS)
- ImageMagick (opcional, para geração de assets)

## Recursos Específicos para Mobile

- Escaneamento de códigos de barras/QR Code
- Notificações push
- Salvamento offline de dados
- Compartilhamento de conteúdo
- Acesso à câmera
- Animações otimizadas para touch

## Instalação e Configuração

### Preparação do Ambiente

1. Certifique-se de ter Node.js e NPM instalados
2. Instale as dependências do projeto:
   ```
   npm install
   ```
3. Para desenvolvimento Android, instale o Android Studio e configure o SDK
4. Para desenvolvimento iOS, instale Xcode e CocoaPods (apenas em macOS)

### Construindo e Executando

#### Construir a versão web e sincronizar com Capacitor

```bash
./capacitor-build.sh
```

Esse script irá:
1. Compilar a aplicação web
2. Sincronizar os arquivos com o Capacitor
3. Atualizar projetos Android e iOS
4. Fornecer comandos para execução

#### Desenvolvimento Android

Após executar o script de build:

```bash
npx cap open android
```

Isso abrirá o projeto no Android Studio. A partir daí, você pode:
- Compilar e executar o aplicativo em um emulador ou dispositivo físico
- Depurar usando ferramentas nativas do Android
- Modificar recursos específicos do Android

#### Desenvolvimento iOS (apenas macOS)

Após executar o script de build:

```bash
npx cap open ios
```

Isso abrirá o projeto no Xcode. A partir daí, você pode:
- Compilar e executar o aplicativo em um simulador ou dispositivo físico
- Depurar usando ferramentas nativas do iOS
- Modificar recursos específicos do iOS

## Estrutura de Diretórios

```
/
├── android/               # Projeto Android Studio
├── ios/                   # Projeto Xcode
├── capacitor.config.ts    # Configuração do Capacitor
├── resources/             # Ícones e splash screens
├── client/src/lib/capacitor.ts   # Utilitários para Capacitor
├── client/src/hooks/use-mobile-device.tsx  # Hook para informações do dispositivo
├── capacitor-build.sh     # Script de build para Capacitor
└── mobile-assets.sh       # Script para gerar assets mobile
```

## Personalização e Temas

O aplicativo Condor Center usa uma abordagem de design responsivo e adaptativo que:

- Ajusta layouts automaticamente para diferentes tamanhos de tela
- Implementa gestos de toque nativos (swipe, pinch, etc.)
- Adapta-se a diferentes densidades de pixel
- Suporta temas claro e escuro
- Considera as áreas seguras (notches, navegação por gestos, etc.)

## Geração de Ícones e Splash Screens

Para gerar ícones e splash screens para todas as plataformas e resoluções necessárias:

```bash
./mobile-assets.sh
```

Este script utiliza o ImageMagick para converter os arquivos SVG em resources/ para todas as resoluções necessárias.

## Plugins Capacitor Utilizados

- @capacitor/core: Biblioteca principal
- @capacitor/android: Suporte ao Android
- @capacitor/ios: Suporte ao iOS
- @capacitor/camera: Acesso à câmera
- @capacitor/local-notifications: Notificações locais
- @capacitor/splash-screen: Gerenciamento da splash screen
- @capacitor/app: Eventos do ciclo de vida do aplicativo
- @capacitor/device: Informações sobre o dispositivo

## Solução de Problemas

### Problemas comuns em Android

- **Erro no AndroidManifest.xml**: Certifique-se de que todas as permissões necessárias estão declaradas.
- **Problemas com SSL**: Em modo de desenvolvimento, configure o Network Security Config para permitir tráfego HTTP.
- **Erros de compilação**: Execute `npx cap sync` para garantir que todas as dependências estejam atualizadas.

### Problemas comuns em iOS

- **Erros de CocoaPods**: Execute `pod repo update` e depois `pod install` no diretório `ios/App/`.
- **Problemas de certificados**: Configure corretamente os perfis de provisionamento no Xcode.
- **Problemas com permissões**: Verifique se as descrições de uso (Usage Description) estão configuradas no Info.plist.

## Notas de Implementação

- A detecção de dispositivo é feita através do hook `useMobileDevice`
- Funcionalidades nativas são implementadas de forma condicional, com fallbacks para a web
- CSS específico para aplicativos nativos é aplicado usando as classes 'native-app', 'ios-app', e 'android-app'

## Considerações de Performance

Para garantir a melhor experiência em dispositivos móveis:

- Otimize imagens e assets para reduzir o tamanho do aplicativo
- Minimize o uso de animações complexas em dispositivos de baixo desempenho
- Implemente carregamento lazy para componentes e dados
- Armazene dados em cache para uso offline
- Minimize o número de requisições de rede

## Próximos Passos

- [ ] Implementar sincronização offline
- [ ] Adicionar autenticação biométrica
- [ ] Otimizar para diferentes tamanhos de tela (tablets)
- [ ] Implementar modo de baixo consumo de dados
- [ ] Adicionar testes automatizados específicos para mobile