using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Config;
using Microsoft.Extensions.Options;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.Tale
{
    /// <summary>
    /// Tale Mongo DB Access
    /// </summary>
    public class TaleMongoDbAccess : BaseMongoDbAccess, ITaleDbAccess
    {
        /// <summary>
        /// Collection Name of the dialogs
        /// </summary>
        public const string TaleDialogCollectionName = "TaleDialog";

        /// <summary>
        /// Collection Name of the dialogs recyling bin
        /// </summary>
        public const string TaleDialogRecyclingBinCollectionName = "TaleDialogRecyclingBin";

        /// <summary>
        /// Dialog Collection
        /// </summary>
        private IMongoCollection<TaleDialog> _DialogCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public TaleMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _DialogCollection = _Database.GetCollection<TaleDialog>(TaleDialogCollectionName);
        }

        /// <summary>
        /// Creates a new dialog
        /// </summary>
        /// <param name="dialog">Dialog to create</param>
        /// <returns>Created dialog, with filled id</returns>
        public async Task<TaleDialog> CreateDialog(TaleDialog dialog)
        {
            if(string.IsNullOrEmpty(dialog.RelatedObjectId))
            {
                throw new InvalidOperationException("Can not create a new dialog without related object");
            }

            dialog.Id = Guid.NewGuid().ToString();
            await _DialogCollection.InsertOneAsync(dialog);

            return dialog;
        }

        /// <summary>
        /// Gets a dialog by the id
        /// </summary>
        /// <param name="id">Dialog Id</param>
        /// <returns>Dialog</returns>
        public async Task<TaleDialog> GetDialogById(string id)
        {
            TaleDialog dialog = await _DialogCollection.Find(p => p.Id == id).FirstOrDefaultAsync();
            return dialog;
        }

        /// <summary>
        /// Gets a dialog by the related object
        /// </summary>
        /// <param name="relatedObjectId">Related object Id</param>
        /// <returns>Dialog</returns>
        public async Task<TaleDialog> GetDialogByRelatedObjectId(string relatedObjectId)
        {
            TaleDialog dialog = await _DialogCollection.Find(p => p.RelatedObjectId == relatedObjectId).FirstOrDefaultAsync();
            return dialog;
        }

        /// <summary>
        /// Returns all dialogs an object is referenced in (not including the relatedobjectid itself)
        /// </summary>
        /// <param name="objectId">Object Id</param>
        /// <returns>All Dialogs object is referenced in without detail information and the entrie with relatedobjectid = itself</returns>
        public async Task<List<TaleDialog>> GetDialogsObjectIsReferenced(string objectId)
        {
            List<TaleDialog> dialogs = await _DialogCollection.AsQueryable().Where(t => t.Action.Any(a => a.ActionRelatedToObjectId == objectId || (a.ActionRelatedToAdditionalObjects != null && a.ActionRelatedToAdditionalObjects.Any(e => e.ObjectId == objectId))) || t.Condition.Any(c => c.Conditions.Any(ce => ce.DependsOnObjects.Any(o => o.ObjectId == objectId))) || t.Choice.Any(c => c.Choices.Any(co => co.Condition != null && co.Condition.DependsOnObjects.Any(o => o.ObjectId == objectId)))).Select(t => new TaleDialog() {
                Id = t.Id,
                RelatedObjectId = t.RelatedObjectId
            }).ToListAsync();
            return dialogs;
        }

        /// <summary>
        /// Returns all Dialogs that are not yet implemented
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Dialogs</returns>
        public async Task<List<TaleDialog>> GetNotImplementedDialogs(string projectId, int start, int pageSize)
        {
            List<TaleDialog> dialogs = await _DialogCollection.AsQueryable().Where(t => t.ProjectId == projectId && !t.IsImplemented).Skip(start).Take(pageSize).Select(t => new TaleDialog() {
                Id = t.Id,
                RelatedObjectId = t.RelatedObjectId
            }).ToListAsync();
            return dialogs;
        }

        /// <summary>
        /// Returns the count of all Dialogs that are not yet implemented
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Dialogs Count</returns>
        public async Task<int> GetNotImplementedDialogsCount(string projectId)
        {
            int count = await _DialogCollection.AsQueryable().Where(t => t.ProjectId == projectId && !t.IsImplemented).CountAsync();
            return count;
        }

        /// <summary>
        /// Updates a dialog
        /// </summary>
        /// <param name="dialog">Dialog</param>
        /// <returns>Task</returns>
        public async Task UpdateDialog(TaleDialog dialog)
        {
            ReplaceOneResult result = await _DialogCollection.ReplaceOneAsync(p => p.Id == dialog.Id, dialog);
        }

        /// <summary>
        /// Deletes a dialog
        /// </summary>
        /// <param name="dialog">Dialog</param>
        /// <returns>Task</returns>
        public async Task DeleteDialog(TaleDialog dialog)
        {
            TaleDialog existingDialog = await GetDialogById(dialog.Id);
            if(existingDialog == null)
            {
                throw new NullReferenceException();
            }

            IMongoCollection<TaleDialog> recyclingBin = _Database.GetCollection<TaleDialog>(TaleDialogRecyclingBinCollectionName);
            await recyclingBin.InsertOneAsync(existingDialog);

            DeleteResult result = await _DialogCollection.DeleteOneAsync(p => p.Id == dialog.Id);
        }
        

        /// <summary>
        /// Returns all dialogs that were last modified by a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>List of Dialogs</returns>
        public async Task<List<TaleDialog>> GetDialogsByModifiedUser(string userId)
        {
            return await _DialogCollection.AsQueryable().Where(t => t.ModifiedBy == userId).ToListAsync();
        }
    }
}