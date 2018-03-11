using System.Collections.Generic;

namespace GoNorth.Services.ImplementationStatusCompare
{
    /// <summary>
    /// Compare Difference Value
    /// </summary>
    public class CompareDifferenceValue
    {
        /// <summary>
        /// Type for how a values must be resolved to the final output
        /// </summary>
        public enum ValueResolveType
        {
            /// <summary>
            /// No resolve required
            /// </summary>
            None,

            /// <summary>
            /// Value is an item id and must be resolved
            /// </summary>
            ResolveItemName,

            /// <summary>
            /// Value is a skill id and must be resolved
            /// </summary>
            ResolveSkillName,

            /// <summary>
            /// Value is a language key and must be resolved
            /// </summary>
            LanguageKey
        };

        /// <summary>
        /// Name of the result
        /// </summary>
        public string Value { get; set; }

        /// <summary>
        /// Resolve Type
        /// </summary>
        public ValueResolveType ResolveType { get; set; }


        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="value">Value</param>
        /// <param name="resolveType">Resolve Type</param>
        public CompareDifferenceValue(string value, ValueResolveType resolveType)
        {
            Value = value;
            ResolveType = resolveType;
        }
    };
}