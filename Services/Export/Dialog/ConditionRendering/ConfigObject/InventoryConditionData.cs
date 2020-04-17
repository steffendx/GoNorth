namespace GoNorth.Services.Export.Dialog.ConditionRendering.ConfigObject
{
    /// <summary>
    /// Inventory Condition Data
    /// </summary>
    public class InventoryConditionData
    {
        /// <summary>
        /// Compare Operator for at least
        /// </summary>
        public const int CompareOperator_AtLeast = 0;

        /// <summary>
        /// Compare Operator for at maximum
        /// </summary>
        public const int CompareOperator_AtMaximum = 1;


        /// <summary>
        /// Item Id
        /// </summary>
        public string ItemId { get; set; }

        /// <summary>
        /// Compare Operator
        /// </summary>
        public int Operator { get; set; }

        /// <summary>
        /// Compare Quantity
        /// </summary>
        public int Quantity { get; set; }
    }
}