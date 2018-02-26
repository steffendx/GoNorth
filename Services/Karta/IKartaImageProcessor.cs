using System.Threading.Tasks;
using GoNorth.Data.Karta;
using Microsoft.AspNetCore.Http;

namespace GoNorth.Services.Karta
{
    /// <summary>
    /// Interface for Karta Image Processor
    /// </summary>
    public interface IKartaImageProcessor
    {
        /// <summary>
        /// Proccesses an image for a karta map
        /// </summary>
        /// <param name="map">Map for which to process</param>
        /// <param name="file">Uploaded image file</param>
        /// <returns>Task for the async task</returns>
        Task ProcessMapImage(KartaMap map, IFormFile file);
    }
}
