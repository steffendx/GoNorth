using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Karta;
using GoNorth.Data.Karta.Marker;
using GoNorth.Data.Kirja;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Styr;
using Microsoft.AspNetCore.Http;

namespace GoNorth.Services.Karta
{
    /// <summary>
    /// Karta Marker Label Sync
    /// </summary>
    public class KartaMarkerLabelSync : IKartaMarkerLabelSync
    {
        /// <summary>
        /// Karta Map Db Access
        /// </summary>
        private readonly IKartaMapDbAccess _kartaMapDbAccess;

        /// <summary>
        /// Kirja Page Db Access
        /// </summary>
        private readonly IKirjaPageDbAccess _kirjaPageDbAccess;

        /// <summary>
        /// Kortisto Npc Db Access
        /// </summary>
        private readonly IKortistoNpcDbAccess _kortistoNpcDbAccess;

        /// <summary>
        /// Styr Item Db Access
        /// </summary>
        private readonly IStyrItemDbAccess _styrItemDbAccess;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="kartaMapDbAccess">Karta Map Db Access</param>
        /// <param name="kirjaPageDbAccess">Kirja Page Db Access</param>
        /// <param name="npcDbAccess">Npc Db Access</param>
        /// <param name="itemDbAccess">Item Db Access</param>
        public KartaMarkerLabelSync(IKartaMapDbAccess kartaMapDbAccess, IKirjaPageDbAccess kirjaPageDbAccess, IKortistoNpcDbAccess npcDbAccess, IStyrItemDbAccess itemDbAccess)
        {
            _kartaMapDbAccess = kartaMapDbAccess;
            _kirjaPageDbAccess = kirjaPageDbAccess;
            _kortistoNpcDbAccess = npcDbAccess;
            _styrItemDbAccess = itemDbAccess;
        }

        /// <summary>
        /// Syncs the labels of the markers
        /// </summary>
        /// <returns>Task</returns>
        public async Task SyncMarkerLabels()
        {
            List<KartaMap> maps = await _kartaMapDbAccess.GetAllMaps();
            foreach(KartaMap curMap in maps)
            {
                await SyncKirjaMarkerLabels(curMap);
                await SyncKortistoMarkerLabels(curMap);
                await SyncStyrMarkerLabels(curMap);
                await SyncKartaMapChangeMarkerLabels(curMap);

                await _kartaMapDbAccess.UpdateMap(curMap);
            }
        }

        /// <summary>
        /// Syncs kirja marker label
        /// </summary>
        /// <param name="map">Map To sync</param>
        /// <returns>Task</returns>
        private async Task SyncKirjaMarkerLabels(KartaMap map)
        {
            if(map.KirjaPageMarker == null)
            {
                return;
            }

            foreach(KirjaPageMapMarker curMarker in map.KirjaPageMarker)
            {
                KirjaPage curPage = await _kirjaPageDbAccess.GetPageById(curMarker.PageId);
                if(curPage == null)
                {
                    continue;
                }

                curMarker.PageName = curPage.Name;
            }
        }

        /// <summary>
        /// Syncs kortisto marker label
        /// </summary>
        /// <param name="map">Map To sync</param>
        /// <returns>Task</returns>
        private async Task SyncKortistoMarkerLabels(KartaMap map)
        {
            if(map.NpcMarker == null)
            {
                return;
            }

            foreach(NpcMapMarker curMarker in map.NpcMarker)
            {
                KortistoNpc curNpc = await _kortistoNpcDbAccess.GetFlexFieldObjectById(curMarker.NpcId);
                if(curNpc == null)
                {
                    continue;
                }

                curMarker.NpcName = curNpc.Name;
            }
        }

        /// <summary>
        /// Syncs styr marker label
        /// </summary>
        /// <param name="map">Map To sync</param>
        /// <returns>Task</returns>
        private async Task SyncStyrMarkerLabels(KartaMap map)
        {
            if(map.ItemMarker == null)
            {
                return;
            }

            foreach(ItemMapMarker curMarker in map.ItemMarker)
            {
                StyrItem curItem = await _styrItemDbAccess.GetFlexFieldObjectById(curMarker.ItemId);
                if(curItem == null)
                {
                    continue;
                }

                curMarker.ItemName = curItem.Name;
            }
        }


        /// <summary>
        /// Syncs the karta map change marker labels
        /// </summary>
        /// <param name="map">Map To sync</param>
        /// <returns>Task</returns>
        private async Task SyncKartaMapChangeMarkerLabels(KartaMap map)
        {
            if(map.MapChangeMarker == null)
            {
                return;
            }

            foreach(MapChangeMapMarker curMarker in map.MapChangeMarker)
            {
                KartaMap curMap = await _kartaMapDbAccess.GetMapById(curMarker.MapId);
                if(curMap == null)
                {
                    continue;
                }

                curMarker.MapName = curMap.Name;
            }
        }
    }
}
