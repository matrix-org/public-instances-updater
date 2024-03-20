## What this does

This project is meant to be used in the CI of Matrix.org to update the list of servers that feed the Public Instance Picker.

## How to use

The project expects an `instances.toml` file at its root. It will read the servers from the list, and update the file itself with the latest version of the server.
To laun the project, run `yarn run update`.
