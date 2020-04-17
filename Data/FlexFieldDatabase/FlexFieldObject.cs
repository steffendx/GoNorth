using System;
using System.Collections.Generic;
using System.Linq;
using GoNorth.Data.ImplementationSnapshot;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.FlexFieldDatabase
{
    /// <summary>
    /// Flex Field Object
    /// </summary>
    public class FlexFieldObject : IHasModifiedData, IImplementationComparable, IImplementationSnapshotable, IImplementationStatusTrackingObject, IFlexFieldExportable
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
        /// Thumbnail Image File
        /// </summary>
        public string ThumbnailImageFile { get; set; }

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


        /// <summary>
        /// Clones the flex field object
        /// </summary>
        /// <returns>Cloned</returns>
        protected T CloneObject<T>() where T : FlexFieldObject, new()
        {
            T clonedObject = new T {
                Id = this.Id,
                ProjectId = this.ProjectId,
                TemplateId = this.TemplateId,
                Name = this.Name,
                ParentFolderId = this.ParentFolderId,
                ImageFile = this.ImageFile,
                ThumbnailImageFile = this.ThumbnailImageFile,
                Fields = CloneFields(this.Fields),
                Tags = new List<string>(this.Tags),
                IsImplemented = this.IsImplemented,
                ModifiedOn = this.ModifiedOn,
                ModifiedBy = this.ModifiedBy
            };

            return clonedObject;
        }

        /// <summary>
        /// Clones a list of field
        /// </summary>
        /// <param name="fields">List of fields to clone</param>
        /// <returns>Cloned list of field</returns>
        private List<FlexField> CloneFields(List<FlexField> fields)
        {
            if(fields == null)
            {
                return null;
            }
            
            return fields.Select(f => f.Clone()).Cast<FlexField>().ToList();
        }
    }
}