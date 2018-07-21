using System.Threading.Tasks;
using GoNorth.Data.Karta;
using Microsoft.AspNetCore.Http;

namespace GoNorth.Services.Karta
{
    /// <summary>
    /// Interface for Karta Marker Label Sync
    /// </summary>
    public interface IKartaMarkerLabelSync
    {
        /// <summary>
        /// Syncs the labels of the markers
        /// </summary>
        /// <returns>Task</returns>
        Task SyncMarkerLabels();
    }
}
