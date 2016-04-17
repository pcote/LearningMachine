# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  config.vm.box = "ubuntu/trusty64"

  # `vagrant box outdated`. This is not recommended.
  # config.vm.box_check_update = false
  config.vm.network "forwarded_port", guest: 80, host: 8080
  #config.vm.network "private_network", ip: "192.168.33.10"
  # config.vm.network "public_network"
  # config.vm.synced_folder "../data", "/vagrant_data"
  #
  config.vm.provider "virtualbox" do |vb|
    vb.gui = false 
    vb.memory = "512"
  end

  config.vm.provision "ansible" do |ansible|
    ansible.verbose="v"
    ansible.extra_vars = {
        host: "all",
        root_password: "setRootPasswordHere",
        public_password: "setPublicPasswordHere",
        domain: "domain.goes.here",
        session_key: "sesson_key_goes_here",
    }
    ansible.playbook = "main_playbook.yml"
  end 
end
