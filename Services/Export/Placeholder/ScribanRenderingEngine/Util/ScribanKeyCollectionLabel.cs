using System;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util
{
    /// <summary>
    /// Attribute to provide a label for scriban export 
    /// </summary>
    [AttributeUsage(AttributeTargets.Property)]
    public class ScribanKeyCollectionLabel : Attribute
    {
        /// <summary>
        /// Language Key used for the description
        /// </summary>
        public string PrefixKey { get; set; }

        /// <summary>
        /// Value Type
        /// </summary>
        public Type ValueType { get; set; }

        /// <summary>
        /// true if the parent prefix should be used, else false
        /// </summary>
        public bool UseParentPrefix { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="prefixKey">Key of the prefix to use for a placeholders of the key for the values</param>
        /// <param name="valueType">Type of the values</param>
        /// <param name="useParentPrefix">true if the parent prefix should be used, else false</param>
        public ScribanKeyCollectionLabel(string prefixKey, Type valueType, bool useParentPrefix)
        {
            PrefixKey = prefixKey;
            ValueType = valueType;
            UseParentPrefix = useParentPrefix;
        }
    }
}