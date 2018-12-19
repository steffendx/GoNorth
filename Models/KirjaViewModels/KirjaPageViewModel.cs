namespace GoNorth.Models.KirjaViewModels
{
    /// <summary>
    /// Kirja Page Viewmodel
    /// </summary>
    public class KirjaPageViewModel
    {
        /// <summary>
        /// Allowed Attachment Mime Types
        /// </summary>
        public string AllowedAttachmentMimeTypes { get; set; }

        /// <summary>
        /// true if versioning is used, else false
        /// </summary>
        public bool IsUsingVersioning { get; set; }
    }
}