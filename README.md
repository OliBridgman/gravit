### Test Standalone / Desktop Shell

run grunt pck to build the app within package/desktop folder
run node-webkit executable with -dev argument to use development environment

### DEV Environment
WebStorm

## Debug Web-App:
* Run grunt
* Add Remote JS Debug Run-Configuration on URL http://127.0.0.1:8999/

## Debug Desktop-App
* run grunt pck at least once to have the node-webkit binaries
* choose the right version & platform executable for your system within package/desktop/cache
* Add a new Remote NodeJS Debug Configuration, set the port to 9222
* Add a "Before Launch" Configuration that launches your node-webkit executable including the parameter to /src and the parameter --remote-debugging-port=9222
* Run grunt, then launch your run configuration