(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for waiting
            var actionTypeWait = 14;


            /// Wait Type for Waiting in Real Time
            var waitTypeRealTime = 0;

            /// Wait Type for Waiting in Game Time
            var waitTypeGameTime = 1;


            /// Wait unit for milliseconds
            var waitUnitMilliseconds = 0;

            /// Wait unit for seconds
            var waitUnitSeconds = 1;
            
            /// Wait unit for minutes
            var waitUnitMinutes = 2;

            /// Wait unit for hours
            var waitUnitHours = 3;
            
            /// Wait unit for days
            var waitUnitDays = 4;



            /**
             * Wait Action
             * @class
             */
            Actions.WaitAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
            };

            Actions.WaitAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.WaitAction.prototype.getContent = function() {
                return  "<input type='text' class='gn-actionNodeWaitAmount'/>" + 
                        "<select class='gn-actionNodeWaitType'></select>" +
                        "<select class='gn-actionNodeWaitUnit'></select>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.WaitAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;

                this.contentElement.find(".gn-actionNodeWaitAmount").val("0");

                var availableWaitTypes = [
                    {
                        label: DefaultNodeShapes.Localization.Actions.WaitTypeRealTime,
                        value: waitTypeRealTime
                    },
                    {
                        label: DefaultNodeShapes.Localization.Actions.WaitTypeGameTime,
                        value: waitTypeGameTime
                    }
                ];
                var waitType = contentElement.find(".gn-actionNodeWaitType");
                GoNorth.Util.fillSelectFromArray(waitType, availableWaitTypes, function(waitType) { return waitType.value; }, function(waitType) { return waitType.label; });

                var self = this;
                waitType.on("change", function() {
                    self.syncTimeUnits();
                    self.serialize();
                });

                this.syncTimeUnits();
                contentElement.find(".gn-actionNodeWaitUnit").on("change", function() {
                    self.serialize();
                });

                var waitAmount = contentElement.find(".gn-actionNodeWaitAmount");
                waitAmount.keydown(function(e) {
                    GoNorth.Util.validateNumberKeyPress(waitAmount, e);
                });

                waitAmount.change(function(e) {
                    if(self.isNumberValueSelected)
                    {
                        self.ensureNumberValue();
                    }

                    self.serialize();
                });

                this.deserialize();
            };

            /**
             * Syncs the time units
             */
            Actions.WaitAction.prototype.syncTimeUnits = function() {
                var availableUnits = [
                    {
                        label: DefaultNodeShapes.Localization.Actions.WaitUnitMilliseconds,
                        value: waitUnitMilliseconds
                    },
                    {
                        label: DefaultNodeShapes.Localization.Actions.WaitUnitSeconds,
                        value: waitUnitSeconds
                    },
                    {
                        label: DefaultNodeShapes.Localization.Actions.WaitUnitMinutes,
                        value: waitUnitMinutes
                    }
                ];

                if(this.contentElement.find(".gn-actionNodeWaitType").val() == waitTypeGameTime)
                {
                    availableUnits = [
                        {
                            label: DefaultNodeShapes.Localization.Actions.WaitUnitMinutes,
                            value: waitUnitMinutes
                        },
                        {
                            label: DefaultNodeShapes.Localization.Actions.WaitUnitHours,
                            value: waitUnitHours
                        },
                        {
                            label: DefaultNodeShapes.Localization.Actions.WaitUnitDays,
                            value: waitUnitDays
                        }
                    ];
                }

                GoNorth.Util.fillSelectFromArray(this.contentElement.find(".gn-actionNodeWaitUnit"), availableUnits, function(waitType) { return waitType.value; }, function(waitType) { return waitType.label; });
            };

            /**
             * Ensures the user entered a number if a number field was selected
             */
            Actions.WaitAction.prototype.ensureNumberValue = function() {
                var parsedValue = parseFloat(this.contentElement.find(".gn-actionNodeWaitAmount").val());
                if(isNaN(parsedValue))
                {
                    this.contentElement.find(".gn-actionNodeWaitAmount").val("0");
                }
            };

            /**
             * Deserializes the data
             */
            Actions.WaitAction.prototype.deserialize = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return "";
                }

                var data = JSON.parse(actionData);
                
                this.contentElement.find(".gn-actionNodeWaitAmount").val(data.waitAmount);
                this.contentElement.find(".gn-actionNodeWaitType").find("option[value='" + data.waitType + "']").prop("selected", true);
                this.syncTimeUnits();
                this.contentElement.find(".gn-actionNodeWaitUnit").find("option[value='" + data.waitUnit + "']").prop("selected", true);
            };

            /**
             * Saves the data
             */
            Actions.WaitAction.prototype.serialize = function() {
                var waitAmount = parseFloat(this.contentElement.find(".gn-actionNodeWaitAmount").val());
                if(isNaN(waitAmount))
                {
                    waitAmount = 0;
                }

                var waitType = this.contentElement.find(".gn-actionNodeWaitType").val();
                var waitUnit = this.contentElement.find(".gn-actionNodeWaitUnit").val();

                var serializeData = {
                    waitAmount: waitAmount,
                    waitType: waitType,
                    waitUnit: waitUnit
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));
            };

            /**
             * Returns the label for the main output
             * 
             * @returns {string} Label for the main output
             */
            Actions.WaitAction.prototype.getMainOutputLabel = function() {
                return DefaultNodeShapes.Localization.Actions.WaitLaterContinueLabel;
            };

            /**
             * Returns the additional outports of the action
             * 
             * @returns {string[]} Additional outports
             */
            Actions.WaitAction.prototype.getAdditionalOutports = function() {
                return [ DefaultNodeShapes.Localization.Actions.WaitDirectContinueLabel ];
            };

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.WaitAction.prototype.buildAction = function() {
                return new Actions.WaitAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.WaitAction.prototype.getType = function() {
                return actionTypeWait;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.WaitAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.WaitLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.WaitAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));