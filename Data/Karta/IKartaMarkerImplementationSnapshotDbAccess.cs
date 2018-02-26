using System.IO;
using System.Threading.Tasks;
using GoNorth.Data.ImplementationSnapshot;
using GoNorth.Data.Karta.Marker;

namespace GoNorth.Data.Karta
{
    /// <summary>
    /// Interface for Karta Marker Implementation Snapshot Db Access
    /// </summary>
    public interface IKartaMarkerImplementationSnapshotDbAccess
    {
        /// <summary>
        /// Returns an implementation snapshot of a Npc Marker
        /// </summary>
        /// <param name="id">Id of the marker</param>
        /// <returns>Marker snapshot</returns>
        Task<NpcMapMarker> GetNpcMarkerSnapshotById(string id);

        /// <summary>
        /// Returns an implementation snapshot of a Item Marker
        /// </summary>
        /// <param name="id">Id of the marker</param>
        /// <returns>Marker snapshot</returns>
        Task<ItemMapMarker> GetItemMarkerSnapshotById(string id);

        /// <summary>
        /// Returns an implementation snapshot of a Map Change Marker
        /// </summary>
        /// <param name="id">Id of the marker</param>
        /// <returns>Marker snapshot</returns>
        Task<MapChangeMapMarker> GetMapChangeMarkerSnapshotById(string id);

        /// <summary>
        /// Returns an implementation snapshot of a Quest Marker
        /// </summary>
        /// <param name="id">Id of the marker</param>
        /// <returns>Marker snapshot</returns>
        Task<QuestMapMarker> GetQuestMarkerSnapshotById(string id);


        /// <summary>
        /// Saves a npc marker snapshot
        /// </summary>
        /// <param name="snapshot">Snapshot to save</param>
        /// <returns>Task</returns>
        Task SaveNpcMarkerSnapshot(NpcMapMarker snapshot);
        
        /// <summary>
        /// Saves a item marker snapshot
        /// </summary>
        /// <param name="snapshot">Snapshot to save</param>
        /// <returns>Task</returns>
        Task SaveItemMarkerSnapshot(ItemMapMarker snapshot);

        /// <summary>
        /// Saves a map change marker snapshot
        /// </summary>
        /// <param name="snapshot">Snapshot to save</param>
        /// <returns>Task</returns>
        Task SaveMapChangeMarkerSnapshot(MapChangeMapMarker snapshot);
                
        /// <summary>
        /// Saves a quest marker snapshot
        /// </summary>
        /// <param name="snapshot">Snapshot to save</param>
        /// <returns>Task</returns>
        Task SaveQuestMarkerSnapshot(QuestMapMarker snapshot);


        /// <summary>
        /// Deletes a npc marker snapshot
        /// </summary>
        /// <param name="id">Id of the snapshot</param>
        /// <returns>Task</returns>
        Task DeleteNpcMarkerSnapshot(string id); 
        
        /// <summary>
        /// Deletes a item marker snapshot
        /// </summary>
        /// <param name="id">Id of the snapshot</param>
        /// <returns>Task</returns>
        Task DeleteItemMarkerSnapshot(string id);

        /// <summary>
        /// Deletes a map change marker snapshot
        /// </summary>
        /// <param name="id">Id of the snapshot</param>
        /// <returns>Task</returns>
        Task DeleteMapChangeMarkerSnapshot(string id);         

        /// <summary>
        /// Deletes a quest marker
        /// </summary>
        /// <param name="id">Id of the snapshot</param>
        /// <returns>Task</returns>
        Task DeleteQuestMarkerSnapshot(string id); 
    }
}