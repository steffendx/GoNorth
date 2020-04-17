using System;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util
{
    /// <summary>
    /// Attribute to provide a label for scriban export
    /// </summary>
    [AttributeUsage(AttributeTargets.Property)]
    public class ScribanExportValueLabel : Attribute
    {
    }
}