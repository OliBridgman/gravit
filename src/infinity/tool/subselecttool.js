(function (_) {
    /**
     * The sub selection tool
     * @class GXSubSelectTool
     * @extends GXSelectTool
     * @constructor
     * @version 1.0
     */
    function GXSubSelectTool() {
        GXSelectTool.call(this);
    };

    GObject.inherit(GXSubSelectTool, GXSelectTool);

    /** @override */
    GXSubSelectTool.prototype.getGroup = function () {
        return 'select';
    };

    /** @override */
    GXSubSelectTool.prototype.getIcon = function () {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M3.5,18.5v18l5-7h9L3.5,18.5z M7.5,27.5l-3,4.5V20.5l9,7H7.5z"/>\n</svg>\n';
    };

    /** @override */
    GXSubSelectTool.prototype.getHint = function () {
        return GXSelectTool.prototype.getHint.call(this)
            .setTitle(new GLocale.Key(GXSubSelectTool, "title"));
    };

    /** @override */
    GXSubSelectTool.prototype.getActivationCharacters = function () {
        return ['A', '1'];
    };

    /** @override */
    GXSubSelectTool.prototype.getCursor = function () {
        var result = GXSelectTool.prototype.getCursor.call(this);
        if (result === GUICursor.Select) {
            return GUICursor.SelectInverse;
        } else if (result === GUICursor.SelectDot) {
            return GUICursor.SelectDotInverse;
        } else {
            return result;
        }
    };

    /** @override */
    GXSubSelectTool.prototype.activate = function (view, layer) {
        GXSelectTool.prototype.activate.call(this, view, layer);

        // Set detail mode for selection for sub-select tool
        this._editor.setSelectionDetail(true);
    };

    /** @override */
    GXSubSelectTool.prototype.deactivate = function (view, layer) {
        // Remove detail mode for selection for sub-select tool
        this._editor.setSelectionDetail(false);

        GXSelectTool.prototype.deactivate.call(this, view, layer);
    };

    /** @override */
    GXSubSelectTool.prototype._mouseDragStart = function (event) {
        // When Path point is drag with SubSelect Tool the options are:
        // 1. If a point has styled corner type:
        // a) User drags and cu is true -> both handles moved to the _same_ value
        // b) User drags and cu is false -> move only the selected corner/shoulder length
        // c) User drags and cu is false but user holds shift -> move both corner / shoulder lengths but NOT to
        // the same value but instead, add delta value to both from original movement so their unit length stays the same.
        // 2. Otherwise::
        // - if a point was not selected - it gets selected and moved (together with other selected if Shift is pressed)
        // - if a point was selected and didn't have right handle - create right handle (correct projection for connector)
        // - if a point was selected and had the right handle,
        //      but not the left - create left (& rotate right handle for smooth point)
        // - if a point was selected and had both handles - drag the point together with other selected points
        // If Shift is pressed, new coordinate is constrained against the original point's position
        // If a point is drag, and Alt is pressed in the last mouse move position, then the path is cloned
        //
        // When Path segment is drag with SubSelect Tool:
        // If handles are newly created:
        //      both handles should have the overall length 2/3 from segment length
        //      a mouse point should divide the distance between handle points in the same proportion as between segment ends
        //      after movement starts handle end points move synchronously
        //      after movement starts mouse position defines a point through which should go curve tangent line,
        // which oriented the same as original segment
        // To get newly created handles:
        //      for catch point between handles y position: hdy = dy (mouse) * 4 / 3
        //      for catch point between handles x position: hdx = dx * 4 / 3
        //
        // If both handles existed before, their orientation remains, and:
        // For segment which is oriented horizontally (catch point at slope t):
        //      hldx = dx * kl, hldy = 0, hrdx = dx * kr, hrdy = 0; kl = 3*(1 - t) , kr = 3*t
        // For any segment for each handle:
        //      1) make projection of movement into handle orientation
        //      2) if not zero - apply handle coefficient to that projection
        //      3) add received vector to handle position.
        //
        // For one new handle and one existed:
        //      Exact policy is not defined, lets try this:
        //      - the same as above for existed handle
        //      - for new handle h = end p. + 2/3*(catch p. - end p.) + kh*(dx, dy)
        //


        if (this._mode == GXSelectTool._Mode.Move) {
            // Save start
            this._moveStart = event.client;
            this._moveStartTransformed = this._view.getViewTransform().mapPoint(this._moveStart);

            // Switch to moving mode
            this._updateMode(GXSelectTool._Mode.Moving);

            if (this._editorMovePartInfo) {
                if (this._editorMovePartInfo.isolated) {
                    this._editorMovePartInfo =
                        this._editorMovePartInfo.editor.subSelectDragStartAction(this._editorMovePartInfo);
                } else {
                    var selection = this._editor.getSelection();
                    if (selection && selection.length) {
                        for (var i = 0; i < selection.length; ++i) {
                            var editor = GXElementEditor.getEditor(selection[i]);
                            if (editor) {
                                var partInfo = editor.subSelectDragStartAction(this._editorMovePartInfo);
                                if (partInfo) {
                                    this._editorMovePartInfo = partInfo;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    /** override */
    GXSubSelectTool.prototype.toString = function () {
        return "[Object GXSubSelectTool]";
    };

    _.GXSubSelectTool = GXSubSelectTool;
})(this);