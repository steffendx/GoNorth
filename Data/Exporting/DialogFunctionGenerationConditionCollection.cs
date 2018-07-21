using System;
using System.Collections.Generic;

namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Dialog Function Generation Condition Collection
    /// </summary>
    public class DialogFunctionGenerationConditionCollection : IHasModifiedData
    {
        /// <summary>
        /// Id
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Project Id
        /// </summary>
        public string ProjectId { get; set; }

        /// <summary>
        /// Generation Rules
        /// </summary>
        public List<DialogFunctionGenerationCondition> GenerateRules { get; set; }

        /// <summary>
        /// Prevent Generation Rules
        /// </summary>
        public List<DialogFunctionGenerationCondition> PreventGenerationRules { get; set; }

        
        /// <summary>
        /// Last modify Date
        /// </summary>
        public DateTimeOffset ModifiedOn { get; set; }

        /// <summary>
        /// Id of the user who last modified the template
        /// </summary>
        public string ModifiedBy { get; set; }
    };
}