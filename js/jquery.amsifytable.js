(function($) {

    $.fn.amsifyTable = function(options) {

        // merging default settings with custom
        var settings = $.extend({
            type                : 'bootstrap',
            contentType         : 'table',
            searchMethod        : '',
            sortAction          : '',
            sortAttr            : 'id',
            sortParams          : {},
            afterSort           : {},
            flash               : false,
        }, options);
        /**
         * Global variable for this object context
         */
        var _self;
        /**
         * initialization begins from here
         * @type {Object}
         */
        var AmsifyTable = function () {
            /**
             * Assigning this context to _self
             * @type {object}
             */
            _self                 = this;
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
        };


        AmsifyTable.prototype = {
            /**
             * Executing all the required settings
             * @param  {selector} form
             * @param  {object} settings
             */
            _init               : function(table, settings) {
                this._table   = table;
                this.setTableColumns();
            },

            setTableColumns     : function() {
              var columnNames     = [];
              var columnInputs    = [];
              var columns         = $(this._table).find('thead tr th');
              $.each(columns, function(key, column){
                var name              = $.trim($(column).text());
                columnNames.push(name);
                if($(column).hasClass('skip')) {
                  $(column).removeClass(_self.columnSelector.substring(1));
                  columnInputs[name]  = '';
                } else {
                  $(column).addClass(_self.columnSelector.substring(1));
                  if($(column).attr('selecthtml')) {
                    var htmlSeletor     = $(column).attr('selecthtml');
                    columnInputs[name]  = '<select class="'+_self.getInputClass(settings.type)+'">'+$(htmlSeletor).html()+'</select>';
                  } else if($(column).attr('datepicker')) {
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
              var inputsRow = '<tr class="'+this.columnInputArea+'">';
              $.each(names, function(index, name){
                inputsRow += '<td>'+inputs[name]+'</td>';
              });
              inputsRow += '</tr>';
              $(this._table).find('thead').append(inputsRow);
            },

            sortRows            : function() {
              AmsifyHelper.setDefaultSortIcon(this.columnSelector, settings.type);
              $(this.columnSelector).click(function(e){
                console.info();
                e.stopImmediatePropagation();
                $(_self.columnSelector).removeClass('active-sort');
                $(this).addClass('active-sort');
                if($(this).hasClass('skip')) return false;
                var rowHtml         = $(this).html();
                var rowtxt          = $.trim($(this).clone().children().remove().end().text());
                var cellIndex       = $(this).index();
                var rowSearchInput  = '';
                if(!e.originalEvent) {
                  if($(this).data('selecthtml')) {
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

             $(_self.inputClass.amsify).keyup(function(e){
               e.stopImmediatePropagation();
               if(e.keyCode == 13) {
                  var cellIndex  = $(this).parent('td').index();
                  $(this).closest('tr').prev().children().eq(cellIndex).click();
               }
             });

             $(_self.inputClass.amsify).change(function(e){
                e.stopImmediatePropagation();
                if(e.keyCode != 13) {
                 var cellIndex = $(this).parent('td').index();
                 $(this).closest('tr').prev().children().eq(cellIndex).click();
               }
             });
           },

            sortPaginate        : function() {
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
              var params      = {
                                  column  : sortColumn,
                                  input   : rowSearchInput,
                                  type    : sortType,
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
                  $(_self.paginateSelector).html(data['links']);
              };
              ajaxConfig['complete'] = function(data) {
                  $(_self._table).css('opacity', '1');
                  $(_self.bodyLoaderClass).hide();
                  AmsifyHelper.showURL('', page);
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
            (new AmsifyTable)._init(this, settings);
        });

    };

}(jQuery));