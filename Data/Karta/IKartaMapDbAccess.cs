using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Karta.Marker;

namespace GoNorth.Data.Karta
{
    /// <summary>
    /// Interface for Database Access for Karta Maps
    /// </summary>
    public interface IKartaMapDbAccess
    {
        /// <summary>
        /// Creates a Karta map
        /// </summary>
        /// <param name="map">Map to create</param>
        /// <returns>Created map, with filled id</returns>
        Task<KartaMap> CreateMap(KartaMap map);

        /// <summary>
        /// Renames a map
        /// </summary>
        /// <param name="map">Map with updated data</param>
        /// <returns>Task</returns>
        Task RenameMap(KartaMap map);

        /// <summary>
        /// Updates all fields of a map
        /// </summary>
        /// <param name="map">Map with updated data</param>
        /// <returns>Task</returns>
        Task UpdateMap(KartaMap map);

        /// <summary>
        /// Returns a map by its id
        /// </summary>
        /// <param name="id">Id</param>
        /// <returns>Map</returns>
        Task<KartaMap> GetMapById(string id);

        /// <summary>
        /// Returns all markers that are not yet implemented
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Markers</returns>
        Task<List<MarkerImplementationQueryResultObject>> GetNotImplementedMarkers(string projectId, int start, int pageSize);

        /// <summary>
        /// Returns the count of all markers that are not yet implemented
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Markers Count</returns>
        Task<int> GetNotImplementedMarkersCount(string projectId);

        /// <summary>
        /// Returns all maps for a project with full detail
        /// </summary>
        /// <param name="projectId">Project Id for which to request the maps</param>
        /// <returns>All Maps for a project with full information</returns>
        Task<List<KartaMap>> GetAllProjectMapsWithFullDetail(string projectId);

        /// <summary>
        /// Returns all maps
        /// </summary>
        /// <returns>All Maps</returns>
        Task<List<KartaMap>> GetAllMaps();

        /// <summary>
        /// Returns all maps for a project without detail information
        /// </summary>
        /// <param name="projectId">Project Id for which to request the maps</param>
        /// <returns>All Maps for a project without detail information</returns>
        Task<List<KartaMap>> GetAllProjectMaps(string projectId);

        /// <summary>
        /// Returns all maps for an npc without detail information
        /// </summary>
        /// <param name="npcId">Npc Id for which to request the maps</param>
        /// <returns>Marker Query Result</returns>
        Task<List<KartaMapMarkerQueryResult>> GetAllMapsNpcIsMarkedIn(string npcId);

        /// <summary>
        /// Returns all maps for an item without detail information
        /// </summary>
        /// <param name="itemId">Item Id for which to request the maps</param>
        /// <returns>Marker Query Result</returns>
        Task<List<KartaMapMarkerQueryResult>> GetAllMapsItemIsMarkedIn(string itemId);

        /// <summary>
        /// Returns all maps for a kirja page without detail information
        /// </summary>
        /// <param name="pageId">Page Id for which to request the maps</param>
        /// <returns>Marker Query Result</returns>
        Task<List<KartaMapMarkerQueryResult>> GetAllMapsKirjaPageIsMarkedIn(string pageId);

        /// <summary>
        /// Returns all maps for a Aika quest without detail information
        /// </summary>
        /// <param name="questId">Quest Id for which to request the maps</param>
        /// <returns>All Maps for a Aika Quest without detail information</returns>
        Task<List<KartaMap>> GetAllMapsAikaQuestIsMarkedIn(string questId);

        /// <summary>
        /// Returns all maps in which a map is marked without detail information
        /// </summary>
        /// <param name="mapId">Map Id for which to request the maps</param>
        /// <returns>All Maps in which a map is marked without detail information</returns>
        Task<List<KartaMap>> GetAllMapsMapIsMarkedIn(string mapId);

        /// <summary>
        /// Returns all quest markers for a given quest
        /// </summary>
        /// <param name="questId">Quest Id for which to request the markers</param>
        /// <returns>All Markers for the given quest</returns>
        Task<List<MapMarkerQueryResult>> GetAllQuestMarkers(string questId);

        /// <summary>
        /// Deletes a map
        /// </summary>
        /// <param name="map">Map to delete</param>
        /// <returns>Task</returns>
        Task DeleteMap(KartaMap map);

        /// <summary>
        /// Deletes all markers for a given quest
        /// </summary>
        /// <param name="questId">Id of the quest for which the markers must be deleted</param>
        /// <returns>Async Task</returns>
        Task DeleteMarkersOfQuest(string questId);


        /// <summary>
        /// Returns all maps that were last modified by a user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Maps</returns>
        Task<List<KartaMap>> GetMapsByModifiedUser(string userId);
    }
}