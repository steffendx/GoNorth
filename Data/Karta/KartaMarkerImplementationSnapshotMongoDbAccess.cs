using System;
using System.Threading.Tasks;
using GoNorth.Config;
using GoNorth.Data.Karta.Marker;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.Karta
{
    /// <summary>
    /// Object implementation snapshot
    /// </summary>
    public class KartaMarkerImplementationSnapshotMongoDbAccess : BaseMongoDbAccess, IKartaMarkerImplementationSnapshotDbAccess
    {
        /// <summary>
        /// Collection Name of the Npc Marker Snapshot Collection
        /// </summary>
        public const string NpcMarkerCollectionName = "KartaNpcMarkerImplementationSnapshot";

        /// <summary>
        /// Collection Name of the Item Marker Snapshot Collection
        /// </summary>
        public const string ItemMarkerCollectionName = "KartaItemMarkerImplementationSnapshot";

        /// <summary>
        /// Collection Name of the Map Change Marker Snapshot Collection
        /// </summary>
        public const string MapChangeMarkerCollectionName = "KartaMapChangeMarkerImplementationSnapshot";

        /// <summary>
        /// Collection Name of the Quest Marker Snapshot Collection
        /// </summary>
        public const string QuestMarkerCollectionName = "KartaQuestMarkerImplementationSnapshot";
        
        /// <summary>
        /// Collection Name of the Note Marker Snapshot Collection
        /// </summary>
        public const string NoteMarkerCollectionName = "KartaNoteMarkerImplementationSnapshot";


        /// <summary>
        /// Npc Marker Snapshot Collection
        /// </summary>
        protected IMongoCollection<NpcMapMarker> _NpcMarkerSnapshotCollection;

        /// <summary>
        /// Item Marker Snapshot Collection
        /// </summary>
        protected IMongoCollection<ItemMapMarker> _ItemMarkerSnapshotCollection;
        
        /// <summary>
        /// Map Change Marker Snapshot Collection
        /// </summary>
        protected IMongoCollection<MapChangeMapMarker> _MapChangeMarkerSnapshotCollection;

        /// <summary>
        /// Quest Marker Snapshot Collection
        /// </summary>
        protected IMongoCollection<QuestMapMarker> _QuestMarkerSnapshotCollection;
        
        /// <summary>
        /// Note Marker Snapshot Collection
        /// </summary>
        protected IMongoCollection<NoteMapMarker> _NoteMarkerSnapshotCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public KartaMarkerImplementationSnapshotMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _NpcMarkerSnapshotCollection = _Database.GetCollection<NpcMapMarker>(NpcMarkerCollectionName);
            _ItemMarkerSnapshotCollection = _Database.GetCollection<ItemMapMarker>(ItemMarkerCollectionName);
            _MapChangeMarkerSnapshotCollection = _Database.GetCollection<MapChangeMapMarker>(MapChangeMarkerCollectionName);
            _QuestMarkerSnapshotCollection = _Database.GetCollection<QuestMapMarker>(QuestMarkerCollectionName);
            _NoteMarkerSnapshotCollection = _Database.GetCollection<NoteMapMarker>(NoteMarkerCollectionName);
        }

        /// <summary>
        /// Returns an implementation snapshot of a marker
        /// </summary>
        /// <param name="collection">Collection to query</param>
        /// <param name="id">Id of the marker</param>
        /// <returns>Implementation snapshot</returns>
        private async Task<T> GetMarkerSnapshotById<T>(IMongoCollection<T> collection, string id) where T : MapMarker
        {
            T snapshot = await collection.Find(n => n.Id == id).FirstOrDefaultAsync();
            return snapshot;
        }

        /// <summary>
        /// Returns an implementation snapshot of a Npc Marker
        /// </summary>
        /// <param name="id">Id of the marker</param>
        /// <returns>Marker snapshot</returns>
        public async Task<NpcMapMarker> GetNpcMarkerSnapshotById(string id)
        {
            return await GetMarkerSnapshotById(_NpcMarkerSnapshotCollection, id);
        }

        /// <summary>
        /// Returns an implementation snapshot of a Item Marker
        /// </summary>
        /// <param name="id">Id of the marker</param>
        /// <returns>Marker snapshot</returns>
        public async Task<ItemMapMarker> GetItemMarkerSnapshotById(string id)
        {
            return await GetMarkerSnapshotById(_ItemMarkerSnapshotCollection, id);
        }

        /// <summary>
        /// Returns an implementation snapshot of a Map Change Marker
        /// </summary>
        /// <param name="id">Id of the marker</param>
        /// <returns>Marker snapshot</returns>
        public async Task<MapChangeMapMarker> GetMapChangeMarkerSnapshotById(string id)
        {
            return await GetMarkerSnapshotById(_MapChangeMarkerSnapshotCollection, id);
        }

        /// <summary>
        /// Returns an implementation snapshot of a Quest Marker
        /// </summary>
        /// <param name="id">Id of the marker</param>
        /// <returns>Marker snapshot</returns>
        public async Task<QuestMapMarker> GetQuestMarkerSnapshotById(string id)
        {
            return await GetMarkerSnapshotById(_QuestMarkerSnapshotCollection, id);
        }
        
        /// <summary>
        /// Returns an implementation snapshot of a Note Marker
        /// </summary>
        /// <param name="id">Id of the marker</param>
        /// <returns>Marker snapshot</returns>
        public async Task<NoteMapMarker> GetNoteMarkerSnapshotById(string id)
        {
            return await GetMarkerSnapshotById(_NoteMarkerSnapshotCollection, id);
        }


        /// <summary>
        /// Saves a marker snapshot
        /// </summary>
        /// <param name="collection">Collection to save to</param>
        /// <param name="snapshot">Snapshot to save</param>
        /// <returns>Task</returns>
        private async Task SaveMarkerSnapshot<T>(IMongoCollection<T> collection, T snapshot) where T : MapMarker
        {
            if(string.IsNullOrEmpty(snapshot.Id))
            {
                throw new ArgumentNullException();
            }

            T existingSnapshot = await GetMarkerSnapshotById(collection, snapshot.Id);
            if(existingSnapshot == null)
            {
                await collection.InsertOneAsync(snapshot);
            }
            else
            {
                await collection.ReplaceOneAsync(s => s.Id == snapshot.Id, snapshot);
            }
        }

        /// <summary>
        /// Saves a npc marker snapshot
        /// </summary>
        /// <param name="snapshot">Snapshot to save</param>
        /// <returns>Task</returns>
        public async Task SaveNpcMarkerSnapshot(NpcMapMarker snapshot)
        {
            await SaveMarkerSnapshot(_NpcMarkerSnapshotCollection, snapshot);
        }

        /// <summary>
        /// Saves a item marker snapshot
        /// </summary>
        /// <param name="snapshot">Snapshot to save</param>
        /// <returns>Task</returns>
        public async Task SaveItemMarkerSnapshot(ItemMapMarker snapshot)
        {
            await SaveMarkerSnapshot(_ItemMarkerSnapshotCollection, snapshot);
        }
        
        /// <summary>
        /// Saves a map change marker snapshot
        /// </summary>
        /// <param name="snapshot">Snapshot to save</param>
        /// <returns>Task</returns>
        public async Task SaveMapChangeMarkerSnapshot(MapChangeMapMarker snapshot)
        {
            await SaveMarkerSnapshot(_MapChangeMarkerSnapshotCollection, snapshot);
        }
                
        /// <summary>
        /// Saves a quest marker snapshot
        /// </summary>
        /// <param name="snapshot">Snapshot to save</param>
        /// <returns>Task</returns>
        public async Task SaveQuestMarkerSnapshot(QuestMapMarker snapshot)
        {
            await SaveMarkerSnapshot(_QuestMarkerSnapshotCollection, snapshot);
        }

        /// <summary>
        /// Saves a note marker snapshot
        /// </summary>
        /// <param name="snapshot">Snapshot to save</param>
        /// <returns>Task</returns>
        public async Task SaveNoteMarkerSnapshot(NoteMapMarker snapshot)
        {
            await SaveMarkerSnapshot(_NoteMarkerSnapshotCollection, snapshot);
        }


        /// <summary>
        /// Deletes a snapshot
        /// </summary>
        /// <param name="collection">Collection to delete from</param>
        /// <param name="id">Id of the snapshot</param>
        /// <returns>Task</returns>
        private async Task DeleteMarkerSnapshot<T>(IMongoCollection<T> collection, string id) where T : MapMarker
        {
            DeleteResult result = await collection.DeleteOneAsync(n => n.Id == id);
        }

        /// <summary>
        /// Deletes a npc marker snapshot
        /// </summary>
        /// <param name="id">Id of the snapshot</param>
        /// <returns>Task</returns>
        public async Task DeleteNpcMarkerSnapshot(string id)
        {
            await DeleteMarkerSnapshot(_NpcMarkerSnapshotCollection, id);
        }
        
        /// <summary>
        /// Deletes a item marker snapshot
        /// </summary>
        /// <param name="id">Id of the snapshot</param>
        /// <returns>Task</returns>
        public async Task DeleteItemMarkerSnapshot(string id)
        {
            await DeleteMarkerSnapshot(_ItemMarkerSnapshotCollection, id);
        }

        /// <summary>
        /// Deletes a map change marker snapshot
        /// </summary>
        /// <param name="id">Id of the snapshot</param>
        /// <returns>Task</returns>
        public async Task DeleteMapChangeMarkerSnapshot(string id)
        {
            await DeleteMarkerSnapshot(_MapChangeMarkerSnapshotCollection, id);
        }        

        /// <summary>
        /// Deletes a quest marker
        /// </summary>
        /// <param name="id">Id of the snapshot</param>
        /// <returns>Task</returns>
        public async Task DeleteQuestMarkerSnapshot(string id)
        {
            await DeleteMarkerSnapshot(_QuestMarkerSnapshotCollection, id);
        }
        
        /// <summary>
        /// Deletes a note marker
        /// </summary>
        /// <param name="id">Id of the snapshot</param>
        /// <returns>Task</returns>
        public async Task DeleteNoteMarkerSnapshot(string id)
        {
            await DeleteMarkerSnapshot(_NoteMarkerSnapshotCollection, id);
        }
    }
}