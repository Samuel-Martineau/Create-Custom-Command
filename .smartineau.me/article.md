# Create-Custom-Command (FR)

**Un CLI pour facilement créer vos propres CLI**  
Important: _Ce CLI n'a été testé que sur Ubuntu 18.04 (LTS) avec ZSH et MacOS Catalina avec ZSH_

## Installation

`$ npm i -g create-custom-command`

## Configuration

Le programme va vous demander votre _nom_ et la _langue_ que vous préférez (_Français_ / _Anglais_)

`$ config-cccmd`

Pour effacer la configuration de ce paquet, exécutez **`$ reset-cccmd`**

## Utilisation

**Pour créer une commande**  
Le programme va vous demander le _nom_ de la commande, sa _description_ et le _language_ de programmation dans lequel vous voulez la codé (_BASH / ZSH_ ou _JS_)

`$ mk-cmd`

**Pour supprimer une commande**  
Le programme va vous afficher la liste des commandes que vous avez créées et vous pourrez sélectionner celle que vous voulez supprimer

`$ rm-cmd`
