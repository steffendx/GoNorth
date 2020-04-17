using System;
using System.Collections.Generic;
using System.Linq;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Base class to export flex field objects to scriban
    /// </summary>
    public abstract class ScribanFlexFieldObject
    {
        /// <summary>
        /// Id of the object
        /// </summary>
        [ScribanExportValueLabel]
        public string Id { get; set; }

        /// <summary>
        /// Name of the object
        /// </summary>
        [ScribanExportValueLabel]
        public string Name { get; set; }

        /// <summary>
        /// Fields of the object
        /// </summary>
        [ScribanKeyCollectionLabel("<VALUE_NAME>", typeof(ScribanFlexFieldField), true)]
        public ScribanFlexFieldDictionary Fields { get; set; }

        /// <summary>
        /// All Fields of the object
        /// </summary>
        [ScribanExportValueLabel]
        public List<ScribanFlexFieldField> AllFields
        {
            get
            {
                return Fields.Values.Where(f => !f.DontExportToScript).ToList();
            }
        }

        /// <summary>
        /// Unused fields of the object
        /// </summary>
        [ScribanExportValueLabel]
        public List<ScribanFlexFieldField> UnusedFields
        {
            get
            {
                return Fields.Values.Where(f => !f.DontExportToScript && !UsedFieldIds.Contains(f.Id)).ToList();
            }
        }

        /// <summary>
        /// Ids of the fields that were used in the template by name
        /// </summary>
        [ScriptMemberIgnore]
        public HashSet<string> UsedFieldIds { get; set; }

        /// <summary>
        /// Export object type
        /// </summary>
        public abstract string ExportObjectType { get; }
    }
}