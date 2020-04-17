namespace GoNorth.Services.Export.Dialog
{
    /// <summary>
    /// Export Dialog Data Child
    /// </summary>
    public class ExportDialogDataChild
    {
        /// <summary>
        /// Id of the child node
        /// </summary>
        public int NodeChildId { get; set; }

        /// <summary>
        /// Child Node
        /// </summary>
        public ExportDialogData Child { get; set;}
    }
}