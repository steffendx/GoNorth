using GoNorth.Services.Timeline;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity;
using GoNorth.Data.User;
using GoNorth.Data.Karta;
using GoNorth.Extensions;
using System.Net;
using System;
using System.Threading.Tasks;
using GoNorth.Services.Karta;
using GoNorth.Data.Project;
using System.Collections.Generic;
using GoNorth.Data.Karta.Marker;
using System.Linq;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Tale;
using GoNorth.Data.Aika;
using Microsoft.AspNetCore.Http;
using GoNorth.Services.Project;
using GoNorth.Data.Evne;
using GoNorth.Data.Exporting;
using GoNorth.Services.Export.ExportSnippets;
using GoNorth.Data.StateMachines;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// Karta Api controller
    /// </summary>
    [ApiController]
    [Authorize(Roles = RoleNames.Karta)]
    [Route("/api/[controller]/[action]")]
    public class KartaApiController : ControllerBase
    {
        /// <summary>
        /// Request for saving a marker, only the property corresponding to the type of marker to be saved will be set
        /// </summary>
        public class SaveMarkerRequest
        {
            /// <summary>
            /// Kirja marker
            /// </summary>
            public KirjaPageMapMarker KirjaMarker { get; set; }

            /// <summary>
            /// Npc marker
            /// </summary>
            public NpcMapMarker NpcMarker { get; set; }

            /// <summary>
            /// Item marker
            /// </summary>
            public ItemMapMarker ItemMarker { get; set; }

            /// <summary>
            /// Quest marker
            /// </summary>
            public QuestMapMarker QuestMarker { get; set; }

            /// <summary>
            /// Map Change marker
            /// </summary>
            public MapChangeMapMarker MapChangeMarker { get; set; }
            
            /// <summary>
            /// Note  marker
            /// </summary>
            public NoteMapMarker NoteMarker { get; set; }
        };

        /// <summary>
        /// Marker Implementation Query Result
        /// </summary>
        public class MarkerImplementationQueryResult
        {
            /// <summary>
            /// true if there are more objects to query, else false
            /// </summary>
            public bool HasMore { get; set; }

            /// <summary>
            /// Markers
            /// </summary>
            public IList<MarkerImplementationQueryResultObject> Markers { get; set; }
        }
        
        /// <summary>
        /// Marker Name Query Result
        /// </summary>
        public class NamedMarkerQueryResult
        {
            /// <summary>
            /// true if there are more objects to query, else false
            /// </summary>
            public bool HasMore { get; set; }

            /// <summary>
            /// Markers
            /// </summary>
            public IList<KartaMapNamedMarkerQueryResult> Markers { get; set; }
        }


        /// <summary>
        /// Mime Type of the tile image
        /// </summary>
        private const string TileImageMimeType = "image/png";


        /// <summary>
        /// Map Db Access
        /// </summary>
        private readonly IKartaMapDbAccess _mapDbAccess;

        /// <summary>
        /// Map Marker Implementation Snapshot Db Access
        /// </summary>
        private readonly IKartaMarkerImplementationSnapshotDbAccess _markerImplementationSnapshotDbAccess;

        /// <summary>
        /// Kortisto Npc Db Access
        /// </summary>
        private readonly IKortistoNpcDbAccess _kortistoNpcDbAccess;

        /// <summary>
        /// Npc Template Db Access
        /// </summary>
        private readonly IKortistoNpcTemplateDbAccess _npcTemplateDbAccess;

        /// <summary>
        /// Tale Db Access
        /// </summary>
        private readonly ITaleDbAccess _taleDbAccess;

        /// <summary>
        /// Quest Db Access
        /// </summary>
        private readonly IAikaQuestDbAccess _questDbAccess;

        /// <summary>
        /// Skill Db Access
        /// </summary>
        private readonly IEvneSkillDbAccess _skillDbAccess;

        /// <summary>
        /// Object export snippet Db Access
        /// </summary>
        private readonly IObjectExportSnippetDbAccess _objectExportSnippetDbAccess;

        /// <summary>
        /// User project access
        /// </summary>
        private readonly IUserProjectAccess _userProjectAccess;

        /// <summary>
        /// Karta Image Access
        /// </summary>
        private readonly IKartaImageAccess _mapImageAccess;

        /// <summary>
        /// Karta Image Processor
        /// </summary>
        private readonly IKartaImageProcessor _imageProcessor;
        
        /// <summary>
        /// Service that will resolve export snippet related object names
        /// </summary>
        private readonly IExportSnippetRelatedObjectNameResolver _exportSnippetRelatedObjectNameResolver;

        /// <summary>
        /// State Machine Db Access
        /// </summary>
        private readonly IStateMachineDbAccess _stateMachineDbAccess;

        /// <summary>
        /// Timeline Service
        /// </summary>
        private readonly ITimelineService _timelineService;

        /// <summary>
        /// User Manager
        /// </summary>
        private readonly UserManager<GoNorthUser> _userManager;

        /// <summary>
        /// Logger
        /// </summary>
        private readonly ILogger _logger;
    
        /// <summary>
        /// Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;
        
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="mapDbAccess">Map Db Access</param>
        /// <param name="markerImplementationSnapshotDbAccess">Marker Implementation Snapshot Db Access</param>
        /// <param name="kortistoNpcDbAccess">Kortisto Npc Db Access</param>
        /// <param name="npcTemplateDbAccess">Npc Template Db Access</param>
        /// <param name="taleDbAccess">Tale Db Access</param>
        /// <param name="questDbAccess">Quest Db Access</param>
        /// <param name="skillDbAccess">Skill Db Access</param>
        /// <param name="objectExportSnippetDbAccess">Object export snippet Db Access</param>
        /// <param name="stateMachineDbAccess">State Machine Db Access</param>
        /// <param name="userProjectAccess">User project access</param>
        /// <param name="mapImageAccess">Map Image Access</param>
        /// <param name="imageProcessor">Map Image Processor</param>
        /// <param name="exportSnippetRelatedObjectNameResolver">Service that will resolve export snippet related object names</param>
        /// <param name="timelineService">Timeline Service</param>
        /// <param name="userManager">User Manager</param>
        /// <param name="logger">Logger</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public KartaApiController(IKartaMapDbAccess mapDbAccess, IKartaMarkerImplementationSnapshotDbAccess markerImplementationSnapshotDbAccess, IKortistoNpcDbAccess kortistoNpcDbAccess, IKortistoNpcTemplateDbAccess npcTemplateDbAccess, 
                                  ITaleDbAccess taleDbAccess, IAikaQuestDbAccess questDbAccess, IEvneSkillDbAccess skillDbAccess, IObjectExportSnippetDbAccess objectExportSnippetDbAccess, IStateMachineDbAccess stateMachineDbAccess, 
                                  IUserProjectAccess userProjectAccess, IKartaImageAccess mapImageAccess, IKartaImageProcessor imageProcessor, IExportSnippetRelatedObjectNameResolver exportSnippetRelatedObjectNameResolver, 
                                  ITimelineService timelineService, UserManager<GoNorthUser> userManager, ILogger<KartaApiController> logger, IStringLocalizerFactory localizerFactory)
        {
            _mapDbAccess = mapDbAccess;
            _markerImplementationSnapshotDbAccess = markerImplementationSnapshotDbAccess;
            _kortistoNpcDbAccess = kortistoNpcDbAccess;
            _npcTemplateDbAccess = npcTemplateDbAccess;
            _taleDbAccess = taleDbAccess;
            _questDbAccess = questDbAccess;
            _skillDbAccess = skillDbAccess;
            _objectExportSnippetDbAccess = objectExportSnippetDbAccess;
            _stateMachineDbAccess = stateMachineDbAccess;
            _userProjectAccess = userProjectAccess;
            _mapImageAccess = mapImageAccess;
            _imageProcessor = imageProcessor;
            _exportSnippetRelatedObjectNameResolver = exportSnippetRelatedObjectNameResolver;
            _timelineService = timelineService;
            _userManager = userManager;
            _logger = logger;
            _localizer = localizerFactory.Create(typeof(KartaApiController));
        }


        /// <summary>
        /// Returns a map by its id
        /// </summary>
        /// <param name="id">Id of the map</param>
        /// <returns>Maps for the current project</returns>
        [ProducesResponseType(typeof(KartaMap), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> Map(string id)
        {
            KartaMap map = await _mapDbAccess.GetMapById(id);
            if(!User.IsInRole(RoleNames.Kirja))
            {
                map.KirjaPageMarker = new List<KirjaPageMapMarker>();
            }
            if(!User.IsInRole(RoleNames.Kortisto))
            {
                map.NpcMarker = new List<NpcMapMarker>();
            }
            if(!User.IsInRole(RoleNames.Styr))
            {
                map.ItemMarker = new List<ItemMapMarker>();
            }
            if(!User.IsInRole(RoleNames.Aika))
            {
                map.QuestMarker = new List<QuestMapMarker>();
            }

            return Ok(map);
        }

        /// <summary>
        /// Returns the maps for the current project
        /// </summary>
        /// <returns>Maps for the current project</returns>
        [ProducesResponseType(typeof(List<KartaMap>), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> Maps()
        {
            GoNorthProject project = await _userProjectAccess.GetUserProject();
            List<KartaMap> maps = await _mapDbAccess.GetAllProjectMaps(project.Id);
            return Ok(maps);
        }

        /// <summary>
        /// Returns the maps in which an npc is marked
        /// </summary>
        /// <param name="npcId">Npc Id</param>
        /// <returns>Maps in which an npc is marked</returns>
        [ProducesResponseType(typeof(List<KartaMapMarkerQueryResult>), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> GetMapsByNpcId(string npcId)
        {
            List<KartaMapMarkerQueryResult> maps = await _mapDbAccess.GetAllMapsNpcIsMarkedIn(npcId);
            return Ok(maps);
        }

        /// <summary>
        /// Returns the maps in which an item is marked
        /// </summary>
        /// <param name="itemId">Item Id</param>
        /// <returns>Maps in which an item is marked</returns>
        [ProducesResponseType(typeof(List<KartaMapMarkerQueryResult>), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> GetMapsByItemId(string itemId)
        {
            List<KartaMapMarkerQueryResult> maps = await _mapDbAccess.GetAllMapsItemIsMarkedIn(itemId);
            return Ok(maps);
        }

        /// <summary>
        /// Returns the maps in which a kirja page is marked
        /// </summary>
        /// <param name="pageId">Page Id</param>
        /// <returns>Maps in which a kirja page is marked with markers</returns>
        [ProducesResponseType(typeof(List<KartaMapMarkerQueryResult>), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> GetMapsByKirjaPageId(string pageId)
        {
            List<KartaMapMarkerQueryResult> markerQueryResult = await _mapDbAccess.GetAllMapsKirjaPageIsMarkedIn(pageId);
            return Ok(markerQueryResult);
        }

        /// <summary>
        /// Returns the maps in which a quest is marked
        /// </summary>
        /// <param name="questId">Quest Id</param>
        /// <returns>Maps in which a quest is marked</returns>
        [ProducesResponseType(typeof(List<KartaMap>), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> GetMapsByQuestId(string questId)
        {
            List<KartaMap> maps = await _mapDbAccess.GetAllMapsAikaQuestIsMarkedIn(questId);
            return Ok(maps);
        }

        /// <summary>
        /// Returns the maps in which a quest is marked
        /// </summary>
        /// <param name="questId">Quest Id</param>
        /// <returns>Maps in which a quest is marked</returns>
        [ProducesResponseType(typeof(List<MapMarkerQueryResult>), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> GetAllQuestMarkers(string questId)
        {
            List<MapMarkerQueryResult> markers = await _mapDbAccess.GetAllQuestMarkers(questId);
            return Ok(markers);
        }

        /// <summary>
        /// Returns the image for a map tile
        /// </summary>
        /// <param name="mapId">Map ID</param>
        /// <param name="z">Zoom</param>
        /// <param name="x">X</param>
        /// <param name="y">Y</param>
        /// <param name="maxZoom">MaxZoom of the map</param>
        /// <param name="maxTileCountX">Max Tile Count of the map on the X-Axis</param>
        /// <param name="maxTileCountY">Max Tile Count of the map on the Y-Axis</param>
        /// <returns>Tile Image</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [HttpGet]
        public IActionResult MapImage(string mapId, int z, int x, int y, int maxZoom, int maxTileCountX, int maxTileCountY)
        {
            // Security check mapid
            if(mapId.Contains("/") || mapId.Contains("\\") || mapId.Contains("."))
            {
                return BadRequest();
            }

            // Check if tile is outside of bounds
            if(z == maxZoom && (x > maxTileCountX || y > maxTileCountY))
            {
                return File(_mapImageAccess.OpenBlankImage(), TileImageMimeType);
            }
            else
            {
                return File(_mapImageAccess.OpenImage(mapId, z, x, y), TileImageMimeType);
            }
        }


        /// <summary>
        /// Creates a new map
        /// </summary>
        /// <param name="name">Name of the map</param>
        /// <returns>Created map</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = RoleNames.KartaMapManager)]
        public async Task<IActionResult> CreateMap(string name)
        {
            // Validate data
            if(string.IsNullOrEmpty(name))
            {
                return BadRequest();
            }

            string validateResult = this.ValidateImageUploadData();
            if(validateResult != null)
            {
                return BadRequest(_localizer[validateResult]);
            }

            // Prepare Map
            KartaMap map = new KartaMap();
            map.Id = Guid.NewGuid().ToString();
            map.Name = name;

            await this.SetModifiedData(_userManager, map);

            GoNorthProject project = await _userProjectAccess.GetUserProject();
            map.ProjectId = project.Id;

            // Process Map
            try
            {
                await _imageProcessor.ProcessMapImage(map, Request.Form.Files[0]);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not process map image.");
                _mapImageAccess.DeleteMapFolder(map.Id);
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            // Save Map
            try
            {
                await _mapDbAccess.CreateMap(map);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not save map.");
                _mapImageAccess.DeleteMapFolder(map.Id);
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        
            await _timelineService.AddTimelineEntry(map.ProjectId, TimelineEvent.KartaMapCreated, map.Name, map.Id);

            return Ok(map.Id);
        }

        /// <summary>
        /// Updates a map
        /// </summary>
        /// <param name="id">Id of the map</param>
        /// <param name="name">Name of the map</param>
        /// <returns>Result</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> UpdateMap(string id, string name)
        {
            // Validate data
            if(string.IsNullOrEmpty(name))
            {
                return BadRequest();
            }

            string validateResult = this.ValidateImageUploadData();
            if(validateResult != null)
            {
                return BadRequest(_localizer[validateResult]);
            }

            // Get Old Data
            KartaMap map = await _mapDbAccess.GetMapById(id);
            int oldWidth = map.Width;
            int oldHeight = map.Height;

            // Rename map
            bool nameChanged = map.Name != name;

            map.Name = name;
            await this.SetModifiedData(_userManager, map);

            // Rebuild images
            try
            {
                _mapImageAccess.SaveMapImagesForRollback(map.Id);
                await _imageProcessor.ProcessMapImage(map, Request.Form.Files[0]);
            }
            catch(Exception ex)
            {
                _mapImageAccess.RollbackMapImages(map.Id);
                _logger.LogError(ex, "Could not process map image.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            // Scale Map Markers
            float scaleX = (int)((float)map.Width / oldWidth);
            float scaleY = (int)((float)map.Height / oldHeight);
            foreach(MapMarker curMarker in map.NpcMarker)
            {
                ScaleMapMarker(curMarker, scaleX, scaleY);
            }

            foreach(MapMarker curMarker in map.ItemMarker)
            {
                ScaleMapMarker(curMarker, scaleX, scaleY);
            }

            foreach(MapMarker curMarker in map.KirjaPageMarker)
            {
                ScaleMapMarker(curMarker, scaleX, scaleY);
            }

            foreach(MapMarker curMarker in map.QuestMarker)
            {
                ScaleMapMarker(curMarker, scaleX, scaleY);
            }

            foreach(MapMarker curMarker in map.MapChangeMarker)
            {
                ScaleMapMarker(curMarker, scaleX, scaleY);
            }

            foreach(MapMarker curMarker in map.NoteMarker)
            {
                ScaleMapMarker(curMarker, scaleX, scaleY);
            }

            try
            {
                await _mapDbAccess.UpdateMap(map);
            }
            catch(Exception ex)
            {
                _mapImageAccess.RollbackMapImages(map.Id);
                _logger.LogError(ex, "Could not update map image.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            if(nameChanged)
            {
                await SyncMapNameToMarkers(id, name);
            }

            // Clean rollback data
            _mapImageAccess.CleanRollbackMapImages(map.Id);

            await _timelineService.AddTimelineEntry(map.ProjectId, TimelineEvent.KartaMapUpdated, name, id);

            return Ok(id);
        }

        /// <summary>
        /// Scale a map marker
        /// </summary>
        /// <param name="marker">Marker</param>
        /// <param name="scaleX">ScaleY</param>
        /// <param name="scaleY">ScaleY</param>
        private void ScaleMapMarker(MapMarker marker, float scaleX, float scaleY)
        {
            marker.X *= scaleX;
            marker.Y *= scaleY;

            if(marker.ChapterPixelCoords == null)
            {
                return;
            }

            foreach(MapMarkerChapterPixelCoords curCoords in marker.ChapterPixelCoords)
            {
                curCoords.X *= scaleX;
                curCoords.Y *= scaleY;
            }

            if(marker.Geometry != null)
            {
                foreach(MarkerGeometry curGeom in marker.Geometry)
                {
                    foreach(MarkerGeometryPosition curPos in curGeom.Positions)
                    {
                        curPos.X *= scaleX;
                        curPos.Y *= scaleY;
                    }
                }
            }
        }


        /// <summary>
        /// Renames a map
        /// </summary>
        /// <param name="id">Id of the map</param>
        /// <param name="name">New Name of the map</param>
        /// <returns>Result</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = RoleNames.KartaMapManager)]
        public async Task<IActionResult> RenameMap(string id, string name)
        {
            // Update map
            KartaMap map = await _mapDbAccess.GetMapById(id);
            if(map == null)
            {
                return NotFound();
            }

            bool hasNameChanged = map.Name != name;

            map.Name = name;
            await this.SetModifiedData(_userManager, map);
            await _mapDbAccess.RenameMap(map);

            if(hasNameChanged)
            {
                await this.SyncMapNameToMarkers(id, name);
            }

            await _timelineService.AddTimelineEntry(map.ProjectId, TimelineEvent.KartaMapUpdated, name, id);
            return Ok(id);
        }

        /// <summary>
        /// Syncs the map name to markers after an update
        /// </summary>
        /// <param name="id">Id of the map</param>
        /// <param name="mapName">New map name</param>
        /// <returns>Task</returns>
        private async Task SyncMapNameToMarkers(string id, string mapName)
        {
            List<KartaMap> markerResult = await _mapDbAccess.GetAllMapsMapIsMarkedIn(id);
            foreach(KartaMap curMap in markerResult)
            {
                KartaMap map = await _mapDbAccess.GetMapById(curMap.Id);
                foreach(MapChangeMapMarker curMarker in map.MapChangeMarker)
                {
                    if(curMarker.MapId == id)
                    {
                        curMarker.MapName = mapName;
                    }
                }
                await _mapDbAccess.UpdateMap(map);
            }
        }

        /// <summary>
        /// Deletes a map
        /// </summary>
        /// <param name="id">Map ID</param>
        /// <returns>Task</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [HttpDelete]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = RoleNames.KartaMapManager)]
        public async Task<IActionResult> DeleteMap(string id) 
        {
            string error = await CheckMapReferencesForDeletion(id);
            if(!string.IsNullOrEmpty(error))
            {
                return BadRequest(error);
            }

            await DeleteAdditionalMapReferences(id);

            KartaMap map = await _mapDbAccess.GetMapById(id);
            await _mapDbAccess.DeleteMap(map);
            _logger.LogInformation("Map was deleted.");

            _mapImageAccess.DeleteMapFolder(map.Id);
            _logger.LogInformation("Map image was deleted.");

            await _timelineService.AddTimelineEntry(map.ProjectId, TimelineEvent.KartaMapDeleted, map.Name);
            return Ok(id);
        }

        /// <summary>
        /// Checks the references of a map if it can be deleted
        /// </summary>
        /// <param name="id">Id of the map</param>
        /// <returns>Error message if it can not be deleted, else null</returns>
        private async Task<string> CheckMapReferencesForDeletion(string id) 
        {
            List<KartaMap> kartaMaps = await _mapDbAccess.GetAllMapsMapIsMarkedIn(id);
            if(kartaMaps.Count > 0)
            {
                string markedInMaps = string.Join(", ", kartaMaps.Select(p => p.Name));
                return _localizer["CanNotDeleteMapMarkedInKartaMap", markedInMaps].Value;
            }

            List<TaleDialog> taleDialogs = await _taleDbAccess.GetDialogsObjectIsReferenced(id);
            if(taleDialogs.Count > 0)
            {
                List<KortistoNpc> npcs = await _kortistoNpcDbAccess.ResolveFlexFieldObjectNames(taleDialogs.Select(t => t.RelatedObjectId).ToList());
                string referencedInDialogs = string.Join(", ", npcs.Select(n => n.Name));
                return _localizer["CanNotDeleteMapReferencedInTaleDialog", referencedInDialogs].Value;
            }

            List<KortistoNpc> usedNpcs = await _kortistoNpcDbAccess.GetNpcsObjectIsReferencedInDailyRoutine(id);
            if(usedNpcs.Count > 0)
            {
                string referencedInNpcs = string.Join(", ", usedNpcs.Select(p => p.Name));
                return _localizer["CanNotDeleteMapReferencedInNpc", referencedInNpcs].Value;
            }

            List<AikaQuest> aikaQuests = await _questDbAccess.GetQuestsObjectIsReferenced(id);
            if(aikaQuests.Count > 0)
            {
                string referencedInQuests = string.Join(", ", aikaQuests.Select(p => p.Name));
                return _localizer["CanNotDeleteMapReferencedInAikaQuest", referencedInQuests].Value;
            }

            List<EvneSkill> referencedInSkills = await _skillDbAccess.GetSkillsObjectIsReferencedIn(id);
            if(referencedInSkills.Count > 0)
            {
                string usedInSkills = string.Join(", ", referencedInSkills.Select(m => m.Name));
                return _localizer["CanNotDeleteMapReferencedInSkill", usedInSkills].Value;
            }

            List<ObjectExportSnippet> referencedInSnippets = await _objectExportSnippetDbAccess.GetExportSnippetsObjectIsReferenced(id);
            if(referencedInSnippets.Count > 0)
            {
                List<ObjectExportSnippetReference> references = await _exportSnippetRelatedObjectNameResolver.ResolveExportSnippetReferences(referencedInSnippets, true, true, true);
                string usedInDailyRoutines = string.Join(", ", references.Select(m => string.Format("{0} ({1})", m.ObjectName, m.ExportSnippet)));
                return _localizer["CanNotDeleteMapReferencedInExportSnippet", usedInDailyRoutines].Value;
            }

            List<StateMachine> referencedInStateMachine = await _stateMachineDbAccess.GetStateMachinesObjectIsReferenced(id);
            if(referencedInStateMachine.Count > 0)
            {
                List<KortistoNpc> npcs = await _kortistoNpcDbAccess.ResolveFlexFieldObjectNames(referencedInStateMachine.Select(t => t.RelatedObjectId).ToList());
                List<KortistoNpc> npcTemplates = await _npcTemplateDbAccess.ResolveFlexFieldObjectNames(referencedInStateMachine.Select(t => t.RelatedObjectId).ToList());
                string usedInStateMachines = string.Join(", ", npcs.Union(npcTemplates).Select(n => n.Name));
                return _localizer["CanNotDeleteMapReferencedInStateMachines", usedInStateMachines].Value;
            }

            return null;
        }

        /// <summary>
        /// Deletes additional map references
        /// </summary>
        /// <param name="id">Id of the map</param>
        /// <returns>Task</returns>
        private async Task DeleteAdditionalMapReferences(string id)
        {
            List<KortistoNpc> npcs = await _kortistoNpcDbAccess.GetNpcsWithMovementTargetInMap(id);
            foreach(KortistoNpc curNpc in npcs)
            {
                curNpc.DailyRoutine.RemoveAll(dr => dr.MovementTarget != null && dr.MovementTarget.MapId == id);
                await _kortistoNpcDbAccess.UpdateFlexFieldObject(curNpc);
            }
        }


        /// <summary>
        /// Returns a new map marker id
        /// </summary>
        /// <returns>Map Marker Id</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [HttpGet]
        public IActionResult GetNewMapMarkerId()
        {
            string markerId = Guid.NewGuid().ToString();
            return Ok(markerId);
        }

        /// <summary>
        /// Saves a map marker
        /// </summary>
        /// <param name="id">Map Id</param>
        /// <param name="markerRequest">Marker Request</param>
        /// <returns>Task Result</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task <IActionResult> SaveMapMarker(string id, [FromBody]SaveMarkerRequest markerRequest)
        {
            if((!User.IsInRole(RoleNames.Kirja) && markerRequest.KirjaMarker != null) ||
               (!User.IsInRole(RoleNames.Kortisto) && markerRequest.NpcMarker != null) ||
               (!User.IsInRole(RoleNames.Styr) && markerRequest.ItemMarker != null) ||
               (!User.IsInRole(RoleNames.Aika) && markerRequest.QuestMarker != null))
            {
                return Unauthorized();
            }

            string markerId = string.Empty;
            string markerType = string.Empty;
            KartaMap map = await _mapDbAccess.GetMapById(id);
            if(markerRequest.KirjaMarker != null)
            {
                if(map.KirjaPageMarker == null)
                {
                    map.KirjaPageMarker = new List<KirjaPageMapMarker>();    
                }

                markerId = markerRequest.KirjaMarker.Id;
                markerType = MarkerType.KirjaPage.ToString();

                KirjaPageMapMarker existingMarker = map.KirjaPageMarker.FirstOrDefault(m => m.Id == markerRequest.KirjaMarker.Id);
                if(existingMarker != null)
                {
                    CopyBaseMarkerAttributes(existingMarker, markerRequest.KirjaMarker);
                    existingMarker.IsImplemented = false;
                }
                else
                {
                    map.KirjaPageMarker.Add(markerRequest.KirjaMarker);
                }
            }
            else if(markerRequest.NpcMarker != null)
            {
                if(map.NpcMarker == null)
                {
                    map.NpcMarker = new List<NpcMapMarker>();    
                }

                markerId = markerRequest.NpcMarker.Id;
                markerType = MarkerType.Npc.ToString();

                NpcMapMarker existingMarker = map.NpcMarker.FirstOrDefault(m => m.Id == markerRequest.NpcMarker.Id);
                if(existingMarker != null)
                {
                    CopyBaseMarkerAttributes(existingMarker, markerRequest.NpcMarker);
                    existingMarker.IsImplemented = false;
                }
                else
                {
                    map.NpcMarker.Add(markerRequest.NpcMarker);
                }
            }
            else if(markerRequest.ItemMarker != null)
            {
                if(map.ItemMarker == null)
                {
                    map.ItemMarker = new List<ItemMapMarker>();    
                }

                markerId = markerRequest.ItemMarker.Id;
                markerType = MarkerType.Item.ToString();

                ItemMapMarker existingMarker = map.ItemMarker.FirstOrDefault(m => m.Id == markerRequest.ItemMarker.Id);
                if(existingMarker != null)
                {
                    CopyBaseMarkerAttributes(existingMarker, markerRequest.ItemMarker);
                    existingMarker.IsImplemented = false;
                }
                else
                {
                    map.ItemMarker.Add(markerRequest.ItemMarker);
                }
            }
            else if(markerRequest.QuestMarker != null)
            {
                if(map.QuestMarker == null)
                {
                    map.QuestMarker = new List<QuestMapMarker>();    
                }

                markerId = markerRequest.QuestMarker.Id;
                markerType = MarkerType.Quest.ToString();

                QuestMapMarker existingMarker = map.QuestMarker.FirstOrDefault(m => m.Id == markerRequest.QuestMarker.Id);
                if(existingMarker != null)
                {
                    CopyBaseMarkerAttributes(existingMarker, markerRequest.QuestMarker);
                    existingMarker.Name = markerRequest.QuestMarker.Name;
                    existingMarker.IsImplemented = false;
                }
                else
                {
                    map.QuestMarker.Add(markerRequest.QuestMarker);
                }
            }
            else if(markerRequest.MapChangeMarker != null)
            {
                if(map.MapChangeMarker == null)
                {
                    map.MapChangeMarker = new List<MapChangeMapMarker>();    
                }

                markerId = markerRequest.MapChangeMarker.Id;
                markerType = MarkerType.MapChange.ToString();
                
                MapChangeMapMarker existingMarker = map.MapChangeMarker.FirstOrDefault(m => m.Id == markerRequest.MapChangeMarker.Id);
                if(existingMarker != null)
                {
                    CopyBaseMarkerAttributes(existingMarker, markerRequest.MapChangeMarker);
                    existingMarker.IsImplemented = false;
                }
                else
                {
                    map.MapChangeMarker.Add(markerRequest.MapChangeMarker);
                }
            }
            else if(markerRequest.NoteMarker != null)
            {
                if(map.NoteMarker == null)
                {
                    map.NoteMarker = new List<NoteMapMarker>();    
                }

                markerId = markerRequest.NoteMarker.Id;
                markerType = MarkerType.Note.ToString();
                
                NoteMapMarker existingMarker = map.NoteMarker.FirstOrDefault(m => m.Id == markerRequest.NoteMarker.Id);
                if(existingMarker != null)
                {
                    CopyBaseMarkerAttributes(existingMarker, markerRequest.NoteMarker);
                    existingMarker.Name = markerRequest.NoteMarker.Name;
                    existingMarker.Description = markerRequest.NoteMarker.Description;
                    existingMarker.IsImplemented = false;
                }
                else
                {
                    map.NoteMarker.Add(markerRequest.NoteMarker);
                }
            }
            await _mapDbAccess.UpdateMap(map);

            string localizedMarkerType = _localizer["MarkerType" + markerType].Value;
            await _timelineService.AddTimelineEntry(map.ProjectId, TimelineEvent.KartaMapMarkerUpdated, map.Name, map.Id, markerId, markerType, localizedMarkerType);

            return Ok(id);
        } 

        /// <summary>
        /// Deletes a map marker
        /// </summary>
        /// <param name="id">Map Id</param>
        /// <param name="markerId">Marker Id</param>
        /// <param name="markerType">Marker Type</param>
        /// <returns>Task Result</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [HttpDelete]
        [ValidateAntiForgeryToken]
        public async Task <IActionResult> DeleteMapMarker(string id, string markerId, MarkerType markerType)
        {
            if((!User.IsInRole(RoleNames.Kirja) && markerType == MarkerType.KirjaPage) ||
               (!User.IsInRole(RoleNames.Kortisto) && markerType == MarkerType.Npc) ||
               (!User.IsInRole(RoleNames.Styr) && markerType == MarkerType.Item) ||
               (!User.IsInRole(RoleNames.Aika) && markerType == MarkerType.Quest))
            {
                return Unauthorized();
            }

            string deleteError = await CheckMarkerReferencesForDelete(markerId);
            if(!string.IsNullOrEmpty(deleteError))
            {
                return BadRequest(deleteError);
            }

            KartaMap map = await _mapDbAccess.GetMapById(id);
            if(markerType == MarkerType.KirjaPage)
            {
                DeleteMarkerFromList(map.KirjaPageMarker, markerId);
            }
            else if(markerType == MarkerType.Npc)
            {
                DeleteMarkerFromList(map.NpcMarker, markerId);
                await _markerImplementationSnapshotDbAccess.DeleteNpcMarkerSnapshot(markerId);
            }
            else if(markerType == MarkerType.Item)
            {
                DeleteMarkerFromList(map.ItemMarker, markerId);
                await _markerImplementationSnapshotDbAccess.DeleteItemMarkerSnapshot(markerId);
            }
            else if(markerType == MarkerType.Quest)
            {
                DeleteMarkerFromList(map.QuestMarker, markerId);
                await _markerImplementationSnapshotDbAccess.DeleteQuestMarkerSnapshot(markerId);
            }
            else if(markerType == MarkerType.MapChange)
            {
                DeleteMarkerFromList(map.MapChangeMarker, markerId);
                await _markerImplementationSnapshotDbAccess.DeleteMapChangeMarkerSnapshot(markerId);
            }
            else if(markerType == MarkerType.Note)
            {
                DeleteMarkerFromList(map.NoteMarker, markerId);
                await _markerImplementationSnapshotDbAccess.DeleteNoteMarkerSnapshot(markerId);
            }
            await _mapDbAccess.UpdateMap(map);

            string localizedMarkerType = _localizer["MarkerType" + markerType.ToString()].Value;
            await _timelineService.AddTimelineEntry(map.ProjectId, TimelineEvent.KartaMapMarkerDeleted, map.Name, map.Id, localizedMarkerType);

            return Ok(id);
        } 

        /// <summary>
        /// Checks if a marker has references or if it can be deleted
        /// </summary>
        /// <param name="markerId">Marker id</param>
        /// <returns>Error message</returns>
        private async Task<string> CheckMarkerReferencesForDelete(string markerId) 
        {
            List<TaleDialog> taleDialogs = await _taleDbAccess.GetDialogsObjectIsReferenced(markerId);
            if(taleDialogs.Count > 0)
            {
                List<KortistoNpc> npcs = await _kortistoNpcDbAccess.ResolveFlexFieldObjectNames(taleDialogs.Select(t => t.RelatedObjectId).ToList());
                string referencedInDialogs = string.Join(", ", npcs.Select(n => n.Name));
                return _localizer["CanNotDeleteMarkerReferencedInTaleDialog", referencedInDialogs].Value;
            }

            List<KortistoNpc> usedNpcs = await _kortistoNpcDbAccess.GetNpcsObjectIsReferencedInDailyRoutine(markerId);
            if(usedNpcs.Count > 0)
            {
                string referencedInNpcs = string.Join(", ", usedNpcs.Select(p => p.Name));
                return _localizer["CanNotDeleteMarkerReferencedInNpc", referencedInNpcs].Value;
            }

            List<AikaQuest> aikaQuests = await _questDbAccess.GetQuestsObjectIsReferenced(markerId);
            if(aikaQuests.Count > 0)
            {
                string referencedInQuests = string.Join(", ", aikaQuests.Select(p => p.Name));
                return _localizer["CanNotDeleteMarkerReferencedInAikaQuest", referencedInQuests].Value;
            }
            
            List<EvneSkill> referencedInSkills = await _skillDbAccess.GetSkillsObjectIsReferencedIn(markerId);
            if(referencedInSkills.Count > 0)
            {
                string usedInSkills = string.Join(", ", referencedInSkills.Select(m => m.Name));
                return _localizer["CanNotDeleteMarkerReferencedInSkill", usedInSkills].Value;
            }

            List<ObjectExportSnippet> referencedInSnippets = await _objectExportSnippetDbAccess.GetExportSnippetsObjectIsReferenced(markerId);
            if(referencedInSnippets.Count > 0)
            {
                List<ObjectExportSnippetReference> references = await _exportSnippetRelatedObjectNameResolver.ResolveExportSnippetReferences(referencedInSnippets, true, true, true);
                string usedInDailyRoutines = string.Join(", ", references.Select(m => string.Format("{0} ({1})", m.ObjectName, m.ExportSnippet)));
                return _localizer["CanNotDeleteMarkerReferencedInExportSnippet", usedInDailyRoutines].Value;
            }

            List<StateMachine> referencedInStateMachine = await _stateMachineDbAccess.GetStateMachinesObjectIsReferenced(markerId);
            if(referencedInStateMachine.Count > 0)
            {
                List<KortistoNpc> npcs = await _kortistoNpcDbAccess.ResolveFlexFieldObjectNames(referencedInStateMachine.Select(t => t.RelatedObjectId).ToList());
                List<KortistoNpc> npcTemplates = await _npcTemplateDbAccess.ResolveFlexFieldObjectNames(referencedInStateMachine.Select(t => t.RelatedObjectId).ToList());
                string usedInStateMachines = string.Join(", ", npcs.Union(npcTemplates).Select(n => n.Name));
                return _localizer["CanNotDeleteMarkerReferencedInStateMachines", usedInStateMachines].Value;
            }

            return null;
        }

        /// <summary>
        /// Deletes a marker from a marker list
        /// </summary>
        /// <param name="markerList">Marker list to update</param>
        /// <param name="markerId">Marker Id</param>
        private void DeleteMarkerFromList<T>(List<T> markerList, string markerId) where T : MapMarker
        {
            T existingMarker = markerList.FirstOrDefault(m => m.Id == markerId);
            if(existingMarker != null)
            {
                markerList.Remove(existingMarker);
            }
        }

        /// <summary>
        /// Copies the base marker attributes from one marker to another marker
        /// </summary>
        /// <param name="targetMarker">Marker to copy to</param>
        /// <param name="sourceMarker">Marker to copy from</param>
        private void CopyBaseMarkerAttributes(MapMarker targetMarker, MapMarker sourceMarker)
        {
            targetMarker.X = sourceMarker.X;
            targetMarker.Y = sourceMarker.Y;
            targetMarker.AddedInChapter = sourceMarker.AddedInChapter;
            targetMarker.ChapterPixelCoords = sourceMarker.ChapterPixelCoords;
            targetMarker.DeletedInChapter = sourceMarker.DeletedInChapter;
            targetMarker.Geometry = sourceMarker.Geometry;
            targetMarker.ExportName = sourceMarker.ExportName;
        }


        /// <summary>
        /// Returns the not implemented markers
        /// </summary>
        /// <param name="start">Start of the page</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Markers</returns>
        [ProducesResponseType(typeof(MarkerImplementationQueryResult), StatusCodes.Status200OK)]
        [Authorize(Roles = RoleNames.Karta)]
        [Authorize(Roles = RoleNames.ImplementationStatusTracker)]
        [HttpGet]
        public async Task<IActionResult> GetNotImplementedMarkers(int start, int pageSize)
        {
            GoNorthProject project = await _userProjectAccess.GetUserProject();
            Task<List<MarkerImplementationQueryResultObject>> queryTask;
            Task<int> countTask;
            queryTask = _mapDbAccess.GetNotImplementedMarkers(project.Id, start, pageSize);
            countTask = _mapDbAccess.GetNotImplementedMarkersCount(project.Id);
            Task.WaitAll(queryTask, countTask);

            MarkerImplementationQueryResult queryResult = new MarkerImplementationQueryResult();
            queryResult.Markers = queryTask.Result;
            queryResult.HasMore = start + queryResult.Markers.Count < countTask.Result;
            return Ok(queryResult);
        }


        /// <summary>
        /// Searches map markers
        /// </summary>
        /// <param name="searchPattern">Search term</param>
        /// <param name="start">Start of the page</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Markers</returns>
        [ProducesResponseType(typeof(NamedMarkerQueryResult), StatusCodes.Status200OK)]
        [Authorize(Roles = RoleNames.Karta)]
        [Authorize(Roles = RoleNames.Tale)]
        [Authorize(Roles = RoleNames.Kortisto)]
        [Authorize(Roles = RoleNames.Aika)]
        [HttpGet]
        public async Task<IActionResult> SearchMarkersByExportName(string searchPattern, int start, int pageSize)
        {
            GoNorthProject project = await _userProjectAccess.GetUserProject();
            List<KartaMapNamedMarkerQueryResult> markers = await _mapDbAccess.GetMarkersByExportName(project.Id, searchPattern);

            NamedMarkerQueryResult queryResult = new NamedMarkerQueryResult();
            queryResult.Markers = markers.Skip(start).Take(pageSize).ToList();
            queryResult.HasMore = start + queryResult.Markers.Count < markers.Count;
            return Ok(queryResult);
        }

        /// <summary>
        /// Returns a marker by id
        /// </summary>
        /// <param name="mapId">Map Id</param>
        /// <param name="markerId">Marker Id</param>
        /// <returns>Marker</returns>
        [ProducesResponseType(typeof(KartaMapNamedMarkerQueryResult), StatusCodes.Status200OK)]
        [Authorize(Roles = RoleNames.Karta)]
        [Authorize(Roles = RoleNames.Tale)]
        [Authorize(Roles = RoleNames.Kortisto)]
        [Authorize(Roles = RoleNames.Aika)]
        [HttpGet]
        public async Task<IActionResult> GetMarker(string mapId, string markerId)
        {
            KartaMapNamedMarkerQueryResult marker = await _mapDbAccess.GetMarkerById(mapId, markerId);
            return Ok(marker);
        }

    }
}