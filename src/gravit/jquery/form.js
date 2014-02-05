(function ($) {

    function ev(value) {
        if (!value) {
            return value;
        } else if (typeof value === 'function') {
            return value();
        } else {
            return value;
        }
    }

    var methods = {
        init: function (layout) {
            var self = this;
            return this.each(function () {
                var $this = $(this);
                var cols = 0;
                var sections = [];

                // Collect all sections and rows and calc. approx. col count
                for (var s = 0; s < layout.sections.length; ++s) {
                    var section = layout.sections[s];
                    var newSection = $.extend({}, section);
                    newSection.rows = [];
                    sections.push(newSection);
                    for (var r = 0; r < section.rows.length; ++r) {
                        var row = ev(section.rows[r]);
                        if (!(row instanceof Array)) {
                            row = [row];
                        }

                        if (row.length * 2 > cols) {
                            cols = row.length * 2;
                        }

                        newSection.rows.push(row);
                    }
                }

                // Build table layout now
                var table = $('<table></table>')
                    .addClass('g-form')
                    .appendTo($this);

                for (var s = 0; s < sections.length; ++s) {
                    var section = sections[s];
                    if (section.label) {
                        var label = gLocale.get(ev(section.label));
                        var sectionEl = $('<td></td>')
                            .attr('colspan', cols)
                            .appendTo($('<tr></tr>')
                                .addClass('section')
                                .appendTo(table));

                        sectionEl.text(label);
                    }

                    for (var r = 0; r < section.rows.length; ++r) {
                        var row = ev(section.rows[r]);
                        var stretchColspan = cols - row.length;

                        var rowEl = $('<tr></tr>')
                            .appendTo(table);

                        var hasStretchedColumn = false;
                        for (var c = 0; c < row.length; ++c) {
                            var col = ev(row[c]);

                            // Prepend label column
                            if (col.icon) {
                                $('<td></td>')
                                    .addClass('label icon')
                                    .append($('<span></span>')
                                        .addClass('fa fa-' + ev(col.icon)))
                                    .appendTo(rowEl);
                            } else {
                                var lbl = ev(col.label);
                                $('<td></td>')
                                    .addClass('label text')
                                    .text(lbl && lbl !== '' ? gLocale.get(lbl) : '')
                                    .appendTo(rowEl);
                            }

                            // Add value column
                            var colEl = $('<td></td>')
                                .addClass('input')
                                .appendTo(rowEl);

                            if (col.stretch) {
                                colEl.attr('colspan', stretchColspan);
                                hasStretchedColumn = true;
                            }

                            var inputs = ev(col.input);
                            if (!(inputs instanceof Array)) {
                                inputs = [inputs];
                            }

                            for (var i = 0; i < inputs.length; ++i) {
                                var input = inputs[i];
                                var inputEl = null;
                                var appendEl = null;

                                if (input.hasOwnProperty('available') && !ev(input.available)) {
                                    continue;
                                }

                                var value = ev(input.value);
                                if (!value) {
                                    value = "";
                                }

                                if (input.type === 'check') {
                                    inputEl = $('<input>')
                                        .attr('type', ev(input.unique) ? 'radio' : 'checkbox')
                                        .val(value);

                                    if (input.checked) {
                                        inputEl.prop('checked', ev(input.checked));
                                    }

                                    appendEl = $('<label></label>')
                                        .append(inputEl)
                                        .append($('<span></span>')
                                            .text(gLocale.get(ev(input.label))));
                                } else if (input.type === 'color') {
                                    inputEl = $('<button></button>')
                                        .gColorButton()
                                        .gColorButton('value', value);
                                } else if (input.type === 'select') {
                                    inputEl = $('<select></select>');
                                    if (input.options) {
                                        inputEl.append(ev(input.options));
                                    }
                                } else {
                                    inputEl = $('<input>')
                                        .val(value);

                                    if (input.size && !input.width) {
                                        inputEl.attr('size', input.size);
                                    }
                                }

                                if (input.width) {
                                    inputEl.css('width', ev(input.width));
                                }
                                if (input.name) {
                                    inputEl.attr('name', ev(input.name));
                                }
                                if (input.blur || !input.hasOwnProperty('blur')) {
                                    inputEl.gAutoBlur();
                                }

                                // Register events if any
                                for (var property in input) {
                                    if (input.hasOwnProperty(property) && property.substr(0, 2) === 'on') {
                                        var value = input[property];
                                        if (typeof value === 'function') {
                                            inputEl.on(property.charAt(2).toLowerCase() + property.slice(3), value);
                                        }
                                    }
                                }

                                colEl.append(appendEl ? appendEl : inputEl);
                            }
                        }
                    }

                    // Add missing columns if any
                    if (!hasStretchedColumn && row.length * 2 < cols) {
                        for (var i = 0; i < row.length * 2 - cols; ++i) {
                            $('<td></td>')
                                .append(rowEl);
                        }
                    }
                }
            });
        }
    };

    /**
     * Layout Block
     */
    $.fn.gForm = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.myPlugin');
        }
    }

}(jQuery));