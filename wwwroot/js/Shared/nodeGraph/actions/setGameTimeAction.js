(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for setting the game time
            var actionTypeSetGameTime = 36;

            /**
             * Set game time action
             * @class
             */
            Actions.SetGameTimeAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Actions.SetGameTimeAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);
            Actions.SetGameTimeAction.prototype = jQuery.extend(Actions.SetGameTimeAction.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.SetGameTimeAction.prototype.getContent = function() {
                return  "<div class='gn-actionNodeTimeContainer'><input type='text' class='gn-actionNodeTime' placeholder=''/></div>";
            };

            /**
             * Returns the object resource
             * 
             * @returns {string} Object Id
             */
            Actions.SetGameTimeAction.prototype.getObjectId = function() {
                return "ProjectMiscConfig";
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.SetGameTimeAction.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceProjectMiscConfig;
            };
            
            /**
             * Loads the project config
             * 
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Actions.SetGameTimeAction.prototype.loadObject = function() {
                var def = new jQuery.Deferred();
                
                jQuery.ajax({ 
                    url: "/api/ProjectConfigApi/GetMiscConfig", 
                    type: "GET"
                }).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.SetGameTimeAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;

                var self = this;
                this.loadObjectShared({}).done(function(miscConfig) {
                    var actionNodeTime = self.contentElement.find(".gn-actionNodeTime");
                    GoNorth.BindingHandlers.initTimePicker(actionNodeTime, function(timeValue) {
                        self.serialize(timeValue.hours, timeValue.minutes);
                    }, miscConfig.hoursPerDay, miscConfig.minutesPerHour, DefaultNodeShapes.Localization.Actions.TimeFormat, function() {
                        contentElement.closest(".node").addClass("gn-actionNodeTimeOverflow");
                    }, function() {
                        contentElement.closest(".node").removeClass("gn-actionNodeTimeOverflow");
                    }, true);

                    GoNorth.BindingHandlers.setTimePickerValue(actionNodeTime, 0, 0, miscConfig.hoursPerDay, miscConfig.minutesPerHour);
                    
                    self.deserialize(actionNodeTime, miscConfig);
                });

            };

            /**
             * Deserializes the data
             * 
             * @param {object} actionNodeTime HTML Element for the time picker
             * @param {object} miscConfig Misc config
             */
            Actions.SetGameTimeAction.prototype.deserialize = function(actionNodeTime, miscConfig) {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return;
                }

                var data = JSON.parse(actionData);

                GoNorth.BindingHandlers.setTimePickerValue(actionNodeTime, data.hours, data.minutes, miscConfig.hoursPerDay, miscConfig.minutesPerHour);
            };

            /**
             * Saves the data
             * 
             * @param {number} hours Hours
             * @param {number} minutes Minutes
             */
            Actions.SetGameTimeAction.prototype.serialize = function(hours, minutes) {
                var serializeData = {
                    hours: hours,
                    minutes: minutes
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));
            };

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.SetGameTimeAction.prototype.buildAction = function() {
                return new Actions.SetGameTimeAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.SetGameTimeAction.prototype.getType = function() {
                return actionTypeSetGameTime;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.SetGameTimeAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.SetGameTimeActionLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.SetGameTimeAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));