#!/usr/bin/env bash
# Préparation d'une VM Oracle Cloud (Ubuntu) : Docker + ouverture des ports 80/443 + swap si peu de RAM.
# Usage : bash deploy/oracle-setup.sh
set -euo pipefail

echo "==> Mise à jour du système"
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl iptables-persistent

echo "==> Installation de Docker"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sudo sh
fi
sudo usermod -aG docker "$USER" || true

echo "==> Ouverture des ports 80 et 443 dans le pare-feu de la VM"
# Les images Ubuntu d'Oracle bloquent tout sauf SSH : on ajoute nos règles en tête de liste.
open_port() {
  local proto="$1" port="$2"
  sudo iptables -C INPUT -p "$proto" --dport "$port" -j ACCEPT 2>/dev/null \
    || sudo iptables -I INPUT 1 -p "$proto" --dport "$port" -j ACCEPT
}
open_port tcp 80
open_port tcp 443
open_port udp 443
sudo netfilter-persistent save

echo "==> Swap (mémoire de secours) si la VM a moins de 2 Go de RAM"
MEM_MB=$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)
if [ "$MEM_MB" -lt 2000 ] && [ ! -f /swapfile ]; then
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

echo
echo "Terminé. DÉCONNECTEZ-VOUS puis reconnectez-vous en SSH (pour activer le groupe docker),"
echo "puis suivez la suite du guide DEPLOIEMENT_ORACLE.md (étape 6)."
