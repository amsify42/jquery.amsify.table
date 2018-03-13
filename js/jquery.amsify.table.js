 // Amsify42 Table 1.0.0
 // http://www.amsify42.com
 (function(AmsifyTable, $, undefined) {
    /**
     * default type
     * @type {String}
     */
    var defaultType                = 'bootstrap';
    /**
     * default table selector
     * @type {String}
     */
    var defaultTableSelector       = 'table';
    /**
     * default sort selector
     * @type {String}
     */
    var defaultSortSelector        = '.amsify-sort-table';
    /**
     * default content type
     * @type {String}
     */
    var defaultContentType         = 'table';
    /**
     * default pagination selector
     * @type {String}
     */
    var defaultPaginateSelector    = '#pagination';
    /**
     * default ajax method action
     * @type {String}
     */
    var defaultAjaxMethod          = 'sort.php';
    /**
     * default sort paginate selector
     * @type {String}
     */
    var defaultSortPaginate        = '.amsify-sort-paginate';
    /**
     * default after sort callback as just intialization
     */
    var defaultAfterSort;

    /**
     * Making method available through Jquery selector
     * @param  {[type]} config [description]
     * @return {[type]}        [description]
     */
    $.fn.amsifyTableSort = function(config) {
        if(config !== undefined) {
          config['tableSelector'] = this;
        } else {
          var config = {tableSelector: this};
        }
        AmsifyTable.setSort(config);
    };
    
    /**
     * init the plugin with global settings
     * @param  {object} config
     */
    AmsifyTable.init = function(config) {
      setConfig(config); 
      var defaultTable = new AmsifyTable.Table;
      defaultTable.set();
    };

    /**
     * run the plugin with each instance settings
     * @param {object} config
     */
    AmsifyTable.set = function(config) {
      var newTable = new AmsifyTable.Table();
      newTable.set(config);
    };

    /**
     * This is like class which can be instantiated multiple times with each setting rules
     */
    AmsifyTable.Table = function() {
      AmsifyTable.Table.prototype.set = function(config) {
        if(config !== undefined) {
          AmsifyTable.setSort(config);
        } else {
          AmsifyTable.setSort();
        }
        AmsifyHelper.bodyLoaderIEfix();
      };
    };

    /**
     * set table sort
     * @param {object} config
     */
    AmsifyTable.setSort = function(config) {
      var type            = defaultType;
      var orderType       = 'amsify';
      var tableSelector   = defaultTableSelector;
      var sortSelector    = defaultSortSelector;  
      if(config !== undefined) {
        if(config.type !== undefined) { 
         type       = config.type;
         orderType  = config.type;
       }
        if(config.tableSelector !== undefined) { 
         tableSelector  = config.tableSelector;
       }
       if(config.sortSelector !== undefined) { 
         sortSelector  = config.sortSelector;
       }
     }

     $(tableSelector).each(function(index, table){
      $(tableSelector).attr('amsify-table-type', orderType);
      var columnNames     = [];
      var columnInputs    = [];
      var columns         = $(this).find(sortSelector);
      $.each(columns, function(key, column){
        var name              = $.trim($(column).text());
       columnNames.push(name);

       if($(column).hasClass('skip')) {
        $(column).removeClass(sortSelector.substring(1));
        columnInputs[name]  = '';
       }
       else if($(column).attr('selecthtml')) {
        var htmlSeletor     = $(column).attr('selecthtml');
        columnInputs[name]  = '<select class="'+getInputClass(type)+'">'+$(htmlSeletor).html()+'</select>';
       } 
       else if($(column).attr('datepicker')) {
        columnInputs[name]  = '<input type="text" placeholder="'+name+'" class="'+getInputClass(type, 'date', $(column).attr('datepicker'))+'"/>';
       }
       else {
        columnInputs[name]  = '<input type="text" placeholder="'+name+'" class="'+getInputClass(type, name)+'"/>';
       }
     });

      // If Ajax method is set
      if($(this).attr('data-method')) {
        if(config === undefined) {
            config = {};
        }
        config['ajaxMethod'] = $(this).data('method');
      }

      // If Drag Sortable is set
      if($(this).attr('drag-sortable')) {
        var ajaxAction  = $(this).attr('drag-sortable');
        $(this).find('tbody').addClass('tbody');
        AmsifyHelper.setDraggableSort($(this).find('.tbody'), ajaxAction, 'id', {}, config);
      }

      AmsifyTable.setColumnInputs(this, columnNames, columnInputs);
      AmsifyTable.sortRows(this, sortSelector, config);
      AmsifyTable.sortPaginate(this, config);
    });
   };

   /**
    * call ajax to sort rows
    * @param  {object}   sortable
    * @param  {selector} tableSelector
    * @param  {array}    IDs
    */
   AmsifyTable.callAjax = function(sortable, tableSelector, IDs) {
      var ajaxAction  = $(tableSelector).attr('drag-sortable');
      var params      = { ids : IDs, _token : AmsifyHelper.getToken() };
      var ajaxConfig  = {};
      ajaxConfig['beforeSend'] = function() {
          $('.section-body-loader').show();
          $(sortable).sortable('disable');
      };
      ajaxConfig['afterResponseError'] = function(data) {
          $(sortable).sortable('cancel');
      };
      ajaxConfig['complete'] = function() {
          $('.section-body-loader').hide();
          $(sortable).sortable('enable');
      };
      AmsifyHelper.callAjax(ajaxAction, params, ajaxConfig);
   };

   /**
    * create on click sort paginate
    * @param  {selector} tableSelector
    * @param  {object}   config
    */
   AmsifyTable.sortPaginate = function(tableSelector, config) {
      var sortPaginate        = defaultSortPaginate;
      var contentType         = defaultContentType;  
      var ajaxMethod          = defaultAjaxMethod;
      var paginateSelector    = defaultPaginateSelector;
      if(config !== undefined) {
        if(config.sortPaginate !== undefined) { 
         sortPaginate  = config.sortPaginate;
       }
       if(config.contentType !== undefined) { 
         contentType  = config.contentType;
       }
       if(config.ajaxMethod !== undefined) { 
         ajaxMethod  = config.ajaxMethod;
       }
       if(config.paginateSelector !== undefined) { 
         paginateSelector  = config.paginateSelector;
       }
     }
     $(document).on('click', sortPaginate, function(e){
       e.preventDefault();
       var column    = $(this).data('column');
       var sortType  = $(this).data('type');
       var page      = $(this).data('page');
       var input     = $(this).data('input');
       var href      = $(this).attr('href');
       if(href) {
        ajaxMethod = href;
       } else if($(tableSelector).data('method')) {
        ajaxMethod = AmsifyHelper.getActionURL($(tableSelector).data('method'));
       }
       AmsifyTable.loadSortedResult(column, input, sortType, tableSelector, contentType, paginateSelector, ajaxMethod, page, config);       
      });
   }

   /**
    * create column inputs for table
    * @param {selector} table
    * @param {array}    names
    */
   AmsifyTable.setColumnInputs = function(table, names, inputs) {
      var inputsRow = '<tr class="amsify-column-input-span">';
      $.each(names, function(index, name){
        inputsRow += '<td>'+inputs[name]+'</td>';
      });
      inputsRow += '</tr>';
      $(table).find('thead').append(inputsRow);
   };

   /**
    * sort table rows
    * @param  {selector} tableSelector
    * @param  {selector} sortSelector
    * @param  {object}   config
    */
   AmsifyTable.sortRows = function(tableSelector, sortSelector, config) {
      var type               = defaultType;
      var contentType        = defaultContentType;  
      var ajaxMethod         = defaultAjaxMethod;
      var paginateSelector   = defaultPaginateSelector;
      if(config !== undefined) {
        if(config.type !== undefined) { 
         type  = config.type;
       }
       if(config.contentType !== undefined) { 
         contentType  = config.contentType;
       }
       if(config.ajaxMethod !== undefined) { 
         ajaxMethod  = config.ajaxMethod;
       }
       if(config.paginateSelector !== undefined) { 
         paginateSelector  = config.paginateSelector;
       }
     }
     AmsifyHelper.setDefaultSortIcon(sortSelector, type);
     $(document).on('click', sortSelector, function(e){
        e.stopImmediatePropagation();
        $(sortSelector).removeClass('active-sort');
        $(this).addClass('active-sort');
        if($(this).hasClass('skip')) {
          return false;
        }
        var rowHtml         = $(this).html();
        var rowtxt          = $(this).clone().children().remove().end().text();
        var cellIndex       = $(this).parent('th').index();

        if($(this).data('selecthtml')) {
          var rowSearchInput  = $(this).closest('tr').next().children().eq(cellIndex).find('.amsify-column-input').find(':selected').val();
        } else {
          var rowSearchInput  = $(this).closest('tr').next().children().eq(cellIndex).find('.amsify-column-input').val();
        }

        if(rowSearchInput === undefined) {
          rowSearchInput = '';
        }

        var result          = AmsifyHelper.getSortIcon(rowHtml, type, rowSearchInput);
        var basicSort       = result['basic'];
        var insertHtml      = result['insertHtml'];

        AmsifyTable.loadSortedResult(rowtxt, rowSearchInput, result['sort_type'], tableSelector, contentType, paginateSelector, AmsifyHelper.getActionURL(ajaxMethod), 1);

        if(type == 'bootstrap') {
          $(sortSelector).find('.fa').remove();
          $(this).find('.fa').remove();
        } else {
          $(sortSelector).find('.sort-icon').remove();
          $(this).find('.sort-icon').remove();           
        }

        $(sortSelector).not(this).append(basicSort);
        $(this).append(insertHtml);

        $('.amsify-column-input').val('');
        $(this).closest('tr').next().children().eq(cellIndex).find('.amsify-column-input').val(rowSearchInput);
      }); 

     $(document).on('keyup', '.amsify-column-input', function(e){
       e.stopImmediatePropagation();
       if(e.keyCode == 13) {
          var cellIndex  = $(this).parent('td').index();
          $(this).closest('tr').prev().children().eq(cellIndex).find(sortSelector).click();
       }
     });

     $(document).on('change', '.amsify-column-input', function(e){
         e.stopImmediatePropagation();
        if(e.keyCode != 13) {
         var cellIndex       = $(this).parent('td').index();
         $(this).closest('tr').prev().children().eq(cellIndex).find(sortSelector).click();
       }
     });
   }; 

    /**
     * load sorted result
     * @param  {string}   sortColumn
     * @param  {string}   rowSearchInput
     * @param  {string}   type
     * @param  {selector} tableSelector
     * @param  {string}   contentType
     * @param  {selector} paginateSelector
     * @param  {string}   ajaxMethod
     * @param  {integer}  page
     * @param  {object}   config
     */
    AmsifyTable.loadSortedResult = function(sortColumn, rowSearchInput, type, tableSelector, contentType, paginateSelector, ajaxMethod, page, config) {
      
      var params      = { column : sortColumn, input : rowSearchInput, type : type, page : page, _token : AmsifyHelper.getToken()};
      var ajaxConfig  = {};

      ajaxConfig['beforeSend'] = function() {
        $('.section-body-loader').show();
        $(tableSelector).css('opacity', 0.5);
      };
      ajaxConfig['afterSuccess'] = function(data) {
          if(contentType == 'table') {
            $(tableSelector).find('tbody').html(data['html']);
          } else {
            $(tableSelector).html(data['html']);  
          }
          $(paginateSelector).html(data['links']);
      };
      ajaxConfig['complete'] = function(data) {
          $(tableSelector).css('opacity', '1');
          $('.section-body-loader').hide();
          AmsifyHelper.showURL('', page);
          if(config !== undefined) {
            if(config.afterSort && typeof config.afterSort == "function") {
              config.afterSort(data);
            }
          }
      };

      AmsifyHelper.callAjax(ajaxMethod, params, ajaxConfig);
    };

    /**
     * get input class
     * @param  {string} type
     * @param  {string} name
     * @param  {string} format
     * @return {string}
     */
    function getInputClass(type, name, format) {
      var inputClass = 'amsify-column-input';
      if(type == 'bootstrap') {
        inputClass += ' form-control';
      }
      else if(type == 'materialize') {
        inputClass += ' browser-default';
      }
      if(name !== undefined) {
        name = name.toLowerCase();  
        if(name == 'date' || name.indexOf('date') == 0) {
          inputClass += ' datepicker';
          if(format !== undefined && format != '')   {
            setDatePicker(type, format);
          } else {
            setDatePicker(type);
          }
        }
      }
      return inputClass;
    };

    /**
     * set datepicker for column input
     * @param {string} type
     * @param {string} format
     */
    function setDatePicker(type, format) {
      var defaultFormat = 'yy-mm-dd';
      if(format !== undefined) {
        defaultFormat = format;
      }
      if(type == 'bootstrap') {
        $(function() {
          $('.datepicker').datepicker({
            dateFormat: defaultFormat,
          });
        });
      } else {
        $(function() {
          $('.datepicker').datepicker({
            dateFormat: defaultFormat,
          });
        });
      }
    };

    /**
     * table row operation
     * @param  {string}   type
     * @param  {selector} selector
     * @param  {[integer} index
     * @param  {string}   html
     */
    AmsifyTable.tableOperation = function(type, selector, index, html) {
      if(type == 'add') {
        AmsifyTable.addRow(selector, html);
      } 
      else if(type == 'update') {
        AmsifyTable.updateRow(selector, index, html);
      }
      else if(type == 'delete') {
        AmsifyTable.removeRow(selector, index);
      }
    };

    /**
     * add table row
     * @param  {string}  content
     * @param  {string}  rowContent
     */
    AmsifyTable.addRow = function(content, rowContent){
      if(content == 'table') {
        $table = $(content+' tbody');
        $table.find('.amsify-not-found').remove();
        $(rowContent).prependTo($table)
                     .children()
                     .first()
                     .prepend(AmsifyHelper.reorderImage($(content).attr('amsify-table-type')));
        $(content+' tbody tr:first').css({'background-color':'#CCFFCC','color':''});
        setTimeout(function(){
          $(content+' tbody tr:first').css({'background-color':'','color':''});
        }, 3000);
      } else {
        $table = $(content);
        $table.find('.amsify-not-found').remove();
        $table.children('div:eq(0)').after(rowContent);
        $(content+' div:eq(1)').css({'background-color':'#CCFFCC','color':''});
        setTimeout(function(){
          $(content+' div:eq(1)').css({'background-color':'','color':''});
        }, 3000);
      }
    };

    /**
     * update table row
     * @param  {string}  content
     * @param  {integer} rowIndex
     * @param  {string}  rowContent
     */
    AmsifyTable.updateRow = function(content, rowIndex, rowContent) {
      if(content == 'table') {
        $row = $(content).closest('table').find('tbody tr:eq('+rowIndex+')');
      } else {
        $row = $(content+' div:eq('+rowIndex+')');
      }
      $row.empty().html(rowContent).css({"background-color":"#2FAFE5",'color':''});
      $row.children().first().prepend(AmsifyHelper.reorderImage($(content).attr('amsify-table-type')));
      setTimeout(function() {
        $row.css({'background-color':'','color':''});
      }, 3000);
    };

    /**
     * remove table row
     * @param  {string}  content
     * @param  {integer} rowIndex
     */
    AmsifyTable.removeRow = function(content, rowIndex) {
      if(content == 'table') {
        $row = $(content).closest('table').find('tbody tr:eq('+rowIndex+')');
      } else {
        $row = $(content+' div:eq('+rowIndex+')');
      }
      $row.css({"background-color":"#FF9999",'color':''});
      setTimeout(function() {
        $row.css({"background-color":"",'color':''});
      }, 3000);
      $row.fadeOut(3000);
      setTimeout(function() {
        $row.remove();
      }, 3000);
    };  

/**
 * 
 ************ Configuration section ************
 *
 **/
    /**
     * set the global config based on options passed
     * @param {object} config
     */
    function setConfig(config) {
      if(config !== undefined) {
       if(config.tableSelector !== undefined) {
         defaultTableSelector = config.tableSelector;
       }
       if(config.type !== undefined) {
         defaultType = config.type;
       }
       if(config.tableSelector !== undefined) {
         defaultTableSelector = config.tableSelector;
       }
       if(config.sortSelector !== undefined) {
         defaultSortSelector = config.sortSelector;
       }
       if(config.contentType !== undefined) {
         defaultContentType = config.contentType;
       }
       if(config.paginateSelector !== undefined) {
         defaultPaginateSelector = config.paginateSelector;
       }
       if(config.ajaxMethod !== undefined) {
         defaultAjaxMethod = config.ajaxMethod;
       }
       if(config.afterSort !== undefined) {
         defaultAfterSort = config.afterSort;
       }
     }
   };

 }(window.AmsifyTable = window.AmsifyTable || {}, jQuery));
