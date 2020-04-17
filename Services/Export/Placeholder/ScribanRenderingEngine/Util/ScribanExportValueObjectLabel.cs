using System;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util
{
    /// <summary>
    /// Attribute to provide a label for scriban export object property
    /// </summary>
    [AttributeUsage(AttributeTargets.Property)]
    public class ScribanExportValueObjectLabel : Attribute
    {
    }
}