(function (_) {
    /**
     * The base class for all widgets. This will trigger most of the available
     * input events like mouse or key events.
     * @param {HTMLDivElement} [container] optional container to append this widget into
     * @class GUIWidget
     * @extends GObject
     * @mixes GEventTarget
     * @constructor
     * @version 1.0
     */
    function GUIWidget(container) {
        this._htmlElement = this._createHTMLElement();

        if (container != null) {
            this._htmlElement.style.position = "relative";
            container.appendChild(this._htmlElement);
        }
    }

    GObject.inheritAndMix(GUIWidget, GObject, [GEventTarget]);

    /**
     * Convert a DOM-Mouse-Event client position to internal coordinates
     * @param htmlElement
     * @param mouseEvent
     * @returns {GPoint}
     */
    GUIWidget.convertClientPositionFromMousePosition = function (htmlElement, mouseEvent) {
        var posX = null;
        var posY = null;
        if (mouseEvent.target == htmlElement) {
            if ("absolute" === htmlElement.style.position) {
                if (mouseEvent.hasOwnProperty("offsetX")) {
                    posX = mouseEvent.offsetX;
                    posY = mouseEvent.offsetY;
                }
            } else {
                posX = mouseEvent.clientX;
                posY = mouseEvent.clientY;
            }
        }
        if (posX == null || posY == null) {

            var box = htmlElement.getBoundingClientRect();
            posX = mouseEvent.pageX - (box.left + window.pageXOffset - document.documentElement.clientLeft);
            posY = mouseEvent.pageY - (box.top + window.pageYOffset - document.documentElement.clientTop);
        }

        return new GPoint(posX, posY);
    };

    /**
     * The underyling html element
     * @type {HTMLElement}
     * @private
     */
    GUIWidget.prototype._htmlElement = null;

    /**
     * Internal cache of input events
     * @type {Object}
     * @private
     */
    GUIWidget.prototype._inputEventCache = null;

    /**
     * Counter of registered drag event listeners
     * @type {Number}
     * @private
     */
    GUIWidget.prototype._dragEventCounter = 0;

    /**
     * @type {String}
     * @private
     */
    GUIWidget.prototype._id = null;

    /**
     * @type {GUIWidget}
     * @private
     */
    GUIWidget.prototype._parent = null;

    /**
     * @type {number}
     * @private
     */
    GUIWidget.prototype._x = 0;


    /**
     * @type {number}
     * @private
     */
    GUIWidget.prototype._y = 0;

    /**
     * @type {number}
     * @private
     */
    GUIWidget.prototype._width = 0;

    /**
     * @type {number}
     * @private
     */
    GUIWidget.prototype._height = 0;

    /**
     * @type {String}
     * @private
     */
    GUIWidget.prototype._cursor = null;

    /**
     * Return the x-position of this widget
     * @return {Number}
     */
    GUIWidget.prototype.getX = function () {
        return this._x;
    };

    /**
     * Return the y-position of this widget
     * @return {Number}
     */
    GUIWidget.prototype.getY = function () {
        return this._y;
    };

    /**
     * Return the width of this widget
     * @return {Number}
     */
    GUIWidget.prototype.getWidth = function () {
        return this._htmlElement.offsetWidth ? this._htmlElement.offsetWidth : this._width;
    };

    /**
     * Return the height of this widget
     * @return {Number}
     */
    GUIWidget.prototype.getHeight = function () {
        return this._htmlElement.offsetHeight ? this._htmlElement.offsetHeight : this._height;
    };

    /**
     * Move the widget to a given position
     * @param {Number} x new x-position
     * @param {Number} y new y-position
     */
    GUIWidget.prototype.move = function (x, y) {
        if (typeof x == "number") {
            this._htmlElement.style.left = x.toString() + 'px';
        } else {
            this._htmlElement.style.left = "";
        }
        if (typeof y == "number") {
            this._htmlElement.style.top = y.toString() + 'px';
        } else {
            this._htmlElement.style.top = "";
        }

        if (typeof x == "number" || typeof y == "number") {
            this._htmlElement.style.position = "absolute";
        } else {
            this._htmlElement.style.position = "";
        }

        this._x = x;
        this._y = y;
    };

    /**
     * Resize the widget to a certain size
     * @param {Number} width the new width
     * @param {Number} height the new height
     */
    GUIWidget.prototype.resize = function (width, height) {
        if (width) {
            this._htmlElement.style.width = width.toString() + 'px';
        } else {
            this._htmlElement.style.width = "";
        }
        if (height) {
            this._htmlElement.style.height = height.toString() + 'px';
        } else {
            this._htmlElement.style.height = "";
        }

        if (width) {
            this._htmlElement.style.overflowX = "hidden";
        } else {
            this._htmlElement.style.overflowX = "";
        }

        if (height) {
            this._htmlElement.style.overflowY = "hidden";
        } else {
            this._htmlElement.style.overflowY = "";
        }

        this._width = width;
        this._height = height;
    };

    /**
     * @return {String} the cursor in use
     * @see GUICursor
     */
    GUIWidget.prototype.getCursor = function () {
        return this._cursor;
    };

    /**
     * Assign a new cursor to be used for this widget and it's
     * children if any
     * @param {String} cursor the cursor to use, null will inherit from parent
     * @see GUICursor
     */
    GUIWidget.prototype.setCursor = function (cursor) {
        if (this._cursor != cursor) {
            if (this._cursor) {
                this._removeCSSClass("g-cursor-" + this._cursor, true);
            }

            this._cursor = cursor;

            if (this._cursor) {
                this._addCSSClass("g-cursor-" + this._cursor, true);
            }
        }
    };

    /**
     * Checks and returns whether the widget is enabled or not
     * @return {Boolean} true if enabled, false if not
     * @version 1.0
     */
    GUIWidget.prototype.isEnabled = function () {
        return this._htmlElement.className == null || this._htmlElement.className.indexOf("g-disabled") < 0;
    };

    /**
     * Makes this widget enabled or disabled
     * @param {Boolean} enabled true to make enabled, false to disable
     * @version 1.0
     */
    GUIWidget.prototype.setEnabled = function (enabled) {
        if (enabled != this.isEnabled()) {
            if (enabled) {
                this._removeCSSClass("g-disabled", true);
            } else {
                this._addCSSClass("g-disabled", true);
            }
        }
    };

    /**
     * Checks and returns whether the widget is displayed or not
     * @return {Boolean} true if displayed, false if not
     * @version 1.0
     */
    GUIWidget.prototype.isDisplayed = function () {
        return "none" != this._htmlElement.style.display;
    };


    /**
     * Makes this widget displayed or not. Non-displayed widgets
     * will be completely gone from rendering this will also not
     * occupy any space in their parents.
     * @param {Boolean} displayed true to make displayed, false to make none-displayed
     * @version 1.0
     */
    GUIWidget.prototype.setDisplayed = function (displayed) {
        this._htmlElement.style.display = displayed ? "" : "none";
    };

    /** @override */
    GUIWidget.prototype.trigger = function (event) {
        // Handle drag release before mouse release
        if (this._dragEventCounter > 0 && event instanceof GUIMouseEvent.Release) {
            this._dragMouseRelease(event);
        }

        // Call original event
        GEventTarget.prototype.trigger.call(this, event);

        // Handle all other drag events after regular event
        if (this._dragEventCounter > 0) {
            if (event instanceof GUIMouseEvent.Down) {
                this._dragMouseDown(event);
            } else if (event instanceof GUIMouseEvent.Move && this._dragStartPosition) {
                this._dragMouseMove(event);
            }
        }
    }

    /** @override */
    GUIWidget.prototype.addEventListener = function (eventClass, listener, target, args) {
        GEventTarget.prototype.addEventListener.call(this, eventClass, listener, target, args);

        if (GUIInputEvent.prototype.isPrototypeOf(eventClass.prototype)) {
            this._registerInputEventListener(eventClass);

            // If event is mouse drag event then register our drag listeners
            if (GUIMouseEvent.isDragEvent(eventClass)) {
                if (this._dragEventCounter == 0) {
                    // First drag llistener so start listening for various events simulating the drag event(s)
                    this._registerInputEventListener(GUIMouseEvent.Down);
                    this._registerInputEventListener(GUIMouseEvent.Move);
                    this._registerInputEventListener(GUIMouseEvent.Release);
                }
                this._dragEventCounter++;
            }
        }
    };

    /** @override */
    GUIWidget.prototype.removeEventListener = function (eventClass, listener) {
        GEventTarget.prototype.removeEventListener.call(this, eventClass, listener);

        if (GUIInputEvent.prototype.isPrototypeOf(eventClass.prototype)) {
            this._unregisterInputEventListener(eventClass);

            // If event is mouse drag event then unregster our drag listeners if it is the last
            if (GUIMouseEvent.isDragEvent(eventClass)) {
                if (--this._dragEventCounter == 0) {
                    // Last drag event so stop listening for various events simulating the drag event(s)
                    this._unregisterInputEventListener(GUIMouseEvent.Down);
                    this._unregisterInputEventListener(GUIMouseEvent.Move);
                    this._unregisterInputEventListener(GUIMouseEvent.Release);
                }
            }
        }
    };

    /**
     * Called to focus this widget. Note that not all widgets
     * do actually support focusing
     * @return {Boolean} true if widget was focused, false if not
     */
    GUIWidget.prototype.focus = function () {
        if (this.isDisplayed()) {
            try {
                this._htmlElement.focus();
                return true;
            } catch (e) {
                return false;
            }
        }
        return false;
    };

    /**
     * @param {Function} eventClass
     * @private
     */
    GUIWidget.prototype._registerInputEventListener = function (eventClass) {
        // Check if event is a drag event
        var isDragEvent = GUIMouseEvent.isDragEvent(eventClass);
        var event_id = GObject.getTypeId(eventClass);

        if (!this._inputEventCache || !(event_id in this._inputEventCache)) {
            if (!this._inputEventCache) {
                this._inputEventCache = {};
            }
            this._inputEventCache[event_id] = {counter: 0, event: new eventClass()};

            // Don't listen for drag events as they're handled transparently
            if (!isDragEvent) {
                this._startListeningInputEvent(eventClass);
            }
        } else if (this._inputEventCache && event_id in this._inputEventCache) {
            this._inputEventCache[event_id].counter++;
        }
    }

    /**
     * @param {Function} eventClass
     * @private
     */
    GUIWidget.prototype._unregisterInputEventListener = function (eventClass) {
        // Check if event is a drag event
        var isDragEvent = GUIMouseEvent.isDragEvent(eventClass);
        var event_id = GObject.getTypeId(eventClass);

        if (this._inputEventCache && event_id in this._inputEventCache) {
            if (--this._inputEventCache[event_id].counter == 0) {

                // Don't stop listening for drag events as they're handled transparently
                if (!isDragEvent) {
                    this._stopListeningInputEvent(eventClass);
                }

                delete this._inputEventCache[event_id];
                if (Object.keys(this._inputEventCache).length == 0) {
                    this._inputEventCache = null;
                }
            }
        }
    }

    /**
     * Called to start listening on a specific input event class
     * @param {Function} eventClass the input event class to start listening for
     * @private
     */
    GUIWidget.prototype._startListeningInputEvent = function (eventClass) {
        var event_id = GObject.getTypeId(eventClass);

        var domListener = function (event) {
            this._updateAndTriggerInputEvent(event, eventClass);
        }.bind(this);

        if (domListener) {
            this._inputEventCache[event_id].domListener = domListener;
            var domEventName = this._getDomEventNameForEventClass(eventClass);
            this._htmlElement.addEventListener(domEventName, domListener);
        }
    };

    /**
     * Called to stop listening on a specific input event class
     * @param {*} eventClass the input event class to stop listening for
     * @private
     */
    GUIWidget.prototype._stopListeningInputEvent = function (eventClass) {
        var event_id = GObject.getTypeId(eventClass);
        var domEventName = this._getDomEventNameForEventClass(eventClass);
        this._htmlElement.removeEventListener(domEventName, this._inputEventCache[event_id].domListener);
        delete this._inputEventCache[event_id].domListener;
    };

    /**
     * @param {GUIMouseEvent} event
     * @private
     */
    GUIWidget.prototype._dragMouseDown = function (event) {
        if (event.button == GUIMouseEvent.BUTTON_LEFT) {
            this._dragStartPosition = event.client;
            this._dragIsDragging = false;
        }
    };

    /**
     * @param {GUIMouseEvent} event
     * @private
     */
    GUIWidget.prototype._dragMouseMove = function (event) {
        if (this._dragStartPosition) {
            // If not yet dragging, we need to fire an initial drag start event
            if (!this._dragIsDragging) {
                var clientStart = this._dragStartPosition;
                if (Math.abs(clientStart.getX() - event.client.getX()) >= 1 || Math.abs(clientStart.getY() - event.client.getY()) >= 1) {

                    this._dragIsDragging = true;
                    this._dragPreviousPosition = this._dragStartPosition;

                    // Fire drag start event
                    if (this.hasEventListeners(GUIMouseEvent.DragStart)) {
                        /** @type GUIMouseEvent */
                        var cachedEvent = this._inputEventCache[GObject.getTypeId(GUIMouseEvent.DragStart)].event;
                        this._dragAssignMouseEvent(event, cachedEvent);

                        // Ensure to use our source positions and not the current one
                        cachedEvent.client = this._dragStartPosition;

                        this.trigger(cachedEvent);
                    }
                }
            }
        }

        if (this._dragIsDragging && this.hasEventListeners(GUIMouseEvent.Drag)) {
            /** @type GUIMouseEvent.Drag */
            var cachedEvent = this._inputEventCache[GObject.getTypeId(GUIMouseEvent.Drag)].event;
            this._dragAssignMouseEvent(event, cachedEvent);
            this._dragAssignDragEvent(cachedEvent, event);
            this.trigger(cachedEvent);

            this._dragPreviousPosition = event.client;
        }
    };

    /**
     * @param {GUIMouseEvent} event
     * @private
     */
    GUIWidget.prototype._dragMouseRelease = function (event) {
        if (event.button == GUIMouseEvent.BUTTON_LEFT) {
            if (this._dragIsDragging) {
                /** @type GUIMouseEvent.DragEnd */
                var cachedEvent = this._inputEventCache[GObject.getTypeId(GUIMouseEvent.DragEnd)].event;
                this._dragAssignMouseEvent(event, cachedEvent);
                this._dragAssignDragEvent(cachedEvent, event);

                this.trigger(cachedEvent);
            }
            delete this._dragStartPosition;
            delete this._dragPreviousPosition;
            delete this._dragIsDragging;
        }
    };

    /**
     * @param {GUIMouseEvent} sourceEvent
     * @param {GUIMouseEvent} dragEvent
     * @private
     */
    GUIWidget.prototype._dragAssignMouseEvent = function (sourceEvent, dragEvent) {
        dragEvent.client = sourceEvent.client;
        dragEvent.button = sourceEvent.button;
    };

    /**
     * @param {GUIMouseEvent.Drag} dragEvent
     * @param {GUIMouseEvent} currentEvent
     * @private
     */
    GUIWidget.prototype._dragAssignDragEvent = function (dragEvent, currentEvent) {
        dragEvent.clientStart = this._dragStartPosition;
        dragEvent.clientDelta = currentEvent.client.subtract(this._dragPreviousPosition);
    };

    /**
     * @param {GUIWidget} parent
     * @private
     */
    GUIWidget.prototype._setParent = function (parent) {
        this._parent = parent;
    };

    /**
     * @private
     */
    GUIWidget.prototype._updateLocale = function () {
        var hint = null;
        if (this._hint) {
            hint = this._hint.asHtml();
        }

        if (!hint || hint.length == 0) {
            this._htmlElement.removeAttribute("data-qhint");
        } else {
            this._htmlElement.setAttribute("data-qhint", qUtil.escape(hint));
        }
    };

    /**
     * Called to trigger a widget event from the dom
     * @param {Event} domEvent dom source mouse event
     * @param {GEvent} widgetEvent the widget event to trigger
     * @param {Boolean} [ignoreTarget] if true, no check for the current target
     * is made. Defaults to false
     * @private
     */
    GUIWidget.prototype._triggerWidgetEventFromDom = function (domEvent, widgetEvent, ignoreTarget) {
        // Handle capturing of mouse for down/release events
        if (widgetEvent instanceof GUIMouseEvent.Down) {
            this._setCapture();
        } else if (widgetEvent instanceof GUIMouseEvent.Release) {
            this._releaseCapture();
        }

        this.trigger(widgetEvent);
    };

    /**
     * @private
     */
    GUIWidget.prototype._updateAndTriggerInputEvent = function (domEvent, eventClass) {
        // Ignore this alltogether if we're actually disabled!
        if (!this.isEnabled()) {
            return;
        }

        // Prevent default action for certain events that may trigger browser default behaviors
        if (domEvent.type === 'keydown') {
            var key = guiKey.translateKey(domEvent.which || domEvent.keyCode);
            switch (key) {
                case GUIKey.Constant.TAB:
                    domEvent.preventDefault();
                    break;
            }
        } else if (domEvent.type === 'mousedown') {
            domEvent.preventDefault();
        }

        if (GUIMouseEvent.prototype.isPrototypeOf(eventClass.prototype)) {
            this._updateAndTriggerMouseEvent(domEvent, GObject.getTypeId(eventClass));
        } else if (GUIKeyEvent.prototype.isPrototypeOf(eventClass.prototype)) {
            this._updateAndTriggerKeyEvent(domEvent, GObject.getTypeId(eventClass));
        }
    };

    /**
     * Update the cached mouse event and trigger it
     * @param {MouseEvent} domEvent dom source mouse event
     * @param {Number} event_id the id of the event
     * @private
     */
    GUIWidget.prototype._updateAndTriggerMouseEvent = function (domEvent, event_id) {
        /** @type GUIMouseEvent */
        var cachedEvent = this._inputEventCache[event_id].event;
        cachedEvent.client = GUIWidget.convertClientPositionFromMousePosition(this._htmlElement, domEvent);
        cachedEvent.button = domEvent.button;
        this._triggerWidgetEventFromDom(domEvent, cachedEvent);
    };

    /**
     * Update the cached key event and trigger it
     * @param {KeyboardEvent} domEvent dom source key event
     * @param {Number} event_id the id of the event
     * @private
     */
    GUIWidget.prototype._updateAndTriggerKeyEvent = function (domEvent, event_id) {
        /** @type GUIKeyEvent */
        var cachedEvent = this._inputEventCache[event_id].event;

        cachedEvent.key = guiKey.translateKey(domEvent.which || domEvent.keyCode);

        this._triggerWidgetEventFromDom(domEvent, cachedEvent);
    };

    /**
     * Get the appropriate dom event name for a given event class
     * @param {Function} eventClass the event class to get a name for
     * @returns {String}
     * @private
     */
    GUIWidget.prototype._getDomEventNameForEventClass = function (eventClass) {
        switch (eventClass) {
            case GUIMouseEvent.Move:
                return "mousemove";
            case GUIMouseEvent.Enter:
                return "mouseover";
            case GUIMouseEvent.Leave:
                return "mouseout";
            case GUIMouseEvent.Down:
                return "mousedown";
            case GUIMouseEvent.Release:
                return "mouseup";
            case GUIMouseEvent.Click:
                return "click";
            case GUIMouseEvent.DblClick:
                return "dblclick";
            case GUIKeyEvent.Down:
                return "keydown";
            case GUIKeyEvent.Release:
                return "keyup";
            case GUIKeyEvent.Press:
                return "keypress";
            default:
                break;
        }

        // TODO : Touch & Key Event Support
        throw new Error("Unknown DOMEvent name");
    };

    var CAPTURE_EVENTS = [GUIMouseEvent.Move, GUIMouseEvent.Release, GUIKeyEvent.Down, GUIKeyEvent.Release, GUIKeyEvent.Press];

    GUIWidget.prototype._setCapture = function () {
        // Try the hand setCapture/releaseCapture combo, first
        //if (this._htmlElement.setCapture && document.releaseCapture) {
        //    this._htmlElement.setCapture(true);
        //} else {
            // The hard way: We'll register additional listeners for our capture-events
            // within the document to properly trigger events for them as well
            var self = this;

            function addDocumentListener(eventClass) {
                var domEventName = self._getDomEventNameForEventClass(eventClass);

                if (!self._savedDocumentListeners) {
                    self._savedDocumentListeners = {};
                }

                self._savedDocumentListeners[domEventName] = function (event) {
                    if (event.target != this._htmlElement) {
                        self._updateAndTriggerInputEvent(event, eventClass);

                        // stop propagation to avoid double-trigger on element itself
                        event.stopImmediatePropagation();
                    }
                }.bind(self);

                document.addEventListener(domEventName, self._savedDocumentListeners[domEventName], true);
            }

            for (var i = 0; i < CAPTURE_EVENTS.length; ++i) {
                var eventClass = CAPTURE_EVENTS[i];
                if (this._inputEventCache[GObject.getTypeId(eventClass)]) {
                    addDocumentListener(eventClass);
                }
            }
        //}
    };

    GUIWidget.prototype._releaseCapture = function () {
        // Try the hand setCapture/releaseCapture combo, first
        //if (this._htmlElement.setCapture && document.releaseCapture) {
        //    document.releaseCapture();
        //} else {
            // The hard way: We'll remove our listeners from the document
            // that were registered to catch mouse-up and mouse-move events
            // outside the element's client area
            if (this._savedDocumentListeners) {
                for (var domEventName in this._savedDocumentListeners) {
                    document.removeEventListener(domEventName, this._savedDocumentListeners[domEventName], true);
                }
                delete this._savedDocumentListeners;
            }
        //}
    };

    /**
     * Add a css class to the underlying div container
     * @param {String} cssClass the css class to add if not yet existent
     * @param {Boolean} noPrefix if set, no prefix will be added, defaults to false
     * @private
     */
    GUIWidget.prototype._addCSSClass = function (cssClass, noPrefix) {
        if (!noPrefix && this._BASE_CSS_CLASS) {
            cssClass = this._BASE_CSS_CLASS + "-" + cssClass;
        }

        var className = this._htmlElement.className;
        if (!className || className.trim().length == 0) {
            className = cssClass;
        } else {
            var assignClass = true;
            var classes = className.trim().split(' ');
            for (var i = 0; i < classes.length; ++i) {
                var class_ = classes[i].trim();
                if (class_ == cssClass) {
                    assignClass = false;
                    break;
                }
            }
            if (assignClass) {
                className += " " + cssClass;
            }
        }
        this._htmlElement.className = className;
    };

    /**
     * Remove a css class from the underlying div container
     * @param {String} cssClass the css class to remove
     * @param {Boolean} noPrefix if set, no prefix will be added, defaults to false
     * @private
     */
    GUIWidget.prototype._removeCSSClass = function (cssClass, noPrefix) {
        if (!noPrefix && this._BASE_CSS_CLASS) {
            cssClass = this._BASE_CSS_CLASS + "-" + cssClass;
        }

        var className = this._htmlElement.className;
        if (className && className.indexOf(cssClass) >= 0) {
            var newClassName = "";
            var classes = className.trim().split(' ');
            for (var i = 0; i < classes.length; ++i) {
                var class_ = classes[i].trim();
                if (class_ != cssClass) {
                    if (newClassName.length > 0) {
                        newClassName += " ";
                    }
                    newClassName += class_;
                }
            }
            this._htmlElement.className = newClassName;
        }
    };

    /**
     * Called to create the underlying html element
     * @private
     */
    GUIWidget.prototype._createHTMLElement = function () {
        var result = document.createElement("div");
        result.setAttribute('tabindex', '0');
        return result;
    };

    /** @override */
    GUIWidget.prototype.toString = function () {
        return "[Object GUIWidget]";
    };

    _.GUIWidget = GUIWidget;
})(this);