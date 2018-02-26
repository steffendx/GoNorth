using System;
using System.Collections.Generic;
using GoNorth.Data.ImplementationSnapshot;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.FlexFieldDatabase
{
    /// <summary>
    /// Flex Field Object
    /// </summary>
    public class FlexFieldObject : IHasModifiedData, IImplementationComparable, IImplementationSnapshotable, IImplementationStatusTrackingObject
    {
        /// <summary>
        /// Id
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Project Id of the Object
        /// </summary>
        public string ProjectId { get; set; }

        /// <summary>
        /// Id of the template on which the object is based
        /// </summary>
        public string TemplateId { get; set; }

        /// <summary>
        /// Name
        /// </summary>
        [ValueCompareAttribute]
        public string Name { get; set; }

        /// <summary>
        /// Parent Folder Id
        /// </summary>
        public string ParentFolderId { get; set; }

        /// <summary>
        /// Image File
        /// </summary>
        [ValueCompareAttribute(LabelKey = "", TextKey = "ImageFileChanged")]
        public string ImageFile { get; set; }

        /// <summary>
        /// Fields
        /// </summary>
        [ListCompareAttribute(LabelKey = "FlexFieldObjectFieldsChanged")]
        public List<FlexField> Fields { get; set; }

        /// <summary>
        /// Tags
        /// </summary>
        public List<string> Tags { get; set; }


        /// <summary>
        /// true if the object is implemented, else false
        /// </summary>
        public bool IsImplemented { get; set; }

        
        /// <summary>
        /// Last modify Date
        /// </summary>
        public DateTimeOffset ModifiedOn { get; set; }

        /// <summary>
        /// Id of the user who last modified the object
        /// </summary>
        public string ModifiedBy { get; set; }
    }
}