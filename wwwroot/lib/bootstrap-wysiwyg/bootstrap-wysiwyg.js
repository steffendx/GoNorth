/* http://github.com/mindmup/bootstrap-wysiwyg */
/*global jQuery, $, FileReader*/
/*jslint browser:true*/
(function ($) {
	'use strict';
	var initToolbarBootstrapBindings = function(toolbarElement, options)
	{
		var fonts = ['Serif', 'Sans', 'Arial', 'Arial Black', 'Courier', 
			'Courier New', 'Helvetica', 'Impact', 'Lucida Grande', 'Lucida Sans', 'Tahoma', 'Times',
			'Times New Roman', 'Verdana'];
		var fontTarget = toolbarElement.find('.wysiwyg-fonts');
	
		$.each(fonts, function (idx, fontName)
		{
			fontTarget.append($('<li><a data-edit="fontName ' + fontName +'" style="font-family:\''+ fontName +'\'">'+fontName + '</a></li>'));
		});
		toolbarElement.find(".dropdown-menu").click(function(event) {
			event.stopPropagation();
		});
		toolbarElement.find('.dropdown-menu input[data-' + options.commandRole + ']').click(function() {return false; })
			.change(function ()
			{
				$(this).parent('.dropdown-menu').siblings('.dropdown-toggle').dropdown('toggle');
			}).keydown('esc', function ()
			{
				this.value='';$(this).change();
			});
		toolbarElement.find('[data-role=magic-overlay]').each(function ()
		{ 
			var overlay = $(this); 
			var target = $(this).prev();
			target.click(function() {
				overlay.click();
			})
		});
	};

	var createToolbar = function(targetElement, additionalButtons, options) {
		var toolbarHtml = '<div class="btn-toolbar" data-role="editor-toolbar"> \
			<div class="btn-group"> \
				<a class="btn btn-default dropdown-toggle" data-toggle="dropdown" title="' + bootstrapWysiwyg.local.font + '"><i class="glyphicon glyphicon-font"></i><b class="caret"></b></a> \
				<ul class="dropdown-menu wysiwyg-fonts"> \
				</ul> \
				</div>';
		if(options.showFontSize)
		{
			toolbarHtml += '<div class="btn-group"> \
				<a class="btn btn-default dropdown-toggle" data-toggle="dropdown" title="' + bootstrapWysiwyg.local.fontSize + '"><i class="glyphicon glyphicon-text-height"></i>&nbsp;<b class="caret"></b></a> \
				<ul class="dropdown-menu"> \
					<li><a data-edit="fontSize 5"><font size="5">' + bootstrapWysiwyg.local.fontSizeHuge + '</font></a></li> \
					<li><a data-edit="fontSize 3"><font size="3">' + bootstrapWysiwyg.local.fontSizeNormal + '</font></a></li> \
					<li><a data-edit="fontSize 1"><font size="1">' + bootstrapWysiwyg.local.fontSizeSmall + '</font></a></li> \
				</ul> \
			</div>';
		}
		toolbarHtml += '<div class="btn-group"> \
				<a class="btn btn-default" data-edit="formatBlock <h4>" title="' + bootstrapWysiwyg.local.header + '"><i class="glyphicon glyphicon-header"></i></a> \
				<a class="btn btn-default" data-edit="formatBlock <h5>" title="' + bootstrapWysiwyg.local.subHeader + '"><i class="glyphicon glyphicon-header gn-richTextEditorSubHeader"></i></a> \
			</div> \
			<div class="btn-group"> \
				<a class="btn btn-default" data-edit="bold" title="' + bootstrapWysiwyg.local.bold + '"><i class="glyphicon glyphicon-bold"></i></a> \
				<a class="btn btn-default" data-edit="italic" title="' + bootstrapWysiwyg.local.italic + '"><i class="glyphicon glyphicon-italic"></i></a> \
				<a class="btn btn-default" data-edit="strikethrough" title="' + bootstrapWysiwyg.local.strikeThrough + '"><i class="glyphicon glyphicon-font" style="text-decoration: line-through"></i></a> \
				<a class="btn btn-default" data-edit="underline" title="' + bootstrapWysiwyg.local.underline + '"><i class="glyphicon glyphicon-font" style="text-decoration: underline"></i></a> \
			</div> \
			<div class="btn-group"> \
				<a class="btn btn-default" data-edit="insertunorderedlist" title="' + bootstrapWysiwyg.local.bulletList + '"><i class="glyphicon glyphicon-list"></i></a> \
				<a class="btn btn-default" data-edit="insertorderedlist" title="' + bootstrapWysiwyg.local.numberList + '"><i class="glyphicon glyphicon-th-list"></i></a> \
				<a class="btn btn-default" data-edit="outdent" title="' + bootstrapWysiwyg.local.reduceIndent + '"><i class="glyphicon glyphicon-indent-right"></i></a> \
				<a class="btn btn-default" data-edit="indent" title="' + bootstrapWysiwyg.local.indent + '"><i class="glyphicon glyphicon-indent-left"></i></a> \
			</div> \
			<div class="btn-group"> \
				<a class="btn btn-default" data-edit="justifyleft" title="' + bootstrapWysiwyg.local.alignLeft + '"><i class="glyphicon glyphicon-align-left"></i></a> \
				<a class="btn btn-default" data-edit="justifycenter" title="' + bootstrapWysiwyg.local.alignCenter + '"><i class="glyphicon glyphicon-align-center"></i></a> \
				<a class="btn btn-default" data-edit="justifyright" title="' + bootstrapWysiwyg.local.alignRight + '"><i class="glyphicon glyphicon-align-right"></i></a> \
				<a class="btn btn-default" data-edit="justifyfull" title="' + bootstrapWysiwyg.local.justifyFull + '"><i class="glyphicon glyphicon-align-justify"></i></a> \
			</div> \
			<div class="btn-group"> \
				<a class="btn btn-default dropdown-toggle" data-toggle="dropdown" title="' + bootstrapWysiwyg.local.hyperlink + '"><i class="glyphicon glyphicon-link"></i></a> \
				<div class="dropdown-menu input-append" style="padding: 10px"> \
					<input class="form-control" placeholder="' + bootstrapWysiwyg.local.url + '" type="text" data-edit="createLink"/> \
					<button class="btn btn-default" style="margin-top: 5px" type="button">' + bootstrapWysiwyg.local.hyperlinkAdd + '</button> \
				</div> \
				<a class="btn btn-default" data-edit="unlink" title="' + bootstrapWysiwyg.local.removeHyperlink + '"><i class="glyphicon glyphicon-link" style="text-decoration: line-through"></i></a> \
			</div> \
			\
			<div class="btn-group"> \
				<a class="btn btn-default" title="' + bootstrapWysiwyg.local.insertPicture + '"><i class="glyphicon glyphicon-picture"></i></a> \
				<input type="file" data-role="magic-overlay" data-edit="insertImage" class="wysiwgEditor-imageUpload" /> \
			</div> \
			<div class="btn-group"> \
				<a class="btn btn-default dropdown-toggle" data-toggle="dropdown" title="' + bootstrapWysiwyg.local.table + '"><i class="glyphicon glyphicon-th"></i></a> \
				<div class="dropdown-menu input-append" style="padding: 10px"> \
					<input class="form-control gn-table-columns" placeholder="' + bootstrapWysiwyg.local.columns + '" type="text"/> \
					<input class="form-control gn-table-rows" placeholder="' + bootstrapWysiwyg.local.rows + '" type="text"/> \
					<div class="checkbox"><label><input type="checkbox" class="gn-table-addHeader">' + bootstrapWysiwyg.local.addHeaderRow + '</label></div> \
					<button class="btn btn-default gn-table-add" style="margin-top: 5px" type="button">' + bootstrapWysiwyg.local.tableAdd + '</button> \
				</div> \
				<a class="btn btn-default gn-table-add-row-after" disabled="disabled" title="' + bootstrapWysiwyg.local.onlyAvailableInsideTable + '" data-disabletitle="' + bootstrapWysiwyg.local.onlyAvailableInsideTable + '" data-enabletitle="' + bootstrapWysiwyg.local.tableAddRowAfter + '" data-editactiveinside="tr"><i class="glyphicon glyphicon-object-align-vertical wysiwgEditor-flipIcon"></i></a> \
				<a class="btn btn-default gn-table-add-row-before" disabled="disabled" title="' + bootstrapWysiwyg.local.onlyAvailableInsideTable + '" data-disabletitle="' + bootstrapWysiwyg.local.onlyAvailableInsideTable + '" data-enabletitle="' + bootstrapWysiwyg.local.tableAddRowBefore + '" data-editactiveinside="tr"><i class="glyphicon glyphicon-object-align-vertical"></i></a> \
				<a class="btn btn-default gn-table-remove-row" disabled="disabled" title="' + bootstrapWysiwyg.local.onlyAvailableInsideTable + '" data-disabletitle="' + bootstrapWysiwyg.local.onlyAvailableInsideTable + '" data-enabletitle="' + bootstrapWysiwyg.local.tableRemoveRow + '" data-editactiveinside="tr"><i class="glyphicon glyphicon-object-align-vertical"></i><i class="glyphicon glyphicon-remove wysiwgEditor-removeIcon"></i></a> \
				<a class="btn btn-default gn-table-add-column-after" disabled="disabled" title="' + bootstrapWysiwyg.local.onlyAvailableInsideTable + '" data-disabletitle="' + bootstrapWysiwyg.local.onlyAvailableInsideTable + '" data-enabletitle="' + bootstrapWysiwyg.local.tableAddColumnAfter + '" data-editactiveinside="th,td"><i class="glyphicon glyphicon-object-align-horizontal"></i></a> \
				<a class="btn btn-default gn-table-add-column-before" disabled="disabled" title="' + bootstrapWysiwyg.local.onlyAvailableInsideTable + '" data-disabletitle="' + bootstrapWysiwyg.local.onlyAvailableInsideTable + '" data-enabletitle="' + bootstrapWysiwyg.local.tableAddColumnBefore + '" data-editactiveinside="th,td"><i class="glyphicon glyphicon-object-align-horizontal wysiwgEditor-flipIcon"></i></a> \
				<a class="btn btn-default gn-table-remove-column" disabled="disabled" title="' + bootstrapWysiwyg.local.onlyAvailableInsideTable + '" data-disabletitle="' + bootstrapWysiwyg.local.onlyAvailableInsideTable + '" data-enabletitle="' + bootstrapWysiwyg.local.tableRemoveColumn + '" data-editactiveinside="th,td"><i class="glyphicon glyphicon-object-align-horizontal"></i><i class="glyphicon glyphicon-remove wysiwgEditor-removeIcon"></i></a> \
				<a class="btn btn-default gn-table-add-header-row" disabled="disabled" title="' + bootstrapWysiwyg.local.onlyAvailableInsideTable + '" data-disabletitle="' + bootstrapWysiwyg.local.onlyAvailableInsideTable + '" data-enabletitle="' + bootstrapWysiwyg.local.tableAddHeaderRow + '" data-editactiveinside="table"><i class="glyphicon glyphicon-th-large"></i></a> \
			</div> \
			<div class="btn-group"> \
				<a class="btn btn-default" data-edit="undo" title="' + bootstrapWysiwyg.local.undo + '"><i class="glyphicon glyphicon-share-alt" style="-webkit-transform: scaleX(-1); filter: FlipH;"></i></a> \
				<a class="btn btn-default" data-edit="redo" title="' + bootstrapWysiwyg.local.redo + '"><i class="glyphicon glyphicon-share-alt"></i></a> \
			</div>';

		if(additionalButtons)
		{
			jQuery.each(additionalButtons, function(key, button) {
				var buttonHtml = '<div class="btn-group"> \
									<a class="btn btn-default" title="' + button.title + '" data-customcallback="' + key + '"><i class="glyphicon ' + button.icon + '"></i></a> \
								  </div>';
				
				toolbarHtml += buttonHtml;
			});
		}

		toolbarHtml += '</div>';
		
		var toolbarElement = jQuery(toolbarHtml).insertBefore(targetElement);
		initToolbarBootstrapBindings(toolbarElement, options);
		return toolbarElement;
	};

	var readFileIntoDataUrl = function (fileInfo) {
		var loader = $.Deferred(),
			fReader = new FileReader();
		fReader.onload = function (e) {
			loader.resolve(e.target.result);
		};
		fReader.onerror = loader.reject;
		fReader.onprogress = loader.notify;
		fReader.readAsDataURL(fileInfo);
		return loader.promise();
	};
	$.fn.cleanHtml = function () {
		var html = $(this).html();
		return html && html.replace(/(<br>|\s|<div><br><\/div>|&nbsp;)*$/, '');
	};
	$.fn.wysiwyg = function (userOptions) {
		options = $.extend({}, $.fn.wysiwyg.defaults, userOptions);
		var createdToolbar = createToolbar(this, userOptions.additionalButtons, options);
		var htmlOld = $(this).html();
		
		var editor = this;
		var selectedRange,
			options,
			toolbarBtnSelector,
			toolbarBtnActivateSelector,
			getSelectionInsideElement = function (selector) {
				var sel, containerNode;
				if (window.getSelection) {
					sel = window.getSelection();
					if (sel.rangeCount > 0) {
						containerNode = sel.getRangeAt(0).commonAncestorContainer;
					}
				} else if ((sel = document.selection) && sel.type != "Control") {
					containerNode = sel.createRange().parentElement();
				}
				
				var elementNodeType = 1;
				while (containerNode) 
				{
					if (containerNode.nodeType == elementNodeType && $(containerNode).is(selector)) {
						return containerNode;
					}
					containerNode = containerNode.parentNode;
				}
				return null;
			},
			updateToolbar = function () {
				if (options.activeToolbarClass) {
					$(createdToolbar).find(toolbarBtnSelector).each(function () {
						var command = $(this).data(options.commandRole);
						if (document.queryCommandState(command)) {
							$(this).addClass(options.activeToolbarClass);
						} else {
							$(this).removeClass(options.activeToolbarClass);
						}
					});

					$(createdToolbar).find(toolbarBtnActivateSelector).each(function() {
						var activateInside = $(this).data(options.activeRole);
						if(getSelectionInsideElement(activateInside) != null) {
							$(this).removeAttr("disabled");
							$(this).attr("title", $(this).data("enabletitle"));
						} else {
							$(this).attr("disabled", "disabled");
							$(this).attr("title", $(this).data("disabletitle"));
						}
					});
				}

				var htmlNew = $(editor).html();
                if (htmlOld !== htmlNew) {
                    htmlOld = htmlNew;
					if(userOptions && userOptions.events && userOptions.events.change)
					{
						userOptions.events.change(htmlNew);
					}
                }
			},
			execCommand = function (commandWithArgs, valueArg) {
				var commandArr = commandWithArgs.split(' '),
					command = commandArr.shift(),
					args = commandArr.join(' ') + (valueArg || '');
				document.execCommand(command, 0, args);
				updateToolbar();
			},
			bindHotkeys = function (hotKeys) {
				$.each(hotKeys, function (hotkey, command) {
					editor.keydown(hotkey, function (e) {
						if (editor.attr('contenteditable') && editor.is(':visible')) {
							e.preventDefault();
							e.stopPropagation();
							execCommand(command);
						}
					}).keyup(hotkey, function (e) {
						if (editor.attr('contenteditable') && editor.is(':visible')) {
							e.preventDefault();
							e.stopPropagation();
						}
					});
				});
			},
			getCurrentRange = function () {
				var sel = window.getSelection();
				if (sel.getRangeAt && sel.rangeCount) {
					return sel.getRangeAt(0);
				}
			},
			saveSelection = function () {
				selectedRange = getCurrentRange();
			},
			restoreSelection = function () {
				var selection = window.getSelection();
				if (selectedRange) {
					try {
						selection.removeAllRanges();
					} catch (ex) {
						document.body.createTextRange().select();
						document.selection.empty();
					}

					selection.addRange(selectedRange);
				}
			},
			insertFiles = function (files, userOptions) {
				if(!userOptions.imageUploadUrl)
				{
					$.each(files, function (idx, fileInfo) {
						if (/^image\//.test(fileInfo.type)) {
							$.when(readFileIntoDataUrl(fileInfo)).done(function (dataUrl) {
								restoreSelection();
								editor.focus();
								execCommand('insertimage', dataUrl);
							}).fail(function (e) {
								options.fileUploadError(bootstrapWysiwyg.local.couldNotReadFile);
							});
						} else {
							options.fileUploadError(bootstrapWysiwyg.local.unsupportedFileType);
						}
					});
				}
				else
				{
					if(files.length != 1)
					{
						options.fileUploadError(bootstrapWysiwyg.local.onlyOneFileCanBeUploaded);
						return;
					}

					if (!(/^image\//.test(files[0].type))) 
					{
						options.fileUploadError(bootstrapWysiwyg.local.unsupportedFileType);
						return;
					}

					var uploadUrl = userOptions.imageUploadUrl.replace(/{filename}/g, encodeURIComponent(files[0].name))

					var data = new FormData();
					$.each(files, function(key, value)
					{
						data.append(key, value);
					});
				
					$.ajax({
						url: uploadUrl,
						type: "POST",
						data: data,
						cache: false,
						headers: GoNorth.Util.generateAntiForgeryHeader(),
						processData: false, 
						contentType: false
					}).done(function(data) {
						var imageUrl = userOptions.fileUploadSuccess(data);
						restoreSelection();
						editor.focus();
						execCommand('insertimage', imageUrl);
						if(userOptions.afterFileInserted) {
							userOptions.afterFileInserted();
						}
					}).fail(function(jqXHR, textStatus, errorThrown) {
						options.fileUploadError(textStatus, jqXHR);
					});
				}
			},
			markSelection = function (input, color) {
				restoreSelection();
				if (document.queryCommandSupported('hiliteColor')) {
					document.execCommand('hiliteColor', 0, color || 'transparent');
				}
				saveSelection();
				input.data(options.selectionMarker, color);
			},
			bindToolbar = function (toolbar, options) {
				toolbar.find(toolbarBtnSelector).click(function () {
					restoreSelection();
					editor.focus();
					execCommand($(this).data(options.commandRole));
					saveSelection();
				});
				toolbar.find('[data-toggle=dropdown]').click(restoreSelection);

				toolbar.find('input[type=text][data-' + options.commandRole + ']').on('change', function () {
					var newValue = this.value; /* ugly but prevents fake double-calls due to selection restoration */
					this.value = '';
					restoreSelection();
					if (newValue) {
						editor.focus();
						execCommand($(this).data(options.commandRole), newValue);
					}
					saveSelection();
				}).on('focus', function () {
					var input = $(this);
					if (!input.data(options.selectionMarker)) {
						markSelection(input, options.selectionColor);
						input.focus();
					}
				}).on('blur', function () {
					var input = $(this);
					if (input.data(options.selectionMarker)) {
						markSelection(input, false);
					}
				});
				toolbar.find('input[type=file][data-' + options.commandRole + ']').change(function () {
					restoreSelection();
					if (this.type === 'file' && this.files && this.files.length > 0) {
						insertFiles(this.files, userOptions);
					}
					saveSelection();
					this.value = '';
				});

				var generateRowHtmlForTable = function(parentTable, cellTag)
				{
					var colCount = parentTable.find("tr").first().find("td,th").length;
					var rowHtml = "<tr>";
					for(var curColumn = 0; curColumn < colCount; ++curColumn)
					{
						rowHtml += "<" + cellTag + "><br/></" + cellTag + ">";
					}
					rowHtml += "</tr>";
					return rowHtml;
				}
				toolbar.find(".gn-table-columns,.gn-table-rows").keydown(function(e) {
					GoNorth.Util.validateNumberKeyPress(jQuery(this), e);
				});
				toolbar.find(".gn-table-add").click(function() {
					var columns = parseInt(toolbar.find(".gn-table-columns").val());
					if(isNaN(columns)) {
						columns = 1;
					}
					var rows = parseInt(toolbar.find(".gn-table-rows").val());
					if(isNaN(rows)) {
						rows = 1;
					}
					var addHeaderRow = toolbar.find(".gn-table-addHeader").is(":checked");
					
					var tableHtml = "<div class='table-responsive'><table class='table table-bordered table-striped'>";
					if(addHeaderRow) {
						tableHtml += "<thead><tr>";
						for(var curColumn = 0; curColumn < columns; ++curColumn)
						{
							tableHtml += "<th></th>";
						}
						tableHtml += "</tr></thead>";
					}

					tableHtml += "<tbody>";
					for(var curRow = 0; curRow < rows; ++curRow)
					{
						tableHtml += "<tr>"
						for(var curColumn = 0; curColumn < columns; ++curColumn)
						{
							tableHtml += "<td></td>";
						}
						tableHtml += "</tr>";
					}
					tableHtml += "</tbody></table></div>";
					
					restoreSelection();
					editor.focus();
					execCommand("insertHtml", tableHtml);
					saveSelection();

					$(this).parent('.dropdown-menu').siblings('.dropdown-toggle').dropdown('toggle');
				});
				var insertTableChange = function(parentTable, html)
				{
					restoreSelection();
					editor.focus();

					var selection = window.getSelection();
					var range = document.createRange();
					range.setStartBefore(parentTable.first()[0]);
					range.setEndAfter(parentTable.last()[0]);
					selection.removeAllRanges();
					selection.addRange(range);
					execCommand("insertHTML", html);
					
					saveSelection();
				};
				var insertTableRow = function(insertAfter) {
					var currentRow = $(getSelectionInsideElement("tr"));
					var parentTable = currentRow.closest("table");
					var clonedTable = parentTable.clone();
					var rowIndex = currentRow.index() + 1;
					var clonedRow = clonedTable.find(currentRow.parent().prop("tagName")).children(":nth-child(" + rowIndex + ")");
					if(clonedRow.parent().is("thead"))
					{
						if(!insertAfter)
						{
							return;
						}

						clonedRow = clonedTable.find("tbody>tr").first();		
						insertAfter = false;				
					}

					var rowHtml = generateRowHtmlForTable(clonedTable, "td");
					if(insertAfter)
					{
						$(rowHtml).insertAfter(clonedRow);
					}
					else
					{
						$(rowHtml).insertBefore(clonedRow);
					}

					insertTableChange(parentTable, clonedTable[0].outerHTML);
				};
				toolbar.find(".gn-table-add-row-after").click(function() {
					insertTableRow(true);
				});
				toolbar.find(".gn-table-add-row-before").click(function() {
					insertTableRow(false);
				});
				toolbar.find(".gn-table-remove-row").click(function() {
					var rowToDelete = $(getSelectionInsideElement("tr"));
					var rowIndex = rowToDelete.index() + 1;
					var parentTable = rowToDelete.closest("table");
					var clonedTable = parentTable.clone();
					if(clonedTable.find("tr").first().find("td,th").length > 1)
					{
						var clonedRow = clonedTable.find(rowToDelete.parent().prop("tagName")).children(":nth-child(" + rowIndex + ")");
						clonedRow.remove(); 
					}
					
					insertTableChange(parentTable, clonedTable[0].outerHTML);
				});
				var insertTableColumn = function(insertAfter) {
					var columnCell = $(getSelectionInsideElement("th,td"));
					var columnIndex = columnCell.index() + 1;
					var parentTable = columnCell.closest("table");
					var clonedTable = parentTable.clone();
					clonedTable.find("tr").each(function() {
						var columnHtml = "<td><br/></td>";
						if($(this).parent().is("thead"))
						{
							columnHtml = "<th><br/></th>";
						}

						if(insertAfter) 
						{
							$(columnHtml).insertAfter($(this).find(":nth-child(" + columnIndex + ")"));
						}
						else
						{
							$(columnHtml).insertBefore($(this).find(":nth-child(" + columnIndex + ")"));
						}
					});

					insertTableChange(parentTable, clonedTable[0].outerHTML);
				};
				toolbar.find(".gn-table-add-column-after").click(function() {
					insertTableColumn(true);
				});
				toolbar.find(".gn-table-add-column-before").click(function() {
					insertTableColumn(false);
				});
				toolbar.find(".gn-table-remove-column").click(function() {
					var columnCell = $(getSelectionInsideElement("th,td"));
					var columnIndex = columnCell.index() + 1;
					var parentTable = columnCell.closest("table");
					var clonedTable = parentTable.clone();
					if(clonedTable.find("tr").first().find("td,th").length > 1)
					{
						clonedTable.find("tr").find(":nth-child(" + columnIndex + ")").remove(); 
					}

					insertTableChange(parentTable, clonedTable[0].outerHTML);
				});
				toolbar.find(".gn-table-add-header-row").click(function() {
					var parentTable = $(getSelectionInsideElement("table"));
					var clonedTable = parentTable.clone();
					var tableHead = clonedTable.find("thead");
					if(tableHead.find("tr").length > 0)
					{
						return;
					}

					if(tableHead.length == 0)
					{
						clonedTable.prepend("<thead></thead>");
					}

					clonedTable.find("thead").append(generateRowHtmlForTable(clonedTable, "th"));
					
					insertTableChange(parentTable, clonedTable[0].outerHTML);
				});
			},
			initFileDrops = function () {
				editor.on('dragenter dragover', false)
					.on('drop', function (e) {
						var dataTransfer = e.originalEvent.dataTransfer;
						e.stopPropagation();
						e.preventDefault();
						if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0) {
							insertFiles(dataTransfer.files, userOptions);
						}
					});
			};
		toolbarBtnSelector = 'a[data-' + options.commandRole + '],button[data-' + options.commandRole + '],input[type=button][data-' + options.commandRole + ']';
		toolbarBtnActivateSelector = 'a[data-' + options.activeRole + '],button[data-' + options.activeRole + '],input[type=button][data-' + options.activeRole + ']';
		bindHotkeys(options.hotKeys);
		if (options.dragAndDropImages) {
			initFileDrops();
		}
		bindToolbar($(options.toolbarSelector), options);
		if(userOptions.additionalButtons) {
			jQuery(createdToolbar).find("a[data-customcallback]").click(function() {
				var buttonData = userOptions.additionalButtons[jQuery(this).data("customcallback")];
				if(buttonData && buttonData.callback) {
					buttonData.callback(function(htmlToInsert) {
						restoreSelection();
						if (htmlToInsert) {
							editor.focus();
							execCommand("insertHTML", htmlToInsert);
						}
					});
				}
			});
		}
		editor.attr('contenteditable', true)
			.on('mouseup keyup mouseout', function () {
				saveSelection();
				updateToolbar();
			});
		$(window).bind('touchend', function (e) {
			var isInside = (editor.is(e.target) || editor.has(e.target).length > 0),
				currentRange = getCurrentRange(),
				clear = currentRange && (currentRange.startContainer === currentRange.endContainer && currentRange.startOffset === currentRange.endOffset);
			if (!clear || isInside) {
				saveSelection();
				updateToolbar();
			}
		});
		return this;
	};
	$.fn.wysiwyg.defaults = {
		hotKeys: {
			'ctrl+h meta+h': 'formatBlock <h4>',
			'ctrl+g meta+g': 'formatBlock <h5>',
			'ctrl+b meta+b': 'bold',
			'ctrl+i meta+i': 'italic',
			'ctrl+u meta+u': 'underline',
			'ctrl+z meta+z': 'undo',
			'ctrl+y meta+y meta+shift+z': 'redo',
			'ctrl+l meta+l': 'justifyleft',
			'ctrl+r meta+r': 'justifyright',
			'ctrl+e meta+e': 'justifycenter',
			'ctrl+j meta+j': 'justifyfull',
			'shift+tab': 'outdent',
			'tab': 'indent'
		},
		toolbarSelector: '[data-role=editor-toolbar]',
		commandRole: 'edit',
		activeRole: 'editactiveinside',
		activeToolbarClass: 'btn-info',
		selectionMarker: 'edit-focus-marker',
		selectionColor: 'darkgrey',
		dragAndDropImages: true,
		showFontSize: false,
		fileUploadError: function (reason, jqXHR) { }
	};
	
}(window.jQuery));
