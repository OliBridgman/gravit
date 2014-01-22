$(document).ready(function () {
    // Initialize Application
    gApp = new EXApplication();
});


// Init when everything is finally loaded
$(window).load(function () {
    // Pre-init application
    gApp.preInit();

    // Init application now
    gApp.init();

    gshell.openShell();
});