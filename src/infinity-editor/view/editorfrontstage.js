(function (_) {
    /**
     * A stage for rendering the editor foreground
     * @param {IFView} view
     * @class IFEditorFrontStage
     * @extends IFStage
     * @constructor
     */
    function IFEditorFrontStage(view) {
        IFStage.call(this, view);
        view.getScene().addEventListener(IFNode.AfterPropertiesChangeEvent, this._sceneAfterPropertiesChanged, this);

        this._view.getEditor().getGuides().addEventListener(
            IFGuides.InvalidationRequestEvent, this._guidesInvalidationRequest, this);
    }
    IFObject.inherit(IFEditorFrontStage, IFStage);

    /** @override */
    IFEditorFrontStage.prototype.paint = function (context) {
        this._view.getEditor().getGuides().paint(this._view.getWorldTransform(), context);
    };

    IFEditorFrontStage.prototype._sceneAfterPropertiesChanged = function (event) {
        if (event.properties.indexOf('gridSizeX') >= 0 || event.properties.indexOf('gridSizeY') >= 0 ||
            event.properties.indexOf('gridActive') >= 0) {
            this.invalidate();
        }
    };

    IFEditorFrontStage.prototype._guidesInvalidationRequest = function (event) {
        if (event.area) {
            this.invalidate(event.area);
        }
    };

    /** @override */
    IFEditorFrontStage.prototype.toString = function () {
        return "[Object IFEditorFrontStage]";
    };

    _.IFEditorFrontStage = IFEditorFrontStage;
})(this);