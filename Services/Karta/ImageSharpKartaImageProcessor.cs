using System;
using System.IO;
using System.Threading.Tasks;
using GoNorth.Data.Karta;
using Microsoft.AspNetCore.Http;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

namespace GoNorth.Services.Karta
{
    /// <summary>
    /// ImageSharp Karta Image Processor
    /// </summary>
    public class ImageSharpKartaImageProcessor : IKartaImageProcessor
    {
        /// <summary>
        /// Target Tile Size
        /// </summary>
        private const int TileSize = 256;

        /// <summary>
        /// Tile Size pwo of two (2^x = TileSize)
        /// </summary>
        private const int TilePowOfTwo = 8;


        /// <summary>
        /// Image Access
        /// </summary>
        private readonly IKartaImageAccess _imageAccess;

        /// <summary>
        /// Constrcturo
        /// </summary>
        /// <param name="imageAccess">Image Access</param>
        public ImageSharpKartaImageProcessor(IKartaImageAccess imageAccess)
        {
            _imageAccess = imageAccess;
        }

        /// <summary>
        /// Proccesses an image for a karta map
        /// </summary>
        /// <param name="map">Map for which to process</param>
        /// <param name="file">Uploaded image file</param>
        /// <returns>Task for the async task</returns>
        public async Task ProcessMapImage(KartaMap map, IFormFile file)
        {
            _imageAccess.EnsureEmptyMapFolder(map.Id);

            await SaveRawImage(map, file);

            using(Image<Rgba32> image = OpenRawImage(file))
            {
                DetermineMapImageValues(map, image);
                EnsurePowerOfTwo(map, image);

                for(int curZoomLevel = 0; curZoomLevel <= map.MaxZoom; ++curZoomLevel)
                {
                    GenerateTiles(map, image, curZoomLevel);
                }
            }
        }

        /// <summary>
        /// Saves the raw image
        /// </summary>
        /// <param name="map">Map for which to process</param>
        /// <param name="file">Uploaded image file</param>
        /// <returns>Task for the async task</returns>
        private async Task SaveRawImage(KartaMap map, IFormFile file)
        {
            using(Stream saveStream = _imageAccess.CreateRawImage(map.Id, file.FileName))
            {
                await file.CopyToAsync(saveStream);
            }
        }

        /// <summary>
        /// Opens the raw image
        /// </summary>
        /// <param name="file">Uploaded image file</param>
        /// <returns>Raw Image</returns>
        private Image<Rgba32> OpenRawImage(IFormFile file)
        {
            using(Stream imageStream = file.OpenReadStream())
            {
                Image<Rgba32> rawImage = Image.Load<Rgba32>(imageStream);
                return rawImage;
            }
        }

        /// <summary>
        /// Determines the map image values (MaxZoom, Size)
        /// </summary>
        /// <param name="map">Map to fill with values</param>
        /// <param name="image">Image to check</param>
        private void DetermineMapImageValues(KartaMap map, Image<Rgba32> image)
        {
            map.Width = image.Width;
            map.Height = image.Height;
            
            int zoomLevels = 0;
            int zoomLevelSize = Math.Max(map.Width, map.Height);
            while(zoomLevelSize > TileSize)
            {
                zoomLevelSize = zoomLevelSize / 2;
                ++zoomLevels;
            }
            map.MaxZoom = zoomLevels;
        }

        /// <summary>
        /// Ensures an image has a power of two size
        /// </summary>
        /// <param name="map">Map which is being processed</param>
        /// <param name="image">Image to format</param>
        private void EnsurePowerOfTwo(KartaMap map, Image<Rgba32> image)
        {
            int targetSize = (int)Math.Pow(2, TilePowOfTwo + map.MaxZoom);

            ResizeOptions fillOptions = new ResizeOptions();
            fillOptions.Mode = ResizeMode.BoxPad;
            fillOptions.Position = AnchorPositionMode.TopLeft;
            fillOptions.Size = new Size(targetSize, targetSize);

            image.Mutate(i => i.Resize(fillOptions));
        }

        /// <summary>
        /// Generates the tiles for a zoom level
        /// </summary>
        /// <param name="map">Map</param>
        /// <param name="image">Image</param>
        /// <param name="zoomLevel">Zoom Level</param>
        private void GenerateTiles(KartaMap map, Image<Rgba32> image, int zoomLevel)
        {
            int maxImageSize = (int)Math.Pow(2, TilePowOfTwo + map.MaxZoom);
            int imageTargetSize = (int)Math.Pow(2, TilePowOfTwo + zoomLevel);

            int originalImageWidth = (int)(((float)map.Width / maxImageSize) * imageTargetSize);
            int originalImageHeight = (int)(((float)map.Height / maxImageSize) * imageTargetSize);

            int tileCount = (int)Math.Pow(2, zoomLevel);
            using(Image<Rgba32> resizedImage = image.Clone())
            {
                resizedImage.Mutate(i => i.Resize(imageTargetSize, imageTargetSize));
                for(int curX = 0; curX < tileCount; ++curX)
                {
                    for(int curY = 0; curY < tileCount; ++curY)
                    {
                        if((curX + 1) * TileSize - originalImageWidth > TileSize)
                        {
                            return;
                        }
                        if((curY + 1) * TileSize - originalImageHeight > TileSize)
                        {
                            break;
                        }

                        SaveTileImage(map, resizedImage, zoomLevel, curX, curY);
                    }    
                }
            }
        }

        /// <summary>
        /// Saves a tile image
        /// </summary>
        /// <param name="map">Map</param>
        /// <param name="resizedImage">Resized image for the zoom level</param>
        /// <param name="zoomLevel">Zoom Level</param>
        /// <param name="x">X</param>
        /// <param name="y">Y</param>
        private void SaveTileImage(KartaMap map, Image<Rgba32> resizedImage, int zoomLevel, int x, int y)
        {
            using(Image<Rgba32> cropImage = resizedImage.Clone())
            {
                cropImage.Mutate(i => i.Crop(new Rectangle(x * TileSize, y * TileSize, TileSize, TileSize)));
                using(Stream imageSaveStream = _imageAccess.CreateTileImage(map.Id, zoomLevel, x, y))
                {
                    cropImage.Save(imageSaveStream, new PngEncoder());
                }
            }
        }
    }
}
