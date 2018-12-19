(function(GoNorth) {
    "use strict";
    (function(BindingHandlers) {

        if(typeof ko !== "undefined")
        {
            /**
             * Modal Binding Handler
             */
            ko.bindingHandlers.modal = {
                init: function (element, valueAccessor) {
                    jQuery(element).modal({
                        show: false
                    });
            
                    var value = valueAccessor();
                    if (ko.isObservable(value)) {
                        jQuery(element).on("hide.bs.modal", function() {
                            value(false);
                        });
                    }

                    jQuery(element).on('shown.bs.modal', function () {
                        jQuery(element).find("input[type=text],textarea,select").filter(":visible:first").focus()
                    });
                },
                update: function (element, valueAccessor) {
                    var value = valueAccessor();
                    if (ko.utils.unwrapObservable(value)) {
                        jQuery(element).modal("show");
                    } else {
                        jQuery(element).modal("hide");
                    }
                }
            },

            /**
             * Enter Pressed Binding Handler
             */
            ko.bindingHandlers.enterPressed = {
                init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var callbackFunction = valueAccessor();
                    if(typeof callbackFunction != "function")
                    {
                        callbackFunction = null;
                    }

                    jQuery(element).keydown(function(e) {
                        if(e.which == 13) 
                        {
                            if(callbackFunction)
                            {
                                // Unfocus elements to ensure databinding
                                jQuery(":focus").blur();
                                if(bindingContext.$data)
                                {
                                    callbackFunction.apply(bindingContext.$data);
                                }
                                else
                                {
                                    callbackFunction();
                                }
                            }

                            e.preventDefault();
                        }
                    });
                }
            };

            /**
             * Richtext Binding Handler
             */
            ko.bindingHandlers.richText = {
                init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var options = {};

                    var value = valueAccessor();
                    var valueToInit = value;
                    if (ko.isObservable(value)) {
                        valueToInit = value();
                        options.events = {
                            change: function(newHtml) {
                                value._blockUpdate = true;
                                try
                                {
                                    value(newHtml);
                                    value._blockUpdate = false;
                                }
                                catch(e)
                                {
                                    value._blockUpdate = false;
                                }
                            }
                        }
                    }

                    if(allBindings.get("richTextAddditionalButtons"))
                    {
                        options.additionalButtons = allBindings.get("richTextAddditionalButtons").apply(bindingContext.$data);
                    }

                    if(allBindings.get("richTextImageUploadUrl") && allBindings.get("richTextImageUploadSuccess"))
                    {
                        var uploadSuccessCallback = allBindings.get("richTextImageUploadSuccess");
                        options.imageUploadUrl = allBindings.get("richTextImageUploadUrl");
                        options.fileUploadSuccess = function(data) { return uploadSuccessCallback.apply(bindingContext.$data, [ data ]); }

                        if(allBindings.get("richTextAfterImageInserted")) {
                            var afterImageInsertedCallback = allBindings.get("richTextAfterImageInserted");
                            options.afterFileInserted = function() { afterImageInsertedCallback.apply(bindingContext.$data); }
                        }
                    }

                    if(allBindings.get("richTextAddditionalImageUploadError"))
                    {
                        var uploadErrorCallback = allBindings.get("richTextAddditionalImageUploadError");
                        options.fileUploadError = function(errorMessage, xhr) { uploadErrorCallback.apply(bindingContext.$data, [ errorMessage, xhr ]); }
                    }            

                    jQuery(element).wysiwyg(options);
                    jQuery(element).addClass("wysiwgEditor");
                    if(valueToInit) {
                        jQuery(element).html(valueToInit);
                    }
                },
                update: function (element, valueAccessor) {
                    var value = valueAccessor();
                    var blockUpdate = value._blockUpdate;
                    if(ko.isObservable(value))
                    {
                        value = value();
                    }

                    if(!blockUpdate)
                    {
                        jQuery(element).html(value);
                    }
                }
            };

            /**
             * Numeric Binding Handler
             */
            ko.bindingHandlers.numeric = {
                init: function (element, valueAccessor) {
                    var value = valueAccessor();
                    if (!ko.isObservable(value)) {
                        jQuery(element).val(value);
                        return;
                    }

                    jQuery(element).keydown(function(e) {
                        GoNorth.Util.validateNumberKeyPress(element, e);
                    });

                    jQuery(element).change(function() {
                        var parsedValue = 0.0;
                        if(jQuery(element).val())
                        {
                            parsedValue = parseFloat(jQuery(element).val());
                        }
                        if(!isNaN(parsedValue))
                        {
                            value(parsedValue);
                        }
                        else
                        {
                            value(0.0);
                        }
                    });
                },
                update: function (element, valueAccessor) {
                    var value = valueAccessor();
                    if(ko.isObservable(value))
                    {
                        jQuery(element).val(value());
                    }
                    else
                    {
                        jQuery(element).val(value);
                    }
                }
            };

            /**
             * Dropzone Binding Handler
             */
            ko.bindingHandlers.dropzone = {
                init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var originalUploadUrl = valueAccessor();
                    var uploadUrl = originalUploadUrl;
                    if(ko.isObservable(uploadUrl))
                    {
                        uploadUrl = uploadUrl();
                    }

                    var options = {
                        url: uploadUrl,
                        headers: GoNorth.Util.generateAntiForgeryHeader()
                    };

                    if(allBindings.get("dropzoneAcceptedFiles"))
                    {
                        options.acceptedFiles = allBindings.get("dropzoneAcceptedFiles");
                    }

                    if(allBindings.get("dropzoneMaxFiles") && !isNaN(parseInt(allBindings.get("dropzoneMaxFiles"))))
                    {
                        options.maxFiles = parseInt(allBindings.get("dropzoneMaxFiles"));
                    }

                    if(allBindings.get("dropzoneTimeout"))
                    {
                        options.timeout = allBindings.get("dropzoneTimeout");
                    }

                    var autoProcess = allBindings.get("dropzoneAutoProcess");
                    if(typeof autoProcess !== "undefined")
                    {
                        if(ko.isObservable(autoProcess))
                        {
                            autoProcess = autoProcess();
                        }
                        options.autoProcessQueue = autoProcess;
                    }

                    if(allBindings.get("dropzoneDisable"))
                    {
                        var disableObs = allBindings.get("dropzoneDisable");
                        var initialDisable = disableObs;
                        if(ko.isObservable(disableObs))
                        {
                            disableObs.subscribe(function(newValue) {
                                if(newValue) {
                                    jQuery(element).hide();
                                } else {
                                    jQuery(element).show();
                                }
                            });

                            initialDisable = disableObs();
                        }

                        if(initialDisable)
                        {
                            jQuery(element).hide();
                        }
                    }

                    var successFunction = null;
                    if(allBindings.get("dropzoneSuccess"))
                    {
                        successFunction = allBindings.get("dropzoneSuccess");
                        if(typeof successFunction != "function")
                        {
                            successFunction = null;
                        }
                    }

                    var errorFunction = null;
                    if(allBindings.get("dropzoneError"))
                    {
                        errorFunction = allBindings.get("dropzoneError");
                        if(typeof errorFunction != "function")
                        {
                            errorFunction = null;
                        }
                    }

                    var addedFileFunction = null;
                    if(allBindings.get("dropzoneAddedFile"))
                    {
                        addedFileFunction = allBindings.get("dropzoneAddedFile");
                        if(typeof addedFileFunction != "function")
                        {
                            addedFileFunction = null;
                        }
                    }

                    var receiveTriggerFunctionsCallback = null;
                    if(allBindings.get("dropzoneReceiveTriggerFunctions"))
                    {
                        receiveTriggerFunctionsCallback = allBindings.get("dropzoneReceiveTriggerFunctions");
                        if(typeof receiveTriggerFunctionsCallback != "function")
                        {
                            receiveTriggerFunctionsCallback = null;
                        }
                    }
                    
                    var dropzoneHoverClass = allBindings.get("dropzoneHoverClass");
                    if(allBindings.get("dropzoneHoverClass"))
                    {
                        jQuery(element).on("dragenter", function() {
                            jQuery(element).addClass(dropzoneHoverClass);
                        });
                        
                        jQuery(element).on("dragleave", function() {
                            jQuery(element).removeClass(dropzoneHoverClass);
                        });
                    }

                    jQuery(element).dropzone(options).addClass("dropzone");
                    var dropzoneObj = jQuery(element)[0].dropzone;
                    if(options.maxFiles == 1)
                    {
                        dropzoneObj.on("complete", function(file) {
                            dropzoneObj.removeFile(file);
                        });
                    }

                    if(successFunction) 
                    {
                        dropzoneObj.on("success", function(file, response) {
                            successFunction.apply(bindingContext.$data, [ response ]);
                        });
                    }

                    if(errorFunction) 
                    {
                        dropzoneObj.on("error", function(file, errorMessage, xhr) {
                            errorFunction.apply(bindingContext.$data, [ errorMessage, xhr ]);
                        });
                    }
                    
                    dropzoneObj.on("addedfile", function() {
                        if(dropzoneHoverClass)
                        {
                            jQuery(element).removeClass(dropzoneHoverClass);
                        }

                        if(options.autoProcessQueue === false && dropzoneObj.files && dropzoneObj.files.length > options.maxFiles)
                        {
                            dropzoneObj.removeFile(dropzoneObj.files[0]);
                        }

                        if(addedFileFunction)
                        {
                            addedFileFunction.apply(bindingContext.$data);
                        }
                    });

                    if(receiveTriggerFunctionsCallback != null)
                    {
                        var clearFilesCallback = function() {
                            dropzoneObj.removeAllFiles();
                        };

                        var processQueueCallback = function() {
                            dropzoneObj.processQueue();
                        };

                        receiveTriggerFunctionsCallback.apply(bindingContext.$data, [ clearFilesCallback, processQueueCallback ]);
                    }

                    if(ko.isObservable(originalUploadUrl)) 
                    {
                        originalUploadUrl.subscribe(function() {
                            dropzoneObj.options.url = originalUploadUrl();
                        })
                    }
                }
            };

            /**
             * Tagsinput Binding Handler
             */
            ko.bindingHandlers.tagsInput = {
                init: function (element, valueAccessor, allBindings) {
                    var options = {
                        tagClass: "btn-primary rounded gn-tag"
                    };

                    if(allBindings.get("tagsInputOptions"))
                    {
                        var tagsInputOptions = allBindings.get("tagsInputOptions");
                        options.typeahead = {
                            source: function() {
                                if(ko.isObservable(tagsInputOptions))
                                {
                                    return tagsInputOptions();
                                }

                                return tagsInputOptions;
                            },
                            afterSelect: function(val) { this.$element.val(""); }
                        };
                    }

                    jQuery(element).tagsinput(options);
                    jQuery(element).tagsinput("input").parent().addClass("form-control gn-tagInput");
                    
                    if(allBindings.get("tagsInputDisabled"))
                    {
                        var disableObs = allBindings.get("tagsInputDisabled");
                        var initialDisable = disableObs;
                        if(ko.isObservable(disableObs))
                        {
                            disableObs.subscribe(function(newValue) {
                                if(newValue)
                                {
                                    jQuery(element).tagsinput("input").parent().attr("disabled", "disabled");
                                }
                                else
                                {
                                    jQuery(element).tagsinput("input").parent().removeAttr("disabled");
                                }
                            });

                            initialDisable = disableObs();
                        }

                        if(initialDisable) 
                        {
                            jQuery(element).tagsinput("input").parent().attr("disabled", "disabled");
                        }
                    }

                    if(ko.isObservable(valueAccessor()))
                    {
                        var obs = valueAccessor();
                        jQuery(element).on("itemAdded itemRemoved", function() {
                            if(obs._blockUpdate)
                            {
                                return;
                            }

                            try
                            {
                                obs._blockUpdate = true;
                                obs(jQuery(element).tagsinput("items"));
                                obs._blockUpdate = false;
                            }
                            catch(e)
                            {
                                obs._blockUpdate = false;
                                throw e;
                            }
                        });
                    }
                },
                update: function (element, valueAccessor) {
                    var obs = valueAccessor();
                    var values = obs;
                    var blockUpdate = obs._blockUpdate;
                    if(ko.isObservable(obs))
                    {
                        values = obs();
                    }

                    if(blockUpdate)
                    {
                        return;
                    }

                    obs._blockUpdate = true;

                    try
                    {
                        jQuery(element).tagsinput("removeAll");
                        if(!values) 
                        {
                            values = [];
                        }

                        for(var curValue = 0; curValue < values.length; ++curValue)
                        {
                            jQuery(element).tagsinput("add", values[curValue]);
                        }
                        obs._blockUpdate = false;
                    }
                    catch(e)
                    {
                        obs._blockUpdate = false;
                        throw e;
                    }
                }
            };

            /**
             * Slide Binding Handler
             */
            ko.bindingHandlers.slide = {
                init: function (element, valueAccessor) {
                },
                update: function (element, valueAccessor) {
                    var value = valueAccessor();
                    if (ko.utils.unwrapObservable(value)) {
                        jQuery(element).slideDown(200);
                    } else {
                        jQuery(element).slideUp(200);
                    }
                }
            };

            var currentDraggableObject = null;
            /**
             * Draggable Binding Handler
             */
            ko.bindingHandlers.draggableElement = {
                init: function (element, valueAccessor, allBindings) {
                    var helper = valueAccessor();
                    if(ko.isObservable(helper))
                    {
                        helper = helper();
                    }

                    var draggableOptions = {
                        helper: helper
                    };

                    var draggableRevert = allBindings.get("draggableRevert");
                    if(typeof draggableRevert != "undefined")
                    {
                        draggableOptions.revert = draggableRevert;
                    }

                    var draggableRevertDuration  = allBindings.get("draggableRevertDuration");
                    if(typeof draggableRevertDuration != "undefined")
                    {
                        draggableOptions.revertDuration  = draggableRevertDuration;
                    }

                    var draggableZIndex  = allBindings.get("draggableZIndex");
                    if(typeof draggableZIndex != "undefined")
                    {
                        draggableOptions.zIndex   = draggableZIndex;
                    }

                    var draggableObject = allBindings.get("draggableObject");
                    var dropableIndiciators = allBindings.get("draggableDropIndicators");
                    if(draggableObject || dropableIndiciators) {
                        draggableOptions.start = function() {
                            currentDraggableObject = draggableObject ? draggableObject : null;

                            if(dropableIndiciators)
                            {
                                jQuery.each(dropableIndiciators, function(searchSelector, addClass) {
                                    jQuery(searchSelector).addClass(addClass);
                                });
                            }
                        };
                        draggableOptions.stop = function() {
                            currentDraggableObject = null;

                            if(dropableIndiciators)
                            {
                                jQuery.each(dropableIndiciators, function(searchSelector, addClass) {
                                    jQuery(searchSelector).removeClass(addClass);
                                });
                            }
                        };
                    }

                    jQuery(element).draggable(draggableOptions);
                },
                update: function (element, valueAccessor) {
                }
            };

            /**
             * Droppable Binding Handler
             */
            ko.bindingHandlers.droppableElement = {
                init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var callbackFunc = valueAccessor();
                    var droppableOptions = {
                        drop: function(ev, ui) {
                            var leftPosition  = ui.offset.left - jQuery(this).offset().left;
                            var topPosition   = ui.offset.top - jQuery(this).offset().top;
                            
                            var args = [ ui.draggable, leftPosition, topPosition ];
                            if(currentDraggableObject)
                            {
                                args.push(currentDraggableObject);
                            }

                            callbackFunc.apply(bindingContext.$data, args);
                        }
                    };

                    if(allBindings.get("droppableAccept"))
                    {
                        droppableOptions.accept = allBindings.get("droppableAccept");
                    }

                    jQuery(element).droppable(droppableOptions);
                },
                update: function (element, valueAccessor) {
                }
            };

            /**
             * Double click Binding Handler
             */
            ko.bindingHandlers.dblClick = {
                init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var callbackFunction = valueAccessor();
                    if(typeof callbackFunction != "function")
                    {
                        return;
                    }

                    jQuery(element).dblclick(function(e) {
                        if(bindingContext.$data)
                        {
                            callbackFunction.apply(bindingContext.$data);
                        }
                        else
                        {
                            callbackFunction();
                        }

                        e.preventDefault();
                    });
                }
            };

            /**
             * Datetime picker Binding Handler
             */
            ko.bindingHandlers.dateTimePicker = {
                init: function (element, valueAccessor, allBindings) {
                    // Add Datetimepicker
                    var options = allBindings.get("dateTimePickerOptions") || { format: "L" };
                    jQuery(element).datetimepicker(options);
            
                    // Register Change
                    ko.utils.registerEventHandler(element, "dp.change", function (event) {
                        var value = valueAccessor();
                        if (ko.isObservable(value)) 
                        {
                            if (event.date != null && !(event.date instanceof Date) && event.date.toDate) 
                            {
                                value(event.date.toDate());
                            } 
                            else 
                            {
                                if(event.date instanceof Date)
                                {
                                    value(event.date);
                                }
                                else
                                {
                                    value(null);
                                }
                            }
                        }
                    });
            
                    // Register dispose
                    ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                        var picker = jQuery(element).data("DateTimePicker");
                        if (picker) 
                        {
                            picker.destroy();
                        }
                    });
                },
                update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    // Sync Datepicker
                    var picker = jQuery(element).data("DateTimePicker");
                    if (picker) 
                    {
                        var koDate = ko.utils.unwrapObservable(valueAccessor());
                        if(koDate)
                        {
                            koDate = (typeof (koDate) !== 'object') ? new Date(koDate) : koDate;
                        }
                        else
                        {
                            koDate = null;
                        }
                        picker.date(koDate);
                    }
                }
            };

            /**
             * Formats the text for an element with moment
             * @param {object} element HTML target element
             * @param {object} valueAccessor Value accessor
             * @param {string} formatString Format string
             */
            function momentFormatText(element, valueAccessor, formatString)
            {
                var koDate = ko.utils.unwrapObservable(valueAccessor());
                var formattedDate = "";
                if(koDate)
                {
                    formattedDate = moment(koDate).format(formatString);
                }
               
                jQuery(element).text(formattedDate);
            }

            /**
             * Formatted Date text Binding Handler
             */
            ko.bindingHandlers.formattedDateText = {
                init: function (element, valueAccessor, allBindings) {
                    
                },
                update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    momentFormatText(element, valueAccessor, "L");
                }
            };

            /**
             * Formatted Date time text Binding Handler
             */
            ko.bindingHandlers.formattedDateTimeText = {
                init: function (element, valueAccessor, allBindings) {
                    
                },
                update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    momentFormatText(element, valueAccessor, "L LT");
                }
            };


            /**
             * Extracts the url for the href binding
             * 
             * @param {object} valueAccessor Knockout Value Accessor
             * @param {object} bindingContext Binding Context
             * @returns {string} Url
             */
            function extractHref(valueAccessor, bindingContext) {
                var href = valueAccessor();
                if(ko.isObservable(href))
                {
                    href = ko.utils.unwrapObservable(href);
                }
                else if(typeof href == "function")
                {
                    href = href.apply(bindingContext.$data, [ bindingContext.$data ]);
                }

                return href;
            }


            /// Left mouse button
            var mouesButtonLeft = 1;

            /**
             * Href Binding Handler
             */
            ko.bindingHandlers.href = {
                init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var href = extractHref(valueAccessor, bindingContext);
                    jQuery(element).prop("href", href);

                    if(allBindings.get("isPushStateHref"))
                    {
                        jQuery(element).click(function(event) {
                            if(event.which != mouesButtonLeft) {
                                return;
                            }
    
                            var hrefTarget = jQuery(this).attr("href");
                            hrefTarget = hrefTarget.replace(window.location.pathname + "?", "");
                            hrefTarget = hrefTarget.replace(window.location.pathname + "#", "");
                            GoNorth.Util.setUrlParameters(hrefTarget);
                            event.preventDefault();
                            return false;
                        });
                    }
                },
                update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var href = extractHref(valueAccessor, bindingContext);
                    jQuery(element).prop("href", href);
                }
            };
        }

    }(GoNorth.BindingHandlers = GoNorth.BindingHandlers || {}));
}(window.GoNorth = window.GoNorth || {}));