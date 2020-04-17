using System;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.Kortisto
{
    /// <summary>
    /// Kortisto Npc Daily Routine movement target
    /// </summary>
    public class KortistoNpcDailyRoutineMovementTarget : IImplementationComparable, ICloneable
    {
        /// <summary>
        /// Id of the map to which the movement target belongs
        /// </summary>
        public string MapId { get; set; }

        /// <summary>
        /// Latitude of the target
        /// </summary>
        [ValueCompareAttribute]
        public float Lat { get; set; }
        
        /// <summary>
        /// Longitude of the target
        /// </summary>
        [ValueCompareAttribute]
        public float Lng { get; set; }

        /// <summary>
        /// Name of the target
        /// </summary>
        [ValueCompareAttribute]
        public string Name { get; set; }

        /// <summary>
        /// Export Name of the target
        /// </summary>
        [ValueCompareAttribute]
        public string ExportName { get; set; }

        /// <summary>
        /// Clones the movement target
        /// </summary>
        /// <returns>Cloned movement target</returns>
        public object Clone()
        {
            return new KortistoNpcDailyRoutineMovementTarget {
                MapId = this.MapId,
                Lat = this.Lat,
                Lng = this.Lng,
                Name = this.Name,
                ExportName = this.ExportName
            };
        }
    }
}