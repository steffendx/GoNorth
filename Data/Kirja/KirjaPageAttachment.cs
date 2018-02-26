using System;
using System.Collections.Generic;

namespace GoNorth.Data.Kirja
{
    /// <summary>
    /// Kirja Page Attachment
    /// </summary>
    public class KirjaPageAttachment
    {
        /// <summary>
        /// Original Filename
        /// </summary>
        public string OriginalFilename { get; set; }

        /// <summary>
        /// Filename of the attachment
        /// </summary>
        public string Filename { get; set; }

        /// <summary>
        /// Mime Type of the attachment
        /// </summary>
        public string MimeType { get; set; }
    }
}