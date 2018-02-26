(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Serialize) {


            /// Link Name
            var linkName = "link";


            /**
             * Serializer
             * @class
             */
            var serializer = function()
            {
                this.nodeSerializer = {};
                this.nodeDeserializer = {};
            };

            serializer.prototype = {
                /**
                 * Adds a node serializer
                 * 
                 * @param {object} nodeSerializer Node Serializer
                 */
                addNodeSerializer: function(nodeSerializer) {
                    this.nodeSerializer[nodeSerializer.type] = nodeSerializer;
                    this.nodeDeserializer[nodeSerializer.serializeArrayName] = nodeSerializer;
                },

                /**
                 * Serializes a graph
                 * 
                 * @returns {object} Serialized Objects
                 */
                serializeGraph: function(graph) {
                    var serializedGraph = graph.toJSON();
                    var serializedObjects = {};
                    serializedObjects[linkName] = [];
                    for(var curCell = 0; curCell < serializedGraph.cells.length; ++curCell)
                    {
                        var cellType = serializedGraph.cells[curCell].type;
                        if(cellType == linkName)
                        {
                            serializedObjects[linkName].push(this.serializeLink(serializedGraph.cells[curCell]));
                        }
                        else
                        {
                            if(!this.nodeSerializer[cellType])
                            {
                                throw { error: "Unknown node type: " + cellType };
                            }

                            var targetArrayName = this.nodeSerializer[cellType].serializeArrayName;
                            if(!serializedObjects[targetArrayName])
                            {
                                serializedObjects[targetArrayName] = [];
                            }

                            serializedObjects[targetArrayName].push(this.nodeSerializer[cellType].serialize(serializedGraph.cells[curCell]));
                        }
                    }

                    return serializedObjects;
                },

                /**
                 * Deserializes a graph
                 * 
                 * @param {object} targetGraph Graph to fill
                 * @param {object} serializedData Serialized Data
                 * @param {function} nodeAddCallback Optional Callback function which gets called for each new node added to the graph
                 */
                deserializeGraph: function(targetGraph, serializedData, nodeAddCallback) {
                    targetGraph.clear();
                    for(var curNodeCollection in serializedData)
                    {
                        if(!this.nodeDeserializer[curNodeCollection])
                        {
                            continue;
                        }

                        var nodeCollection = serializedData[curNodeCollection];
                        if(!nodeCollection)
                        {
                            continue;
                        }

                        for(var curNode = 0; curNode < nodeCollection.length; ++curNode)
                        {
                            var newNode = this.nodeDeserializer[curNodeCollection].deserialize(nodeCollection[curNode]);
                            targetGraph.addCell(newNode);
                            if(typeof nodeAddCallback === "function")
                            {
                                nodeAddCallback(newNode);
                            }
                        }
                    }

                    var linkCollection = serializedData[linkName];
                    if(linkCollection)
                    {
                        for(var curLink = 0; curLink < linkCollection.length; ++curLink)
                        {
                            var newLink = this.deserializeLink(linkCollection[curLink]);
                            targetGraph.addCell(newLink);
                        }
                    }
                },


                /**
                 * Serializes a link
                 * 
                 * @param {object} linkObject
                 */
                serializeLink: function(linkObject) {
                    var serializedLink = {
                        sourceNodeId: linkObject.source.id,
                        sourceNodePort: linkObject.source.port,
                        targetNodeId: linkObject.target.id,
                        targetNodePort: linkObject.target.port,
                        vertices: linkObject.vertices
                    };

                    return serializedLink;
                },

                /**
                 * Deserializes a link
                 * 
                 * @param {object} linkObject
                 */
                deserializeLink: function(serializedLink) {
                    var linkObject = DefaultNodeShapes.Connections.createDefaultLink({
                        source: 
                        { 
                            id: serializedLink.sourceNodeId,
                            port: serializedLink.sourceNodePort
                        },
                        target: 
                        { 
                            id: serializedLink.targetNodeId,
                            port: serializedLink.targetNodePort
                        },
                        vertices: serializedLink.vertices
                    });

                    return linkObject;
                },



                /**
                 * Creates a new node
                 * 
                 * @param {string} type Node Type
                 * @param {object} initOptions Init Options
                 * @returns {object} New Node
                 */
                createNewNode: function(type, initOptions) {
                    if(!this.nodeSerializer[type])
                    {
                        return null;
                    }

                    return this.nodeSerializer[type].createNewNode(initOptions);
                }
            };


            var serializerInstance = new serializer();

            /**
             * Returns the serializer instance
             * 
             * @returns {object} Node Graph Serializer
             */
            Serialize.getNodeSerializerInstance = function() {
                return serializerInstance;
            }

        }(DefaultNodeShapes.Serialize = DefaultNodeShapes.Serialize || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));