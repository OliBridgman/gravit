(function (_) {

    /**
     * The styles sidebar
     * @class GStylesSwatchesSidebar
     * @extends GSidebar
     * @constructor
     */
    function GStylesSwatchesSidebar() {
        GSidebar.call(this);
    }
    IFObject.inherit(GStylesSwatchesSidebar, GSidebar);

    GStylesSwatchesSidebar.ID = "styles";
    GStylesSwatchesSidebar.TITLE = new IFLocale.Key(GStylesSwatchesSidebar, "title");

    /**
     * @type {JQuery}
     * @private
     */
    GStylesSwatchesSidebar.prototype._stylePanel = null;

    /**
     * @type {JQuery}
     * @private
     */
    GStylesSwatchesSidebar.prototype._swatchPanel = null;

    /** @override */
    GStylesSwatchesSidebar.prototype.getId = function () {
        return GStylesSwatchesSidebar.ID;
    };

    /** @override */
    GStylesSwatchesSidebar.prototype.getTitle = function () {
        return GStylesSwatchesSidebar.TITLE;
    };

    /** @override */
    GStylesSwatchesSidebar.prototype.getIcon = function () {
        return '<span class="fa fa-fw fa-leaf"></span>';
    };

    /** @override */
    GStylesSwatchesSidebar.prototype.init = function (htmlElement) {
        GSidebar.prototype.init.call(this, htmlElement);

        this._stylePanel = $('<div></div>')
            .addClass('g-style-list')
            .css({
                'height': '50%',
                'overflow-y': 'auto',
                'overflow-x': 'hidden'
            })
            .gStylePanel({
            })
            .appendTo(htmlElement);

        this._swatchPanel = $('<div></div>')
            .addClass('g-swatch-list')
            .css({
                'height': '50%',
                'overflow-y': 'auto',
                'overflow-x': 'hidden'
            })
            .gSwatchPanel({
            })
            .appendTo(htmlElement);
    };

    /** @override */
    GStylesSwatchesSidebar.prototype._documentEvent = function (event) {
        if (event.type === GApplication.DocumentEvent.Type.Activated) {
            this._document = event.document;
            var scene = this._document.getScene();
            this._stylePanel.gStylePanel('attach', scene.getStyleCollection());
            this._swatchPanel.gSwatchPanel('attach', scene.getSwatchCollection());
        } else if (event.type === GApplication.DocumentEvent.Type.Deactivated) {
            var scene = this._document.getScene();
            this._stylePanel.gStylePanel('detach');
            this._swatchPanel.gSwatchPanel('detach');
        }
    };

    /** @override */
    GStylesSwatchesSidebar.prototype.toString = function () {
        return "[Object GStylesSwatchesSidebar]";
    };

    _.GStylesSwatchesSidebar = GStylesSwatchesSidebar;
})(this);