(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {

        /**
         * Node Shapes Base View Model
         * @class
         */
        DefaultNodeShapes.BaseViewModel = function()
        {
            this.nodeGraph = new ko.observable();
            this.nodePaper = new ko.observable();
        
            this.showConfirmNodeDeleteDialog = new ko.observable(false);
            this.deleteDeferred = null;

            this.errorOccured = new ko.observable(false);
        };

        DefaultNodeShapes.BaseViewModel.prototype = {

            /**
             * Adds a new node
             * 
             * @param {object} dropElement Element that was dropped
             * @param {float} x X-Drop Coordinate
             * @param {float} z X-Drop Coordinate
             */
            addNewNode: function(dropElement, x, y) {
                if(!this.nodeGraph() || !this.nodePaper())
                {
                    return;
                }

                var initOptions = this.calcNodeInitOptionsPosition(x, y);
                this.addNodeByType(dropElement.data("nodetype"), initOptions);
            },

            /**
             * Creates the node init options with the node position
             * 
             * @param {float} x X-Drop Coordinate
             * @param {float} z X-Drop Coordinate
             */
            calcNodeInitOptionsPosition: function(x, y) {
                var scale = this.nodePaper().scale();
                var translate = this.nodePaper().translate();
                var initOptions = {
                    position: { x: (x - translate.tx) / scale.sx, y: (y - translate.ty) / scale.sy }
                };
                return initOptions;
            },

            /**
             * Adds a new node by the type
             * 
             * @param {string} nodeType Type of the new node
             * @param {object} initOptions Init Options for the node
             */
            addNodeByType: function(nodeType, initOptions) {
                var newNode = GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().createNewNode(nodeType, initOptions);
                if(newNode == null)
                {
                    this.errorOccured(true);
                    return;
                }

                this.nodeGraph().addCells(newNode);
                this.setupNewNode(newNode);
            },

            /**
             * Prepares a new node
             * 
             * @param {object} newNode New Node to setup
             */
            setupNewNode: function(newNode) {
                newNode.attr(".inPorts circle/magnet", "passive");
                
                var self = this;
                newNode.onDelete = function() {
                    return self.onDelete();
                };
            },


            /**
             * Delete Callback if a user wants to delete a node
             */
            onDelete: function() {
                this.showConfirmNodeDeleteDialog(true);

                this.deleteDeferred = new jQuery.Deferred();
                return this.deleteDeferred.promise();
            },

            /**
             * Deletes the node for which the dialog is opened
             */
            deleteNode: function() {
                if(this.deleteDeferred)
                {
                    this.deleteDeferred.resolve();
                    this.deleteDeferred = null;
                }
                this.closeConfirmNodeDeleteDialog();
            },

            /**
             * Closes the confirm delete node dialog
             */
            closeConfirmNodeDeleteDialog: function() {
                if(this.deleteDeferred)
                {
                    this.deleteDeferred.reject();
                    this.deleteDeferred = null;
                }
                this.showConfirmNodeDeleteDialog(false);
            },

            /**
             * Sets the graph to readonly mode
             */
            setGraphToReadonly: function() {
                jQuery(".gn-nodeGraphContainer").find("input,textarea,select").prop("disabled", true);
                jQuery(".gn-nodeGraphContainer").find(".joint-cell").css("pointer-events", "none");
                jQuery(".gn-nodeGraphContainer").find(".gn-nodeDeleteOnReadonly").remove();
                jQuery(".gn-nodeGraphContainer").find(".gn-nodeNonClickableOnReadonly").css("pointer-events", "none");
            }
        };

    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));