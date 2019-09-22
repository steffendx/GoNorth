(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Shapes) {

            /// Action Type
            var actionType = "default.Action";
            
            /// Action Target Array
            var actionTargetArray = "action";


            /// All available actions
            var availableActions = [];

            /// Height of action node
            var actionNodeHeight = 200;

            /**
             * Adds a new available action
             * 
             * @param {object} action Action
             */
            Shapes.addAvailableAction = function(action) {
                availableActions.push(action);
            }

            /**
             * Loads the config for an action
             * 
             * @param {string} configKey Config key
             * @returns {jQuery.Deferred} Deferred for the request
             */
            function loadActionConfig(configKey) {
                var def = new jQuery.Deferred();

                jQuery.ajax("/api/ProjectConfigApi/GetJsonConfigByKey?configKey=" + encodeURIComponent(configKey)).done(function(loadedConfigData) {
                    if(!loadedConfigData)
                    {
                        def.resolve();
                        return;
                    }
                    
                    try
                    {
                        var configLines = JSON.parse(loadedConfigData)
                        var configList = jQuery("<datalist id='gn-" + configKey + "'></datalist>");
                        for(var curLine = 0; curLine < configLines.length; ++curLine)
                        {
                            configList.append(jQuery("<option></option>").text(configLines[curLine]));
                        }
                        jQuery("body").append(configList);
                        def.resolve();
                    }
                    catch(e)
                    {
                        self.errorOccured(true);
                        def.reject();
                    }
                }).fail(function() {
                    def.reject();
                })

                return def.promise();
            }

            /**
             * Loads all the config lists
             * @returns {jQuery.Deferred} Deferred for the requests
             */
            Shapes.loadConfigLists = function() {
                var usedConfigKeys = {};
                var loadingPromises = [];

                for(var curAction = 0; curAction < availableActions.length; ++curAction)
                {
                    var configKey = availableActions[curAction].getConfigKey();
                    if(configKey && !usedConfigKeys[configKey])
                    {
                        usedConfigKeys[configKey] = true;
                        loadingPromises.push(loadActionConfig(configKey));
                    }
                }

                return jQuery.when.apply(jQuery, loadingPromises);
            }

            joint.shapes.default = joint.shapes.default || {};

            /**
             * Creates the action shape
             * @returns {object} Action shape
             * @memberof Shapes
             */
            function createActionShape() {
                var model = joint.shapes.devs.Model.extend(
                {
                    defaults: joint.util.deepSupplement
                    (
                        {
                            type: actionType,
                            icon: "glyphicon-cog",
                            size: { width: 250, height: 200 },
                            inPorts: ['input'],
                            outPorts: ['output'],
                            attrs:
                            {
                                '.inPorts circle': { "magnet": "passive", "port-type": "input" },
                                '.outPorts circle': { "magnet": "true" }
                            },
                            actionType: null,
                            actionRelatedToObjectType: null,
                            actionRelatedToObjectId: null,
                            actionRelatedToAdditionalObjects: [],
                            actionData: null
                        },
                        joint.shapes.default.Base.prototype.defaults
                    )
                });
                return model;
            }

            /**
             * Creates a action view
             * @returns {object} Action view
             * @memberof Shapes
             */
            function createActionView() {
                return joint.shapes.default.BaseView.extend(
                {
                    /**
                     * Template
                     */
                    template:
                    [
                        '<div class="node">',
                            '<span class="label"><i class="nodeIcon glyphicon"></i><span class="labelText"></span></span>',
                            '<span class="gn-nodeLoading" style="display: none"><i class="glyphicon glyphicon-refresh spinning"></i></span>',
                            '<span class="gn-nodeError text-danger" style="display: none" title="' + GoNorth.DefaultNodeShapes.Localization.ErrorOccured + '"><i class="glyphicon glyphicon-warning-sign"></i></span>',
                            '<button class="delete gn-nodeDeleteOnReadonly cornerButton" title="' + GoNorth.DefaultNodeShapes.Localization.DeleteNode + '">x</button>',
                            '<select class="gn-actionNodeSelectActionType"></select>',
                            '<div class="gn-actionNodeActionContent"></div>',
                        '</div>',
                    ].join(''),

                    /**
                     * Initializes the shape
                     */
                    initialize: function() {
                        joint.shapes.default.BaseView.prototype.initialize.apply(this, arguments);

                        var actionTypeBox = this.$box.find(".gn-actionNodeSelectActionType");
                        GoNorth.Util.fillSelectFromArray(actionTypeBox, availableActions, function(action) { return action.getType(); }, function(action) { return action.getLabel(); });

                        var self = this;
                        actionTypeBox.on("change", function() {
                            self.resetActionData();
                            self.syncActionData();
                        });

                        actionTypeBox.find("option[value='" + this.model.get("actionType") + "']").prop("selected", true);

                        this.syncActionData();
                    },

                    /**
                     * Returns the current action
                     */
                    getCurrentAction: function() {
                        var actionType = this.$box.find(".gn-actionNodeSelectActionType").val();
                        for(var curAction = 0; curAction < availableActions.length; ++curAction)
                        {
                            if(availableActions[curAction].getType() == actionType)
                            {
                                return availableActions[curAction];
                            }
                        }
                        return null;
                    },

                    /**
                     * Resets the action data
                     */
                    resetActionData: function() {
                        this.model.set("actionRelatedToObjectType", null);
                        this.model.set("actionRelatedToObjectId", null);
                        this.model.set("actionRelatedToAdditionalObjects", []);
                        this.model.set("actionData", null);

                        if(this.model.get("actionCustomAttributes")) 
                        {
                            var customAttributes = this.model.get("actionCustomAttributes");
                            for(var curAttribute = 0; curAttribute < customAttributes.length; ++curAttribute)
                            {
                                this.model.set(customAttributes[curAttribute], null);
                            }
                            this.model.set("actionCustomAttributes", null);
                        }
                    },

                    /**
                     * Syncs the action data
                     */
                    syncActionData: function() {
                        var action = this.getCurrentAction();
                        if(!action)
                        {
                            return;
                        }

                        var currentAction = action.buildAction();
                        currentAction.setNodeModel(this.model);
                        this.model.set("actionType", currentAction.getType());

                        var actionContent = this.$box.find(".gn-actionNodeActionContent");
                        actionContent.html(currentAction.getContent());
                        this.model.set("actionCustomAttributes", currentAction.getCustomActionAttributes());
                        var self = this;
                        currentAction.showErrorCallback = function() {
                            self.showError();
                        };
                        this.syncOutputPorts(currentAction);
                        currentAction.onInitialized(actionContent, this);
                    },

                    /**
                     * Syncs the output ports
                     * @param {object} currentAction Action to load the output ports from
                     */
                    syncOutputPorts: function(currentAction) {
                        var currentPortDisplayNames = [];
                        this.$el.find(".gn-nodeActionOutputLabel").each(function() {
                            currentPortDisplayNames.push(jQuery(this).find("tspan").text());
                        });
                        if(currentPortDisplayNames.length == 0)
                        {
                            currentPortDisplayNames.push("");
                        }

                        var outPorts = ["output"];
                        var outPortDisplayNames = [currentAction.getMainOutputLabel()];

                        var additionalOutPorts = currentAction.getAdditionalOutports();
                        if(additionalOutPorts)
                        {
                            for(var curPort = 0; curPort < additionalOutPorts.length; ++curPort)
                            {
                                outPorts.push("additionalActionOutput" + (curPort + 1));
                                outPortDisplayNames.push(additionalOutPorts[curPort])
                            }
                        }

                        if(!GoNorth.Util.isEqual(currentPortDisplayNames, outPortDisplayNames))
                        {
                            this.model.set("outPorts", outPorts);

                            // Update Port Positions
                            if(outPorts.length > 1)
                            {
                                var heightsPerPort = actionNodeHeight / (outPorts.length + 1);
                                for(var curPort = 0; curPort < outPorts.length; ++curPort)
                                {
                                    var label = "";
                                    if(curPort == 0)
                                    {
                                        label = currentAction.getMainOutputLabel();
                                    }
                                    else
                                    {
                                        label = additionalOutPorts[curPort - 1];
                                    }

                                    this.model.attr(".outPorts>.port" + curPort, { "ref-y": (heightsPerPort * (curPort + 1)) + "px", "ref": ".body" });
                                    this.model.attr(".outPorts>.port" + curPort + " .port-label", { "title": label, "class": "gn-nodeActionOutputLabel", "dx": 15, "dy": 0 });
                                }
                            }
                            else
                            {
                                this.model.attr(".outPorts>.port0" + " .port-label", { "title": "", "class": "", "dx": 15, "dy": 0 });
                            }

                            // setTimeout is required to have the element ready on load
                            var self = this;
                            setTimeout(function() {
                                self.$el.find(".gn-nodeActionOutputLabel").each(function() {
                                    jQuery(this).find("tspan").text(jQuery(this).attr("title"));
                                });
                            }, 1);
                        }
                    },

                    /**
                     * Reloads the shared data
                     * 
                     * @param {number} objectType Object Type
                     * @param {string} objectId Object Id
                     */
                    reloadSharedLoadedData: function(objectType, objectId) {
                        if(this.model.get("actionRelatedToObjectId") == objectId)
                        {
                            this.syncActionData();
                        }
                    },


                    /**
                     * Shows the loading indicator
                     */
                    showLoading: function() {
                        this.$box.find(".gn-nodeLoading").show();
                    },

                    /**
                     * Hides the loading indicator
                     */
                    hideLoading: function() {
                        this.$box.find(".gn-nodeLoading").hide();
                    },


                    /**
                     * Shows the error indicator
                     */
                    showError: function() {
                        this.$box.find(".gn-nodeError").show();
                    },

                    /**
                     * Hides the error indicator
                     */
                    hideError: function() {
                        this.$box.find(".gn-nodeError").hide();
                    }
                });
            }

            /**
             * Action Shape
             */
            joint.shapes.default.Action = createActionShape();

            /**
             * Action View
             */
            joint.shapes.default.ActionView = createActionView();


            /** 
             * Action Serializer 
             * 
             * @class
             */
            Shapes.ActionSerializer = function()
            {
                GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.apply(this, [ joint.shapes.default.Action, actionType, actionTargetArray ]);
            };

            Shapes.ActionSerializer.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.prototype)

            /**
             * Serializes a node
             * 
             * @param {object} node Node Object
             * @returns {object} Serialized NOde
             */
            Shapes.ActionSerializer.prototype.serialize = function(node) {
                var serializedData = {
                    id: node.id,
                    x: node.position.x,
                    y: node.position.y,
                    actionType: node.actionType,
                    actionRelatedToObjectType: node.actionRelatedToObjectType,
                    actionRelatedToObjectId: node.actionRelatedToObjectId,
                    actionRelatedToAdditionalObjects: node.actionRelatedToAdditionalObjects,
                    actionData: node.actionData
                };

                return serializedData;
            };

            /**
             * Deserializes a serialized node
             * 
             * @param {object} node Serialized Node Object
             * @returns {object} Deserialized Node
             */
            Shapes.ActionSerializer.prototype.deserialize = function(node) {
                var initOptions = {
                    id: node.id,
                    position: { x: node.x, y: node.y },
                    actionType: node.actionType,
                    actionRelatedToObjectType: node.actionRelatedToObjectType,
                    actionRelatedToObjectId: node.actionRelatedToObjectId,
                    actionRelatedToAdditionalObjects: node.actionRelatedToAdditionalObjects,
                    actionData: node.actionData
                };

                var node = new this.classType(initOptions);
                return node;
            };

            // Register Serializers
            var actionSerializer = new Shapes.ActionSerializer();
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(actionSerializer);

        }(DefaultNodeShapes.Shapes = DefaultNodeShapes.Shapes || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));