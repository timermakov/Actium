resource "yandex_compute_instance" "vm" {
  name        = var.vm_name
  platform_id = "standard-v3"
  zone        = var.yc_zone

  resources {
    cores  = 2
    memory = 2
  }

  boot_disk {
    initialize_params {
      # public Ubuntu 22.04 image ID; при необходимости замени на свой
      image_id = "fd8q3e0q9ul4********"
      size     = 20
    }
  }

  network_interface {
    subnet_id = var.subnet_id
    nat       = true
  }

  metadata = {
    ssh-keys = "${var.ssh_user}:${var.ssh_pubkey}"
  }
}

