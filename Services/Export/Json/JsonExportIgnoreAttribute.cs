using System;

namespace GoNorth.Services.Export.Json
{
    /// <summary>
    /// Attribute to mark something for not exporting in JSON
    /// </summary>
    [AttributeUsage(AttributeTargets.Property)]
    public class JsonExportIgnoreAttribute : Attribute
    {
    }
}