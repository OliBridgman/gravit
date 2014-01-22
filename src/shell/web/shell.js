(function (_) {
    /**
     * The web shell
     * @class GWebShell
     * @extends GShell
     * @constructor
     */
    function GWebShell() {
    };
    GObject.inherit(GWebShell, GShell);

    /** @override */
    GWebShell.prototype.prepareLoad = function () {
        $('<div></div>')
            .attr('id', 'gravit-loader')
            .append($('<div></div>')
                .append($('<div>')
                    .addClass('icon'))
                .append($('<div></div>')
                    .html('&nbsp;'))
                .append($('<img>')
                    .addClass('loader')))
            .appendTo($('body'));
    };

    /** @override */
    GWebShell.prototype.finishLoad = function () {
        $("#gravit-loader").remove();
    };

    /** @override */
    GWebShell.prototype.createMenuBar = function (menu) {
        throw new Error("Not Supported.");
    };

    _.gShell = new GWebShell;
})(this);
