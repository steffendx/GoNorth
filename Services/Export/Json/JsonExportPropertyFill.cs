using System.Reflection;

namespace GoNorth.Services.Export.Json
{
    /// <summary>
    /// Utility class to fill properties of json export values
    /// </summary>
    public static class JsonExportPropertyFill
    {
        /// <summary>
        /// Fills the base properties of an object
        /// </summary>
        /// <param name="targetObject">Target object to fill</param>
        /// <param name="baseObject">Base object to take information from</param>
        public static void FillBaseProperties<TExtended, TBase>(TExtended targetObject, TBase baseObject)
        {
            PropertyInfo[] properties = baseObject.GetType().GetProperties();
            foreach(PropertyInfo curProperty in properties)
            {
                PropertyInfo derivedProperty = targetObject.GetType().GetProperty(curProperty.Name);
                if (derivedProperty != null)
                {
                    object value = curProperty.GetValue(baseObject);
                    derivedProperty.SetValue(targetObject, value);
                }
            }
        }
    }
}