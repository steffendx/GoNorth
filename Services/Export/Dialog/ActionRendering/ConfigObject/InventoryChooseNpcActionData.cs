namespace GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject
{
    /// <summary>
    /// Inventory choose npc action data
    /// </summary>
    public class InventoryChooseNpcActionData
    {
        /// <summary>
        /// Item Id
        /// </summary>
        public string ItemId { get; set; }
        
        /// <summary>
        /// Npc Id
        /// </summary>
        public string NpcId { get; set; }

        /// <summary>
        /// Quantity
        /// </summary>
        public int? Quantity { get; set; }
    }
}