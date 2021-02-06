(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Shapes) {

            joint.shapes.default = joint.shapes.default || {};

            /**
             * Base Shape
             */
            joint.shapes.default.Base = joint.shapes.devs.Model.extend(
            {
                defaults: joint.util.deepSupplement
                (
                    {
                        type: 'default.Base',
                        size: { width: 200, height: 64 },
                        nodeText: '',
                        attrs:
                        {
                            rect: { stroke: 'none', 'fill-opacity': 0 },
                            text: { display: 'none' },
                        },
                    },
                    joint.shapes.devs.Model.prototype.defaults
                ),
            });

            /**
             * Base Shape View
             */
            joint.shapes.default.BaseView = joint.shapes.devs.ModelView.extend(
            {
                /**
                 * Template
                 */
                template:
                [
                    '<div class="node">',
                        '<span class="label"><i class="nodeIcon glyphicon"></i><span class="labelText"></span></span>',
                        '<button class="delete" title="' + GoNorth.DefaultNodeShapes.Localization.DeleteNode + '">x</button>',
                    '</div>',
                ].join(''),

                /**
                 * Initializes the shape
                 */
                initialize: function() {
                    _.bindAll(this, 'updateBox');
                    joint.shapes.devs.ModelView.prototype.initialize.apply(this, arguments);

                    this.$box = jQuery(_.template(this.template)());
                    // Prevent paper from handling pointerdown.
                    this.$box.find('input').on('mousedown click', function(evt) { evt.stopPropagation(); });

                    this.$box.find('.nodeText').on('change', _.bind(function(evt)
                    {
                        this.model.set('nodeText', jQuery(evt.target).val());
                    }, this));

                    this.$box.find('.delete').on('click', _.bind(function() {
                        if(!this.model.onDelete)
                        {
                            this.model.remove();
                        }
                        else
                        {
                            var self = this;
                            this.model.onDelete(this).done(function() {
                                self.model.remove();
                            });
                        }
                    }, this));

                    if(this.additionalCallbackButtons)
                    {
                        var callbacks = this.additionalCallbackButtons;
                        var self = this;
                        jQuery.each(callbacks, function(key) {
                            self.$box.find("." + key).on("click", _.bind(function() {
                                callbacks[key].apply(self);
                            }, self));
                        });
                    }

                    this.model.on('change', this.updateBox, this);
                    this.model.on('remove', this.removeBox, this);

                    this.updateBox();
                },

                /**
                 * Renders the shape
                 */
                render: function() {
                    joint.shapes.devs.ModelView.prototype.render.apply(this, arguments);
                    
                    this.listenTo(this.paper, "scale", this.updateBox);
                    this.listenTo(this.paper, "translate", this.updateBox);

                    this.paper.$el.prepend(this.$box);
                    this.updateBox();
                    return this;
                },

                /**
                 * Updates the box
                 */
                updateBox: function() {
                    var bbox = this.model.getBBox();
                    if(this.paper)
                    {
                        bbox.x = bbox.x * this.paper.scale().sx + this.paper.translate().tx;
                        bbox.y = bbox.y * this.paper.scale().sy + this.paper.translate().ty;
                        bbox.width *= this.paper.scale().sx;
                        bbox.height *= this.paper.scale().sy;
                    }

                    var textField = this.$box.find('.nodeText');
                    if (!textField.is(':focus'))
                    {
                        textField.val(this.model.get('nodeText'));
                    }

                    var label = this.$box.find('.labelText');
                    var type = this.model.get('type');
                    label.text(DefaultNodeShapes.Localization.TypeNames[type]);
                    this.$box.find('.label').attr('class', 'label ' + type.replace(".", "_"));

                    if(this.model.get("icon"))
                    {
                        this.$box.find(".nodeIcon").addClass(this.model.get("icon"));
                    }
                    else
                    {
                        this.$box.find(".nodeIcon").remove();
                    }

                    this.$box.css({ width: bbox.width, height: bbox.height, left: bbox.x, top: bbox.y, transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)' });
                },

                /**
                 * Removes the box
                 */
                removeBox: function(evt) {
                    this.$box.remove();
                },

                /**
                 * Checks if a node can be deleted
                 * 
                 * @returns {jQuery.Deferred} Deferred for the validation process
                 */
                validateDelete: function() {
                    return null;
                },

                /**
                 * Returns statistics for the node
                 * @returns Node statistics
                 */
                getStatistics: function() {
                    return {
                        wordCount: GoNorth.Util.getWordCount(this.model.get('nodeText'))
                    };
                }
            });

        }(DefaultNodeShapes.Shapes = DefaultNodeShapes.Shapes || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));