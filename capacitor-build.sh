#!/bin/bash

# Esse script ajuda a construir e gerenciar o aplicativo Capacitor

# Função para exibir mensagens de ajuda
show_help() {
  echo "Uso: ./capacitor-build.sh [opção]"
  echo "Opções:"
  echo "  init        - Inicializa o Capacitor no projeto"
  echo "  build       - Constrói o projeto e sincroniza com o Capacitor"
  echo "  add-android - Adiciona a plataforma Android"
  echo "  add-ios     - Adiciona a plataforma iOS"
  echo "  android     - Constrói e abre o projeto Android (necessita Android Studio)"
  echo "  ios         - Constrói e abre o projeto iOS (necessita Xcode, apenas em macOS)"
  echo "  help        - Exibe esta mensagem de ajuda"
}

# Verificação de argumentos
if [ $# -eq 0 ]; then
  show_help
  exit 1
fi

# Executa a ação com base no argumento fornecido
case "$1" in
  init)
    echo "Inicializando o Capacitor..."
    npx cap init
    ;;
    
  build)
    echo "Construindo o projeto e sincronizando com o Capacitor..."
    npm run build
    npx cap sync
    echo "Sincronização concluída!"
    ;;
    
  add-android)
    echo "Adicionando suporte para Android..."
    npx cap add android
    echo "Plataforma Android adicionada com sucesso!"
    ;;
    
  add-ios)
    echo "Adicionando suporte para iOS..."
    npx cap add ios
    echo "Plataforma iOS adicionada com sucesso!"
    ;;
    
  android)
    echo "Construindo e abrindo o projeto Android..."
    npm run build
    npx cap sync
    npx cap open android
    ;;
    
  ios)
    echo "Construindo e abrindo o projeto iOS..."
    npm run build
    npx cap sync
    npx cap open ios
    ;;
    
  help)
    show_help
    ;;
    
  *)
    echo "Opção desconhecida: $1"
    show_help
    exit 1
    ;;
esac

exit 0