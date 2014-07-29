var app = require('app');
var BrowserWindow = require('browser-window');

require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    if (process.platform != 'darwin')
        app.quit();
});

var Menu = require('menu');
var MenuItem = require('menu-item');
var menu = new Menu();


// This method will be called when atom-shell has done everything
// initialization and ready for creating browser windows.
app.on('ready', function () {
    // Create the browser window
    // TODO : Load window state from localStorage
    mainWindow = new BrowserWindow({width: 800, height: 600});

    // and load the index.html of the app.
    mainWindow.loadUrl('file://' + __dirname + '/index.html');




    menu.append(new MenuItem({ label: 'MenuItem123456', click: function () {
        console.log('item 1 clicked');
    } }));
    menu.append(new MenuItem({ type: 'separator' }));
    menu.append(new MenuItem({ label: 'MenuItem2', type: 'checkbox', checked: true }));

    console.log(Menu.prototype);

    menu.delegate.menuWillShow = function () {
        console.log('MENU_WILL_SHOW!!');
    }

    menu.delegate.menuWillShow();


    var appMenu = new Menu();
    appMenu.append(new MenuItem({label: 'TEST', submenu: menu}));
    Menu.setApplicationMenu(appMenu);




    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object to let it go
        mainWindow = null;
    });
});
