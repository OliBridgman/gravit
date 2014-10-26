(function (_) {

    /**
     * Base class for an panel
     * @class GPanel
     * @extends GView
     * @constructor
     */
    function GPanel() {
        GView.call(this);
    };
    GObject.inherit(GPanel, GView);

    /**
     * Get the title of the panel
     * @return {String|GLocale.Key}
     */
    GPanel.prototype.getTitle = function () {
        return null;
    };

    /**
     * Called to let the panel initialize on a given panel
     * @param {JQuery} htmlElement the panel to put the panel into
     */
    GPanel.prototype.init = function (htmlElement) {
        gApp.addEventListener(GApplication.DocumentEvent, this._documentEvent, this);
    };

    /**
     * Called whenever the panel gets activated
     */
    GPanel.prototype.activate = function () {
        // NO-OP
    };

    /**
     * Called whenever the panel gets deactivated
     */
    GPanel.prototype.deactivate = function () {
        // NO-OP
    };

    /** @override */
    GPanel.prototype.toString = function () {
        return "[Object GPanel]";
    };

    _.GPanel = GPanel;
})(this);