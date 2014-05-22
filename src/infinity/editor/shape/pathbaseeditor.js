(function (_) {
    /**
     * A base editor for a base path
     * @param {IFPathBase} path the path this editor works on
     * @class IFPathBaseEditor
     * @extends IFShapeEditor
     * @constructor
     */
    function IFPathBaseEditor(path) {
        IFShapeEditor.call(this, path);
    };
    IFObject.inherit(IFPathBaseEditor, IFShapeEditor);

    /** @override */
    IFPathBaseEditor.prototype.toString = function () {
        return "[Object IFPathBaseEditor]";
    };

    _.IFPathBaseEditor = IFPathBaseEditor;
})(this);