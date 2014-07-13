(function (_) {

    /**
     * The pages & layers sidebar
     * @class GPagesLayersSidebar
     * @extends GSidebar
     * @constructor
     */
    function GPagesLayersSidebar() {
        GSidebar.call(this);
    }

    IFObject.inherit(GPagesLayersSidebar, GSidebar);

    GPagesLayersSidebar.ID = "pages-layers";
    GPagesLayersSidebar.TITLE = new IFLocale.Key(GPagesLayersSidebar, "title");

    /** @override */
    GPagesLayersSidebar.prototype.getId = function () {
        return GPagesLayersSidebar.ID;
    };

    /** @override */
    GPagesLayersSidebar.prototype.getTitle = function () {
        return GPagesLayersSidebar.TITLE;
    };

    /** @override */
    GPagesLayersSidebar.prototype.getIcon = function () {
        return '<span class="fa fa-fw fa-bars"></span>';
    };

    /** @override */
    GPagesLayersSidebar.prototype.init = function (htmlElement) {
        GSidebar.prototype.init.call(this, htmlElement);

        htmlElement.text('PAGES&LAYERS');
    };

    /** @override */
    GPagesLayersSidebar.prototype._documentEvent = function (event) {
        if (event.type === GApplication.DocumentEvent.Type.Activated) {
            this._document = event.document;
            var scene = this._document.getScene();
            // this._stylePanel.gStylePanel('attach', scene.getStyleCollection());
            // this._swatchPanel.gSwatchPanel('attach', scene.getSwatchCollection());
        } else if (event.type === GApplication.DocumentEvent.Type.Deactivated) {
            var scene = this._document.getScene();
            // this._stylePanel.gStylePanel('detach');
            // this._swatchPanel.gSwatchPanel('detach');
        }
    };

    /** @override */
    GPagesLayersSidebar.prototype.toString = function () {
        return "[Object GPagesLayersSidebar]";
    };

    _.GPagesLayersSidebar = GPagesLayersSidebar;
})(this);