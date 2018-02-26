using System.IO;

namespace GoNorth.Data.Karta
{
    /// <summary>
    /// Interface for Image Access for Karta Map Images
    /// </summary>
    public interface IKartaImageAccess
    {
        /// <summary>
        /// Ensures that an empty map folder exists
        /// </summary>
        /// <param name="mapId">Id of the map for which a folder needs to exists</param>
        void EnsureEmptyMapFolder(string mapId);

        /// <summary>
        /// Creates an empty image for saving the raw uploaded image
        /// </summary>
        /// <param name="mapId">Map Id</param>
        /// <param name="originalFilename">Original Filename</param>
        /// <returns>Raw Uploaded image</returns>
        Stream CreateRawImage(string mapId, string originalFilename);

        /// <summary>
        /// Creates a new empty tile image. The tile will be saved in png format to this stream.
        /// </summary>
        /// <param name="mapId">Id of the map</param>
        /// <param name="zoomLevel">Zoom Level of the tile</param>
        /// <param name="x">X Coordinate of the tile</param>
        /// <param name="y">Y Coordinate of the tile</param>
        /// <returns>Stream to write to</returns>
        Stream CreateTileImage(string mapId, int zoomLevel, int x, int y);

        /// <summary>
        /// Opens a tile image
        /// </summary>
        /// <param name="mapId">Id of the map</param>
        /// <param name="zoomLevel">Zoom Level of the tile</param>
        /// <param name="x">X Coordinate of the tile</param>
        /// <param name="y">Y Coordinate of the tile</param>
        /// <returns>Image stream</returns>
        Stream OpenImage(string mapId, int zoomLevel, int x, int y);

        /// <summary>
        /// Opens the blank tile image
        /// </summary>
        /// <returns>Blank tile image</returns>
        Stream OpenBlankImage();

        /// <summary>
        /// Deletes a map folder if it exists
        /// </summary>
        /// <param name="mapId">Map Id</param>
        void DeleteMapFolder(string mapId);


        /// <summary>
        /// Saves map iamges for rollback
        /// </summary>
        /// <param name="mapId">Map Id</param>
        void SaveMapImagesForRollback(string mapId);

        /// <summary>
        /// Cleans the rollback map images
        /// </summary>
        /// <param name="mapId">Map Id</param>
        void CleanRollbackMapImages(string mapId);

        /// <summary>
        /// Rolls the old map images back
        /// </summary>
        /// <param name="mapId">Map Id</param>
        void RollbackMapImages(string mapId);
    }
}