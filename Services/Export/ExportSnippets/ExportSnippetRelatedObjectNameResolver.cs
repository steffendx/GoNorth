using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using GoNorth.Data.Evne;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Styr;

namespace GoNorth.Services.Export.ExportSnippets
{
    /// <summary>
    /// Service that can resolve names for related objects of export snippets
    /// </summary>
    public class ExportSnippetRelatedObjectNameResolver : IExportSnippetRelatedObjectNameResolver
    {
        /// <summary>
        /// Npc Db Access
        /// </summary>
        private readonly IKortistoNpcDbAccess _npcDbAccess; 
        
        /// <summary>
        /// Item Db Access
        /// </summary>
        private readonly IStyrItemDbAccess _itemDbAccess; 
        
        /// <summary>
        /// Skill Db Access
        /// </summary>
        private readonly IEvneSkillDbAccess _skillDbAccess; 
        
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="npcDbAccess">Npc Db Access</param>
        /// <param name="itemDbAccess">Item Db Access</param>
        /// <param name="skillDbAccess">Skill Db Access</param>
        public ExportSnippetRelatedObjectNameResolver(IKortistoNpcDbAccess npcDbAccess, IStyrItemDbAccess itemDbAccess, IEvneSkillDbAccess skillDbAccess)
        {
            _npcDbAccess = npcDbAccess;
            _itemDbAccess = itemDbAccess;
            _skillDbAccess = skillDbAccess;   
        }
        
        /// <summary>
        /// Resolves the reference for object export snippets
        /// </summary>
        /// <param name="exportSnippets">Export snippets</param>
        /// <param name="includeNpcs">True if the npcs should be included</param>
        /// <param name="includeItems">True if the items should be included</param>
        /// <param name="includeSkills">True if the skills should be included</param>
        /// <returns>References</returns>
        public async Task<List<ObjectExportSnippetReference>> ResolveExportSnippetReferences(List<ObjectExportSnippet> exportSnippets, bool includeNpcs, bool includeItems, bool includeSkills)
        {
            Task<List<KortistoNpc>> npcsTask = _npcDbAccess.ResolveFlexFieldObjectNames(exportSnippets.Select(o => o.ObjectId).ToList());
            Task<List<StyrItem>> itemsTask = _itemDbAccess.ResolveFlexFieldObjectNames(exportSnippets.Select(o => o.ObjectId).ToList());
            Task<List<EvneSkill>> skillsTask = _skillDbAccess.ResolveFlexFieldObjectNames(exportSnippets.Select(o => o.ObjectId).ToList());

            await Task.WhenAll(npcsTask, itemsTask, skillsTask);

            Dictionary<string, string> npcs;
            if(includeNpcs)
            {
                npcs = npcsTask.Result.ToDictionary(n => n.Id, n => n.Name);
            }
            else
            {
                npcs = new Dictionary<string, string>();
            }

            Dictionary<string, string> items;
            if(includeItems)
            {
                items = itemsTask.Result.ToDictionary(i => i.Id, i => i.Name);
            }
            else
            {
                items = new Dictionary<string, string>();
            }

            Dictionary<string, string> skills;
            if(includeSkills)
            {
                skills = skillsTask.Result.ToDictionary(s => s.Id, s => s.Name);
            }
            else
            {
                skills = new Dictionary<string, string>();
            }

            List<ObjectExportSnippetReference> references = new List<ObjectExportSnippetReference>();
            foreach(ObjectExportSnippet snippet in exportSnippets)
            {
                string objectName = string.Empty;
                string objectType = string.Empty;
                if(npcs.ContainsKey(snippet.ObjectId))
                {
                    objectName = npcs[snippet.ObjectId];
                    objectType = ExportConstants.ExportObjectTypeNpc;
                }
                else if(items.ContainsKey(snippet.ObjectId))
                {
                    objectName = items[snippet.ObjectId];
                    objectType = ExportConstants.ExportObjectTypeItem;
                }
                else if(skills.ContainsKey(snippet.ObjectId))
                {
                    objectName = skills[snippet.ObjectId];
                    objectType = ExportConstants.ExportObjectTypeSkill;
                }
                else
                {
                    continue;
                }

                ObjectExportSnippetReference referenceResult = new ObjectExportSnippetReference();
                referenceResult.ObjectId = snippet.ObjectId;
                referenceResult.ObjectName = objectName;
                referenceResult.ObjectType = objectType;
                referenceResult.ExportSnippet = snippet.SnippetName;
                references.Add(referenceResult);
            }

            return references;
        }
    }
}