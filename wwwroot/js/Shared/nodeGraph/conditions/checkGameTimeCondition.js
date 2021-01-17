(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking the game time
            var conditionTypeCheckGameTime = 12;

            /// Game time Operator before
            var gameTimeOperatorBefore = 0;

            /// Game time Operator after
            var gameTimeOperatorAfter = 1;

            /// Game time operator label lookup
            var gameTimeOperatorLabelLookup = { };
            gameTimeOperatorLabelLookup[gameTimeOperatorBefore] = DefaultNodeShapes.Localization.Conditions.GameTimeOperatorBefore;
            gameTimeOperatorLabelLookup[gameTimeOperatorAfter] = DefaultNodeShapes.Localization.Conditions.GameTimeOperatorAfter;

            /**
             * Check game time condition
             * @class
             */
            Conditions.CheckGameTimeCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Conditions.CheckGameTimeCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);
            Conditions.CheckGameTimeCondition.prototype = jQuery.extend(Conditions.CheckGameTimeCondition.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.CheckGameTimeCondition.prototype.getTemplateName = function() {
                return "gn-nodeGameTimeCheck";
            };
            
            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            Conditions.CheckGameTimeCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckGameTimeCondition.prototype.getType = function() {
                return conditionTypeCheckGameTime;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckGameTimeCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckGameTimeLabel;
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            Conditions.CheckGameTimeCondition.prototype.getConditionDependsOnObject = function(existingData) {
                return [];
            };

            /**
             * Returns the object resource
             * 
             * @returns {string} Object Id
             */
            Conditions.CheckGameTimeCondition.prototype.getObjectId = function() {
                return "ProjectMiscConfig";
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckGameTimeCondition.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceProjectMiscConfig;
            };
            
            /**
             * Loads the project config
             * 
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckGameTimeCondition.prototype.loadObject = function() {
                var def = new jQuery.Deferred();
                
                GoNorth.HttpClient.get("/api/ProjectConfigApi/GetMiscConfig").done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Creates a time operator object
             * 
             * @param {number} timeOperator Time operator
             * @returns {object} Time operator object
             */
            Conditions.CheckGameTimeCondition.prototype.createTimeOperator = function(timeOperator)
            {
                return {
                    operator: timeOperator,
                    label: gameTimeOperatorLabelLookup[timeOperator]
                };
            };

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckGameTimeCondition.prototype.buildConditionData = function(existingData, element) {
                var gameTimeMinutes = [];
                for(var curMinute = 0; curMinute < 60; curMinute += 5)
                {
                    gameTimeMinutes.push(curMinute);
                }
                gameTimeMinutes.push(59);

                var conditionData = {
                    selectedGameTimeOperator: new ko.observable(),
                    selectedGameTime: new ko.observable(GoNorth.BindingHandlers.buildTimeObject(0, 0)),
                    gameTimeOperators: [
                        this.createTimeOperator(gameTimeOperatorBefore),
                        this.createTimeOperator(gameTimeOperatorAfter)
                    ],
                    hoursPerDay: new ko.observable(24),
                    minutesPerHour: new ko.observable(60)
                };

                // Load config
                this.loadObjectShared({}).done(function(miscConfig) {
                    conditionData.hoursPerDay(miscConfig.hoursPerDay);
                    conditionData.minutesPerHour(miscConfig.minutesPerHour);
                }).fail(function() {
                    element.errorOccured(true);
                })

                // Load existing data
                if(existingData)
                {
                    conditionData.selectedGameTimeOperator(existingData.operator);
                    conditionData.selectedGameTime(GoNorth.BindingHandlers.buildTimeObject(existingData.hour, existingData.minutes));
                }

                return conditionData;
            };

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.CheckGameTimeCondition.prototype.serializeConditionData = function(conditionData) {
                return {
                    operator: conditionData.selectedGameTimeOperator(),
                    hour: conditionData.selectedGameTime().hours,
                    minutes: conditionData.selectedGameTime().minutes
                };
            };

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialzied condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckGameTimeCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                
                var conditionString = DefaultNodeShapes.Localization.Conditions.GameTime;
                conditionString += " " + gameTimeOperatorLabelLookup[existingData.operator];
                conditionString += " " + this.formatTwoDigits(existingData.hour) + ":" + this.formatTwoDigits(existingData.minutes);
                def.resolve(conditionString);

                return def.promise();
            };

            /**
             * Formats a value as a two digit number
             * 
             * @param {number} number Number to format
             * @returns {string} Number as two digit
             */
            Conditions.CheckGameTimeCondition.prototype.formatTwoDigits = function(number) {
                if(!number) {
                    return "00";
                }

                var numberFormated = number.toString();
                if(numberFormated.length < 2)
                {
                    numberFormated = "0" + numberFormated;
                }

                return numberFormated;
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckGameTimeCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));