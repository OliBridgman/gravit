(function (_) {
    /**
     * An editor for a path
     * @param {GXPath} path the path this editor works on
     * @class GXPathEditor
     * @extends GXPathBaseEditor
     * @constructor
     */
    function GXPathEditor(path) {
        GXPathBaseEditor.call(this, path);

        // Add all selected anchor points into our part selection if there're any
        var selectedAnchorPoints = path.getAnchorPoints().queryAll(':selected');
        for (var i = 0; i < selectedAnchorPoints.length; ++i) {
            if (!this._partSelection) {
                this._partSelection = [];
            }
            this._partSelection.push({type: GXPathEditor.PartType.Point, point: selectedAnchorPoints[i]});
        }
    };
    GObject.inherit(GXPathEditor, GXPathBaseEditor);
    GXElementEditor.exports(GXPathEditor, GXPath);

    /**
     * Type of path an editor part
     * @enum
     */
    GXPathEditor.PartType = {
        Segment: 1,
        Point: 2,
        LeftHandle: 3,
        RightHandle: 4,
        LeftShoulder: 5,
        RightShoulder: 6
    };
    // -----------------------------------------------------------------------------------------------------------------
    // GXPathEditor Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * Mapping of source point indices (key) to preview point indices (value)
     * @type {*}
     * @private
     */
    GXPathEditor.prototype._sourceIndexToPreviewIndex = null;

    /** @override */
    GXPathEditor.prototype.getBBox = function (transform) {
        var bbox = GXPathBaseEditor.prototype.getBBox.call(this, transform);
        if (this._showAnnotations()) {
            // Pre-multiply internal transformation if any
            if (this._transform) {
                transform = transform.multiplied(this._transform);
            }

            var _addToBBox = function (other) {
                if (other && !other.isEmpty()) {
                    bbox = bbox ? bbox.united(other) : other;
                }
            };

            this._iteratePoints(true, function (args) {
                // Handles
                if (args.leftHandlePosition) {
                    _addToBBox(this._getAnnotationBBox(transform, args.leftHandlePosition, true));
                }
                if (args.rightHandlePosition) {
                    _addToBBox(this._getAnnotationBBox(transform, args.rightHandlePosition, true));
                }

                // Shoulders
                if (args.leftShoulderPosition) {
                    _addToBBox(this._getAnnotationBBox(transform, args.leftShoulderPosition, true));
                }
                if (args.rightShoulderPosition) {
                    _addToBBox(this._getAnnotationBBox(transform, args.rightShoulderPosition, true));
                }

                // Point
                _addToBBox(this._getAnnotationBBox(transform, args.position, true));
            }.bind(this));

            return bbox;
        } else {
            return bbox;
        }
    };


    /** @override */
    GXPathEditor.prototype.movePart = function (partId, partData, position, ratio) {
        this.requestInvalidation();
        this._createPathPreviewIfNecessary(partId.point);

        switch (partId.type) {
            // TODO: fix setting of handles for connector points (projection to previous handle should be used)
            case GXPathEditor.PartType.LeftHandle:
                this._movePreviewPointCoordinates(partId.point, 'hlx', 'hly', position, ratio);
                break;
            case GXPathEditor.PartType.RightHandle:
                this._movePreviewPointCoordinates(partId.point, 'hrx', 'hry', position, ratio);
                break;
            // TODO : Shoulder lengths
        }

        this.requestInvalidation();
    };

    /** @override */
    GXPathEditor.prototype.resetPartMove = function (partId, partData) {
        this._releasePathPreview();
        this.requestInvalidation();
    };

    /** @override */
    GXPathEditor.prototype.applyPartMove = function (partId, partData) {
        switch (partId.type) {
            case GXPathEditor.PartType.LeftHandle:
                this._assignPreviewPointPropertiesToSourcePoint(partId.point, ['hlx', 'hly', 'ah']);
                break;
            case GXPathEditor.PartType.RightHandle:
                this._assignPreviewPointPropertiesToSourcePoint(partId.point, ['hrx', 'hry', 'ah']);
                break;
            case GXPathEditor.PartType.LeftShoulder:
                this._assignPreviewPointPropertiesToSourcePoint(partId.point, ['cl']);
                break;
            case GXPathEditor.PartType.RightShoulder:
                this._assignPreviewPointPropertiesToSourcePoint(partId.point, ['cr']);
                break;
        }
        this.resetPartMove(partId, partData);
    };

    /** @override */
    GXPathEditor.prototype.transform = function (transform, partId, partData) {
        if (this._partSelection && this._partSelection.length > 0) {
            this.requestInvalidation();
            this._createPathPreviewIfNecessary();

            // TODO : If current partId is a segment, move only segments
            // like freehand does, otherwise move all selected points
            // including the ones from segments

            // Iterate selection and transform all anchor points
            for (var i = 0; i < this._partSelection.length; ++i) {
                var selectedPartId = this._partSelection[i];
                var selectedPoint = selectedPartId.point;

                this._transformPreviewPointCoordinates(selectedPoint, 'x', 'y', transform);

                // Make sure to transform handles as well if not auto-handles are set
                if (!selectedPoint.getProperty('ah')) {
                    if (selectedPoint.getProperty('hlx') != null && selectedPoint.getProperty('hly') != null) {
                        this._transformPreviewPointCoordinates(selectedPoint, 'hlx', 'hly', transform);
                    }
                    if (selectedPoint.getProperty('hrx') != null && selectedPoint.getProperty('hry') != null) {
                        this._transformPreviewPointCoordinates(selectedPoint, 'hrx', 'hry', transform);
                    }
                }
            }

            this.requestInvalidation();
        } else {
            GXPathBaseEditor.prototype.transform.call(this, transform, partId, partData);
        }
    };

    /** @override */
    GXPathEditor.prototype.resetTransform = function () {
        this._releasePathPreview();

        // Need to invalidate if not having the outline flag
        // which will be removed in the super call and make
        // the invalidation, instead
        if (!this.hasFlag(GXElementEditor.Flag.Outline)) {
            this.requestInvalidation();
        }

        GXPathBaseEditor.prototype.resetTransform.call(this);
    };

    /** @override */
    GXPathEditor.prototype.applyTransform = function (element) {
        if (this._partSelection && this._partSelection.length > 0) {
            // Iterate selection and apply changes in preview anchor points
            for (var i = 0; i < this._partSelection.length; ++i) {
                var part = this._partSelection[i];
                if (part.type === GXPathEditor.PartType.Point) {
                    // Work with indices as element might not be ourself
                    var mySourceIndex = this._element.getAnchorPoints().getIndexOfChild(part.point);
                    var elSourcePoint = element.getAnchorPoints().getChildByIndex(mySourceIndex);
                    this._assignPreviewPointPropertiesToSourcePoint(
                        elSourcePoint, ['x', 'y', 'hlx', 'hly', 'hrx', 'hry', 'ah']);
                }
            }
            this.resetTransform();
        } else {
            GXPathBaseEditor.prototype.applyTransform.call(this, element);
        }
    };

    /** @override */
    GXPathEditor.prototype._detach = function () {
        // Ensure to de-select all selected anchor points when detaching
        for (var anchorPoint = this._element.getAnchorPoints().getFirstChild(); anchorPoint != null; anchorPoint = anchorPoint.getNext()) {
            anchorPoint.removeFlag(GXNode.Flag.Selected);
        }

        GXPathBaseEditor.prototype._detach.call(this);
    };

    /** @override */
    GXPathEditor.prototype._getPartInfoAt = function (location, transform) {
        if (this._showAnnotations()) {
            var pickDist = this._element.getScene() ? this._element.getScene().getProperty('pickDist') / 2 : 1.5;
            var _isInAnnotationBBox = function (position, smallAnnotation) {
                if (position) {
                    return this._getAnnotationBBox(transform, position, smallAnnotation)
                        .expanded(pickDist, pickDist, pickDist, pickDist).containsPoint(location);
                } else {
                    return false;
                }
            }.bind(this);

            var result = null;

            this._iteratePoints(false, function (args) {
                var partType = null;
                var isolated = true; // all is isolated except points
                var selectable = false; // only point is selectable

                if (_isInAnnotationBBox(args.rightHandlePosition, true)) {
                    partType = GXPathEditor.PartType.RightHandle;
                } else if (_isInAnnotationBBox(args.leftHandlePosition, true)) {
                    partType = GXPathEditor.PartType.LeftHandle;
                } else if (_isInAnnotationBBox(args.rightShoulderPosition, true)) {
                    partType = GXPathEditor.PartType.RightShoulder;
                } else if (_isInAnnotationBBox(args.leftShoulderPosition, true)) {
                    partType = GXPathEditor.PartType.LeftShoulder;
                } else if (_isInAnnotationBBox(args.position, true)) {
                    partType = GXPathEditor.PartType.Point;
                    isolated = false;
                    selectable = true;
                }

                if (partType) {
                    result = new GXElementEditor.PartInfo(this, {type: partType, point: args.anchorPoint}, null, isolated, selectable);
                    return true;
                }
            }.bind(this));

            if (result) {
                return result;
            } else if (this.hasFlag(GXElementEditor.Flag.Detail)) {
                // In detail mode we're able to select segments so hit test for one here
                // TODO : Implement this right
                var pathHitResult = this._element.hitTest(location, transform, null, false, 0);
                if (pathHitResult) {
                    return new GXElementEditor.PartInfo(this, {type: GXPathEditor.PartType.Segment, point: null}, null, false, true);
                }
            }
        }

        // TODO : Manually make hit test on path here and check whether we've received a segment
        // and if that is the case, return multiple parts

        return null;
    };

    /** @override */
    GXPathEditor.prototype._paintCustom = function (transform, context) {
        if (this._showAnnotations()) {
            this._iteratePoints(true, function (args) {
                // Paint handle(s)
                if (args.leftHandlePosition) {
                    this._paintHandle(transform, context, args.position, args.leftHandlePosition);
                }
                if (args.rightHandlePosition) {
                    this._paintHandle(transform, context, args.position, args.rightHandlePosition);
                }

                // Paint shoulders
                if (args.leftShoulderPosition) {
                    this._paintAnnotation(context, transform, args.leftShoulderPosition, GXElementEditor.Annotation.Diamond, false, true);
                }
                if (args.rightShoulderPosition) {
                    this._paintAnnotation(context, transform, args.rightShoulderPosition, GXElementEditor.Annotation.Diamond, false, true);
                }

                // Paint point annotation
                this._paintAnnotation(context, transform, args.position, args.annotation, args.anchorPoint.hasFlag(GXNode.Flag.Selected), true);
            }.bind(this));
        }
    };

    /** @override */
    GXPathEditor.prototype._partIdAreEqual = function (a, b) {
        return a.type === b.type && a.point === b.point;
    };

    /** @override */
    GXPathEditor.prototype._updatePartSelection = function (selection) {
        this.requestInvalidation();

        // Iterate existing selection if any and deselect all anchor points
        // that are no longer in the new selection
        if (this._partSelection) {
            for (var i = 0; i < this._partSelection.length; ++i) {
                var part = this._partSelection[i];
                var isInNewSelection = false;

                if (selection) {
                    for (var k = 0; k < selection.length; ++k) {
                        if (selection[k].point === part.point) {
                            isInNewSelection = true;
                            break;
                        }
                    }
                }

                if (!isInNewSelection) {
                    part.point.removeFlag(GXNode.Flag.Selected);
                }
            }
        }

        // Iterate new selection if any and select all anchor points
        if (selection) {
            for (var i = 0; i < selection.length; ++i) {
                var part = selection[i];
                part.point.setFlag(GXNode.Flag.Selected);
            }
        }

        this._partSelection = selection;
        this.requestInvalidation();
    };

    /**
     * Paint a handle
     * @param {GTransform} transform
     * @param {GXPaintContext} context
     * @param {GPoint} from
     * @param {GPoint} to
     * @private
     */
    GXPathEditor.prototype._paintHandle = function (transform, context, from, to) {
        var lineFrom = from;
        var lineTo = to;
        if (transform) {
            lineFrom = transform.mapPoint(from);
            lineTo = transform.mapPoint(to);
        }
        context.canvas.strokeLine(lineFrom.getX(), lineFrom.getY(), lineTo.getX(), lineTo.getY(), 1, context.selectionOutlineColor);
        this._paintAnnotation(context, transform, to, GXElementEditor.Annotation.Circle, false, true);
    };

    /**
     * Iterate all point annotations
     * @param {Boolean} paintElement whether to take the paint element for iteration
     * or not (which will then take the source element}
     * @param {Function(args: {{type: GXPathBase.AnchorPoint.Type|GXPathBase.CornerType, anchorPoint: GXPathBase.AnchorPoint,
     * position: GPoint, annotation: GXElementEditor.Annotation, leftHandlePosition: GPoint, rightHandlePosition: GPoint,
     * leftShoulderPosition: GPoint, rightShoulderPosition: GPoint)}})} iterator may return true for stopping iteration
     * @private
     */
    GXPathEditor.prototype._iteratePoints = function (paintElement, iterator) {
        var element = paintElement ? this.getPaintElement() : this._element;
        var anchorPoints = element.getAnchorPoints();
        var transform = element.getProperty('transform');

        for (var anchorPoint = anchorPoints.getFirstChild(); anchorPoint != null; anchorPoint = anchorPoint.getNext()) {
            var previousPt = anchorPoints.getPreviousPoint(anchorPoint);
            var nextPt = anchorPoints.getNextPoint(anchorPoint);
            var type = anchorPoint.getProperty('tp');
            var position = new GPoint(anchorPoint.getProperty('x'), anchorPoint.getProperty('y'));

            var itArgs = {
                type: type,
                anchorPoint: anchorPoint,
                position: position,
                annotation: GXElementEditor.Annotation.Rectangle,
                leftHandlePosition: null,
                rightHandlePosition: null,
                leftShoulderPosition: null,
                rightShoulderPosition: null
            };

            if (anchorPoint.hasFlag(GXNode.Flag.Selected)) {
                if (type === GXPathBase.AnchorPoint.Type.Connector) {
                    itArgs.annotation = GXElementEditor.Annotation.Diamond;
                } else if (type === GXPathBase.AnchorPoint.Type.Smooth) {
                    itArgs.annotation = GXElementEditor.Annotation.Circle;
                }
            }

            if (anchorPoint.hasFlag(GXNode.Flag.Selected) || (previousPt && previousPt.hasFlag(GXNode.Flag.Selected))) {
                var pt = new GPoint(anchorPoint.getProperty('hlx'), anchorPoint.getProperty('hly'));
                if (pt.getX() !== null && pt.getY() !== null) {
                    itArgs.leftHandlePosition = pt;
                }
            }

            if (anchorPoint.hasFlag(GXNode.Flag.Selected) || (nextPt && nextPt.hasFlag(GXNode.Flag.Selected))) {
                var pt = new GPoint(anchorPoint.getProperty('hrx'), anchorPoint.getProperty('hry'));
                if (pt.getX() !== null && pt.getY() !== null) {
                    itArgs.rightHandlePosition = pt;
                }
            }

            if (anchorPoint.hasFlag(GXNode.Flag.Selected) &&
                type !== GXPathBase.AnchorPoint.Type.Regular &&
                type !== GXPathBase.AnchorPoint.Type.Smooth &&
                type !== GXPathBase.AnchorPoint.Type.Connector) {

                var cl = anchorPoint.getProperty('cl');
                if (cl) {
                    var pt = anchorPoint.getLeftShoulderPoint();
                    if (pt.getX() !== null && pt.getY() !== null) {
                        itArgs.leftShoulderPosition = pt;
                    }
                }

                var cr = anchorPoint.getProperty('cr');
                if (cr) {
                    var pt = anchorPoint.getRightShoulderPoint();
                    if (pt.getX() !== null && pt.getY() !== null) {
                        itArgs.rightShoulderPosition = pt;
                    }
                }
            }

            if (transform) {
                var newPosition = transform.mapPoint(itArgs.position);

                if (itArgs.leftHandlePosition) {
                    itArgs.leftHandlePosition = transform.mapPoint(itArgs.leftHandlePosition);
                }

                if (itArgs.rightHandlePosition) {
                    itArgs.rightHandlePosition = transform.mapPoint(itArgs.rightHandlePosition);
                }

                // TODO: discuss
                // We do not apply this transform to shoulders when generating vertices, so should not apply here
                // directly, instead we should re-generate shoulders for modified anchor points,
                // as when generating vertices.
                // As the applied transform is an element's internal transform, which is the same for all points,
                // let's use the following workaround here
                if (itArgs.leftShoulderPosition) {
                    itArgs.leftShoulderPosition =
                        //transform.mapPoint(itArgs.leftShoulderPosition); // incorrect!
                        //itArgs.leftShoulderPosition.subtract(itArgs.position).add(newPosition); // also incorrect!
                        anchorPoint.getLeftShoulderPointTransformed(transform);
                }

                if (itArgs.rightShoulderPosition) {
                    itArgs.rightShoulderPosition =
                        //transform.mapPoint(itArgs.rightShoulderPosition);
                        //itArgs.rightShoulderPosition.subtract(itArgs.position).add(newPosition);
                        anchorPoint.getRightShoulderPointTransformed(transform);
                }

                itArgs.position = newPosition;
            }

            if (iterator(itArgs) === true) {
                break;
            }
        }
    };

    /**
     * Create path preview if not yet existent.
     * @param {GXPathBase.AnchorPoint} [selectedAnchorPoint] if provided then this point
     * will be taken as the only selected one, if this is not provided, the selected
     * anchor points will be taken from the source path. Defaults to null if not provided.
     * @return {GXPath} the path preview
     * @private
     */
    GXPathEditor.prototype._createPathPreviewIfNecessary = function (selectedAnchorPoint) {
        if (!this._elementPreview) {
            this._sourceIndexToPreviewIndex = {};

            this._elementPreview = new GXPath();
            this._elementPreview.transferProperties(this._element, [GXShape.GeometryProperties, GXPath.GeometryProperties]);

            var _anchorPointIsSelected = function (anchorPoint) {
                return (selectedAnchorPoint && anchorPoint === selectedAnchorPoint) || (!selectedAnchorPoint && anchorPoint.hasFlag(GXNode.Flag.Selected));
            };

            var sourceAnchorPoints = this._element.getAnchorPoints();
            var previewAnchorPoints = this._elementPreview.getAnchorPoints();

            // Create our anchor points. We'll ensure to only create the piece of the path
            // that includes selected anchor points so for most of the time we'll be working
            // on an optimized path preview that doesn't require whole redrawing of the path
            // TODO: make later on support for multiple pieces of the path as in FreeHand
            var firstSelPoint = null;
            var lastSelPoint = null;
            var prevPt, nextPt;
            var relPt;
            for (var anchorPoint = sourceAnchorPoints.getFirstChild();
                 anchorPoint != null && (!firstSelPoint || !lastSelPoint);
                 anchorPoint = anchorPoint.getNext()) {

                prevPt = sourceAnchorPoints.getPreviousPoint(anchorPoint);
                nextPt = sourceAnchorPoints.getNextPoint(anchorPoint);

                if (!firstSelPoint) {
                    if (!prevPt && _anchorPointIsSelected(anchorPoint)) {
                        firstSelPoint = anchorPoint;
                    } else {
                        if (!_anchorPointIsSelected(anchorPoint) && nextPt && _anchorPointIsSelected(nextPt)) {
                            // relPt may be == anchorPoint or == prevPt depending on properties of these points
                            relPt = sourceAnchorPoints.getFirstRelatedPoint(nextPt);
                            if (!_anchorPointIsSelected(relPt) &&
                                    (!sourceAnchorPoints.getPreviousPoint(relPt) ||
                                    !_anchorPointIsSelected(sourceAnchorPoints.getPreviousPoint(relPt)))) {
                                firstSelPoint = relPt;
                            }
                        }
                    }
                }

                if (!lastSelPoint) {
                    if (!nextPt && _anchorPointIsSelected(anchorPoint)) {
                        lastSelPoint = anchorPoint;
                    } else {
                        if (!_anchorPointIsSelected(anchorPoint) && prevPt && _anchorPointIsSelected(prevPt)) {
                            // relPt may be == anchorPoint or == nextPt depending on properties of these points
                            relPt = sourceAnchorPoints.getLastRelatedPoint(prevPt);
                            if (!_anchorPointIsSelected(relPt) &&
                                    (!sourceAnchorPoints.getNextPoint(relPt) ||
                                    !_anchorPointIsSelected(sourceAnchorPoints.getNextPoint(relPt)))) {

                                lastSelPoint = relPt;
                            }
                        }
                    }
                }
            }

            if (firstSelPoint && !lastSelPoint ||
                !firstSelPoint && lastSelPoint ||
                firstSelPoint && lastSelPoint && firstSelPoint === lastSelPoint) {

                firstSelPoint = null;
                lastSelPoint = null;
            }

            // Ensure no selected points between lastSelPoint and firstSelPoint
            if (firstSelPoint && lastSelPoint) {
                var noSelected = true;
                // we can start from lastSelPoint and continue until path end or firstSelPoint for both
                // open and closed paths, as for open path there will be no selected points before the firstSelPoint
                // due to the way how we calculated firstSelPoint
                for (var anchorPoint = sourceAnchorPoints.getNextPoint(lastSelPoint);
                     anchorPoint && anchorPoint != firstSelPoint && noSelected;
                     anchorPoint = sourceAnchorPoints.getNextPoint(anchorPoint)) {
                    if (_anchorPointIsSelected(anchorPoint)) {
                        noSelected = false;
                        firstSelPoint = null;
                        lastSelPoint = null;
                    }
                }
            }

            // If there're no valid selection points then take the whole path instead
            firstSelPoint = firstSelPoint ? firstSelPoint : sourceAnchorPoints.getFirstChild();
            var finished = false;
            var anchorPoint = firstSelPoint;
            while (!finished) {
                var previewAnchorPoint = new GXPathBase.AnchorPoint();
                previewAnchorPoint.transferProperties(anchorPoint, [GXPathBase.AnchorPoint.GeometryProperties]);
                if (_anchorPointIsSelected(anchorPoint)) {
                    previewAnchorPoint.setFlag(GXNode.Flag.Selected);
                }

                // use noEvent = true here, because recalculations in the middle of path copying makes incorrect copy
                previewAnchorPoints.appendChild(previewAnchorPoint, true);

                // Add index mappings
                var sourceIndex = sourceAnchorPoints.getIndexOfChild(anchorPoint);
                var previewIndex = previewAnchorPoints.getIndexOfChild(previewAnchorPoint);
                this._sourceIndexToPreviewIndex[sourceIndex] = previewIndex;

                if (anchorPoint == lastSelPoint) {
                    finished = true;
                }
                anchorPoint = sourceAnchorPoints.getNextPoint(anchorPoint);
                if (!anchorPoint || anchorPoint == firstSelPoint) {
                    finished = true;
                }
            }

            this._elementPreview.transferProperties(this._element, [GXShape.GeometryProperties, GXPath.GeometryProperties]);
            // Don't make the path closed if we've created a partial preview only
            if (this._elementPreview.getProperty('closed')) {
                if (lastSelPoint) {
                    this._elementPreview.setProperty('closed', false);
                }
            }

        }
        return this._elementPreview;
    };

    /**
     * Release a path preview if there was any
     * @private
     */
    GXPathEditor.prototype._releasePathPreview = function () {
        this._elementPreview = null;
        this._sourceIndexToPreviewIndex = null;
    };

    /**
     * Returns a mapping of a source point to it's preview point
     * @param {GXPathBase.AnchorPoint} sourcePoint
     * @private
     */
    GXPathEditor.prototype._getPathPointPreview = function (sourcePoint) {
        var sourceIndex = sourcePoint.getParent().getIndexOfChild(sourcePoint);
        var previewIndex = this._sourceIndexToPreviewIndex[sourceIndex];
        return this._elementPreview.getAnchorPoints().getChildByIndex(previewIndex);
    };

    /**
     * Move coordinate properties of a preview point
     * @param {GXPathBase.AnchorPoint} sourcePoint
     * @param {String} xProperty
     * @param {String} yProperty
     * @param {GPoint} position
     * @param {Boolean} ratio
     * @private
     */
    GXPathEditor.prototype._movePreviewPointCoordinates = function (sourcePoint, xProperty, yProperty, position, ratio) {
        var pathTransform = this._element.getProperty('transform');
        var sourcePosition = new GPoint(sourcePoint.getProperty(xProperty), sourcePoint.getProperty(yProperty));

        if (pathTransform) {
            sourcePosition = pathTransform.mapPoint(sourcePosition);
        }

        this._transformPreviewPointCoordinates(sourcePoint, xProperty, yProperty,
            new GTransform(1, 0, 0, 1, position.getX() - sourcePosition.getX(), position.getY() - sourcePosition.getY()));
    };

    /**
     * Transform coordinate properties of a preview point
     * @param {GXPathBase.AnchorPoint} sourcePoint
     * @param {String} xProperty
     * @param {String} yProperty
     * @param {GTransform} transform
     * @private
     */
    GXPathEditor.prototype._transformPreviewPointCoordinates = function (sourcePoint, xProperty, yProperty, transform) {
        var pathTransform = this._element.getProperty('transform');

        var previewPoint = this._getPathPointPreview(sourcePoint);
        if (previewPoint) {
            // Map source point with transformation and apply it to preview point
            var sourcePosition = new GPoint(sourcePoint.getProperty(xProperty), sourcePoint.getProperty(yProperty));

            var transformToApply = transform;
            if (pathTransform) {
                transformToApply = transform.multiplied(pathTransform.inverted());
                transformToApply = pathTransform.multiplied(transformToApply);
            }
            var previewPosition = transformToApply.mapPoint(sourcePosition);

            var propertiesToSet = [xProperty, yProperty];
            var valuesToSet = [previewPosition.getX(), previewPosition.getY()];

            // If we're modifying handle coordinates then set auto-handles to false
            if (xProperty === 'hlx' || xProperty === 'hrx' || yProperty === 'hly' || yProperty === 'hry') {
                propertiesToSet.push('ah');
                valuesToSet.push(false);
            }

            // Assign properties now
            previewPoint.setProperties(propertiesToSet, valuesToSet);
        }
    };

    /**
     * Assign a given set of preview point to source point
     * @param {GXPathBase.AnchorPoint} sourcePoint
     * @param {Array<String>} properties
     * @private
     */
    GXPathEditor.prototype._assignPreviewPointPropertiesToSourcePoint = function (sourcePoint, properties) {
        var previewPoint = this._getPathPointPreview(sourcePoint);
        if (previewPoint) {
            // Simply assign preview position back to source
            sourcePoint.setProperties(properties, previewPoint.getProperties(properties));
        }
    };

    /** @override */
    GXPathEditor.prototype.toString = function () {
        return "[Object GXPathEditor]";
    };

    _.GXPathEditor = GXPathEditor;
})(this);