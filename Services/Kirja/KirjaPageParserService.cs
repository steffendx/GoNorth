using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using GoNorth.Data.Kirja;

namespace GoNorth.Services.Kirja
{
    /// <summary>
    /// Service to parse kirja pages
    /// </summary>
    public class KirjaPageParserService : IKirjaPageParserService
    {
        /// <summary>
        /// Parsers that will be run
        /// </summary>
        private List<IKirjaParser> _Parser;

        /// <summary>
        /// Kirja Page Parser Service
        /// </summary>
        public KirjaPageParserService()
        {
            _Parser = new List<IKirjaParser>();
            _Parser.Add(new KirjaPageKirjaParser());
            _Parser.Add(new QuestKirjaParser());
            _Parser.Add(new NpcKirjaParser());
            _Parser.Add(new ItemKirjaParser());
            _Parser.Add(new ImageKirjaParser());
        }

        /// <summary>
        /// Parses a kirja page
        /// </summary>
        /// <param name="page">Page to parse</param>
        public void ParsePage(KirjaPage page)
        {
            foreach(IKirjaParser curParser in _Parser)
            {
                curParser.ParsePage(page);
            }
        }
    }
}
