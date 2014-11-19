(function (_) {
    var LOADER_CODE = '<div style="position: absolute; left: 0px; top: 0px; right: 0px; bottom: 0px; background: rgb(213, 223, 0);">\n    <style type="text/css">\n        .spinner {\n            width: 120px;\n            height: 120px;\n            position: absolute;\n            top: 50%;\n            left: 50%;\n            margin: -80px 0 0 -60px;\n            text-align: center;\n            -webkit-animation: rotate 2.0s infinite linear;\n            animation: rotate 2.0s infinite linear;\n        }\n\n        .spinner-dot1, .spinner-dot2 {\n            width: 60%;\n            height: 60%;\n            display: inline-block;\n            position: absolute;\n            top: 0;\n            background-color: rgb(229, 71, 97);\n            border-radius: 100%;\n            -webkit-animation: bounce 2.0s infinite ease-in-out;\n            animation: bounce 2.0s infinite ease-in-out;\n        }\n\n        .spinner-dot1 {\n            top: auto;\n            bottom: 0px;\n            -webkit-animation-delay: -1.0s;\n            animation-delay: -1.0s;\n        }\n\n        @-webkit-keyframes rotate { 100% { -webkit-transform: rotate(360deg) }}\n        @keyframes rotate { 100% { transform: rotate(360deg); -webkit-transform: rotate(360deg) }}\n\n        @-webkit-keyframes bounce {\n            0%, 100% { -webkit-transform: scale(0.0) }\n            50% { -webkit-transform: scale(1.0) }\n        }\n\n        @keyframes bounce {\n            0%, 100% {\n                transform: scale(0.0);\n                -webkit-transform: scale(0.0);\n            } 50% {\n                  transform: scale(1.0);\n                  -webkit-transform: scale(1.0);\n              }\n        }\n    </style>\n    <div class="spinner">\n        <div class="spinner-dot1"></div>\n        <div class="spinner-dot2"></div>\n    </div>\n</div>';

    var FONTS = [
        {
            family: 'Open Sans',
            category: GFont.Category.Serif,
            substitutes: [
                {style: GFont.Style.Normal, weight: GFont.Weight.Light, url: 'font/OpenSans-Light.ttf'},
                {style: GFont.Style.Italic, weight: GFont.Weight.Light, url: 'font/OpenSans-LightItalic.ttf'},
                {style: GFont.Style.Normal, weight: GFont.Weight.Regular, url: 'font/OpenSans-Regular.ttf'},
                {style: GFont.Style.Italic, weight: GFont.Weight.Regular, url: 'font/OpenSans-Italic.ttf'},
                {style: GFont.Style.Normal, weight: GFont.Weight.SemiBold, url: 'font/OpenSans-Semibold.ttf'},
                {style: GFont.Style.Italic, weight: GFont.Weight.SemiBold, url: 'font/OpenSans-SemiboldItalic.ttf'},
                {style: GFont.Style.Normal, weight: GFont.Weight.Bold, url: 'font/OpenSans-Bold.ttf'},
                {style: GFont.Style.Italic, weight: GFont.Weight.Bold, url: 'font/OpenSans-BoldItalic.ttf'},
                {style: GFont.Style.Normal, weight: GFont.Weight.ExtraBold, url: 'font/OpenSans-ExtraBold.ttf'},
                {style: GFont.Style.Italic, weight: GFont.Weight.ExtraBold, url: 'font/OpenSans-ExtraBoldItalic.ttf'}
            ]
        },
        {
            family: 'Source Sans Pro',
            category: GFont.Category.Serif,
            substitutes: [
                {style: GFont.Style.Normal, weight: GFont.Weight.Regular, url: 'font/SourceSansPro-Regular.ttf'}
            ]
        }
    ]

    /**
     * The gravit application class
     * @class GravitApplication
     * @extends GApplication
     * @constructor
     */
    function GravitApplication() {
        GApplication.call(this);
    };
    GObject.inherit(GravitApplication, GApplication);

    /**
     * @type {JQuery}
     * @private
     */
    GravitApplication.prototype._loader = null;

    /** @override */
    GravitApplication.prototype.prepare = function () {
        GApplication.prototype.prepare.call(this);

        // Add loader code
        this._loader = $(LOADER_CODE)
            .appendTo($('body'));
    };

    /** @override */
    GravitApplication.prototype.init = function () {
        var fontPromises = [];

        for (var i = 0; i < FONTS.length; ++i) {
            var font = FONTS[i];
            for (var k = 0; k < font.substitutes.length; ++k) {
                var substitute = font.substitutes[k];
                fontPromises.push(ifFont.addType(font.family, substitute.style, substitute.weight, substitute.url, font.category));
            }
        }

        return $.when(GApplication.prototype.init.call(this), $.when.apply($, fontPromises))
    };

    /** @override */
    GravitApplication.prototype.start = function () {
        this._loader.remove();
    };

    _.GravitApplication = GravitApplication;
    _.gApp = new GravitApplication();
})(this);
