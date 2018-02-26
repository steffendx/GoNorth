using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;

namespace GoNorth.Data.Karta
{
    /// <summary>
    /// Class for Image Access on the file system for Karta Maps
    /// </summary>
    public class KartaFileSystemImageAccess : BaseFileSystemAccess, IKartaImageAccess
    {
        /// <summary>
        /// Format of the tile image
        /// </summary>
        private const string TileImageFilenameFormat = "{0}_{1}_{2}.png";

        /// <summary>
        /// Format for the image raw format
        /// </summary>
        private const string RawImageFilenameFormat = "Raw{0}";

        /// <summary>
        /// Folder postfix for rollback images
        /// </summary>
        private const string RollbackFolderPostfix = "_Rollback";

        /// <summary>
        /// Blank Image name
        /// </summary>
        private const string BlankImageName = "blank.png";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="hostingEnvironment">Hosting Environment</param>
        public KartaFileSystemImageAccess(IHostingEnvironment hostingEnvironment) : base("MapImages", hostingEnvironment)
        {
        }

        /// <summary>
        /// Ensures that an empty map folder exists
        /// </summary>
        /// <param name="mapId">Id of the map for which a folder needs to exists</param>
        public void EnsureEmptyMapFolder(string mapId)
        {
            DeleteMapFolder(mapId);

            string folderName = GetMapFolder(mapId);
            Directory.CreateDirectory(folderName);
        }

        /// <summary>
        /// Creates an empty image for saving the raw uploaded image
        /// </summary>
        /// <param name="mapId">Map Id</param>
        /// <param name="originalFilename">Original Filename</param>
        /// <returns>Raw Uploaded image</returns>
        public Stream CreateRawImage(string mapId, string originalFilename)
        {
            string fileName = Path.Combine(GetMapFolder(mapId), string.Format(RawImageFilenameFormat, Path.GetExtension(originalFilename)));
            return new FileStream(fileName, FileMode.Create);
        }

        /// <summary>
        /// Creates a new empty tile image. The tile will be saved in png format to this stream.
        /// </summary>
        /// <param name="mapId">Id of the map</param>
        /// <param name="zoomLevel">Zoom Level of the tile</param>
        /// <param name="x">X Coordinate of the tile</param>
        /// <param name="y">Y Coordinate of the tile</param>
        /// <returns>Stream to write to</returns>
        public Stream CreateTileImage(string mapId, int zoomLevel, int x, int y)
        {
            string fileName = GetImageFilename(mapId, zoomLevel, x, y);
            return new FileStream(fileName, FileMode.Create);
        }

        /// <summary>
        /// Opens a tile image
        /// </summary>
        /// <param name="mapId">Id of the map</param>
        /// <param name="zoomLevel">Zoom Level of the tile</param>
        /// <param name="x">X Coordinate of the tile</param>
        /// <param name="y">Y Coordinate of the tile</param>
        /// <returns>Image stream</returns>
        public Stream OpenImage(string mapId, int zoomLevel, int x, int y)
        {
            string fileName = GetImageFilename(mapId, zoomLevel, x, y);
            if(File.Exists(fileName))
            {
                return File.OpenRead(fileName);
            }

            return OpenBlankImage();
        }

        /// <summary>
        /// Opens the blank tile image
        /// </summary>
        /// <returns>Blank tile image</returns> 
        public Stream OpenBlankImage()
        {
            string blankFileName = Path.Combine(GetFolder(), BlankImageName);
            return File.OpenRead(blankFileName);
        }

        /// <summary>
        /// Deletes a map folder if it exists
        /// </summary>
        /// <param name="mapId">Map Id</param>
        public void DeleteMapFolder(string mapId)
        {
            string folderName = GetMapFolder(mapId);
            if(Directory.Exists(folderName))
            {
                Directory.Delete(folderName, true);
            }
        }

        /// <summary>
        /// Returns the filename for a tile image
        /// </summary>
        /// <param name="mapId">Id of the map</param>
        /// <param name="zoomLevel">Zoom Level of the tile</param>
        /// <param name="x">X Coordinate of the tile</param>
        /// <param name="y">Y Coordinate of the tile</param>
        /// <returns>Filename for the tile image</returns>
        private string GetImageFilename(string mapId, int zoomLevel, int x, int y)
        {
            string folderName = GetMapFolder(mapId);
            string fileName = string.Format(TileImageFilenameFormat, zoomLevel, x, y);
            return Path.Combine(folderName, fileName);
        }

        /// <summary>
        /// Returns the name of a map folder
        /// </summary>
        /// <param name="mapId">Map Id</param>
        /// <returns>Map Folder</returns>
        private string GetMapFolder(string mapId)
        {
            return Path.Combine(GetFolder(), mapId);
        }


        /// <summary>
        /// Saves map iamges for rollback
        /// </summary>
        /// <param name="mapId">Map Id</param>
        public void SaveMapImagesForRollback(string mapId)
        {
            string folderName = GetMapFolder(mapId);
            if(Directory.Exists(folderName))
            {
                CleanRollbackMapImages(mapId);
                Directory.Move(folderName, folderName + RollbackFolderPostfix);
            }
        }

        /// <summary>
        /// Cleans the rollback map images
        /// </summary>
        /// <param name="mapId">Map Id</param>
        public void CleanRollbackMapImages(string mapId)
        {
            string folderName = GetMapFolder(mapId) + RollbackFolderPostfix;
            if(Directory.Exists(folderName))
            {
                Directory.Delete(folderName, true);
            }
        }

        /// <summary>
        /// Rolls the old map images back
        /// </summary>
        /// <param name="mapId">Map Id</param>
        public void RollbackMapImages(string mapId)
        {
            DeleteMapFolder(mapId);

            string folderName = GetMapFolder(mapId);
            if(Directory.Exists(folderName + RollbackFolderPostfix))
            {
                Directory.Move(folderName + RollbackFolderPostfix, folderName);
            }
        }
    }
}