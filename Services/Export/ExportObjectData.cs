using System;
using System.Collections.Generic;

namespace GoNorth.Services.Export
{
    /// <summary>
    /// Data of an object to export
    /// </summary>
    public class ExportObjectData
    {
        /// <summary>
        /// Export Data
        /// </summary>
        public Dictionary<string, object> ExportData { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        public ExportObjectData()
        {
            ExportData = new Dictionary<string, object>();
        }

        /// <summary>
        /// Clones the export data
        /// </summary>
        /// <returns>Cloned data</returns>
        public ExportObjectData Clone()
        {
            ExportObjectData clonedData = new ExportObjectData();
            foreach(string curKey in ExportData.Keys)
            {
                clonedData.ExportData.Add(curKey, CloneValue(ExportData[curKey]));
            }
            return clonedData;
        }

        /// <summary>
        /// Clones a value
        /// </summary>
        /// <param name="valueToClone">value to clone</param>
        /// <returns>Cloned value</returns>
        private object CloneValue(object valueToClone)
        {
            if(valueToClone is ICloneable)
            {
                return ((ICloneable)valueToClone).Clone();
            }

            return valueToClone;
        }
    }
}