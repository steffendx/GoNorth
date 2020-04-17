using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Config;
using GoNorth.Data.Aika;
using GoNorth.Data.Evne;
using GoNorth.Data.Exporting;
using GoNorth.Data.Karta;
using GoNorth.Data.Kirja;
using GoNorth.Data.Kortisto;
using GoNorth.Data.LockService;
using GoNorth.Data.Project;
using GoNorth.Data.ProjectConfig;
using GoNorth.Data.Role;
using GoNorth.Data.Styr;
using GoNorth.Data.Tale;
using GoNorth.Data.TaskManagement;
using GoNorth.Data.Timeline;
using GoNorth.Data.User;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;

namespace GoNorth.Data
{
    /// <summary>
    /// Mongo Db Setup
    /// </summary>
    public class MongoDbSetup : BaseMongoDbAccess, IDbSetup
    {
        /// <summary>
        /// Name of the legacy collection for tale config
        /// </summary>
        private const string LegacyCollection_TaleConfig = "TaleConfig";


        /// <summary>
        /// Timeline Db Access
        /// </summary>
        private readonly ITimelineDbAccess _timelineDbAccess;
        
        /// <summary>
        /// Lock Db Access
        /// </summary>
        private readonly ILockServiceDbAccess _lockServiceDbAccess;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="timelineDbAccess">Timeline Db Access</param>
        /// <param name="lockServiceDbAccess">Lock Service Db Access</param>
        /// <param name="configuration">Configuration</param>
        public MongoDbSetup(ITimelineDbAccess timelineDbAccess, ILockServiceDbAccess lockServiceDbAccess, IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _timelineDbAccess = timelineDbAccess;
            _lockServiceDbAccess = lockServiceDbAccess;
        }

        /// <summary>
        /// Sets the database up
        /// </summary>
        /// <returns>Task</returns>
        public async Task SetupDatabaseAsync()
        {
            List<string> collectionNames = await GetExistingCollections();
            await CreateCollectionIfNotExists(UserMongoDbAccess.UserCollectionName, collectionNames);
            await CreateCollectionIfNotExists(UserPreferencesMongoDbAccess.UserPreferencesCollectionName, collectionNames);

            await CreateCollectionIfNotExists(TimelineMongoDbAccess.TimelineCollectionName, collectionNames);

            await CreateCollectionIfNotExists(RoleMongoDbAccess.RoleCollectionName, collectionNames);

            await CreateCollectionIfNotExists(ProjectMongoDbAccess.ProjectCollectionName, collectionNames);
            
            await CreateCollectionIfNotExists(ProjectConfigMongoDbAccess.JsonConfigCollectionName, collectionNames);
            await CreateCollectionIfNotExists(ProjectConfigMongoDbAccess.MiscConfigCollectionName, collectionNames);

            await CreateCollectionIfNotExists(KortistoFolderMongoDbAccess.KortistoFolderCollectionName, collectionNames);
            await CreateCollectionIfNotExists(KortistoNpcTemplateMongoDbAccess.KortistoNpcTemplateCollectionName, collectionNames);
            await CreateCollectionIfNotExists(KortistoNpcTemplateMongoDbAccess.KortistoNpcTemplateRecyclingBinCollectionName, collectionNames);
            await CreateCollectionIfNotExists(KortistoNpcMongoDbAccess.KortistoNpcCollectionName, collectionNames);
            await CreateCollectionIfNotExists(KortistoNpcMongoDbAccess.KortistoNpcRecyclingBinCollectionName, collectionNames);
            await CreateCollectionIfNotExists(KortistoNpcTagMongoDbAccess.KortistoNpcTagCollectionName, collectionNames);
            await CreateCollectionIfNotExists(KortistoNpcImplementationSnapshotMongoDbAccess.KortistoNpcImplementationSnapshotCollectionName, collectionNames);

            await CreateCollectionIfNotExists(StyrFolderMongoDbAccess.StyrFolderCollectionName, collectionNames);
            await CreateCollectionIfNotExists(StyrItemTemplateMongoDbAccess.StyrItemTemplateCollectionName, collectionNames);
            await CreateCollectionIfNotExists(StyrItemTemplateMongoDbAccess.StyrItemTemplateRecyclingBinCollectionName, collectionNames);
            await CreateCollectionIfNotExists(StyrItemMongoDbAccess.StyrItemCollectionName, collectionNames);
            await CreateCollectionIfNotExists(StyrItemMongoDbAccess.StyrItemRecyclingBinCollectionName, collectionNames);
            await CreateCollectionIfNotExists(StyrItemTagMongoDbAccess.StyrItemTagCollectionName, collectionNames);
            await CreateCollectionIfNotExists(StyrItemImplementationSnapshotMongoDbAccess.StyrItemImplementationSnapshotCollectionName, collectionNames);

            await CreateCollectionIfNotExists(EvneFolderMongoDbAccess.EvneFolderCollectionName, collectionNames);
            await CreateCollectionIfNotExists(EvneSkillTemplateMongoDbAccess.EvneSkillTemplateCollectionName, collectionNames);
            await CreateCollectionIfNotExists(EvneSkillTemplateMongoDbAccess.EvneSkillTemplateRecyclingBinCollectionName, collectionNames);
            await CreateCollectionIfNotExists(EvneSkillMongoDbAccess.EvneSkillCollectionName, collectionNames);
            await CreateCollectionIfNotExists(EvneSkillMongoDbAccess.EvneSkillRecyclingBinCollectionName, collectionNames);
            await CreateCollectionIfNotExists(EvneSkillTagMongoDbAccess.EvneSkillTagCollectionName, collectionNames);
            await CreateCollectionIfNotExists(EvneSkillImplementationSnapshotMongoDbAccess.EvneSkillImplementationSnapshotCollectionName, collectionNames);

            await CreateCollectionIfNotExists(KirjaPageMongoDbAccess.KirjaPageCollectionName, collectionNames);
            await CreateCollectionIfNotExists(KirjaPageMongoDbAccess.KirjaPageRecyclingBinCollectionName, collectionNames);
            await CreateCollectionIfNotExists(KirjaPageVersionMongoDbAccess.KirjaPageVersionCollectionName, collectionNames);

            await CreateCollectionIfNotExists(KartaMapMongoDbAccess.KartaMapCollectionName, collectionNames);
            await CreateCollectionIfNotExists(KartaMapMongoDbAccess.KartaMapRecyclingBinCollectionName, collectionNames);
            await CreateCollectionIfNotExists(KartaMarkerImplementationSnapshotMongoDbAccess.NpcMarkerCollectionName, collectionNames);
            await CreateCollectionIfNotExists(KartaMarkerImplementationSnapshotMongoDbAccess.ItemMarkerCollectionName, collectionNames);
            await CreateCollectionIfNotExists(KartaMarkerImplementationSnapshotMongoDbAccess.MapChangeMarkerCollectionName, collectionNames);
            await CreateCollectionIfNotExists(KartaMarkerImplementationSnapshotMongoDbAccess.QuestMarkerCollectionName, collectionNames);
            await CreateCollectionIfNotExists(KartaMarkerImplementationSnapshotMongoDbAccess.NoteMarkerCollectionName, collectionNames);

            await CreateCollectionIfNotExists(TaleMongoDbAccess.TaleDialogCollectionName, collectionNames);
            await CreateCollectionIfNotExists(TaleMongoDbAccess.TaleDialogRecyclingBinCollectionName, collectionNames);
            await CreateCollectionIfNotExists(TaleDialogImplementationSnapshotMongoDbAccess.TaleDialogImplementationSnapshotCollectionName, collectionNames);

            await CreateCollectionIfNotExists(AikaChapterOverviewMongoDbAccess.AikaChapterOverviewCollectionName, collectionNames);
            await CreateCollectionIfNotExists(AikaChapterOverviewMongoDbAccess.AikaChapterOverviewRecyclingBinCollectionName, collectionNames);
            await CreateCollectionIfNotExists(AikaQuestMongoDbAccess.AikaQuestCollectionName, collectionNames);
            await CreateCollectionIfNotExists(AikaQuestMongoDbAccess.AikaQuestRecyclingBinCollectionName, collectionNames);
            await CreateCollectionIfNotExists(AikaQuestImplementationSnapshotMongoDbAccess.AikaQuestImplementationSnapshotCollectionName, collectionNames);
            
            await CreateCollectionIfNotExists(ExportTemplateMongoDbAccess.ExportTemplateCollectionName, collectionNames);
            await CreateCollectionIfNotExists(ExportTemplateMongoDbAccess.ExportTemplateRecyclingBinCollectionName, collectionNames);
            await CreateCollectionIfNotExists(IncludeExportTemplateMongoDbAccess.IncludeExportTemplateCollectionName, collectionNames);
            await CreateCollectionIfNotExists(IncludeExportTemplateMongoDbAccess.IncludeExportTemplateRecyclingBinCollectionName, collectionNames);
            await CreateCollectionIfNotExists(ExportFunctionIdMongoDbAccess.ExportFunctionIdCounterCollectionName, collectionNames);
            await CreateCollectionIfNotExists(ExportFunctionIdMongoDbAccess.ExportFunctionIdCollectionName, collectionNames);
            await CreateCollectionIfNotExists(LanguageKeyMongoDbAccess.LanguageKeyIdCounterCollectionName, collectionNames);
            await CreateCollectionIfNotExists(LanguageKeyMongoDbAccess.LanguageKeyCollectionName, collectionNames);
            await CreateCollectionIfNotExists(ObjectExportSnippetMongoDbAccess.ObjectExportSnippetCollectionName, collectionNames);
            await CreateCollectionIfNotExists(ObjectExportSnippetSnapshotMongoDbAccess.ObjectExportSnippetSnapshotCollectionName, collectionNames);

            await CreateCollectionIfNotExists(TaskBoardMongoDbAccess.TaskBoardCollectionName, collectionNames);
            await CreateCollectionIfNotExists(TaskTypeMongoDbAccess.TaskTypeCollectionName, collectionNames);
            await CreateCollectionIfNotExists(TaskGroupTypeMongoDbAccess.TaskGroupTypeCollectionName, collectionNames);
            await CreateCollectionIfNotExists(TaskBoardCategoryMongoDbAccess.TaskBoardCategoryCollectionName, collectionNames);
            await CreateCollectionIfNotExists(TaskNumberMongoDbAccess.TaskNumberCollectionName, collectionNames);
            await CreateCollectionIfNotExists(UserTaskBoardHistoryMongoDbAccess.TaskBoardUserHistoryCollectionName, collectionNames);

            await CreateCollectionIfNotExists(LockServiceMongoDbAccess.LockCollectionName, collectionNames);


            await CreateIndices();
        }

        /// <summary>
        /// Returns all collections that exist
        /// </summary>
        /// <returns>All collections that exist</returns>
        private async Task<List<string>> GetExistingCollections()
        {
            List<string> collectionNames = new List<string>();
            IAsyncCursor<BsonDocument> collectionDocumentsCursor = await _Database.ListCollectionsAsync();
            List<BsonDocument> collectionDocuments = await collectionDocumentsCursor.ToListAsync();
            foreach (BsonDocument curCollection in collectionDocuments)
            {
                collectionNames.Add(curCollection["name"].ToString());
            }

            return collectionNames;
        }

        /// <summary>
        /// Creates a collection if it does not exist
        /// </summary>
        /// <param name="collectionName">Collection Name</param>
        /// <param name="collectionNames">All existing collection names</param>
        /// <returns>Task</returns>
        private async Task CreateCollectionIfNotExists(string collectionName, List<string> collectionNames)
        {
            if(collectionNames.Contains(collectionName))
            {
                return;
            }

            await _Database.CreateCollectionAsync(collectionName);
        }


        /// <summary>
        /// Checks if there needs to be some migrations in the database (table/collection renames,...)
        /// </summary>
        /// <returns>Task</returns>
        public async Task CheckForNeededMigrations()
        {
            await CreateIndices();
            List<string> collectionNames = await GetExistingCollections();
            await RenameLegacyCollections(collectionNames);
        }

        /// <summary>
        /// Creates the database indices
        /// </summary>
        /// <returns>Task</returns>
        private async Task CreateIndices()
        {
            await _timelineDbAccess.CreateTimelineIndices();
            await _lockServiceDbAccess.CreateLockIndices();
        }

        /// <summary>
        /// Renames legacy collections
        /// </summary>
        /// <param name="collectionNames">Existing collection names</param>
        /// <returns>Task</returns>
        private async Task RenameLegacyCollections(List<string> collectionNames)
        {
            if(collectionNames.Contains(LegacyCollection_TaleConfig) && !collectionNames.Contains(ProjectConfigMongoDbAccess.JsonConfigCollectionName))
            {
                await _Database.RenameCollectionAsync(LegacyCollection_TaleConfig, ProjectConfigMongoDbAccess.JsonConfigCollectionName);
            }
        }
    }
}