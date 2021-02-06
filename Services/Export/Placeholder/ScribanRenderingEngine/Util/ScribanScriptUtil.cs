namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util
{
    /// <summary>
    /// Utility class to for Scriban script export
    /// </summary>
    public static class ScribanScriptUtil
    {
        /// <summary>
        /// Converts the script type
        /// </summary>
        /// <param name="scriptType">Script type to export</param>
        /// <returns>Export script type</returns>
        public static string ConvertScriptType(int scriptType)
        {
            if(scriptType == ExportConstants.ScriptType_Code)
            {
                return "Code";
            }
            else if(scriptType == ExportConstants.ScriptType_NodeGraph)
            {
                return "NodeGraph";
            }

            return "None";
        }

    }
}