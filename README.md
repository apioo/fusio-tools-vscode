
# Fusio VSCode extension

## Overview

This extension integrates Fusio support into VSCode. That means you can connect to a Fusio instance an load, edit and execute actions through VSCode.
It provides a more advanced development environment for developers who want to create actions for Fusio. More information about Fusio at:
https://www.fusio-project.org/

![Screenshot](./media/screenshot.png)

On the left sidebar Fusio list Actions, Schemas and Connections of your remote instance:

## Actions

If you click on an action the action code gets downloaded and will be written to a local file, which you can then edit. If you save the document Fusio will sync back all changes to the remote instance. If you run the "execute" Command on an action it will execute the action and return the response in the output window.

## Schemas

If you click on a schema the extension will show you a HTML rendered version of the defined schema. This is especially useful if a developer needs to create an action which should follow the defined schema.

## Connections

If you click on a connection  the extension will show an API documentation which can be helpful if you want to use this connection in your action.
