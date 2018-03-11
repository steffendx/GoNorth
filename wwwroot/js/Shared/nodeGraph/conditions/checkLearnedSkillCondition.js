(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /**
             * Checks if a skill is learned or not
             * @class
             */
            Conditions.CheckLearnedSkillCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Conditions.CheckLearnedSkillCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);
            Conditions.CheckLearnedSkillCondition.prototype = jQuery.extend(Conditions.CheckLearnedSkillCondition.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.CheckLearnedSkillCondition.prototype.getTemplateName = function() {
                return "gn-nodeConditionChooseSkillCheck";
            };

            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            Conditions.CheckLearnedSkillCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Returns the object id for dependency checks
             * 
             * @param {object} existingData Existing condition data
             * @returns {string} Object Id on which the condition depends
             */
            Conditions.CheckLearnedSkillCondition.prototype.getDependsOnObjectId = function(existingData) {
                return this.getObjectId(existingData);
            };

            /**
             * Returns the object id from existing condition data for request caching
             * 
             * @param {object} existingData Existing condition data
             * @returns {string} Object Id for caching
             */
            Conditions.CheckLearnedSkillCondition.prototype.getObjectId = function(existingData) {
                return existingData.selectedSkillId;
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckLearnedSkillCondition.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceSkill;
            };

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckLearnedSkillCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = {
                    selectedSkillId: new ko.observable(""),
                    selectedSkillName: new ko.observable(DefaultNodeShapes.Localization.Conditions.ChooseSkillLabel)
                }

                if(existingData)
                {
                    conditionData.selectedSkillId(existingData.selectedSkillId);
                }

                var self = this;
                conditionData.chooseSkill = function() {
                    GoNorth.DefaultNodeShapes.openSkillSearchDialog().then(function(chosenSkill) {
                        conditionData.selectedSkillId(chosenSkill.id);
                        conditionData.selectedSkillName(chosenSkill.name);
                    });
                };

                // Load field data
                if(existingData && existingData.selectedSkillId)
                {
                    this.loadObjectShared(existingData).then(function(skill) {
                        conditionData.selectedSkillName(skill.name);
                    }).fail(function(xhr) {
                        element.errorOccured(true);
                    });
                }

                return conditionData;
            };

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.CheckLearnedSkillCondition.prototype.serializeConditionData = function(conditionData) {
                var serializedData = {
                    selectedSkillId: conditionData.selectedSkillId()
                };

                return serializedData;
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            Conditions.CheckLearnedSkillCondition.prototype.getConditionDependsOnObject = function(existingData) {
                if(!existingData || !existingData.selectedSkillId)
                {
                    return [];
                }

                return [{
                    objectType: Conditions.RelatedToObjectSkill,
                    objectId: existingData.selectedSkillId
                }];
            }

            /**
             * Loads the skill
             * 
             * @param {object} objectId Optional object id
             * @returns {jQuery.Deferred} Deferred for the async process
             */
            Conditions.CheckLearnedSkillCondition.prototype.loadObject = function(objectId) {
                var def = new jQuery.Deferred();
                
                jQuery.ajax({ 
                    url: "/api/EvneApi/FlexFieldObject?id=" + objectId, 
                    type: "GET"
                }).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Returns the condition string prefix infront of the skill name
             * 
             * @returns {string} Condition String prefix
             */
            Conditions.CheckLearnedSkillCondition.prototype.getConditionStringPrefix = function() {
                return "";
            }

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialized condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckLearnedSkillCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                
                // Check if data is valid
                if(!existingData || !existingData.selectedSkillId)
                {
                    def.resolve(DefaultNodeShapes.Localization.Conditions.MissingInformations);
                    return def.promise();
                }

                // Load data and build string
                var self = this;
                this.loadObjectShared(existingData).then(function(skill) {
                    var conditionText = self.getConditionStringPrefix() + skill.name;                    
                    def.resolve(conditionText);
                }, function() {
                    def.reject();
                });

                return def.promise();
            };

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));