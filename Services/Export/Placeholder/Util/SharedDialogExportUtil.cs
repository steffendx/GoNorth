using System.Linq;
using GoNorth.Data.Tale;

namespace GoNorth.Services.Export.Placeholder.Util
{
    /// <summary>
    /// Util class for dialog exporting
    /// </summary>
    public static class SharedDialogExportUtil
    {
        /// <summary>
        /// Returns true if a valid dialog exists, else false
        /// </summary>
        /// <param name="dialog">Dialog to check</param>
        /// <returns>true if a valid dialog exists, else false</returns>
        public static bool HasValidDialog(TaleDialog dialog)
        {
            if(dialog == null)
            {
                return false;
            }

            if(!dialog.NpcText.Any() && !dialog.PlayerText.Any() && !dialog.Choice.Any() && !dialog.Condition.Any() && !dialog.Action.Any() && !dialog.Reference.Any())
            {
                return false;
            }

            return true;
        }
    }
}