using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using GoNorth.Data.Aika;
using GoNorth.Data.Evne;
using GoNorth.Data.Karta;
using GoNorth.Data.Karta.Marker;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Styr;
using GoNorth.Data.Tale;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.ImplementationStatusCompare
{
    /// <summary>
    /// Implementation Status Comparer using the implementation status attributes
    /// </summary>
    public class GenericImplementationStatusComparer : IImplementationStatusComparer
    {
        /// <summary>
        /// Npc Db Access
        /// </summary>
        private readonly IKortistoNpcDbAccess _npcDbAccess;
        
        /// <summary>
        /// Npc Implementation Snapshot Db Access
        /// </summary>
        private readonly IKortistoNpcImplementationSnapshotDbAccess _npcSnapshotDbAccess;

        /// <summary>
        /// Item Db Access
        /// </summary>
        private readonly IStyrItemDbAccess _itemDbAccess;

        /// <summary>
        /// Item Implementation Snapshot Db Access
        /// </summary>
        private readonly IStyrItemImplementationSnapshotDbAccess _itemSnapshotDbAccess;

        /// <summary>
        /// Skill Db Access
        /// </summary>
        private readonly IEvneSkillDbAccess _skillDbAccess;

        /// <summary>
        /// Skill Implementation Snapshot Db Access
        /// </summary>
        private readonly IEvneSkillImplementationSnapshotDbAccess _skillSnapshotDbAccess;

        /// <summary>
        /// Dialog Db Access
        /// </summary>
        private readonly ITaleDbAccess _dialogDbAccess;

        /// <summary>
        /// Dialog Implementation Snapshot Db Access
        /// </summary>
        private readonly ITaleDialogImplementationSnapshotDbAccess _dialogSnapshotDbAccess;

        /// <summary>
        /// Quest Db Access
        /// </summary>
        private readonly IAikaQuestDbAccess _questDbAccess;

        /// <summary>
        /// Quest Implementation Snapshot Db Access
        /// </summary>
        private readonly IAikaQuestImplementationSnapshotDbAccess _questSnapshotDbAccess;

        /// <summary>
        /// Karta Map Db Access
        /// </summary>
        private readonly IKartaMapDbAccess _mapDbAccess;

        /// <summary>
        /// Karta Marker Implementation Snapshot Db Access
        /// </summary>
        private readonly IKartaMarkerImplementationSnapshotDbAccess _markerSnapshotDbAccess;

        /// <summary>
        /// Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="npcDbAccess">Npc Db Access</param>
        /// <param name="npcSnapshotDbAccess">Npc Implementation Snapshot Db Access</param>
        /// <param name="itemDbAccess">Item Db Access</param>
        /// <param name="itemSnapshotDbAccess">Item Implementation Snapshot Db Access</param>
        /// <param name="skillDbAccess">Skill Db Access</param>
        /// <param name="skillSnapshotDbAccess">Skill Implementation Snapshot Db Access</param>
        /// <param name="dialogDbAccess">Dialog Db Access</param>
        /// <param name="dialogSnapshotDbAccess">Dialog Implementation Snapshot Db Access</param>
        /// <param name="questDbAccess">Quest Db Access</param>
        /// <param name="questSnapshotDbAccess">Quest Implementation Snapshot Db Access</param>
        /// <param name="mapDbAccess">Map Db Access</param>
        /// <param name="markerSnapshotDbAccess">Marker Db Access</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public GenericImplementationStatusComparer(IKortistoNpcDbAccess npcDbAccess, IKortistoNpcImplementationSnapshotDbAccess npcSnapshotDbAccess, IStyrItemDbAccess itemDbAccess, IStyrItemImplementationSnapshotDbAccess itemSnapshotDbAccess, 
                                                   IEvneSkillDbAccess skillDbAccess, IEvneSkillImplementationSnapshotDbAccess skillSnapshotDbAccess, ITaleDbAccess dialogDbAccess, ITaleDialogImplementationSnapshotDbAccess dialogSnapshotDbAccess, 
                                                   IAikaQuestDbAccess questDbAccess, IAikaQuestImplementationSnapshotDbAccess questSnapshotDbAccess, IKartaMapDbAccess mapDbAccess, IKartaMarkerImplementationSnapshotDbAccess markerSnapshotDbAccess, IStringLocalizerFactory localizerFactory)
        {
            _npcDbAccess = npcDbAccess;
            _npcSnapshotDbAccess = npcSnapshotDbAccess;
            _itemDbAccess = itemDbAccess;
            _itemSnapshotDbAccess = itemSnapshotDbAccess;
            _skillDbAccess = skillDbAccess;
            _skillSnapshotDbAccess = skillSnapshotDbAccess;
            _dialogDbAccess = dialogDbAccess;
            _dialogSnapshotDbAccess = dialogSnapshotDbAccess;
            _questDbAccess = questDbAccess;
            _questSnapshotDbAccess = questSnapshotDbAccess;
            _mapDbAccess = mapDbAccess;
            _markerSnapshotDbAccess = markerSnapshotDbAccess;
            _localizer = localizerFactory.Create(typeof(GenericImplementationStatusComparer));
        }

        /// <summary>
        /// Compares an npc
        /// </summary>
        /// <param name="npcId">Id of the npc</param>
        /// <param name="currentNpc">Current npc, if null the npc will be loaded</param>
        /// <returns>Compare Result</returns>
        public async Task<CompareResult> CompareNpc(string npcId, KortistoNpc currentNpc = null)
        {
            if(currentNpc == null)
            {
                currentNpc = await _npcDbAccess.GetFlexFieldObjectById(npcId);
            }

            KortistoNpc oldNpc = await _npcSnapshotDbAccess.GetSnapshotById(npcId);
            
            return CompareObjects(currentNpc, oldNpc);
        }

        /// <summary>
        /// Compares an item
        /// </summary>
        /// <param name="itemId">Id of the item</param>
        /// <param name="currentItem">Current item, if null the item will be loaded</param>
        /// <returns>Compare Result</returns>
        public async Task<CompareResult> CompareItem(string itemId, StyrItem currentItem = null)
        {
            if(currentItem == null)
            {
                currentItem = await _itemDbAccess.GetFlexFieldObjectById(itemId);
            }

            StyrItem oldItem = await _itemSnapshotDbAccess.GetSnapshotById(itemId);
            
            return CompareObjects(currentItem, oldItem);
        }
        
        /// <summary>
        /// Compares a skill
        /// </summary>
        /// <param name="skillId">Id of the skill</param>
        /// <param name="currentSkill">Current skill, if null the skill will be loaded</param>
        /// <returns>Compare Result</returns>
        public async Task<CompareResult> CompareSkill(string skillId, EvneSkill currentSkill = null)
        {
            if(currentSkill == null)
            {
                currentSkill = await _skillDbAccess.GetFlexFieldObjectById(skillId);
            }

            EvneSkill oldSkill = await _skillSnapshotDbAccess.GetSnapshotById(skillId);
            
            return CompareObjects(currentSkill, oldSkill);
        }

        /// <summary>
        /// Compares a dialog
        /// </summary>
        /// <param name="dialogId">Id of the dialog</param>
        /// <param name="currentDialog">Current dialog, if null the dialog will be loaded</param>
        /// <returns>Compare Result</returns>
        public async Task<CompareResult> CompareDialog(string dialogId, TaleDialog currentDialog = null)
        {
            if(currentDialog == null)
            {
                currentDialog = await _dialogDbAccess.GetDialogById(dialogId);
            }

            TaleDialog oldDialog = await _dialogSnapshotDbAccess.GetSnapshotById(dialogId);
            
            return CompareObjects(currentDialog, oldDialog);
        }

        /// <summary>
        /// Compares a quest
        /// </summary>
        /// <param name="questId">Id of the quest</param>
        /// <param name="currentQuest">Current Quest, if null the quest will be loaded</param>
        /// <returns>Compare Result</returns>
        public async Task<CompareResult> CompareQuest(string questId, AikaQuest currentQuest = null)
        {
            if(currentQuest == null)
            {
                currentQuest = await _questDbAccess.GetQuestById(questId);
            }

            AikaQuest oldQuest = await _questSnapshotDbAccess.GetSnapshotById(questId);
            
            return CompareObjects(currentQuest, oldQuest);
        }

        /// <summary>
        /// Compares a marker
        /// </summary>
        /// <param name="mapId">Id of the map</param>
        /// <param name="markerId">Id of the marker</param>
        /// <param name="markerType">Type of the marker</param>
        /// <param name="currentMarker">Current marker, if null the marker will be loaded</param>
        /// <returns>Compare Result</returns>
        public async Task<CompareResult> CompareMarker(string mapId, string markerId, MarkerType markerType, IImplementationComparable currentMarker = null)
        {
            KartaMap loadingMap = null;
            if(currentMarker == null)
            {
                loadingMap = await _mapDbAccess.GetMapById(mapId);
            }

            IImplementationComparable oldMarker = null;
            if(markerType == MarkerType.Npc)
            {
                oldMarker = await _markerSnapshotDbAccess.GetNpcMarkerSnapshotById(markerId);
                if(loadingMap != null && loadingMap.NpcMarker != null)
                {
                    currentMarker = loadingMap.NpcMarker.First(m => m.Id == markerId);
                }
            }
            else if(markerType == MarkerType.Item)
            {
                oldMarker = await _markerSnapshotDbAccess.GetItemMarkerSnapshotById(markerId);
                if(loadingMap != null && loadingMap.ItemMarker != null)
                {
                    currentMarker = loadingMap.ItemMarker.First(m => m.Id == markerId);
                }
            }
            else if(markerType == MarkerType.MapChange)
            {
                oldMarker = await _markerSnapshotDbAccess.GetMapChangeMarkerSnapshotById(markerId);
                if(loadingMap != null && loadingMap.MapChangeMarker != null)
                {
                    currentMarker = loadingMap.MapChangeMarker.First(m => m.Id == markerId);
                }
            }
            else if(markerType == MarkerType.Quest)
            {
                oldMarker = await _markerSnapshotDbAccess.GetQuestMarkerSnapshotById(markerId);
                if(loadingMap != null && loadingMap.QuestMarker != null)
                {
                    currentMarker = loadingMap.QuestMarker.First(m => m.Id == markerId);
                }
            }
            
            return CompareObjects(currentMarker, oldMarker);
        }

        /// <summary>
        /// Compares two objects
        /// </summary>
        /// <param name="currentState">Current State of the object</param>
        /// <param name="oldState">Old State of the object</param>
        /// <returns>Compare results</returns>
        private CompareResult CompareObjects(IImplementationComparable currentState, IImplementationComparable oldState)
        {
            CompareResult result = new CompareResult();
            if(oldState == null)
            {
                result.DoesSnapshotExist = false;
                return result;
            }
            result.DoesSnapshotExist = true;
            
            // Check Data
            if(currentState.GetType() != oldState.GetType())
            {
                throw new ArgumentException();
            }

            result.CompareDifference.AddRange(CompareValues(currentState, oldState));
            result.CompareDifference.AddRange(CompareLists(currentState, oldState));

            return result;
        }

        /// <summary>
        /// Compares the values of two objects
        /// </summary>
        /// <param name="currentState">Current State of the object</param>
        /// <param name="oldState">Old State of the object</param>
        /// <returns>Compare results</returns>
        private List<CompareDifference> CompareValues(IImplementationComparable currentState, IImplementationComparable oldState)
        {
            List<CompareDifference> compareResults = new List<CompareDifference>();

            List<PropertyInfo> props = currentState.GetType().GetProperties().Where(prop => Attribute.IsDefined(prop, typeof(ValueCompareAttribute))).ToList();
            foreach(PropertyInfo curProperty in props)
            {
                object newValue = curProperty.GetValue(currentState);
                object oldValue = curProperty.GetValue(oldState);
                if(newValue == null && oldValue == null)
                {
                    continue;
                }

                ValueCompareAttribute compareAttribute = curProperty.GetCustomAttribute<ValueCompareAttribute>();

                if((newValue != null && oldValue == null) || (newValue == null && oldValue != null))
                {
                    compareResults.Add(BuildCompareDifference(curProperty.Name, newValue, oldValue, compareAttribute.LabelKey, compareAttribute.TextKey));
                }
                else if(newValue is IImplementationComparable && oldValue is IImplementationComparable)
                {
                    // Compare complex subobject
                    List<CompareDifference> differences = CompareValues((IImplementationComparable)newValue, (IImplementationComparable)oldValue);
                    if(differences.Any())
                    {
                        CompareDifference compareDifference = BuildCompareDifference(curProperty.Name, null, null, compareAttribute.LabelKey, compareAttribute.TextKey);
                        compareDifference.SubDifferences = differences;
                        compareResults.Add(compareDifference);
                    }
                }
                else if(!newValue.Equals(oldValue))
                {
                    compareResults.Add(BuildCompareDifference(curProperty.Name, newValue, oldValue, compareAttribute.LabelKey, compareAttribute.TextKey));
                }
            }

            return compareResults;
        }

        /// <summary>
        /// Compares the lists of two objects
        /// </summary>
        /// <param name="currentState">Current State of the object</param>
        /// <param name="oldState">Old State of the object</param>
        /// <returns>Compare results</returns>
        private List<CompareDifference> CompareLists(IImplementationComparable currentState, IImplementationComparable oldState)
        {
            List<CompareDifference> compareResults = new List<CompareDifference>();

            List<PropertyInfo> props = currentState.GetType().GetProperties().Where(prop => Attribute.IsDefined(prop, typeof(ListCompareAttribute))).ToList();
            foreach(PropertyInfo curProperty in props)
            {
                object newValue = curProperty.GetValue(currentState);
                object oldValue = curProperty.GetValue(oldState);
                if(newValue == null || oldValue == null)
                {
                    continue;
                }

                ListCompareAttribute compareAttribute = curProperty.GetCustomAttribute<ListCompareAttribute>();

                if((newValue != null && oldValue == null) || (newValue == null && oldValue != null))
                {
                    compareResults.Add(BuildCompareDifference(curProperty.Name, newValue, oldValue, compareAttribute.LabelKey, string.Empty));
                }
                else
                {
                    // Compare lists
                    IEnumerable newValueEnumerable = (IEnumerable)newValue;
                    IEnumerable oldValueEnumerable = (IEnumerable)oldValue;
                    if (curProperty.PropertyType.GenericTypeArguments.Any() && typeof(IImplementationListComparable).IsAssignableFrom(curProperty.PropertyType.GenericTypeArguments[0]))
                    {
                        CompareDifference difference = BuildCompareDifference(curProperty.Name, null, null, compareAttribute.LabelKey, string.Empty);
                        difference.SubDifferences.AddRange(CompareImplementationComparableList(newValueEnumerable, oldValueEnumerable));
                        if(difference.SubDifferences.Count > 0)
                        {
                            compareResults.Add(difference);
                        }
                    }
                }
            }

            return compareResults;
        }

        /// <summary>
        /// Compares two lists of Implementation comparables
        /// </summary>
        /// <param name="newValueEnumerable">New Value List</param>
        /// <param name="oldValueEnumerable">Old Value List</param>
        /// <returns>Compare Results</returns>
        private List<CompareDifference> CompareImplementationComparableList(IEnumerable newValueEnumerable, IEnumerable oldValueEnumerable)
        {
            List<CompareDifference> compareResults = new List<CompareDifference>();

            List<IImplementationListComparable> newComparables = newValueEnumerable.Cast<IImplementationListComparable>().ToList();
            List<IImplementationListComparable> oldComparables = oldValueEnumerable.Cast<IImplementationListComparable>().ToList();

            Dictionary<string, IImplementationListComparable> newObjectsDictionary = newComparables.ToDictionary(c => c.ListComparableId);
            Dictionary<string, IImplementationListComparable> oldObjectsDictionary = oldComparables.ToDictionary(c => c.ListComparableId);

            // Get deleted Objects
            List<IImplementationListComparable> deletedObjects = oldComparables.Where(c => !newObjectsDictionary.ContainsKey(c.ListComparableId)).ToList();
            compareResults.AddRange(deletedObjects.Select(l => BuildCompareDifference(null, null, l.ListComparableValue, string.Empty, string.Empty)));

            // Get new Objects
            List<IImplementationListComparable> newObjects = newComparables.Where(c => !oldObjectsDictionary.ContainsKey(c.ListComparableId)).ToList();
            compareResults.AddRange(newObjects.Select(l => BuildCompareDifference(null, l.ListComparableValue, null, string.Empty, string.Empty)));
            
            // Compare objects that exist in both
            List<IImplementationListComparable> sameObjects = newComparables.Where(c => oldObjectsDictionary.ContainsKey(c.ListComparableId)).ToList();
            foreach(IImplementationListComparable curNewObject in sameObjects)
            {
                IImplementationListComparable curOldObject = oldObjectsDictionary[curNewObject.ListComparableId];
                CompareResult subCompareResult = CompareObjects(curNewObject, curOldObject);
                if(subCompareResult.CompareDifference != null && subCompareResult.CompareDifference.Any())
                {
                    CompareDifference compareDifference = BuildCompareDifference(curNewObject.ListComparableValue, null, null, string.Empty, string.Empty);
                    compareDifference.SubDifferences = subCompareResult.CompareDifference;
                    compareResults.Add(compareDifference);
                }
            }

            return compareResults;
        }

        /// <summary>
        /// Builds a compare difference
        /// </summary>
        /// <param name="name">Name</param>
        /// <param name="newValue">New Value</param>
        /// <param name="oldValue">Old Value</param>
        /// <param name="labelKey">Text key used for the label</param>
        /// <param name="textKey">Text key used for the text</param>
        /// <returns>Compare Difference</returns>
        private CompareDifference BuildCompareDifference(string name, object newValue, object oldValue, string labelKey, string textKey)
        {
            CompareDifferenceValue nameValueDifference = new CompareDifferenceValue(name, CompareDifferenceValue.ValueResolveType.None);

            CompareDifferenceValue newValueDifference = null;
            if(newValue != null)
            {
                newValueDifference = new CompareDifferenceValue(newValue.ToString(), CompareDifferenceValue.ValueResolveType.None);
            }

            CompareDifferenceValue oldValueDifference = null;
            if(oldValue != null)
            {
                oldValueDifference = new CompareDifferenceValue(oldValue.ToString(), CompareDifferenceValue.ValueResolveType.None);
            }

            return BuildCompareDifference(nameValueDifference, newValueDifference, oldValueDifference, labelKey, textKey);
        }

        /// <summary>
        /// Builds a compare difference
        /// </summary>
        /// <param name="name">Name</param>
        /// <param name="newValue">New Value</param>
        /// <param name="oldValue">Old Value</param>
        /// <param name="labelKey">Text key used for the label</param>
        /// <param name="textKey">Text key used for the text</param>
        /// <returns>Compare Difference</returns>
        private CompareDifference BuildCompareDifference(CompareDifferenceValue name, CompareDifferenceValue newValue, CompareDifferenceValue oldValue, string labelKey, string textKey)
        {
            CompareDifference difference = new CompareDifference();
            difference.Name = name;
            difference.NewValue = newValue;
            difference.OldValue = oldValue;
            difference.LabelKey = labelKey;
            difference.TextKey = textKey;

            return difference;
        }


        /// <summary>
        /// Formates a compare result
        /// </summary>
        /// <param name="differences">Differences to format</param>
        /// <returns>Formatted differences</returns>
        public async Task<List<CompareDifferenceFormatted>> FormatCompareResult(List<CompareDifference> differences)
        {
            // Resolve Names
            await ResolveNames(differences);

            List<CompareDifferenceFormatted> formattedResult = new List<CompareDifferenceFormatted>();

            formattedResult.AddRange(FormatCompareResultArray(differences));

            return formattedResult;
        }

        /// <summary>
        /// Resolves names
        /// </summary>
        /// <param name="differences">Differences to resolve</param>
        private async Task ResolveNames(List<CompareDifference> differences)
        {
            List<string> itemIds = CollectIds(differences, CompareDifferenceValue.ValueResolveType.ResolveItemName);
            if(itemIds.Count > 0)
            {
                await ResolveItemNames(itemIds, differences);
            }

            List<string> skillIds = CollectIds(differences, CompareDifferenceValue.ValueResolveType.ResolveSkillName);
            if(skillIds.Count > 0)
            {
                await ResolveSkillNames(skillIds, differences);
            }

            ResolveLanguageKeys(differences);
        }

        /// <summary>
        /// Collects ids to resolve
        /// </summary>
        /// <param name="differences">Differences to collect from</param>
        /// <param name="valueType">Value type to collect</param>
        /// <returns>Ids</returns>
        private List<string> CollectIds(List<CompareDifference> differences, CompareDifferenceValue.ValueResolveType valueType)
        {
            List<string> ids = new List<string>();
            if(differences == null)
            {
                return ids;
            }

            foreach(CompareDifference curDifference in differences)
            {
                CollectId(ids, curDifference.Name, valueType);
                CollectId(ids, curDifference.NewValue, valueType);
                CollectId(ids, curDifference.OldValue, valueType);
                ids.AddRange(CollectIds(curDifference.SubDifferences, valueType));
            }

            return ids;
        }

        /// <summary>
        /// Collects an id from a Compare Difference Value
        /// </summary>
        /// <param name="ids">Id collection to push to</param>
        /// <param name="value">Compare Difference Value</param>
        /// <param name="valueType">Value Type to collect</param>
        private void CollectId(List<string> ids, CompareDifferenceValue value, CompareDifferenceValue.ValueResolveType valueType)
        {
            if(value == null || value.ResolveType != valueType)
            {
                return;
            }

            ids.Add(value.Value);
        }

        /// <summary>
        /// Resolves item names
        /// </summary>
        /// <param name="itemIds">Item Ids to resolve</param>
        /// <param name="differences">Differences to fill</param>
        private async Task ResolveItemNames(List<string> itemIds, List<CompareDifference> differences)
        {
            itemIds = itemIds.Distinct().ToList();
            List<StyrItem> items = await _itemDbAccess.ResolveFlexFieldObjectNames(itemIds);
            Dictionary<string, string> itemLookup = items.ToDictionary(i => i.Id, i => i.Name);
            FillObjectNames(differences, itemLookup, CompareDifferenceValue.ValueResolveType.ResolveItemName, "ItemWasDeleted");
        }

        /// <summary>
        /// Resolves skill names
        /// </summary>
        /// <param name="skillIds">Skill Ids to resolve</param>
        /// <param name="differences">Differences to fill</param>
        private async Task ResolveSkillNames(List<string> skillIds, List<CompareDifference> differences)
        {
            skillIds = skillIds.Distinct().ToList();
            List<EvneSkill> skills = await _skillDbAccess.ResolveFlexFieldObjectNames(skillIds);
            Dictionary<string, string> skillLookup = skills.ToDictionary(i => i.Id, i => i.Name);
            FillObjectNames(differences, skillLookup, CompareDifferenceValue.ValueResolveType.ResolveSkillName, "SkillWasDeleted");
        }

        /// <summary>
        /// Fills object names
        /// </summary>
        /// <param name="differences">Differences to fill</param>
        /// <param name="objectLookup">Dictionary to get object names from</param>
        /// <param name="objectType">Object type to resolve</param>
        /// <param name="deletedMessage">Message used if object was deleted</param>
        private void FillObjectNames(List<CompareDifference> differences, Dictionary<string, string> objectLookup, CompareDifferenceValue.ValueResolveType objectType, string deletedMessage)
        {
            if(differences == null)
            {
                return;
            }

            foreach(CompareDifference curDifference in differences)
            {
                FillSingleObjectName(curDifference.Name, objectLookup, objectType, deletedMessage);
                FillSingleObjectName(curDifference.NewValue, objectLookup, objectType, deletedMessage);
                FillSingleObjectName(curDifference.OldValue, objectLookup, objectType, deletedMessage);
                FillObjectNames(curDifference.SubDifferences, objectLookup, objectType, deletedMessage);
            }
        }

        /// <summary>
        /// Fills a single item name
        /// </summary>
        /// <param name="value">Value to fill</param>
        /// <param name="objectLookup">Dictionary to get object names from</param>
        /// <param name="objectType">Object type to resolve</param>
        /// <param name="deletedMessage">Message used if object was deleted</param>
        private void FillSingleObjectName(CompareDifferenceValue value, Dictionary<string, string> objectLookup, CompareDifferenceValue.ValueResolveType objectType, string deletedMessage)
        {
            if(value == null || value.ResolveType != objectType)
            {
                return;
            }

            if(objectLookup.ContainsKey(value.Value))
            {
                value.Value = objectLookup[value.Value];
            }
            else
            {
                value.Value = _localizer[deletedMessage];
            }
        }

        
        /// <summary>
        /// Resolves language keys for values
        /// </summary>
        /// <param name="differences">Differences to resolve</param>
        private void ResolveLanguageKeys(List<CompareDifference> differences)
        {
            if(differences == null)
            {
                return;
            }

            foreach(CompareDifference curDifference in differences)
            {
                ResolveSingleLanguageKey(curDifference.Name);
                ResolveSingleLanguageKey(curDifference.NewValue);
                ResolveSingleLanguageKey(curDifference.OldValue);

                ResolveLanguageKeys(curDifference.SubDifferences);
            }
        }

        /// <summary>
        /// Resolves a single language key
        /// </summary>
        /// <param name="value">Value to resolve</param>
        private void ResolveSingleLanguageKey(CompareDifferenceValue value)
        {
            if(value == null || value.ResolveType != CompareDifferenceValue.ValueResolveType.LanguageKey)
            {
                return;
            }

            value.Value = _localizer[value.Value].Value;
        }

        /// <summary>
        /// Formats a compare result array
        /// </summary>
        /// <param name="differences">Differences to format</param>
        /// <returns>Formatted Result</returns>
        private List<CompareDifferenceFormatted> FormatCompareResultArray(List<CompareDifference> differences)
        {
            List<CompareDifferenceFormatted> formattedResult = new List<CompareDifferenceFormatted>();
            foreach(CompareDifference curDifference in differences)
            {
                CompareDifferenceFormatted formatted = new CompareDifferenceFormatted();
                string differenceLabel = string.Empty;
                
                // Format label
                if(!string.IsNullOrEmpty(curDifference.LabelKey))
                {
                    differenceLabel = _localizer[curDifference.LabelKey];
                }
                else if(curDifference.Name != null)
                {
                    differenceLabel = curDifference.Name.Value;
                    LocalizedString localizedPropertyName = _localizer["PropertyName" + differenceLabel];
                    if(!localizedPropertyName.ResourceNotFound)
                    {
                        differenceLabel = localizedPropertyName.Value;
                    }
                }
                formatted.Label = differenceLabel;

                // Format special cases
                if(curDifference.Name != null && (curDifference.SubDifferences == null || curDifference.SubDifferences.Count == 0))
                {
                    if(string.IsNullOrEmpty(curDifference.LabelKey))
                    {
                        formatted.Label = _localizer["FieldValueChanged", differenceLabel].Value;
                    }

                    if(string.IsNullOrEmpty(curDifference.TextKey))
                    {
                        formatted.Text = _localizer["FieldValueChangedValueDisplay", curDifference.OldValue != null ? curDifference.OldValue.Value : _localizer["BlankValue"].Value, curDifference.NewValue != null ? curDifference.NewValue.Value : _localizer["BlankValue"].Value].Value;
                    }
                    else
                    {
                        formatted.Text = _localizer[curDifference.TextKey];
                    }
                }
                else if(curDifference.Name == null && curDifference.NewValue == null && curDifference.OldValue != null)
                {
                    formatted.Label = _localizer["EntryRemoved", curDifference.OldValue.Value].Value;
                }
                else if(curDifference.Name == null && curDifference.NewValue != null && curDifference.OldValue == null)
                {
                    formatted.Label = _localizer["EntryAdded", curDifference.NewValue.Value].Value;
                }
                else if(curDifference.Name != null && curDifference.SubDifferences != null && curDifference.SubDifferences.Count > 0 && string.IsNullOrEmpty(curDifference.LabelKey))
                {
                    formatted.Label = _localizer["EntryChanged", differenceLabel].Value;
                }

                formatted.SubDifferences.AddRange(FormatCompareResultArray(curDifference.SubDifferences));

                formattedResult.Add(formatted);
            }

            return formattedResult;
        }
    }
}