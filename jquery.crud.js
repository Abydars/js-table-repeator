$.fn.Crud = function(config) {
		var $table = $(this);
		
		var operate = {
			table: $table,
			tbody: null,
			thead: null,
			tfoot: null,
			columns: config.columns || {},
			data: config.data || [],
			saveAll: config.saveAll || false,
			saveEach: config.saveEach || false,
			deleteEach: config.deleteEach || false,
			disableDelete: config.disableDelete || false,
			init: function() {
				var t = this;
				
				t.drawData();
			},
			repairData: function() {Array
				var t = this;
				
				t.data = t.data.filter(a => a != "");
			},
			drawData: function() {
				var t = this;
				
				t.repairData();
				
				t.thead = t.prepareHeaders();
				t.tbody = t.prepareBody();
				t.tfoot = t.prepareFooter();
				
				t.table.empty();
				t.table.append(t.thead).append(t.tbody).append(t.tfoot);
				t.tbody.find('[data-view]').hide();
			},
			prepareHeaders: function() {
				var t = this;
				var $thead = $('<thead/>');
				var $row = $('<tr/>');
				
				Object.entries(t.columns).map(([k,col]) => {
					$row.append(`<th data-key="${k}">${col.heading}</th>`);
				});
				
				$thead.append($row);
				
				return $thead;
			},
			prepareBody: function() {
				var t = this;
				var $tbody = $('<tbody/>');
				
				for(var i in t.data) {
					var row = t.data[i];
					var $tr = $('<tr/>');
					
					Object.entries(t.columns).map(([k,col]) => {
						var $td = $('<td/>');
						
						switch(col.type) {
							case "dropdown":
								var $elem = $(`<select data-key="${k}" data-edit name="crud[${i}][${k}]"/>`);
								var selectedOptionName = null;
								
								for(var option of col.options) {
									var selected = (row[k] && option.value == row[k]) ? "selected" : "";
									selectedOptionName = selected != "" ? option.name : "";
									
									$elem.append(`<option value="${option.value}" ${selected}>${option.name}</option>`);
								}
								
								var $view = $(`<span data-view>${selectedOptionName}</span>`);
								
								$td.append($elem).append($view);
								
								break;
							case "checkbox":
								var selectedOptionName = null;
								
								for(var option of col.options) {
									var selected = false;
									
									if( col.check ) {
										selected = col.check(row[k], option) ? "checked" : "";
									} else {
										selected = (row[k] && option.value == row[k]) ? "checked" : "";
									}
								
									selectedOptionName = selected != "" ? option.name : "";
									
									$td.append(`<div><label><input type="checkbox" data-edit name="crud[${i}][${k}][]" value="${option.value}" ${selected}>&nbsp;${option.name}</label></div>`);
								}
								
								var $view = $(`<span data-view>${selectedOptionName}</span>`);
								
								$td.append($elem).append($view);
								
								break;
							case "actions":
								
								if(col.buttons) {
									for(var button of col.buttons) {
										var $btn = $('<button/>');

										$btn.text(button.name);
										$btn.on('click', button.onClick);

										$td.append($btn);
									}
								}
								
								if(t.saveEach)
									$td.append(t.rowSaveActionButton());
								
								if(!t.disableDelete)
									$td.append(t.rowDeleteActionButton());
								
								$td.append(t.rowHiddenFields(row, i));
								
								break;
							default:
								var val = row[k] ? row[k] : "";
								var $elem = $(`<input type="${col.type}" data-key="${k}" data-edit name="crud[${i}][${k}]" value="${val}"/>`);
								var $view = $(`<span data-view>${val}</span>`);
								$td.append($elem).append($view);
								break;
						}
						
						$tr.append($td);
						t.registerRowActions($tr);
					});
					
					$tbody.append($tr);
				}
				
				return $tbody;
			},
			prepareFooter: function() {
				var t = this;
				var colspan = Object.keys(t.columns).length;
				var $tfoot = $('<tfoot/>');
				var $row = $('<tr/>');
				var $td = $(`<td colspan="${colspan}"/>`);
				var $btn = $(`<button type="button" />`);
				
				$btn.text('Add New');
				$btn.on('click', (e) => {
					var $last_row = t.tbody.find('tr').last();
					var $cloned = $last_row.clone();
					var i1 = $last_row.index();
					var i2 = i1 + 1;
					
					t.data.push({});

					if($cloned.length) {
						$cloned.find('input:not([type=checkbox]):not([type=radio]),select').val("");
						$cloned.find('input[type=checkbox],input[type=radio]').prop('checked', false);
						$cloned.find(`[name^="crud[${i1}]"]`).each(function() {
							var n = $(this).attr('name').replace(`crud[${i1}]`, `crud[${i2}]`);
							$(this).attr('name', n);
						});
						t.tbody.append($cloned);
						t.registerRowActions($cloned);
					} else {
						t.drawData();
					}
				});
				
				$td.append($btn);
				$row.append($td);
				$tfoot.append($row);
				
				return $tfoot;
			},
			rowDeleteAction: function(t, e) {
				var $tr = $(e.target).parents('tr');
				var index = $tr.index();

				if(t.deleteEach)
					t.deleteEach(t.data[index], $tr);

				delete t.data[index];
				t.repairData();

				$tr.remove();
			},
			rowSaveAction: function(t, e) {
				var $tr = $(e.target).parents('tr');
				var index = $tr.index();
				var updatedData = {};
				
				$tr.find('[data-key]').each(function() {
					var k = $(this).attr('data-key');
					var v = $(this).val();
					
					updatedData[k] = v;
				});

				if(t.saveEach)
					t.saveEach(t.data[index], updatedData, $tr);
			},
			rowDeleteActionButton: function() {
				var t = this;
				var $btn = $('<button data-delete-action type="button"/>');
								
				$btn.text('Delete');
				
				return $btn;
			},
			rowSaveActionButton: function() {
				var t = this;
				var $btn = $('<button data-save-action type="button"/>');
				
				$btn.text('Save');
				
				return $btn;
			},
			registerRowActions: function($tr) {
				var t = this;
				
				$tr.find('[data-save-action]').on('click', (e) => t.rowSaveAction(t, e));
				$tr.find('[data-delete-action]').on('click', (e) => t.rowDeleteAction(t, e));
			},
			rowHiddenFields: function(row, i) {
				var t = this;
				var columns = Object.keys(t.columns);
				var fields = Object.keys(row).filter(f => columns.indexOf(f) < 0);
				var $hidden_fields = $('<div/>');
				
				for(var field of fields) {
					$hidden_fields.append(`<input type="hidden" name="crud[${i}][${field}]" value="${row[field]}" />`);
				}
				
				return $hidden_fields;
			}
		};
		
		operate.init();
		
		return operate;
	};
