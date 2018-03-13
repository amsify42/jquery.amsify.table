(function($) {

    $.fn.amsifyTable = function(options) {

        // merging default settings with custom
        var settings = $.extend({
            type                : 'bootstrap',
            contentType         : 'table',
            searchMethod        : '',
            sortMethod          : '',
            afterSort           : {},
        }, options);

        /**
         * initialization begins from here
         * @type {Object}
         */
        var AmsifyTable = function () {

            this._table           = null;
            this.inputClass       = {
              amsify      : 'amsify-column-input',
              bootstrap   : 'form-control',
              materialize : 'browser-default',
            };
            this.columnSelector   = 'amsify-sort-table';
            this.paginateSelector = 'amsify-sort-paginate';
            this.columnInputArea  = 'amsify-column-input-span';
            this.paginateArea     = '#pagination';
            this.datePickerClass  = 'datepicker';
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
                var _self     = this;
                this._table   = table;
                this.setTableColumns();
            },

            setTableColumns     : function() {
              var _self           = this;
              var columnNames     = [];
              var columnInputs    = [];
              var columns         = $(this._table).find('.'+columnSelector);
              $.each(columns, function(key, column){
                var name              = $.trim($(column).text());
                columnNames.push(name);
                if($(column).hasClass('skip')) {
                  $(column).removeClass(columnSelector);
                  columnInputs[name]  = '';
                } else if($(column).attr('selecthtml')) {
                  var htmlSeletor     = $(column).attr('selecthtml');
                  columnInputs[name]  = '<select class="'+_self.getInputClass(type)+'">'+$(htmlSeletor).html()+'</select>';
                } else if($(column).attr('datepicker')) {
                  columnInputs[name]  = '<input type="text" placeholder="'+name+'" class="'+getInputClass(type, 'date', $(column).attr(_self.datePickerAttr))+'"/>';
                } else {
                  columnInputs[name]  = '<input type="text" placeholder="'+name+'" class="'+getInputClass(type, name)+'"/>';
                }
              });
              // If Drag Sortable is set
              if($(this._table).attr('drag-sortable')) {
                var ajaxAction  = $(this._table).attr('drag-sortable');
                $(this._table).find('tbody').addClass('tbody');
                AmsifyHelper.setDraggableSort($(this._table).find('.tbody'), settings.sortMethod, 'id', {}, config);
              }
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
              var _self = this;
              AmsifyHelper.setDefaultSortIcon('.'+this.columnSelector, type);
              $('.'+this.columnSelector).click(function(e){
                e.stopImmediatePropagation();
                $('.'+this.columnSelector).removeClass('active-sort');
                $(this).addClass('active-sort');
                if($(this).hasClass('skip')) {
                  return false;
                }
                var rowHtml         = $(this).html();
                var rowtxt          = $(this).clone().children().remove().end().text();
                var cellIndex       = $(this).parent('th').index();
                if($(this).data('selecthtml')) {
                  var rowSearchInput  = $(this).closest('tr').next().children().eq(cellIndex).find('.'+_self.inputClass.amsify).find(':selected').val();
                } else {
                  var rowSearchInput  = $(this).closest('tr').next().children().eq(cellIndex).find('.'+_self.inputClass.amsify).val();
                }

                if(rowSearchInput === undefined) {
                  rowSearchInput = '';
                }

                var result          = AmsifyHelper.getSortIcon(rowHtml, type, rowSearchInput);
                var basicSort       = result['basic'];
                var insertHtml      = result['insertHtml'];

                AmsifyTable.loadSortedResult(rowtxt, rowSearchInput, result['sort_type'], 1);

                if(type == 'bootstrap') {
                  $('.'+this.columnSelector).find('.fa').remove();
                  $(this).find('.fa').remove();
                } else {
                  $('.'+this.columnSelector).find('.sort-icon').remove();
                  $(this).find('.sort-icon').remove();           
                }

                $('.'+this.columnSelector).not(this).append(basicSort);
                $(this).append(insertHtml);

                $('.amsify-column-input').val('');
                $(this).closest('tr').next().children().eq(cellIndex).find('.amsify-column-input').val(rowSearchInput);
              }); 

             $('.'.this.inputClass.amsify).keyup(function(e){
               e.stopImmediatePropagation();
               if(e.keyCode == 13) {
                  var cellIndex  = $(this).parent('td').index();
                  $(this).closest('tr').prev().children().eq(cellIndex).find('.'+this.columnSelector).click();
               }
             });

             $('.'.this.inputClass.amsify).change(function(e){
                 e.stopImmediatePropagation();
                if(e.keyCode != 13) {
                 var cellIndex       = $(this).parent('td').index();
                 $(this).closest('tr').prev().children().eq(cellIndex).find('.'+this.columnSelector).click();
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
              var params      = {
                                  column  : sortColumn,
                                  input   : rowSearchInput,
                                  type    : sortType,
                                  page    : page,
                                  _token  : AmsifyHelper.getToken()
                                };
              var ajaxConfig  = {};
              ajaxConfig['beforeSend'] = function() {
                $(this.bodyLoaderClass).show();
                $(this._table).css('opacity', 0.5);
              };
              ajaxConfig['afterSuccess'] = function(data) {
                  if(settings.contentType == 'table') {
                    $(this._table).find('tbody').html(data['html']);
                  } else {
                    $(this._table).html(data['html']);  
                  }
                  $(paginateSelector).html(data['links']);
              };
              ajaxConfig['complete'] = function(data) {
                  $(this._table).css('opacity', '1');
                  $(this.bodyLoaderClass).hide();
                  AmsifyHelper.showURL('', page);
                  if(settings.afterSort && typeof settings.afterSort == "function") {
                    settings.afterSort(data);
                  }
              };
              AmsifyHelper.callAjax(settings.searchMethod, params, ajaxConfig);
            },

            getInputClass       : function(type, name, format) {
              var inputClass = this.inputClass.amsify+' '+this.inputClass[type];
              if(name !== undefined) {
                name = name.toLowerCase();  
                if(name == 'date' || name.indexOf('date') == 0) {
                  inputClass += ' '+this.datePickerClass;
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
                  $('.'+this.datePickerClass).datepicker({
                    dateFormat: format,
                  });
                });
              } else {
                $(function() {
                  $('.'+this.datePickerClass).datepicker({
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