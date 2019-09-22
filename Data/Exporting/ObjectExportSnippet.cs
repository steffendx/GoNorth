using System;
using GoNorth.Data.NodeGraph;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Object export snippet
    /// </summary>
    public class ObjectExportSnippet : IHasModifiedData, IImplementationListComparable
    {
        /// <summary>
        /// Id
        /// </summary>
        public string Id { get; set; }
        
        /// <summary>
        /// Id of the project
        /// </summary>
        public string ProjectId { get; set; }

        /// <summary>
        /// Id of the object to which the snippet belongs
        /// </summary>
        public string ObjectId { get; set; }

        /// <summary>
        /// Name of the export snippets
        /// </summary>
        public string SnippetName { get; set; }

        /// <summary>
        /// Script Type
        /// </summary>
        [ValueCompareAttribute]
        public int ScriptType { get; set; }

        /// <summary>
        /// Script name
        /// </summary>
        [ValueCompareAttribute]
        public string ScriptName { get; set; }
        
        /// <summary>
        /// Script node graph
        /// </summary>
        [ValueCompareAttribute]
        public NodeGraphSnippet ScriptNodeGraph { get; set; }

        /// <summary>
        /// Script name
        /// </summary>
        [ValueCompareAttribute(LabelKey = "", TextKey = "ScriptCodeChanged")]
        public string ScriptCode { get; set; }


        /// <summary>
        /// Last modify Date
        /// </summary>
        public DateTimeOffset ModifiedOn { get; set; }

        /// <summary>
        /// Id of the user who last modified the object
        /// </summary>
        public string ModifiedBy { get; set; }


        /// <summary>
        /// Id which is used in a list compare to detect deleted or new objects
        /// </summary>
        public string ListComparableId { get { return SnippetName; } }

        /// <summary>
        /// Value which is used in a list compare for display
        /// </summary>
        public CompareDifferenceValue ListComparableValue { get { return new CompareDifferenceValue(SnippetName, CompareDifferenceValue.ValueResolveType.None); } }      
    }
}