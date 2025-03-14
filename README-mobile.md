# Condor Center - Aplicativo Móvel

## Configuração do Ambiente

### Pré-requisitos

- [Node.js](https://nodejs.org/) v16+
- [Android Studio](https://developer.android.com/studio) para desenvolvimento Android
- [Xcode](https://developer.apple.com/xcode/) para desenvolvimento iOS (somente macOS)
- [Capacitor](https://capacitorjs.com/)

## Guia Rápido

### Primeira execução

Para inicializar o ambiente Capacitor após clonar o repositório:

```bash
./capacitor-build.sh init
```

### Adicionar plataformas

Para adicionar suporte ao Android:

```bash
./capacitor-build.sh add-android
```

Para adicionar suporte ao iOS (somente em macOS):

```bash
./capacitor-build.sh add-ios
```

### Construir e atualizar o aplicativo

Para construir o aplicativo web e sincronizar com as plataformas nativas:

```bash
./capacitor-build.sh build
```

### Abrir em ambiente de desenvolvimento

Para abrir no Android Studio:

```bash
./capacitor-build.sh android
```

Para abrir no Xcode (somente macOS):

```bash
./capacitor-build.sh ios
```

## Funcionalidades Nativas

O aplicativo utiliza recursos nativos do dispositivo através do Capacitor:

- **Câmera**: Utilizada para scanner de código de barras
- **Notificações Locais**: Para enviar alertas de promoções e status de pedidos
- **Splash Screen**: Tela de inicialização personalizada
- **Integração com UI do sistema**: Adaptação ao tema do dispositivo

## Geração de APK/IPA

### Android (APK)

1. Abra o projeto no Android Studio usando `./capacitor-build.sh android`
2. No menu, vá em Build > Build Bundle(s) / APK(s) > Build APK(s)
3. O APK será gerado em `android/app/build/outputs/apk/debug/app-debug.apk`

### iOS (IPA)

1. Abra o projeto no Xcode usando `./capacitor-build.sh ios`
2. Configure os certificados de assinatura
3. Selecione Product > Archive
4. Siga as instruções para distribuir o aplicativo

## Troubleshooting

Se encontrar problemas:

1. Verifique se todas as dependências estão instaladas
2. Execute `./capacitor-build.sh build` para sincronizar novamente
3. Limpe os caches do projeto (Android Studio: File > Invalidate Caches)
4. Se o problema persistir, verifique o log do Capacitor para mais detalhes

## Recursos Adicionais

- [Documentação do Capacitor](https://capacitorjs.com/docs)
- [Guia de APIs Nativas](https://capacitorjs.com/docs/apis)