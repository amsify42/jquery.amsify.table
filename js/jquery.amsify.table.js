 // Amsify42 Table 1.0.0
 // http://www.amsify42.com
 (function(AmsifyTable, $, undefined) {

    //Private Property
    var defaultType                = 'bootstrap';
    var defaultTableSelector       = 'table';
    var defaultSortSelector        = '.amsify-sort-table';
    var defaultContentType         = 'table';
    var defaultPaginateSelector    = '#pagination';
    var defaultAjaxMethod          = 'sort.php';

    var defaultSortPaginate        = '.amsify-sort-paginate';
    var defaultCallback;

    

    //Public Property
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


    //Public Methods
    AmsifyTable.init = function(config) {
      setConfig(config); 
      var defaultTable = new AmsifyTable.Table;
      defaultTable.set();
    };


    AmsifyTable.set = function(config) {
      var newTable = new AmsifyTable.Table();
      newTable.set(config);
    };


    AmsifyTable.setSort = function(config) {

      var type            = defaultType;
      var tableSelector   = defaultTableSelector;
      var sortSelector    = defaultSortSelector;  

      if(config !== undefined) {
        if(config.type !== undefined) { 
         type  = config.type;
       }
        if(config.tableSelector !== undefined) { 
         tableSelector  = config.tableSelector;
       }
       if(config.sortSelector !== undefined) { 
         sortSelector  = config.sortSelector;
       }
     }

     $(tableSelector).each(function(index, table){
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
        AmsifyTable.setDraggableSort(this);
      }

      AmsifyTable.setColumnInputs(this, columnNames, columnInputs);
      AmsifyTable.sortRows(this, sortSelector, config);
      AmsifyTable.sortPaginate(this, config);
    });
   };


   AmsifyTable.setDraggableSort = function(tableSelector) {
      $(tableSelector).addClass('sortable-table');
      $(function() {
        $(tableSelector).find('tbody').sortable({
          placeholder: 'ui-state-highlight',
          stop: function(event, ui) {
            var IDs = $(this).sortable('toArray');
            AmsifyTable.callAjax(this, tableSelector, IDs);
          }
        });
        $(tableSelector).find('tbody').disableSelection();
      });
   };

   AmsifyTable.callAjax = function(sortable, tableSelector, IDs) {
      $.ajax({
          type        : "POST",
          url         : AmsifyHelper.getActionURL($(tableSelector).attr('drag-sortable')),
          data        : { ids : IDs, _token : AmsifyHelper.getToken()},
          beforeSend  : function() {
            $('.section-body-loader').show();
            $(sortable).sortable('disable');
          },
          success     : function (data) {
            console.info('Success', data);
            var msgType = 'black';
            if(data['status'] !== undefined) {
              if(data['status'] == 'success') {
                msgType = 'success';
              } else if(data['status'] == 'info') {
                msgType = 'info';
              } else {
                msgType = 'error';
              }
            }
            AmsifyHelper.showFlash(data['message'], msgType);
          },
          error       : function (data) {
            console.info('Error', data);
            $(sortable).sortable('cancel');
            AmsifyHelper.showFlash('Something went wrong', 'error');
          },
          complete    : function() {
            $('.section-body-loader').hide();
            $(sortable).sortable('enable');
          } 
      });
   };

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


   AmsifyTable.setColumnInputs = function(table, names, inputs) {
      var inputsRow = '<tr class="amsify-column-input-span">';
      $.each(names, function(index, name){
        inputsRow += '<td>'+inputs[name]+'</td>';
      });
      inputsRow += '</tr>';
      $(table).find('thead').append(inputsRow);
   };




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

     setDefaultSortIcon(sortSelector, type);


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

        var result          = getSortIcon(rowHtml, type, rowSearchInput);
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





   AmsifyTable.loadSortedResult = function(sortColumn, rowSearchInput, type, tableSelector, contentType, paginateSelector, ajaxMethod, page, config) {

    var afterSort = defaultCallback;

    if(config !== undefined) {
      if(config.afterSort && typeof config.afterSort == "function") {
          afterSort = config.afterSort;
        }
    }

    
    $('.section-body-loader').show();
    $.ajax({
      type        : "POST",
      url         : ajaxMethod,
      data        : { column : sortColumn, input : rowSearchInput, type : type, page : page, _token : AmsifyHelper.getToken()},
      beforeSend  : function() {
        $(tableSelector).css('opacity', 0.5);
      },
      success     : function (data) {
        if(contentType == 'table') {
          $(tableSelector).find('tbody').html(data['html']);
        } else {
          $(tableSelector).html(data['html']);  
        }
        $(paginateSelector).html(data['links']);
      },
      error   : function (data) {
        console.info('Error', data);
      },
      complete    : function() {
        $(tableSelector).css('opacity', '1');
        $('.section-body-loader').hide();
        AmsifyHelper.showURL('', page);
        if(afterSort && typeof afterSort == "function") {
            afterSort();
        }
      } 
    });

  };



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
 



    function getSortIcon(rowHtml, type, rowSearchInput) {
        var result = [];
        // If css is bootstrap  
        if(type == 'bootstrap') {
         result['basic'] = ' <span class="fa fa-sort"></span>';

         var htmlArray  = rowHtml.split('class=');
         var reqHtml    = $.trim(htmlArray[1]);

         if(reqHtml == '' || reqHtml == '"fa fa-sort"></span>') {
          result['insertHtml'] = ' <span class="fa fa-sort-asc"></span>';
          result['sort_type']  = 'asc';
        } 
        else if(reqHtml == '"fa fa-sort-asc"></span>') {
          result['insertHtml'] = ' <span class="fa fa-sort-desc"></span>';
          result['sort_type']  = 'desc';
        } 
        else {
          result['insertHtml'] = ' <span class="fa fa-sort"></span>';
          result['sort_type']  = 'default';
        }

      }

        // If css is simple or default
        else {
          result['basic'] = ' <span class="sort-icon"><img src="'+AmsifyHelper.base_url+'/images/arrow-updown.png"></span>';
          var htmlArray   = rowHtml.split('class="sort-icon">');
          var reqHtml     = $.trim(htmlArray[1]);
          if(reqHtml == '' || reqHtml == '<img src="'+AmsifyHelper.base_url+'/images/arrow-updown.png"></span>') {
            result['insertHtml'] = ' <span class="sort-icon"><img src="'+AmsifyHelper.base_url+'/images/arrow-up.png"></span>';
            result['sort_type']  = 'asc';
          } 
          else if(reqHtml == '<img src="'+AmsifyHelper.base_url+'/images/arrow-up.png"></span>') {
            result['insertHtml'] = ' <span class="sort-icon"><img src="'+AmsifyHelper.base_url+'/images/arrow-down.png"></span>';
            result['sort_type']  = 'desc';
          } 
          else {
            result['insertHtml'] = ' <span class="sort-icon"><img src="'+AmsifyHelper.base_url+'/images/arrow-updown.png"></span>';
            result['sort_type']  = 'default';
          }
        }

      return result;
    };




    function setDefaultSortIcon(sortSelector, type) {
      //var defaultIcon = '<span class="sort-icon">&harr;</span>';
      var defaultIcon = ' <span class="sort-icon"><img src="'+AmsifyHelper.base_url+'/images/arrow-updown.png"></span>';
      if(type == 'bootstrap') {
        defaultIcon = ' <span class="fa fa-sort"></span>';      
      }
      $(sortSelector).append(defaultIcon);
    };





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


    AmsifyTable.addRow = function(content, rowContent) {

      if(content == 'table') {

        $table = $(content+' tbody');

        $table.find('.amsify-not-found').remove();
        $table.prepend(rowContent);
        $(content+' tbody tr:first').css({'background-color':'#CCFFCC','color':''});
        setTimeout(function() {
          $(content+' tbody tr:first').css({'background-color':'','color':''});
        }, 3000);

      } else {

        $table = $(content);
        $table.find('.amsify-not-found').remove();
        $table.children('div:eq(0)').after(rowContent);
        $(content+' div:eq(1)').css({'background-color':'#CCFFCC','color':''});
        setTimeout(function() {
          $(content+' div:eq(1)').css({'background-color':'','color':''});
        }, 3000);

      }

    };



    AmsifyTable.updateRow = function(content, rowIndex, rowContent) {

      if(content == 'table') {
        $row = $(content).closest('table').find('tbody tr:eq('+rowIndex+')');
      } else {
        $row = $(content+' div:eq('+rowIndex+')');
      }

      $row.empty().html(rowContent).css({"background-color":"#2FAFE5",'color':''});

      setTimeout(function() {
        $row.css({'background-color':'','color':''});
      }, 3000);

    };


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




    // Setting Configuations
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
         defaultCallback = config.afterSort;
       }
     }
   };


 }(window.AmsifyTable = window.AmsifyTable || {}, jQuery));   
