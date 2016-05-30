#!/bin/sh
# Set the base path to wherever you are placing the base machine here. Example below....
basemachine=/path/to/base/machine
privatekey=$basemachine/.vagrant/machines/default/virtualbox/private_key
inventory=$basemachine/.vagrant/provisioners/ansible/inventory/vagrant_ansible_inventory

ansible-playbook --private-key=$privatekey -i $inventory -u vagrant --extra-vars="@dev_vars.json" main_playbook.yml
