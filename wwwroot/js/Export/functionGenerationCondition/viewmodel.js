(function(GoNorth) {
    "use strict";
    (function(Export) {
        (function(FunctionGenerationCondition) {

            /**
             * Template Overview View Model
             * @class
             */
            FunctionGenerationCondition.ViewModel = function()
            {
                this.conditionDialog = new GoNorth.DefaultNodeShapes.Conditions.ConditionDialog();

                this.generateRules = new ko.observableArray();
                this.preventGenerationRules = new ko.observableArray();
                
                this.showConfirmDeleteDialog = new ko.observable(false);
                this.targetDeleteArray = null;
                this.targetDeleteRule = null;

                this.isLoading = new ko.observable(false);
                this.errorOccured = new ko.observable(false);
                this.hasUnknownConditionType = new ko.observable(false);
                this.isReadonly = new ko.observable(false);
                this.lockedByUser = new ko.observable("");

                this.acquireLock();
                this.loadFunctionGenerationConditions();
            };

            FunctionGenerationCondition.ViewModel.prototype = {
                /**
                 * Loads the function generation conditions
                 */
                loadFunctionGenerationConditions: function() {
                    this.isLoading(true);
                    this.errorOccured(false);
                    this.hasUnknownConditionType(false);
                    var self = this;
                    jQuery.ajax({
                        url: "/api/ExportApi/GetDialogFunctionGenerationConditions",
                        type: "GET"
                    }).done(function(data) {
                        var generateRulesNameDef = self.generateDisplayNameForRules(data.generateRules);
                        var preventGenerationRulesNameDef = self.generateDisplayNameForRules(data.preventGenerationRules);
                        jQuery.when(generateRulesNameDef, preventGenerationRulesNameDef).then(function(generateRules, preventGenerationRules) {
                            self.generateRules(generateRules);
                            self.preventGenerationRules(preventGenerationRules);

                            self.isLoading(false);
                        }, function() {
                            self.isLoading(false);
                            self.errorOccured(true);
                        });
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Generates the display name for the rules
                 * 
                 * @param {object[]} rules Rules returned from the api
                 * @returns {jQuery.Deferred} Deferred for the name generation
                 */
                generateDisplayNameForRules: function(rules) {
                    var allNameDeferreds = [];
                    var self = this;
                    jQuery.each(rules, function(index, rule) {
                        var ruleNameDef = self.generateDisplayNameForRule(rule);
                        allNameDeferreds.push(ruleNameDef);
                    });
                    
                    var nameDef = new jQuery.Deferred();
                    jQuery.when.apply(jQuery, allNameDeferreds).then(function() {
                        nameDef.resolve(rules);
                    }, function() {
                        nameDef.reject();
                    });

                    return nameDef.promise();
                },

                /**
                 * Generates the display name for a single rule
                 * 
                 * @param {object[]} rules Rule to generate name for
                 * @returns {jQuery.Deferred} Deferred for the name generation
                 */
                generateDisplayNameForRule: function(rule) {
                    var ruleNameDef = new jQuery.Deferred();
                    var convertedRule = this.convertConditionToDialog(rule);
                    if(!convertedRule)
                    {
                        ruleNameDef.reject();
                        return ruleNameDef.promise();
                    }

                    GoNorth.DefaultNodeShapes.Conditions.getConditionManager().getConditionString(convertedRule.conditionElements, GoNorth.DefaultNodeShapes.Localization.Conditions.AndOperatorShort, false).then(function(conditionName) {
                        rule.name = conditionName;
                        ruleNameDef.resolve(rule);
                    }, function() {
                        ruleNameDef.reject();
                    });

                    return ruleNameDef.promise();
                },

                /**
                 * Creates a new rule
                 * 
                 * @param {ko.observableArray} targetArray Array to push the new rule into
                 */
                createNewRule: function(targetArray) {
                    var self = this;
                    this.showConditionDialog([]).done(function(condition) {
                        targetArray.push(condition);
                        self.saveConditions();
                    });
                },

                /**
                 * Opens the edit dialog for a rule
                 * 
                 * @param {object} targetArray Array which contains the rule
                 * @param {number} index Index of the rule
                 */
                openEditRuleDialog: function(targetArray, index) {
                    if(this.isReadonly())
                    {
                        return;
                    }

                    var ruleIndex = index();
                    var targetArrayValue = targetArray();
                    var self = this;
                    var convertedRule = this.convertConditionToDialog(targetArrayValue[ruleIndex]);
                    this.showConditionDialog(convertedRule.conditionElements).done(function(condition) {
                        targetArrayValue[ruleIndex] = condition;
                        targetArray(targetArrayValue);
                        self.saveConditions();
                    });
                },

                /**
                 * Opens the condition dialog
                 * 
                 * @param {object[]} existingElements Existing condition elements ready for the dialog
                 * @returns {jQuery.Deferred} Deferred which will be resolved with the updated condition
                 */
                showConditionDialog: function(existingElements) {
                    var condition = {
                        conditionElements: existingElements
                    };

                    var finalizedConditionsDeferred = new jQuery.Deferred();
                    var conditionDialogDeferred = new jQuery.Deferred();
                    this.conditionDialog.openDialog(condition, conditionDialogDeferred);
                    var self = this;
                    conditionDialogDeferred.done(function() {
                        var convertedCondition = self.convertConditionFromDialog(condition);
                        if(convertedCondition)
                        {
                            self.generateDisplayNameForRule(convertedCondition).then(function() {
                                finalizedConditionsDeferred.resolve(convertedCondition);
                            }, function() {
                                self.errorOccured(true);
                                finalizedConditionsDeferred.reject();
                            });
                        }
                    });

                    return finalizedConditionsDeferred.promise();
                },

                /**
                 * Converts a condition from the condition dialog to a version compatible with the api
                 * 
                 * @param {object} condition Dialog Condition
                 * @returns {object} Converted condition compatible with the api
                 */
                convertConditionFromDialog: function(condition) {
                    var convertedElements = FunctionGenerationCondition.convertConditionElementsFromDialog(condition.conditionElements);
                    return this.checkAndFinalizeConvertedElements(convertedElements);
                },

                /**
                 * Converts a condition from the api to a version compatible with the condition dialog
                 * 
                 * @param {object} condition Api condition
                 * @returns {object} Converted condition compatible with the dialog
                 */
                convertConditionToDialog: function(condition) {
                    var convertedElements = FunctionGenerationCondition.convertConditionElementsToDialog(condition.conditionElements);
                    return this.checkAndFinalizeConvertedElements(convertedElements);
                },

                /**
                 * Checks if a list of converted elements is valid and returns the final condition
                 * 
                 * @param {object[]} convertedElements Converted Elements
                 * @returns {object} Final condition
                 */
                checkAndFinalizeConvertedElements: function(convertedElements) {
                    if(!convertedElements) {
                        this.hasUnknownConditionType(true);
                        this.errorOccured(true);
                        return null;
                    }
                    
                    return {
                        conditionElements: convertedElements
                    };
                },

                /**
                 * Opens the delete rule dialog
                 * 
                 * @param {ko.observableArray} ruleArray Array for the rule
                 * @param {object} rule Rule
                 */
                openDeleteRuleDialog: function(ruleArray, rule) {
                    if(this.isLoading())
                    {
                        return;
                    }

                    this.showConfirmDeleteDialog(true);
                    this.targetDeleteArray = ruleArray;
                    this.targetDeleteRule = rule;     
                },

                /**
                 * Deletes the rule for which the rule dialog is open
                 */
                deleteRule: function() {
                    if(!this.targetDeleteArray) {
                        return;
                    }

                    this.targetDeleteArray.remove(this.targetDeleteRule);
                    this.saveConditions();
                    this.closeConfirmDeleteDialog();
                },

                /**
                 * Closes the confirm delete dialog
                 */
                closeConfirmDeleteDialog: function() {
                    this.showConfirmDeleteDialog(false);
                    this.targetDeleteArray = null;
                    this.targetDeleteRule = null;  
                },


                /**
                 * Saves the conditions
                 */
                saveConditions: function() {
                    var saveData = {
                        generateRules: this.generateRules(),
                        preventGenerationRules: this.preventGenerationRules()
                    }

                    this.isLoading(true);
                    this.errorOccured(false);
                    this.hasUnknownConditionType(false);
                    var self = this;
                    jQuery.ajax({
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        url: "/api/ExportApi/SaveDialogFunctionGenerationConditions",
                        type: "POST",
                        data: JSON.stringify(saveData),
                        contentType: "application/json"
                    }).done(function() {
                        self.loadFunctionGenerationConditions();
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },


                /**
                 * Acquires a lock
                 */
                acquireLock: function() {
                    var self = this;
                    GoNorth.LockService.acquireLock("ExportDialogFunctionGenerationCondition", GoNorth.Export.FunctionGenerationCondition.lockId).done(function(isLocked, lockedUsername) { 
                        if(isLocked)
                        {
                            self.isReadonly(true);
                            self.lockedByUser(lockedUsername);
                        }
                    }).fail(function() {
                        self.errorOccured(true);
                        self.isReadonly(true);
                    });
                }
            };

        }(Export.FunctionGenerationCondition = Export.FunctionGenerationCondition || {}));
    }(GoNorth.Export = GoNorth.Export || {}));
}(window.GoNorth = window.GoNorth || {}));