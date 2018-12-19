using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using GoNorth.Config;
using GoNorth.Data.Karta.Marker;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.Karta
{
    /// <summary>
    /// Karta Mongo DB Access
    /// </summary>
    public class KartaMapMongoDbAccess : BaseMongoDbAccess, IKartaMapDbAccess
    {
        /// <summary>
        /// Collection Name of the karta maps
        /// </summary>
        public const string KartaMapCollectionName = "KartaMap";

        /// <summary>
        /// Collection Name of the karta maps recycling bin
        /// </summary>
        public const string KartaMapRecyclingBinCollectionName = "KartaMapRecyclingBin";

        /// <summary>
        /// Map Collection
        /// </summary>
        private IMongoCollection<KartaMap> _MapCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public KartaMapMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _MapCollection = _Database.GetCollection<KartaMap>(KartaMapCollectionName);
        }

        /// <summary>
        /// Creates a Karta map
        /// </summary>
        /// <param name="map">Map to create</param>
        /// <returns>Created map, with filled id</returns>
        public async Task<KartaMap> CreateMap(KartaMap map)
        {
            if(string.IsNullOrEmpty(map.Id))
            {
                map.Id = Guid.NewGuid().ToString();
            }

            if(map.NpcMarker == null)
            {
                map.NpcMarker = new List<NpcMapMarker>();
            }

            if(map.ItemMarker == null)
            {
                map.ItemMarker = new List<ItemMapMarker>();
            }

            if(map.KirjaPageMarker == null)
            {
                map.KirjaPageMarker = new List<KirjaPageMapMarker>();
            }

            if(map.QuestMarker == null)
            {
                map.QuestMarker = new List<QuestMapMarker>();
            }

            if(map.MapChangeMarker == null)
            {
                map.MapChangeMarker = new List<MapChangeMapMarker>();
            }

            if(map.NoteMarker == null)
            {
                map.NoteMarker = new List<NoteMapMarker>();
            }

            await _MapCollection.InsertOneAsync(map);

            return map;
        }

        /// <summary>
        /// Renames a map
        /// </summary>
        /// <param name="map">Map with updated data</param>
        /// <returns>Task</returns>
        public async Task RenameMap(KartaMap map)
        {
            UpdateResult result = await _MapCollection.UpdateOneAsync(Builders<KartaMap>.Filter.Eq(f => f.Id, map.Id), Builders<KartaMap>.Update.Set(p => p.Name, map.Name).
                                                                                                                                                 Set(p => p.ModifiedOn, map.ModifiedOn).
                                                                                                                                                 Set(p => p.ModifiedBy, map.ModifiedBy));
            if(result.MatchedCount == 0)
            {
                throw new KeyNotFoundException();
            }
        }

        /// <summary>
        /// Updates all fields of a map
        /// </summary>
        /// <param name="map">Map with updated data</param>
        /// <returns>Task</returns>
        public async Task UpdateMap(KartaMap map)
        {
            ReplaceOneResult result = await _MapCollection.ReplaceOneAsync(m => m.Id == map.Id, map);
            if(result.MatchedCount == 0)
            {
                throw new KeyNotFoundException();
            }
        }

        /// <summary>
        /// Returns a map by its id
        /// </summary>
        /// <param name="id">Id</param>
        /// <returns>Map</returns>
        public async Task<KartaMap> GetMapById(string id)
        {
            KartaMap map = await _MapCollection.Find(p => p.Id == id).FirstOrDefaultAsync();
            return map;
        }

        /// <summary>
        /// Returns all markers that are not yet implemented
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Markers</returns>
        public async Task<List<MarkerImplementationQueryResultObject>> GetNotImplementedMarkers(string projectId, int start, int pageSize)
        {
            List<MarkerImplementationQueryResultObject> result = await GetNotImplementedMarkersForProject(projectId);

            return result.Skip(start).Take(pageSize).ToList();
        }

        /// <summary>
        /// Returns the count of all markers that are not yet implemented
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Markers Count</returns>
        public async Task<int> GetNotImplementedMarkersCount(string projectId)
        {
            List<MarkerImplementationQueryResultObject> result = await GetNotImplementedMarkersForProject(projectId);

            return result.Count;
        }

        /// <summary>
        /// Returns the not implemented markers for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Markers</returns>
        private async Task<List<MarkerImplementationQueryResultObject>> GetNotImplementedMarkersForProject(string projectId)
        {
            List<MarkerImplementationQueryResultObject> result = new List<MarkerImplementationQueryResultObject>();
            List<KartaMap> maps = await _MapCollection.Find(p => p.ProjectId == projectId).ToListAsync();
            foreach(KartaMap curMap in maps)
            {
                result.AddRange(ExtractNotImplementedMarkers(curMap, curMap.NpcMarker, MarkerType.Npc));
                result.AddRange(ExtractNotImplementedMarkers(curMap, curMap.ItemMarker, MarkerType.Item));
                result.AddRange(ExtractNotImplementedMarkers(curMap, curMap.MapChangeMarker, MarkerType.MapChange));
                result.AddRange(ExtractNotImplementedMarkers(curMap, curMap.QuestMarker, MarkerType.Quest));
                result.AddRange(ExtractNotImplementedMarkers(curMap, curMap.NoteMarker, MarkerType.Note));
            }

            return result;
        }

        /// <summary>
        /// Extracts the not implemented markers
        /// </summary>
        /// <param name="map">Map</param>
        /// <param name="markers">Markers</param>
        /// <param name="type">Type of the marker</param>
        /// <returns></returns>
        private List<MarkerImplementationQueryResultObject> ExtractNotImplementedMarkers<T>(KartaMap map, List<T> markers, MarkerType type) where T:MapMarker
        {
            if(markers == null)
            {
                return new List<MarkerImplementationQueryResultObject>();
            }

            return markers.Where(m => !m.IsImplemented).Select(m => new MarkerImplementationQueryResultObject {
                Id = m.Id,
                MapId = map.Id,
                Name = map.Name,
                Type = type
            }).ToList();
        }

        /// <summary>
        /// Returns all maps for a project with full detail
        /// </summary>
        /// <param name="projectId">Project Id for which to request the maps</param>
        /// <returns>All Maps for a project with full information</returns>
        public async Task<List<KartaMap>> GetAllProjectMapsWithFullDetail(string projectId)
        {
            List<KartaMap> maps = await _MapCollection.AsQueryable().Where(p => p.ProjectId == projectId).ToListAsync();
            return maps;
        }

        /// <summary>
        /// Returns all maps
        /// </summary>
        /// <returns>All Maps</returns>
        public async Task<List<KartaMap>> GetAllMaps()
        {
            List<KartaMap> maps = await _MapCollection.AsQueryable().ToListAsync();
            return maps;
        }

        /// <summary>
        /// Returns all maps for a project without detail information
        /// </summary>
        /// <param name="projectId">Project Id for which to request the maps</param>
        /// <returns>All Maps for a project without detail information</returns>
        public async Task<List<KartaMap>> GetAllProjectMaps(string projectId)
        {
            List<KartaMap> maps = await _MapCollection.AsQueryable().Where(p => p.ProjectId == projectId).OrderBy(m => m.Name).Select(m => new KartaMap {
                Id = m.Id,
                Name = m.Name
            }).ToListAsync();
            return maps;
        }

        /// <summary>
        /// Returns all maps for an npc without detail information
        /// </summary>
        /// <param name="npcId">Npc Id for which to request the maps</param>
        /// <returns>Marker Query Result</returns>
        public async Task<List<KartaMapMarkerQueryResult>> GetAllMapsNpcIsMarkedIn(string npcId)
        {
            List<KartaMap> maps = await _MapCollection.AsQueryable().Where(p => p.NpcMarker.Any(n => n.NpcId == npcId)).OrderBy(m => m.Name).Select(m => new KartaMap {
                Id = m.Id,
                Name = m.Name,
                NpcMarker = m.NpcMarker
            }).ToListAsync();

            List<KartaMapMarkerQueryResult> result = new List<KartaMapMarkerQueryResult>();
            foreach(KartaMap curMap in maps)
            {
                KartaMapMarkerQueryResult queryResult = new KartaMapMarkerQueryResult();
                queryResult.MapId = curMap.Id;
                queryResult.Name = curMap.Name;
                queryResult.MapMarkerType = MarkerType.Npc.ToString();
                queryResult.MarkerIds = curMap.NpcMarker.Where(m => m.NpcId == npcId).Select(m => m.Id).ToList();
                result.Add(queryResult);
            }

            return result;
        }

        /// <summary>
        /// Returns all maps for an item without detail information
        /// </summary>
        /// <param name="itemId">Item Id for which to request the maps</param>
        /// <returns>Marker Query Result</returns>
        public async Task<List<KartaMapMarkerQueryResult>> GetAllMapsItemIsMarkedIn(string itemId)
        {
            List<KartaMap> maps = await _MapCollection.AsQueryable().Where(p => p.ItemMarker.Any(n => n.ItemId == itemId)).OrderBy(m => m.Name).Select(m => new KartaMap {
                Id = m.Id,
                Name = m.Name,
                ItemMarker = m.ItemMarker
            }).ToListAsync();
            
            List<KartaMapMarkerQueryResult> result = new List<KartaMapMarkerQueryResult>();
            foreach(KartaMap curMap in maps)
            {
                KartaMapMarkerQueryResult queryResult = new KartaMapMarkerQueryResult();
                queryResult.MapId = curMap.Id;
                queryResult.Name = curMap.Name;
                queryResult.MapMarkerType = MarkerType.Item.ToString();
                queryResult.MarkerIds = curMap.ItemMarker.Where(m => m.ItemId == itemId).Select(m => m.Id).ToList();
                result.Add(queryResult);
            }

            return result;
        }

        /// <summary>
        /// Returns all maps for a kirja page without detail information
        /// </summary>
        /// <param name="pageId">Page Id for which to request the maps</param>
        /// <returns>All Maps for a kirja page without detail information</returns>
        public async Task<List<KartaMapMarkerQueryResult>> GetAllMapsKirjaPageIsMarkedIn(string pageId)
        {
            List<KartaMap> maps = await _MapCollection.AsQueryable().Where(p => p.KirjaPageMarker.Any(n => n.PageId == pageId)).OrderBy(m => m.Name).Select(m => new KartaMap {
                Id = m.Id,
                Name = m.Name,
                KirjaPageMarker = m.KirjaPageMarker
            }).ToListAsync();

            List<KartaMapMarkerQueryResult> result = new List<KartaMapMarkerQueryResult>();
            foreach(KartaMap curMap in maps)
            {
                KartaMapMarkerQueryResult queryResult = new KartaMapMarkerQueryResult();
                queryResult.MapId = curMap.Id;
                queryResult.Name = curMap.Name;
                queryResult.MapMarkerType = MarkerType.KirjaPage.ToString();
                queryResult.MarkerIds = curMap.KirjaPageMarker.Where(m => m.PageId == pageId).Select(m => m.Id).ToList();
                result.Add(queryResult);
            }

            return result;
        }

        /// <summary>
        /// Returns all maps for a Aika quest without detail information
        /// </summary>
        /// <param name="questId">Quest Id for which to request the maps</param>
        /// <returns>All Maps for a Aika Quest without detail information</returns>
        public async Task<List<KartaMap>> GetAllMapsAikaQuestIsMarkedIn(string questId)
        {
            List<KartaMap> maps = await _MapCollection.AsQueryable().Where(p => p.QuestMarker.Any(n => n.QuestId == questId)).OrderBy(m => m.Name).Select(m => new KartaMap {
                Id = m.Id,
                Name = m.Name
            }).ToListAsync();
            return maps;
        }

        /// <summary>
        /// Returns all maps in which a map is marked without detail information
        /// </summary>
        /// <param name="mapId">Map Id for which to request the maps</param>
        /// <returns>All Maps fin which a map is marked without detail information</returns>
        public async Task<List<KartaMap>> GetAllMapsMapIsMarkedIn(string mapId)
        {
            List<KartaMap> maps = await _MapCollection.AsQueryable().Where(p => p.MapChangeMarker.Any(n => n.MapId == mapId)).OrderBy(m => m.Name).Select(m => new KartaMap {
                Id = m.Id,
                Name = m.Name
            }).ToListAsync();
            return maps;
        }

        /// <summary>
        /// Returns all quest marker for a given quest
        /// </summary>
        /// <param name="questId">Quest Id for which to request the markers</param>
        /// <returns>All Markers for the given quest</returns>
        public async Task<List<MapMarkerQueryResult>> GetAllQuestMarkers(string questId)
        {
            List<KartaMap> affectedMaps = await _MapCollection.AsQueryable().Where(p => p.QuestMarker.Any(n => n.QuestId == questId)).ToListAsync();
            List<MapMarkerQueryResult> result = new List<MapMarkerQueryResult>();
            foreach(KartaMap curMap in affectedMaps)
            {
                List<MapMarkerQueryResult> mapMarkers = curMap.QuestMarker.Where(m => m.QuestId == questId).Select(m => new MapMarkerQueryResult {
                    Id = m.Id,
                    Name = m.Name,
                    MapName = curMap.Name
                }).ToList();
                result.AddRange(mapMarkers);
            }

            result = result.OrderBy(r => r.Name).ToList();

            return result;
        }

        /// <summary>
        /// Deletes a map
        /// </summary>
        /// <param name="map">Map to delete</param>
        /// <returns>Task</returns>
        public async Task DeleteMap(KartaMap map)
        {
            KartaMap existingMap = await GetMapById(map.Id);
            if(existingMap == null)
            {
                throw new NullReferenceException();
            }

            IMongoCollection<KartaMap> recyclingBin = _Database.GetCollection<KartaMap>(KartaMapRecyclingBinCollectionName);
            await recyclingBin.InsertOneAsync(existingMap);

            DeleteResult result = await _MapCollection.DeleteOneAsync(p => p.Id == map.Id);
        }

        /// <summary>
        /// Deletes all markers for a given quest
        /// </summary>
        /// <param name="questId">Id of the quest for which the markers must be deleted</param>
        /// <returns>Async Task</returns>
        public async Task DeleteMarkersOfQuest(string questId)
        {
            List<KartaMap> affectedMaps = await _MapCollection.AsQueryable().Where(p => p.QuestMarker.Any(n => n.QuestId == questId)).ToListAsync();
            if(affectedMaps == null || affectedMaps.Count == 0)
            {
                return;
            }

            foreach(KartaMap curMap in affectedMaps)
            {
                if(curMap.QuestMarker == null)
                {
                    continue;
                }

                curMap.QuestMarker = curMap.QuestMarker.Where(m => m.QuestId != questId).ToList();
                await UpdateMap(curMap);
            }
        }

        /// <summary>
        /// Returns all maps that were last modified by a user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Maps</returns>
        public async Task<List<KartaMap>> GetMapsByModifiedUser(string userId)
        {
            return await _MapCollection.AsQueryable().Where(p => p.ModifiedBy == userId).ToListAsync();
        }
    }
}