(function (_) {
    /**
     * A dialog for editing the scene settings
     * @class EXSceneSettingsDialog
     * @extends GUIModal
     * @constructor
     */
    function EXSceneSettingsDialog(scene) {
        GUIModal.call(this);
        this._scene = scene;
    };

    GObject.inherit(EXSceneSettingsDialog, GUIModal);

    /**
     * @type {boolean}
     * @private
     */
    EXSceneSettingsDialog.prototype._initialized = false;

    /**
     * @type {GXScene}
     * @private
     */
    EXSceneSettingsDialog.prototype._scene = null;

    /** @override */
    EXSceneSettingsDialog.prototype.open = function () {
        if (!this._initialized) {
            this._initialize();
            this._initialized = true;
        }
        GUIModal.prototype.open.call(this);
    };

    EXSceneSettingsDialog.prototype._initialize = function () {
        this.setWidth(400);
        this.setContent($('<table></table>')
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .text('Design for'))
                .append($('<td></td>')
                    .append($('<select></select>')
                        .append($('<option></option>')
                            .attr('value', 'S')
                            .text('Screen'))
                        .append($('<option></option>')
                            .attr('value', 'P')
                            .text('Print')))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .text('Page Size'))
                .append($('<td></td>')
                    .append($('<input>')
                        .attr('type', 'text'))
                    .append($('<input>')
                        .attr('type', 'text'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .text('Page Margin'))));
    };

    _.EXSceneSettingsDialog = EXSceneSettingsDialog;
})(this);
