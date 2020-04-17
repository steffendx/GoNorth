using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Flex Field Data to export to scriban
    /// </summary>
    public class ScribanFlexFieldField
    {
        /// <summary>
        /// Parnet object to which the field belongs
        /// </summary>
        public ScribanFlexFieldObject ParentObject { get; set; }

        /// <summary>
        /// Id of the field
        /// </summary>
        [ScribanExportValueLabel]
        public virtual string Id { get; set; }

        /// <summary>
        /// Name of the field
        /// </summary>
        [ScribanExportValueLabel]
        public virtual string Name { get; set; }

        /// <summary>
        /// Value of the field
        /// </summary>
        [ScribanExportValueLabel]
        public virtual object Value { get; set; }

        /// <summary>
        /// Unescaped Value of the field
        /// </summary>
        [ScribanExportValueLabel]
        public virtual object UnescapedValue { get; set; }
        
        /// <summary>
        /// Type of the field
        /// </summary>
        [ScribanExportValueLabel]
        public virtual string Type { get; set; }

        /// <summary>
        /// True if the field exists, else false
        /// </summary>
        [ScribanExportValueLabel]
        public virtual bool Exists { get; set; }

        /// <summary>
        /// True if the field should not be exported to script as list, but only used by name, else false
        /// </summary>
        public bool DontExportToScript { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="parentObject">Parent scriban object</param>
        public ScribanFlexFieldField(ScribanFlexFieldObject parentObject)
        {
            ParentObject = parentObject;
            Exists = true;
        }
    }
}