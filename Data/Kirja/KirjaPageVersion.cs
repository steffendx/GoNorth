using System;
using System.Collections.Generic;

namespace GoNorth.Data.Kirja
{
    /// <summary>
    /// Kirja Page Version
    /// </summary>
    public class KirjaPageVersion : KirjaPage
    {
        /// <summary>
        /// Original Page Id
        /// </summary>
        public string OriginalPageId { get; set; }

        /// <summary>
        /// Number of the version
        /// </summary>
        public int VersionNumber { get; set; }
    }
}