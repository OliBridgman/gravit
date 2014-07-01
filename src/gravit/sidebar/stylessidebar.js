(function (_) {

    /**
     * The styles sidebar
     * @class GStylesSidebar
     * @extends GSidebar
     * @constructor
     */
    function GStylesSidebar() {
        GSidebar.call(this);
    }
    IFObject.inherit(GStylesSidebar, GSidebar);

    GStylesSidebar.ID = "styles";
    GStylesSidebar.TITLE = new IFLocale.Key(GStylesSidebar, "title");

    /**
     * @type {JQuery}
     * @private
     */
    GStylesSidebar.prototype._stylePanel = null;

    /** @override */
    GStylesSidebar.prototype.getId = function () {
        return GStylesSidebar.ID;
    };

    /** @override */
    GStylesSidebar.prototype.getTitle = function () {
        return GStylesSidebar.TITLE;
    };

    /** @override */
    GStylesSidebar.prototype.getIcon = function () {
        return '<span class="fa fa-fw fa-leaf"></span>';
    };

    /** @override */
    GStylesSidebar.prototype.init = function (htmlElement) {
        GSidebar.prototype.init.call(this, htmlElement);

        this._stylePanel = $('<div></div>')
            .addClass('g-style-list')
            .css({
                'height': '100%',
                'overflow-y': 'auto',
                'overflow-x': 'hidden'
            })
            .gStylePanel({
                //styleSet: gApp.getActiveDocument().getScene().getStyleCollection()
            })
            .appendTo(htmlElement);
    };

    /** @override */
    GStylesSidebar.prototype._documentEvent = function (event) {
        if (event.type === GApplication.DocumentEvent.Type.Activated) {
            this._document = event.document;
            var scene = this._document.getScene();
            this._stylePanel.gStylePanel('attach', scene.getStyleCollection());
        } else if (event.type === GApplication.DocumentEvent.Type.Deactivated) {
            var scene = this._document.getScene();
            this._stylePanel.gStylePanel('detach');
        }
    };

    /** @override */
    GStylesSidebar.prototype.toString = function () {
        return "[Object GStylesSidebar]";
    };

    _.GStylesSidebar = GStylesSidebar;
})(this);