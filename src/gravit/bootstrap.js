var gravit = {
    /**
     * Array<GModule>
     */
    modules: [],

    /**
     * Array<GStorage>
     */
    storages: [],

    /**
     * Array<GExporter>
     */
    exporters: [],

    /**
     * Array<GAction>
     */
    actions: [],

    /**
     * Array<GPalette>
     */
    palettes: [],

    /**
     * Array<GSidebar>
     */
    sidebars: [],

    /**
     * Array<{{instance: IFTool, title: String|IFLocale.Key, group: String, keys: Array<String>}, icon: String}>
     */
    tools: [],

    /**
     * Array<GColorMatcher>
     */
    colorMatchers: [],

    /**
     * Array<GProperties>
     */
    properties: [],

    /**
     * Array<GStyleEntry>
     */
    styleEntries: [],

    /**
     * Array<GTransformer>
     */
    transformers: []
};

var gLoaderCode = '<div style="position: absolute; left: 0px; top: 0px; right: 0px; bottom: 0px; background: rgb(213, 223, 0);">\n    <style type="text/css">\n        .spinner {\n            width: 120px;\n            height: 120px;\n            position: absolute;\n            top: 50%;\n            left: 50%;\n            margin: -80px 0 0 -60px;\n            text-align: center;\n            -webkit-animation: rotate 2.0s infinite linear;\n            animation: rotate 2.0s infinite linear;\n        }\n\n        .spinner-dot1, .spinner-dot2 {\n            width: 60%;\n            height: 60%;\n            display: inline-block;\n            position: absolute;\n            top: 0;\n            background-color: rgb(229, 71, 97);\n            border-radius: 100%;\n            -webkit-animation: bounce 2.0s infinite ease-in-out;\n            animation: bounce 2.0s infinite ease-in-out;\n        }\n\n        .spinner-dot1 {\n            top: auto;\n            bottom: 0px;\n            -webkit-animation-delay: -1.0s;\n            animation-delay: -1.0s;\n        }\n\n        @-webkit-keyframes rotate { 100% { -webkit-transform: rotate(360deg) }}\n        @keyframes rotate { 100% { transform: rotate(360deg); -webkit-transform: rotate(360deg) }}\n\n        @-webkit-keyframes bounce {\n            0%, 100% { -webkit-transform: scale(0.0) }\n            50% { -webkit-transform: scale(1.0) }\n        }\n\n        @keyframes bounce {\n            0%, 100% {\n                transform: scale(0.0);\n                -webkit-transform: scale(0.0);\n            } 50% {\n                  transform: scale(1.0);\n                  -webkit-transform: scale(1.0);\n              }\n        }\n    </style>\n    <div class="spinner">\n        <div class="spinner-dot1"></div>\n        <div class="spinner-dot2"></div>\n    </div>\n</div>';

/**
 * @type {GShell}
 */
var gShell = null;

/**
 * @type {GApplication}
 */
var gApp = null;

var __loader = null;

// Those functions need to be called from within the shell
function gShellReady() {
    gApp = new GApplication();
}

function gShellFinished() {
    gApp.init();
    gShell.prepare();
    gApp.relayout();

    // Run shell start with a slight delay
    setTimeout(function () {
        gShell.start();
        __loader.remove();
    }, 2500);
}

// Bootstrapping when the DOM is ready
$(document).ready(function () {
    if (!gShell) {
        throw new Error("Shell needs to be initialized, first.");
    }

    // Add Gravit Loader
    __loader = $(gLoaderCode)
        .appendTo($('body'));

    //
    // -- FONTS --
    //

    //
    // TODO : Remove / handle default fonts somewhere else!?
    //

    // Open Sans
    ifFont.addType('Open Sans', IFFont.Style.Normal, IFFont.Weight.Light, 'font/OpenSans-Light.ttf');
    ifFont.addType('Open Sans', IFFont.Style.Italic, IFFont.Weight.Light, 'font/OpenSans-LightItalic.ttf');
    ifFont.addType('Open Sans', IFFont.Style.Normal, IFFont.Weight.Regular, 'font/OpenSans-Regular.ttf');
    ifFont.addType('Open Sans', IFFont.Style.Italic, IFFont.Weight.Regular, 'font/OpenSans-Italic.ttf');
    ifFont.addType('Open Sans', IFFont.Style.Normal, IFFont.Weight.SemiBold, 'font/OpenSans-Semibold.ttf');
    ifFont.addType('Open Sans', IFFont.Style.Italic, IFFont.Weight.SemiBold, 'font/OpenSans-SemiboldItalic.ttf');
    ifFont.addType('Open Sans', IFFont.Style.Normal, IFFont.Weight.Bold, 'font/OpenSans-Bold.ttf');
    ifFont.addType('Open Sans', IFFont.Style.Italic, IFFont.Weight.Bold, 'font/OpenSans-BoldItalic.ttf');
    ifFont.addType('Open Sans', IFFont.Style.Normal, IFFont.Weight.ExtraBold, 'font/OpenSans-ExtraBold.ttf');
    ifFont.addType('Open Sans', IFFont.Style.Italic, IFFont.Weight.ExtraBold, 'font/OpenSans-ExtraBoldItalic.ttf');

    // Source Sans Pro
    ifFont.addType('Source Sans Pro', IFFont.Style.Normal, IFFont.Weight.ExtraLight, 'font/SourceSansPro-ExtraLight.ttf');
    ifFont.addType('Source Sans Pro', IFFont.Style.Italic, IFFont.Weight.ExtraLight, 'font/SourceSansPro-ExtraLightIt.ttf');
    ifFont.addType('Source Sans Pro', IFFont.Style.Normal, IFFont.Weight.Light, 'font/SourceSansPro-Light.ttf');
    ifFont.addType('Source Sans Pro', IFFont.Style.Italic, IFFont.Weight.Light, 'font/SourceSansPro-LightIt.ttf');
    ifFont.addType('Source Sans Pro', IFFont.Style.Normal, IFFont.Weight.Regular, 'font/SourceSansPro-Regular.ttf');
    ifFont.addType('Source Sans Pro', IFFont.Style.Italic, IFFont.Weight.Regular, 'font/SourceSansPro-It.ttf');
    ifFont.addType('Source Sans Pro', IFFont.Style.Normal, IFFont.Weight.SemiBold, 'font/SourceSansPro-Semibold.ttf');
    ifFont.addType('Source Sans Pro', IFFont.Style.Italic, IFFont.Weight.SemiBold, 'font/SourceSansPro-SemiboldIt.ttf');
    ifFont.addType('Source Sans Pro', IFFont.Style.Normal, IFFont.Weight.Bold, 'font/SourceSansPro-Bold.ttf');
    ifFont.addType('Source Sans Pro', IFFont.Style.Italic, IFFont.Weight.Bold, 'font/SourceSansPro-BoldIt.ttf');
    ifFont.addType('Source Sans Pro', IFFont.Style.Normal, IFFont.Weight.Heavy, 'font/SourceSansPro-Black.ttf');
    ifFont.addType('Source Sans Pro', IFFont.Style.Italic, IFFont.Weight.Heavy, 'font/SourceSansPro-BlackIt.ttf');


    // Source Code Pro
    ifFont.addType('Source Code Pro', IFFont.Style.Normal, IFFont.Weight.ExtraLight, 'font/SourceCodePro-ExtraLight.ttf');
    ifFont.addType('Source Code Pro', IFFont.Style.Normal, IFFont.Weight.Light, 'font/SourceCodePro-Light.ttf');
    ifFont.addType('Source Code Pro', IFFont.Style.Normal, IFFont.Weight.Regular, 'font/SourceCodePro-Regular.ttf');
    ifFont.addType('Source Code Pro', IFFont.Style.Normal, IFFont.Weight.Medium, 'font/SourceCodePro-Medium.ttf');
    ifFont.addType('Source Code Pro', IFFont.Style.Normal, IFFont.Weight.SemiBold, 'font/SourceCodePro-Semibold.ttf');
    ifFont.addType('Source Code Pro', IFFont.Style.Normal, IFFont.Weight.Bold, 'font/SourceCodePro-Bold.ttf');
    ifFont.addType('Source Code Pro', IFFont.Style.Normal, IFFont.Weight.Heavy, 'font/SourceCodePro-Black.ttf');
});

$(window).load(function () {
    rangy.init();
});