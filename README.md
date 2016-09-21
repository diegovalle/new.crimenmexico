# new.crimenmexico

Source code for generating the website
[crimenmexico.diegovalle.net](http://crimenmexico.diegovalle.net)

ansible-playbook -i hosts playbook.yml --vault-password-file=password.txt --extra-vars "secrets=true"

There is an ansible script in the ansible directory for setting up an
Ubuntu 14.04 64 bit instance with at least 8GB of RAM. Once the instance is
setup you can run the build.sh script in the new.crimenmexico
directory. If everything went OK the website should be in the
crimenmexico.diegovalle.net directory.
