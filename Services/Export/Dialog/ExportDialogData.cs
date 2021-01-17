using System.Collections.Generic;
using GoNorth.Data.NodeGraph;
using GoNorth.Data.Tale;

namespace GoNorth.Services.Export.Dialog
{
    /// <summary>
    /// Export Dialog Data
    /// </summary>
    public class ExportDialogData
    {
        /// <summary>
        /// Node Type for player text
        /// </summary>
        private const string NodeType_PlayerText = "PlayerText";

        /// <summary>
        /// Node Type for npc text
        /// </summary>
        private const string NodeType_NpcText = "NpcText";

        /// <summary>
        /// Node Type for choice
        /// </summary>
        private const string NodeType_Choice = "Choice";
        
        /// <summary>
        /// Node Type for condition
        /// </summary>
        private const string NodeType_Condition = "Condition";
                
        /// <summary>
        /// Node Type for action
        /// </summary>
        private const string NodeType_Action = "Action";
                
        /// <summary>
        /// Node Type for reference
        /// </summary>
        private const string NodeType_Reference = "Reference";


        /// <summary>
        /// Node index, will be incremented for all steps
        /// </summary>
        public int NodeIndex { get; set; }

        /// <summary>
        /// Id of the export dialog data
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Player Text Lines
        /// </summary>
        public TextNode PlayerText { get; set; }

        /// <summary>
        /// Npc Text Lines
        /// </summary>
        public TextNode NpcText { get; set; }

        /// <summary>
        /// Choices
        /// </summary>
        public TaleChoiceNode Choice { get; set; }

        /// <summary>
        /// Actions
        /// </summary>
        public ActionNode Action { get; set; } 

        /// <summary>
        /// Conditions
        /// </summary>
        public ConditionNode Condition { get; set; } 

        /// <summary>
        /// Reference Data
        /// </summary>
        public ReferenceNode Reference { get; set; }


        /// <summary>
        /// Parents
        /// </summary>
        public List<ExportDialogData> Parents { get; set; }

        /// <summary>
        /// Children Dialog Data
        /// </summary>
        public List<ExportDialogDataChild> Children { get; set; }


        /// <summary>
        /// Name of the dialog step function
        /// </summary>
        public string DialogStepFunctionName { get; set; }

        /// <summary>
        /// true if the node was checked for an infinity loop and was not part of an infinity loop
        /// </summary>
        public bool NotPartOfInfinityLoop { get; set; }

        
        /// <summary>
        /// Constructor
        /// </summary>
        public ExportDialogData()
        {
            Parents = new List<ExportDialogData>();
            Children = new List<ExportDialogDataChild>();
            DialogStepFunctionName = string.Empty;
        }


        /// <summary>
        /// Returns the node type as string
        /// </summary>
        /// <returns>Node type as string</returns>
        public string GetNodeType()
        {
            if(PlayerText != null)
            {
                return NodeType_PlayerText;
            }
            else if(NpcText != null)
            {
                return NodeType_NpcText;
            }
            else if(Choice != null)
            {
                return NodeType_Choice;
            }
            else if(Condition != null)
            {
                return NodeType_Condition;
            }
            else if(Action != null)
            {
                return NodeType_Action;
            }
            else if(Reference != null)
            {
                return NodeType_Reference;
            }

            return string.Empty;
        }

        /// <summary>
        /// Returns all supported node types
        /// </summary>
        /// <returns>Node types</returns>
        public static string[] GetAllNodeTypes()
        {
            return new string[] {
                NodeType_PlayerText,
                NodeType_NpcText,
                NodeType_Choice,
                NodeType_Condition,
                NodeType_Action,
                NodeType_Reference
            };
        }
    }
}