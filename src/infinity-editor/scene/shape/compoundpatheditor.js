(function (_) {
    /**
     * An editor for a compound path
     * @param {IFCompoundPath} compoundPath the compound path this editor works on
     * @class IFCompoundPathEditor
     * @extends IFElementEditor
     * @constructor
     */
    function IFCompoundPathEditor(compoundPath) {
        IFShapeEditor.call(this, compoundPath);
    };
    IFObject.inherit(IFCompoundPathEditor, IFShapeEditor);
    IFElementEditor.exports(IFCompoundPathEditor, IFCompoundPath);

    /** @override */
    IFCompoundPathEditor.prototype.transform = function (transform, partId, partData) {
        if (partId && IFUtil.dictionaryContainsValue(IFPathEditor.PartType, partId.type)) {
            for (var i = 0; i < this._editors.length; ++i) {
                var ed = this._editors[i];
                if (ed.getPartSelection()) {
                    ed.transform(transform, partId, partData);
                }
            }
        } else {
            IFShapeEditor.prototype.transform.call(this, transform, partId, partData);
        }
    };

    IFCompoundPathEditor.prototype._setTransform = function (transform) {
        for (var i = 0; i < this._editors.length; ++i) {
            var ed = this._editors[i];
            ed._setTransform(transform);
        }
    };

    /** @override */
    IFCompoundPathEditor.prototype.resetTransform = function () {
        for (var i = 0; i < this._editors.length; ++i) {
            var ed = this._editors[i];
            ed.resetTransform();
        }
    };

    /** @override */
    IFCompoundPathEditor.prototype.canApplyTransform = function () {
        var canApply = false;
        for (var i = 0; i < this._editors.length; ++i) {
            var ed = this._editors[i];
            canApply = canApply || ed.canApplyTransform();
        }
        return canApply;
    };

    /** @override */
    IFCompoundPathEditor.prototype.applyTransform = function (element) {
        for (var i = 0; i < this._editors.length; ++i) {
            var ed = this._editors[i];
            if (ed.canApplyTransform()) {
                ed.applyTransform(ed._element);
            }
        }
    };

    /** @override */
    IFCompoundPathEditor.prototype._attach = function () {
        var scene = this._element.getScene();
        if (scene != null) {
            scene.addEventListener(IFElement.GeometryChangeEvent, this._geometryChange, this);
        }
    };

    /** @override */
    IFCompoundPathEditor.prototype._detach = function () {
        // Ensure to de-select all selected anchor points when detaching
        for (var anchorPath = this._element.getAnchorPaths().getFirstChild(); anchorPath != null; anchorPath = anchorPath.getNext()) {
            anchorPath.removeFlag(IFNode.Flag.Selected);
        }

        var scene = this._element.getScene();
        if (scene != null) {
            scene.removeEventListener(IFElement.GeometryChangeEvent, this._geometryChange);
        }

        IFShapeEditor.prototype._detach.call(this);
    };

    /**
     * Hit-test anchor point's annotation
     * @param {IFPathBase.AnchorPoint} anchorPt - anchor point to hit-test
     * @param {IFPoint} location
     * @param {IFTransform} [transform] a transformation to apply to anchor point's coordinates before hit-testing,
     * defaults to null
     * @param {Number} [tolerance] optional tolerance for hit testing, defaults to zero
     * @returns {boolean} the result of hit-test
     */
    IFCompoundPathEditor.prototype.hitAnchorPoint = function (anchorPt, location, transform, tolerance) {
        return false;
    };

    /**
     * Calculates and returns IFPoint in scene coordinates, corresponding to the given anchor point
     * @param {IFPathBase.AnchorPoint} anchorPt - the given anchor point
     * @returns {IFPoint}
     */
    IFCompoundPathEditor.prototype.getPointCoord = function (anchorPt) {
        var pt = null;
        return pt;
    };

    /** @override */
    IFCompoundPathEditor.prototype._getPartInfoAt = function (location, transform, tolerance) {
        var res = null;
        for (var pt = this._element.getAnchorPaths().getFirstChild(); pt != null; pt = pt.getNext()) {
            var pathEditor = IFElementEditor.openEditor(pt);
            res = pathEditor._getPartInfoAt(location, transform, tolerance);
            if (res) {
                return res;
            }
        }
        return null;
    };

    /** @override */
    IFCompoundPathEditor.prototype._prePaint = function (transform, context) {
        if (this.hasFlag(IFElementEditor.Flag.Selected) || this.hasFlag(IFElementEditor.Flag.Highlighted)) {
            var element = this.getPaintElement();

            // Work in transformed coordinates to avoid scaling outline
            var transformer = new IFVertexTransformer(element, transform);
            context.canvas.putVertices(new IFVertexPixelAligner(transformer));

            // Paint either outlined or highlighted (highlighted has a higher precedence)
            context.canvas.strokeVertices(this.hasFlag(IFElementEditor.Flag.Highlighted) ? context.highlightOutlineColor : context.selectionOutlineColor, 1);

            for (var pt = this._element.getAnchorPaths().getFirstChild(); pt != null; pt = pt.getNext()) {
                var pathEditor = IFElementEditor.openEditor(pt);
                pathEditor._prePaint(transform, context);
            }
        }
    };

    /** @override */
    IFCompoundPathEditor.prototype._postPaint = function (transform, context) {
        for (var pt = this._element.getAnchorPaths().getFirstChild(); pt != null; pt = pt.getNext()) {
            var pathEditor = IFElementEditor.openEditor(pt);
            pathEditor._postPaint(transform, context);
        }
    };

    /** @override */
    IFCompoundPathEditor.prototype._partIdAreEqual = function (a, b) {
        var eqs = (a.type === b.type);
        if (eqs && a.type == IFPathEditor.PartType.Point) {
            eqs = (a.point === b.point);
        } else if (eqs && a.type == IFPathEditor.PartType.Segment) {
            eqs = (a.apLeft === b.apLeft && a.apRight == b.apRight);
        }
        return eqs;
    };

    /** @override */
    IFCompoundPathEditor.prototype.updatePartSelection = function (toggle, selection) {
        // This editor should not have any parts selected
        if (this._partSelection) {
            this._partSelection = null;
        }
        if (!selection && this.hasFlag(IFElementEditor.Flag.Selected)) {
            for (var i = 0; i < this._editors.length; ++i) {
                this._editors[i].updatePartSelection(toggle, null);
            }
        }
    };

    /** override */
    IFCompoundPathEditor.prototype.isPartSelectionUnderCollisionAllowed = function () {
        return true;
    };

    /** override */
    IFCompoundPathEditor.prototype.updatePartSelectionUnderCollision = function (toggle, collisionArea) {
        for (var pt = this._element.getAnchorPaths().getFirstChild(); pt != null; pt = pt.getNext()) {
            var pathEditor = IFElementEditor.openEditor(pt);
            pathEditor.updatePartSelectionUnderCollision(toggle, collisionArea);
        }
    };

    /** override */
    IFCompoundPathEditor.prototype.isDeletePartsAllowed = function () {
        var res = false;
        if (this.hasFlag(IFElementEditor.Flag.Selected)) {
            for (var pt = this._element.getAnchorPaths().getFirstChild(); pt != null && !res; pt = pt.getNext()) {
                var pathEditor = IFElementEditor.openEditor(pt);
                res = pathEditor.isDeletePartsAllowed();
            }
        }
        return res;
    };

    /** override */
    IFCompoundPathEditor.prototype.deletePartsSelected = function () {
        for (var pt = this._element.getAnchorPaths().getFirstChild(); pt != null; pt = pt.getNext()) {
            var pathEditor = IFElementEditor.openEditor(pt);
            if (pathEditor.isDeletePartsAllowed()) {
                pathEditor.deletePartsSelected();
            }
        }
    };

    /** override */
    IFCompoundPathEditor.prototype.isAlignPartsAllowed = function () {
        var res = false;
        if (this.hasFlag(IFElementEditor.Flag.Selected)) {
            for (var pt = this._element.getAnchorPaths().getFirstChild(); pt != null && !res; pt = pt.getNext()) {
                var pathEditor = IFElementEditor.openEditor(pt);
                res = pathEditor.isAlignPartsAllowed();
            }
        }
        return res;
    };

    /** override */
    IFCompoundPathEditor.prototype.alignParts = function (alignType, posX, posY) {
        for (var pt = this._element.getAnchorPaths().getFirstChild(); pt != null; pt = pt.getNext()) {
            var pathEditor = IFElementEditor.openEditor(pt);
            if (pathEditor.isAlignPartsAllowed()) {
                pathEditor.alignParts(alignType, posX, posY);
            }
        }
    };

    /**
     * If the path is updated (may be way around of this path editor), handle this by updating preview
     * @param {IFElement.GeometryChangeEvent} evt
     * @private
     */
    IFCompoundPathEditor.prototype._geometryChange = function (evt) {
        if (evt.type == IFElement.GeometryChangeEvent.Type.After && evt.element == this._element) {
            //if (this._elementPreview) {
                this.requestInvalidation();
            //}
        }
    };

    /** @override */
    IFCompoundPathEditor.prototype.setFlag = function (flag) {
        if ((this._flags & flag) == 0) {
            this.requestInvalidation();
            this._flags = this._flags | flag;
            for (var pt = this._element.getAnchorPaths().getFirstChild(); pt != null; pt = pt.getNext()) {
                var pathEditor = IFElementEditor.openEditor(pt);
                pathEditor.setFlag(flag);
            }
            this.requestInvalidation();
        }
    };

    /** @override */
    IFCompoundPathEditor.prototype.removeFlag = function (flag) {
        if ((this._flags & flag) != 0) {
            this.requestInvalidation();
            this._flags = this._flags & ~flag;
            for (var pt = this._element.getAnchorPaths().getFirstChild(); pt != null; pt = pt.getNext()) {
                var pathEditor = IFElementEditor.openEditor(pt);
                pathEditor.removeFlag(flag);
            }
            this.requestInvalidation();
        }
    };

    /** @override */
    IFCompoundPathEditor.prototype.toString = function () {
        return "[Object IFCompoundPathEditor]";
    };

    _.IFCompoundPathEditor = IFCompoundPathEditor;
})(this);
