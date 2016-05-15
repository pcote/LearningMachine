#!/bin/sh
# Set the base path to wherever you are placing the base machine here. Example below....
# base_machine_path=/home/yourusername/basemachine
base_machine_path=
ansible-playbook -i $base_machine_path/.vagrant/provisioners/ansible/inventory/vagrant_ansible_inventory -u vagrant --private-key=$base_machine_path/.vagrant/machines/default/virtualbox/private_key --extra-vars="@dev_vars.json" main_playbook.yml
