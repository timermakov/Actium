variable "yc_token" {
  description = "Yandex Cloud OAuth token / API key"
  type        = string
}

variable "yc_cloud_id" {
  description = "Yandex Cloud ID"
  type        = string
}

variable "yc_folder_id" {
  description = "Yandex Cloud folder ID"
  type        = string
}

variable "yc_zone" {
  description = "YC zone, e.g. ru-central1-a"
  type        = string
  default     = "ru-central1-a"
}

variable "vm_name" {
  description = "Name of VM instance"
  type        = string
  default     = "devops-lab-vm"
}

variable "ssh_user" {
  description = "Linux user name for SSH (e.g. tsermakov)"
  type        = string
  default     = "tsermakov"
}

variable "ssh_pubkey" {
  description = "SSH public key content (id_rsa.pub)"
  type        = string
}

variable "subnet_id" {
  description = "Existing YC subnet ID where VM will be created"
  type        = string
}

