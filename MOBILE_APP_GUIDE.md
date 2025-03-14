# Condor Center Mobile App - Guia de Construção e Instalação

Este guia descreve como construir, configurar e instalar o aplicativo móvel Condor Center para Android e iOS.

## Pré-requisitos

### Para Todos os Sistemas
- Node.js 16+ e NPM 7+
- Git
- ImageMagick (para geração de assets)

### Para Desenvolvimento Android
- Android Studio
- Java Development Kit (JDK) 11+
- Variáveis de ambiente configuradas:
  - ANDROID_HOME apontando para o diretório do Android SDK
  - JAVA_HOME apontando para o diretório do JDK

### Para Desenvolvimento iOS (apenas macOS)
- Xcode 13+
- CocoaPods
- Apple Developer Account (para distribuição na App Store)

## Arquivos Fornecidos Neste Projeto

1. **capacitor.config.ts** - Configuração principal do Capacitor
2. **capacitor-build.sh** - Script para compilar e preparar o aplicativo
3. **mobile-assets.sh** - Script para gerar ícones e splash screens
4. **resources/icon.svg** - Ícone do aplicativo em formato SVG
5. **resources/splash.svg** - Tela de splash em formato SVG
6. **android-permissions.xml** - Lista de permissões para Android

## Passos para Construção e Instalação

### Passo 1: Preparação do Ambiente

1. Instale as dependências necessárias:
   ```bash
   npm install @capacitor/android @capacitor/ios @capacitor/core @capacitor/cli
   ```

2. Certifique-se de que as dependências específicas para capacidades mobile estão instaladas:
   ```bash
   npm install @capacitor/camera @capacitor/app @capacitor/device @capacitor/local-notifications @capacitor/splash-screen
   ```

### Passo 2: Construção do Aplicativo Web

1. Execute o comando para construir a aplicação web:
   ```bash
   npm run build
   ```

2. Este comando cria a pasta `dist` com a versão otimizada da aplicação web.

### Passo 3: Criação e Configuração das Plataformas Nativas

1. Dê permissão de execução aos scripts de build:
   ```bash
   chmod +x capacitor-build.sh mobile-assets.sh
   ```

2. Execute o script de build do Capacitor:
   ```bash
   ./capacitor-build.sh
   ```

3. Este script irá:
   - Compilar a aplicação
   - Sincronizar com o Capacitor
   - Adicionar as plataformas Android e iOS (se não existirem)
   - Atualizar os projetos nativos

### Passo 4: Configuração Adicional do Android

1. Após a execução do script, a pasta `android` será criada.

2. Para adicionar as permissões necessárias, edite o arquivo `android/app/src/main/AndroidManifest.xml` e adicione as permissões listadas em `android-permissions.xml`.

3. Configure o arquivo de rede para permitir conexões (necessário para desenvolvimento):
   - Crie o arquivo `android/app/src/main/res/xml/network_security_config.xml` com o seguinte conteúdo:
     ```xml
     <?xml version="1.0" encoding="utf-8"?>
     <network-security-config>
         <base-config cleartextTrafficPermitted="true">
             <trust-anchors>
                 <certificates src="system" />
             </trust-anchors>
         </base-config>
     </network-security-config>
     ```
   - No `AndroidManifest.xml`, adicione a referência:
     ```xml
     <application
         android:networkSecurityConfig="@xml/network_security_config"
         ... >
     ```

### Passo 5: Construção do APK/AAB para Android

1. Abra o projeto Android no Android Studio:
   ```bash
   npx cap open android
   ```

2. No Android Studio:
   - Espere a sincronização do Gradle terminar
   - No menu, escolha Build > Build Bundle(s) / APK(s) > Build APK(s)
   - O APK será gerado em `android/app/build/outputs/apk/debug/app-debug.apk`

3. Alternativamente, para construir a partir da linha de comando:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```

### Passo 6: Construção do IPA para iOS (apenas macOS)

1. Abra o projeto iOS no Xcode:
   ```bash
   npx cap open ios
   ```

2. No Xcode:
   - Selecione o dispositivo de destino
   - Escolha Product > Archive
   - No organizador de arquivos, escolha "Distribute App"

## Instalando o APK em Dispositivos Android

### Método 1: Instalação Direta (Desenvolvimento)

1. Habilite a "Instalação de fontes desconhecidas" no dispositivo Android
2. Conecte o dispositivo ao computador via USB
3. Execute:
   ```bash
   npx cap run android
   ```

### Método 2: Arquivo APK

1. Copie o arquivo APK para o dispositivo
2. No dispositivo, navegue até o arquivo e toque nele para instalar
3. Siga as instruções na tela

## Instalando o App em Dispositivos iOS (apenas macOS)

### Método 1: Desenvolvimento

1. Conecte o dispositivo iOS ao Mac
2. No Xcode, selecione seu dispositivo na lista de dispositivos
3. Clique no botão "Play" (Executar)

### Método 2: TestFlight

1. Archive o app conforme o Passo 6
2. Faça upload para o App Store Connect
3. Adicione testadores ao TestFlight
4. Os testadores receberão um convite para instalar o app via TestFlight

## Solução de Problemas Comuns

### Problemas de Compilação Android
- Verifique se ANDROID_HOME e JAVA_HOME estão configurados corretamente
- Atualize o Gradle para a versão mais recente
- Execute `./gradlew clean` antes de tentar compilar novamente

### Problemas de Compilação iOS
- Verifique se CocoaPods está instalado e atualizado
- Execute `pod install` dentro da pasta `ios/App`
- Verifique se seu Apple Developer ID está configurado no Xcode

### Problemas com Permissões
- Para Android, verifique o AndroidManifest.xml
- Para iOS, verifique a configuração em Info.plist e Capabilities

## Configuração para Distribuição em Produção

### Google Play Store
1. Gere um APK assinado usando um keystore:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
2. Crie uma conta de desenvolvedor no Google Play Console
3. Crie um novo aplicativo e faça upload do AAB/APK

### Apple App Store
1. Registre-se no Apple Developer Program
2. Configure os certificados e perfis de provisionamento no Xcode
3. Archive o app e faça upload para o App Store Connect

## Notas Adicionais

- **Keystore Android**: Guarde o arquivo keystore e a senha em local seguro
- **Certificados iOS**: Gerenciados através do Apple Developer Portal
- **Firebase**: Para notificações push, adicione o arquivo `google-services.json` ao projeto Android e configure o APNs para iOS