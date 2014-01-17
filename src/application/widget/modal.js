(function (_) {
    /**
     * A modal dialog
     * @class GUIModal
     * @constructor
     * @version 1.0
     */
    function GUIModal() {
        // Create our outer modal wrapper
        this._htmlElement = $('<div></div>')
            .addClass('g-modal-wrapper');

        // Add our modal header
        $('<div></div>')
            .addClass('g-modal-header')
            .append($('<div></div>')
                .addClass('g-modal-header-wrapper')
                .append($('<div></div>')))
            .appendTo(this._htmlElement);

        // Add our modal content
        $('<div></div>')
            .addClass('g-modal-container')
            .append($('<div></div>')
                .addClass('g-modal-content-wrapper')
                .append($('<div></div>')
                    .addClass('g-modal-content')))
            .appendTo(this._htmlElement);

        // Do some initial updates
        this._updateHeaderButtons();
    };

    GObject.inherit(GUIModal, GEventTarget);

    // -----------------------------------------------------------------------------------------------------------------
    // GUIModal.CloseEvent Event
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An event whenever a modal is closed
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GUIModal.CloseEvent = function () {
    };
    GObject.inherit(GUIModal.CloseEvent, GEvent);

    /** @override */
    GUIModal.CloseEvent.prototype.toString = function () {
        return "[Object GUIModal.CloseEvent]";
    };

    GUIModal.CLOSE_EVENT = new GUIModal.CloseEvent();

    // -----------------------------------------------------------------------------------------------------------------
    // GUIModal Class
    // -----------------------------------------------------------------------------------------------------------------    

    /**
     * @type {boolean}
     * @private
     */
    GUIModal.prototype._closeable = true;

    /**
     * @type {boolean}
     * @private
     */
    GUIModal.prototype._scrollable = true;

    /**
     * @type {boolean}
     * @private
     */
    GUIModal.prototype._margins = true;

    /**
     * @type {number}
     * @private
     */
    GUIModal.prototype._width = null;

    /**
     * @type {number}
     * @private
     */
    GUIModal.prototype._height = null;

    /**
     * @type {Jquery|String}
     * @private
     */
    GUIModal.prototype._header = null;

    /**
     * @type {Jquery|String}
     * @private
     */
    GUIModal.prototype._content = null;

    /**
     * @type {Array<{title: GLocale.Key|String, click: Function}>}
     * @private
     */
    GUIModal.prototype._buttons = null;

    /**
     * @type {GUIModal}
     * @private
     */
    GUIModal.prototype._parent = null;

    /**
     * @type {Function}
     * @private
     */
    GUIModal.prototype._keyCloseListener = null;

    /**
     * @type {Jquery}
     * @private
     */
    GUIModal.prototype._htmlElement = null;

    /**
     * @type {Jquery}
     * @private
     */
    GUIModal.prototype._htmlElementBackground = null;

    /**
     * @type {IScroll}
     * @private
     */
    GUIModal.prototype._contentScroller = null;

    /**
     * @type {Function}
     * @private
     */
    GUIModal.prototype._contentScrollerEventInterceptor = null;

    /**
     * @return {boolean} whether the modal is closeable or not
     */
    GUIModal.prototype.isCloseable = function () {
        return this._closeable;
    };

    /**
     * @param {boolean} closeable whether the modal is closeable or not
     */
    GUIModal.prototype.setCloseable = function (closeable) {
        this._closeable = closeable;
        this._updateHeaderButtons();
    };

    /**
     * @return {boolean} whether the modal's content is scrollable or not
     */
    GUIModal.prototype.isScrollable = function () {
        return this._scrollable;
    };

    /**
     * @param {boolean} scrollable whether the modal's content is scrollable or not
     */
    GUIModal.prototype.setScrollable = function (scrollable) {
        this._scrollable = scrollable;
        this._updateScroller();
    };

    /**
     * Wether the modal has any margins or not
     * @return {boolean}
     */
    GUIModal.prototype.hasMargins = function () {
        this._margins;
    };

    /**
     * Set whether the modal has any margins or not
     * @param {boolean} margins
     */
    GUIModal.prototype.setMargins = function (margins) {
        if (margins !== this._margins) {
            this._margins = margins;
            var modalContainer = this._htmlElement.find('.g-modal-container');
            modalContainer.css('padding', this._margins ? '' : '0px');
        }
    };

    /**
     * @return {number} the modal's width
     */
    GUIModal.prototype.getWidth = function () {
        return this._width;
    };

    /**
     * @param {number} width the modal's width or null to use the default
     */
    GUIModal.prototype.setWidth = function (width) {
        this._width = width;
        this._htmlElement.css('width', this._width ? (this._width + "px") : "");
    };

    /**
     * @return {number} the modal's height
     */
    GUIModal.prototype.getHeight = function () {
        return this._height;
    };

    /**
     * @param {number} height the modal's height or null to use the default
     */
    GUIModal.prototype.setHeight = function (height) {
        this._height = height;
        this._htmlElement.css('height', this._height ? (this._height + "px") : "");
        this._updateSizes();
    };

    /**
     * @return {JQuery|String} the modal's header content
     */
    GUIModal.prototype.getHeader = function () {
        return this._header;
    };

    /**
     * @param {JQuery|String} header the modal's header or null for none
     */
    GUIModal.prototype.setHeader = function (header) {
        this._header = header;
        var headerWrapper = this._htmlElement.find('.g-modal-header-wrapper');
        headerWrapper.empty();
        headerWrapper.append(this._header ? this._header : '&nbsp;');
        this._updateHeaderVisibility();
        if (this._contentScroller) {
            this._contentScroller.refresh();
        }
    };

    /**
     * @return {JQuery|String} the modal's content
     */
    GUIModal.prototype.getContent = function () {
        return this._content;
    };

    /**
     * @param {JQuery|String} content the modal's content or null for none
     */
    GUIModal.prototype.setContent = function (content) {
        this._content = content;
        var modalContent = this._htmlElement.find('.g-modal-content');
        modalContent.empty();
        if (content) {
            modalContent.append(content);
        }
        this._updateScroller();
        if (this._contentScroller) {
            this._contentScroller.refresh();
        }
    };

    /**
     * @return {Array<{title: GLocale.Key|String, click: Function}>}
     */
    GUIModal.prototype.getButtons = function () {
        return this._buttons;
    };

    /**
     * @param {Array<{title: GLocale.Key|String, click: Function, enabled : Function, visible: Function}>} buttons
     */
    GUIModal.prototype.setButtons = function (buttons) {
        this._buttons = buttons;
        if (this._buttons && this._buttons.length === 0) {
            this._buttons = null;
        }
        this._updateHeaderButtons();
        this.updateButtons();
    };

    /**
     * @return {GUIModal}
     */
    GUIModal.prototype.getParent = function () {
        return this._parent;
    };

    /**
     * @param {GUIModal} parent
     */
    GUIModal.prototype.setParent = function (parent) {
        return this._parent = parent;
    };

    /**
     * Scroll to a specific element. Ignored when the modal is not opened.
     * @param elementSelector the css selector for an element within the content
     */
    GUIModal.prototype.scrollToElement = function (elementSelector) {
        if (this._contentScroller) {
            this._contentScroller.scrollToElement(elementSelector);
        }
    };

    /**
     * Update the buttons state when opened
     */
    GUIModal.prototype.updateButtons = function () {
        if (this._buttons) {
            this._htmlElement.find('.g-modal-header-button').each(function (index, element) {
                var el = $(element);
                var btIndex = el.attr('data-button-index');
                if (!btIndex) {
                    return;
                }
                btIndex = parseInt(btIndex);
                if (btIndex >= 0 && btIndex < this._buttons.length) {
                    var el = $(element);
                    var bt = this._buttons[btIndex];

                    if (typeof bt.title === 'function') {
                        el.text(gLocale.get(bt.title()));
                    } else {
                        el.text(gLocale.get(bt.title));
                    }

                    if (bt.enabled && !bt.enabled()) {
                        el.attr('disabled', 'disabled');
                    } else {
                        el.removeAttr('disabled');
                    }

                    if (bt.visible && !bt.visible()) {
                        el.css('display', 'none');
                    } else {
                        el.css('display', null);
                    }
                }
            }.bind(this));
        }
    };

    /**
     * Open the modal
     */
    GUIModal.prototype.open = function () {
        var parent = this._parent ? this._parent._htmlElement : $("body");

        // If modal is closeable, add a listener for the ESC-Key
        if (this._closeable) {
            this._keyCloseListener = function (evt) {
                if (evt.keyCode == 27) {
                    this.close();
                }
            }.bind(this)
            document.addEventListener("keyup", this._keyCloseListener, true);
        } else {
            this._keyCloseListener = null;
        }

        // Create and add our background
        this._htmlElementBackground = $('<div></div>')
            .addClass('g-modal-background')
            .on('click', function () {
                if (this._closeable) {
                    this.close();
                } else {
                    // TODO: Bounce dialog
                }
            }.bind(this))
            .appendTo(parent);

        // Add our modal wrapper
        this._htmlElement.appendTo(parent);

        // Update header visiblity
        this._updateHeaderVisibility();

        // Refresh scroller
        if (this._contentScroller) {
            this._contentScroller.refresh();
        }

        // Update buttons
        this.updateButtons();
    };

    /**
     * Close the modal
     */
    GUIModal.prototype.close = function () {
        if (this._htmlElement) {
            // Remove our background and modal
            this._htmlElementBackground.remove();
            this._htmlElement.detach();

            // Remove any attached key close listener
            if (this._keyCloseListener) {
                document.removeEventListener("keyup", this._keyCloseListener, true);
            }

            // Reset temporaries
            this._htmlElementBackground = null;
            this._keyCloseListener = null;

            // Trigger event that our modal has been closed
            this.trigger(GUIModal.CLOSE_EVENT);
        }
    };

    GUIModal.prototype._updateHeaderVisibility = function () {
        var visible = this._header || this._buttons || this._closeable;
        var header = this._htmlElement.find('.g-modal-header');

        header.css('display', visible ? '' : 'none');

        this._updateSizes();
    };

    GUIModal.prototype._updateScroller = function () {
        var modalContentWrapper = this._htmlElement.find('.g-modal-content-wrapper');
        var modalContent = modalContentWrapper.find('.g-modal-content');

        if (this._scrollable && !this._contentScroller && modalContentWrapper[0].children && modalContentWrapper[0].children.length > 0) {
            this._contentScroller = new IScroll(modalContentWrapper[0], {
                scrollbars: true,
                mouseWheel: true,
                interactiveScrollbars: true,
                resizeIndicator: true
            });

            // Register event interceptor to prevent mouse click when scrolled
            this._contentScrollerEventInterceptor = function (evt) {
                if (this._contentScroller.moved) {
                    evt.stopPropagation();
                }
            }.bind(this);

            modalContent[0].addEventListener('click', this._contentScrollerEventInterceptor, true);
        } else {
            if (this._contentScroller) {
                this._contentScroller.destroy();
                this._contentScroller = null;

                modalContent[0].removeEventListener('click', this._contentScrollerEventInterceptor, true);
            }
        }
    };

    GUIModal.prototype._updateSizes = function () {
        // Assign fixed height
        if (gSystem.hardware === GSystem.Hardware.Phone || this._height) {
            var header = this._htmlElement.find('.g-modal-header');

            this._htmlElement
                .find('.g-modal-container')
                .css('height', (this._htmlElement.height() - (header.css('display') !== 'none' ? header.outerHeight() : 0)).toString() + 'px');
            this._htmlElement
                .find('.g-modal-content-wrapper')
                .css('height', '100%');
            this._htmlElement
                .find('.g-modal-content')
                .css('height', '100%');
        } else {
            this._htmlElement
                .find('.g-modal-container')
                .css('height', 'auto');
            this._htmlElement
                .find('.g-modal-content-wrapper')
                .css('height', 'auto');
            this._htmlElement
                .find('.g-modal-content')
                .css('height', 'auto');
        }

        if (this._contentScroller) {
            this._contentScroller.refresh();
        }
    };

    GUIModal.prototype._updateHeaderButtons = function () {
        var header = this._htmlElement.find('.g-modal-header');
        header.find('.g-modal-header-buttons').remove();

        if (this._buttons || this._closeable) {
            var buttonContainer = $('<div></div>')
                .addClass('g-modal-header-buttons')
                .appendTo(header);

            if (this._buttons) {
                for (var i = 0; i < this._buttons.length; ++i) {
                    $('<span>&nbsp;</span>')
                        .appendTo(buttonContainer);

                    $('<button></button>')
                        .addClass('g-modal-header-button')
                        .attr('data-button-index', i.toString())
                        .on('click', this._buttons[i].click)
                        .appendTo(buttonContainer);
                }
            } else if (!this._buttons && this._closeable) {
                // Append "magic" close button if there're no other buttons
                $('<button></button>')
                    .addClass('g-modal-header-button')
                    .text(gLocale.get(GLocale.Constant.Close))
                    .on('click', function () {
                        this.close();
                    }.bind(this))
                    .appendTo(buttonContainer);
            }
        }

        this._updateHeaderVisibility();
    };

    _.GUIModal = GUIModal;
})(this);
