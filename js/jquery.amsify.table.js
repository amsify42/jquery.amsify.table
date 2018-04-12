/**
 * Amsify Jquery Table 2.0
 * http://www.amsify42.com
 */
(function($) {

    $.fn.amsifyTable = function(options) {
        /**
         * Merging default settings with custom
         * @type {object}
         */
        var settings = $.extend({
            type                : 'bootstrap',
            contentType         : 'table',
            searchMethod        : '',
            sortAction          : '',
            sortAttr            : 'id',
            sortParams          : {},
            afterSort           : {},
            flash               : false,
            rowCheckbox         : false,
        }, options);

        /**
         * Initialization begins from here
         * @type {Object}
         */
        var AmsifyTable = function () {
            this._table           = null;
            this.inputClass       = {
              amsify      : '.amsify-column-input',
              bootstrap   : '.form-control',
              materialize : '.browser-default',
            };
            this.columnSelector   = '.amsify-sort-table';
            this.paginateSelector = '.amsify-sort-paginate';
            this.columnInputArea  = '.amsify-column-input-span';
            this.paginateArea     = '#pagination';
            this.datePickerClass  = '.datepicker';
            this.datePickerAttr   = 'datepicker';
            this.dateFormat       = 'yy-mm-dd';
            this.searchActionAttr = 'data-method';
            this.sortActionAttr   = 'drag-sortable';
            this.bodyLoaderClass  = '.section-body-loader';
            this.selectHtmlAttr   = 'select-html';
        };

        AmsifyTable.prototype = {
            /**
             * Executing all the required settings
             * @param  {selector} form
             */
            _init               : function(table) {
                this._table   = table;
                if(this._table) this.setTableColumns();
            },

            setTableColumns     : function() {
              var _self           = this;
              var columnNames     = [];
              var columnInputs    = [];
              var columns         = $(this._table).find('thead tr th');
              $.each(columns, function(key, column){
                var name                = $.trim($(column).text());
                columnNames.push(name);
                if($(column).hasClass('skip')) {
                  $(column).removeClass(_self.columnSelector.substring(1));
                  columnInputs[name]    = '';
                } else {
                  $(column).addClass(_self.columnSelector.substring(1));
                  if($(column).data(_self.selectHtmlAttr)) {
                    var htmlSeletor     = $(column).data(_self.selectHtmlAttr);
                    columnInputs[name]  = $(htmlSeletor).html();
                  } else if($(column).attr(_self.datePickerAttr)) {
                    columnInputs[name]  = '<input type="text" placeholder="'+name+'" class="'+_self.getInputClass(settings.type, 'date', $(column).attr(_self.datePickerAttr))+'"/>';
                  } else {
                    columnInputs[name]  = '<input type="text" placeholder="'+name+'" class="'+_self.getInputClass(settings.type, name)+'"/>';
                  }
                } 
              });
              // If Drag Sortable is set
              var sortAction = $(this._table).attr('drag-sortable');
              if(sortAction || settings.sortAction) {
                var action  = (sortAction)? sortAction: settings.sortAction;
                $(this._table).find('tbody').addClass('tbody');
                AmsifyHelper.setDraggableSort($(this._table).find('.tbody'), action, settings.sortAttr, settings.sortParams, settings);
              }
              this.setColumnInputs(columnNames, columnInputs);
              this.sortRows();
              this.sortPaginate();
            },

            setColumnInputs     : function(names, inputs) {
              var _self     = this;
              var inputsRow = '<tr class="'+this.columnInputArea+'">';
              $.each(names, function(index, name){
                inputsRow += '<td>'+inputs[name]+'</td>';
              });
              inputsRow += '</tr>';
              $(this._table).find('thead').append(inputsRow);
              $(this._table).find('thead').find(':input').each(function(inputIndex, input){
                  if(!$(input).hasClass(_self.inputClass.amsify.substring(1))) {
                    $(input).addClass(_self.getInputClass(settings.type));
                  }
              });
              if(settings.rowCheckbox) {
                $(this._table).find('thead').find('tr').each(function(rowIndex, row){
                    $(row).prepend('<td><input type="checkbox" style="width: 16px; height: 16px;"/></td>');
                });
                this.setRowCheckbox();
              }
            },

            setRowCheckbox      : function() {
              var _self = this;
              $(this._table).find('tbody').find('tr').each(function(rowIndex, row){
                  var value = ($(this).attr(settings.sortAttr))? $(this).attr(settings.sortAttr): ($(this).index()+1);
                  $(row).prepend('<td><input type="checkbox" name="rows[]" value="'+value+'" style="width: 16px; height: 16px;"/></td>');
              });
              $(this._table).find('input[type="checkbox"]:first').prop('checked', 0);
              $(this._table).find('input[type="checkbox"]:first').click(function(){
                if($(this).is(':checked')) {
                  $(_self._table).find('input[type="checkbox"]').prop('checked', 1);
                } else {
                  $(_self._table).find('input[type="checkbox"]').prop('checked', 0);
                }
              });
              $(this._table).find('input[type="checkbox"]:not(:first)').click(function(){
                if($(this).is(':checked')) {
                  var total   = $(_self._table).find('input[type="checkbox"]:not(:first)').length;
                  var checked = $(_self._table).find('input[type="checkbox"]:not(:first):checked').length;
                  if(checked >= total) {
                    $(_self._table).find('input[type="checkbox"]:first').prop('checked', 1);
                  }
                } else {
                  $(_self._table).find('input[type="checkbox"]:first').prop('checked', 0);
                }
              });
            },

            sortRows            : function() {
              var _self = this;
              AmsifyHelper.setDefaultSortIcon(this.columnSelector, settings.type);
              $(this.columnSelector).click(function(e){
                e.stopImmediatePropagation();
                $(_self.columnSelector).removeClass('active-sort');
                $(this).addClass('active-sort');
                if($(this).hasClass('skip')) return false;
                var rowHtml         = $(this).html();
                var rowtxt          = $.trim($(this).clone().children().remove().end().text());
                var cellIndex       = $(this).index();
                var rowSearchInput  = '';
                if(!e.originalEvent) {
                  if($(this).data(_self.selectHtmlAttr)) {
                    rowSearchInput  = $(this).closest('tr').next().children().eq(cellIndex).find(_self.inputClass.amsify).find(':selected').val();
                  } else {
                    rowSearchInput  = $(this).closest('tr').next().children().eq(cellIndex).find(_self.inputClass.amsify).val();
                  }
                } else {
                    $(this).closest('tr').next().children().eq(cellIndex).find(_self.inputClass.amsify).val('');
                }

                if(rowSearchInput === undefined) rowSearchInput = '';

                var result          = AmsifyHelper.getSortIcon(rowHtml, settings.type, rowSearchInput);
                var basicSort       = result['basic'];
                var insertHtml      = result['insertHtml'];

                _self.loadSortedResult(rowtxt, rowSearchInput, result['sort_type'], 1);

                if(settings.type == 'bootstrap') {
                  $(_self.columnSelector).find('.fa').remove();
                  $(this).find('.fa').remove();
                } else {
                  $(_self.columnSelector).find('.sort-icon').remove();
                  $(this).find('.sort-icon').remove();           
                }

                if(rowSearchInput) {
                  $(_self.columnSelector).append(basicSort);
                } else {  
                  $(_self.columnSelector).not(this).append(basicSort);
                  $(this).append(insertHtml);
                }

                $(_self.inputClass.amsify).val('');
                $(this).closest('tr').next().children().eq(cellIndex).find(_self.inputClass.amsify).val(rowSearchInput);
              }); 

             $(_self.inputClass.amsify).on('input change', function(e){
               e.stopImmediatePropagation();
               if((e.type == 'keyup' && e.keyCode == 13) || (e.type == 'change' && e.keyCode != 13)) {
                  var cellIndex  = $(this).parent('td').index();
                  $(this).closest('tr').prev().children().eq(cellIndex).click();
               }
             });
           },

            sortPaginate        : function() {
              var _self = this;
              $(this.paginateSelector).click(function(e){
                 e.preventDefault();
                 var column    = $(this).data('column');
                 var sortType  = $(this).data('type');
                 var page      = $(this).data('page');
                 var input     = $(this).data('input');
                 var href      = $(this).attr('href');
                 if(href) {
                  ajaxMethod = href;
                 } else if($(_self._table).data('method')) {
                  ajaxMethod = AmsifyHelper.getActionURL($(_self._table).data('method'));
                 }
                 _self.loadSortedResult(column, input, sortType, page);       
              });
            },

            loadSortedResult    : function(sortColumn, rowSearchInput, sortType, page) {
              var _self       = this;
              var params      = {
                                  column  : sortColumn,
                                  input   : rowSearchInput,
                                  sort    : sortType,
                                  page    : page,
                                };
              var ajaxConfig  = {};
              ajaxConfig['beforeSend'] = function() {
                $(_self.bodyLoaderClass).show();
                $(_self._table).css('opacity', 0.5);
              };
              ajaxConfig['afterSuccess'] = function(data) {
                if(settings.contentType == 'table') {
                  $(_self._table).find('tbody').html(data['html']);
                } else {
                  $(_self._table).html(data['html']);  
                }
                $(_self.paginateArea).html(data['pagination']);
                _self.sortPaginate();
                if(settings.rowCheckbox) _self.setRowCheckbox();
              };
              ajaxConfig['complete'] = function(data) {
                $(_self._table).css('opacity', '1');
                $(_self.bodyLoaderClass).hide();
                // var paramsURI = (rowSearchInput)? page+'&'+sortColumn.toLowerCase()+'='+rowSearchInput: page;
                // paramsURI     = (sortType != 'default')? paramsURI+'&sort='+sortType: paramsURI;
                // AmsifyHelper.showURL('', paramsURI);
                if(settings.afterSort && typeof settings.afterSort == "function") {
                  settings.afterSort(data);
                }
              };
              AmsifyHelper.callAjax(settings.searchMethod, params, ajaxConfig, 'POST');
            },

            getInputClass       : function(type, name, format) {
              var inputClass = this.inputClass.amsify.substring(1)+' '+this.inputClass[type].substring(1);
              if(name !== undefined) {
                name = name.toLowerCase();  
                if(name == 'date' || name.indexOf('date') == 0) {
                  inputClass += ' '+this.datePickerClass.substring(1);
                  if(format !== undefined && format != '')   {
                    this.setDatePicker(type, format);
                  } else {
                    this.setDatePicker(type);
                  }
                }
              }
              return inputClass;
            },

            setDatePicker     : function(type, format) {
              format  = (format)? format: this.dateFormat;
              if(type == 'bootstrap') {
                $(function() {
                  $(this.datePickerClass).datepicker({
                    dateFormat: format,
                  });
                });
              } else {
                $(function() {
                  $(this.datePickerClass).datepicker({
                    dateFormat: format,
                  });
                });
              }
            },   
        };
        
        /**
         * Initializing each instance of selector
         * @return {object}
         */
        return this.each(function() {
            (new AmsifyTable)._init(this);
        });

    };

}(jQuery));