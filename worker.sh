#!/usr/bin/env bash
# ==============================================================================
# Worker Node Setup Script for QuickTick Application
# OS Supported: Ubuntu 22.04 / 24.04 LTS (AWS EC2 Worker Node)
# Installed Components: Java 21, Docker, Containerd, Kubelet, Kubeadm, Kubectl
# ==============================================================================

set -eo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=====================================================${NC}"
echo -e "${GREEN} Starting QuickTick Worker Node Installation (Java 21 & K8s) ${NC}"
echo -e "${GREEN}=====================================================${NC}"

# 1. Disable Swap (Kubernetes Requirement)
echo -e "${YELLOW}[1/5] Disabling swap...${NC}"
sudo swapoff -a
sudo sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab

# 2. Kernel Modules & Networking Parameters
echo -e "${YELLOW}[2/5] Configuring Kernel Modules and Sysctl settings...${NC}"
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

sudo modprobe overlay
sudo modprobe br_netfilter

cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sudo sysctl --system

# 3. System Packages & Java 21 Installation
echo -e "${YELLOW}[3/5] Installing System Utilities & Java 21...${NC}"
sudo apt-get update -y
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common \
    openjdk-21-jdk

echo -e "${GREEN}Java Version:${NC}"
java -version

# 4. Container Runtime Setup (Docker & Containerd)
echo -e "${YELLOW}[4/5] Installing Docker & Containerd...${NC}"
sudo apt-get install -y docker.io containerd

sudo systemctl enable --now docker
sudo systemctl enable --now containerd

# Configure containerd Systemd cgroup driver
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml >/dev/null
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/g' /etc/containerd/config.toml
sudo systemctl restart containerd

# Add current user to docker group
sudo usermod -aG docker "$USER" || true

# 5. Kubernetes (Kubeadm, Kubelet, Kubectl v1.30) Installation
echo -e "${YELLOW}[5/5] Installing Kubernetes (kubelet, kubeadm, kubectl)...${NC}"
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.30/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.30/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt-get update -y
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
sudo systemctl enable --now kubelet

echo -e "${GREEN}=====================================================${NC}"
echo -e "${GREEN} Worker Node Dependencies Installation Complete! ${NC}"
echo -e "${GREEN}=====================================================${NC}"
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "Copy and execute the '${YELLOW}kubeadm join ...${NC}' command printed at the end of the '${GREEN}master.sh${GREEN}' script on this worker node."
echo -e "Example:"
echo -e "  sudo kubeadm join <MASTER_IP>:6443 --token <TOKEN> --discovery-token-ca-cert-hash sha256:<HASH>"
