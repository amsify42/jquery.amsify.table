 // Amsify42 Table 1.0.0
 // http://www.amsify42.com
 (function(AmsifyTable, $, undefined) {

    //Private Property
    var base_url                   = window.location.protocol+'//'+window.location.host;
    var _token                     = $('meta[name="_token"]').attr('content');

    var defaultType                = 'bootstrap';
    var defaultTableSelector       = 'table';
    var defaultSortSelector        = '.amsify-sort-table';
    var defaultContentType         = 'table';
    var defaultPaginateSelector    = '#pagination';
    var defaultAjaxMethod          = 'sort.php';

    var defaultSortPaginate        = '.amsify-sort-paginate';
    var defaultCallback;

    

    //Public Property
    AmsifyTable.base_url        = base_url;

    AmsifyTable.Table = function() {
      AmsifyTable.Table.prototype.set = function(config) {
        if(config !== undefined) {
          AmsifyTable.setSort(config);
        } else {
          AmsifyTable.setSort();
        }
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

      var tableSelector   = defaultTableSelector;
      var sortSelector    = defaultSortSelector;  

      if(config !== undefined) {
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
       if($(column).attr('selecthtml')) {
        var htmlSeletor     = $(column).attr('selecthtml');
        columnInputs[name]  = '<select class="amsify-column-input">'+$(htmlSeletor).html()+'</select>';
       } else {
        columnInputs[name]   = '<input type="text" placeholder="'+name+'" class="amsify-column-input"/>';
       }
     });

      if($(this).attr('data-method')) {
        if(config === undefined) {
            config = {};
        }
        config['ajaxMethod'] = $(this).data('method');
      }

      AmsifyTable.setColumnInputs(this, columnNames, columnInputs);
      AmsifyTable.sortRows(this, sortSelector, config);
      AmsifyTable.sortPaginate(this, config);
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
       } else {
        ajaxMethod = AmsifyTable.base_url+'/'+ajaxMethod;
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


        AmsifyTable.loadSortedResult(rowtxt, rowSearchInput, result['sort_type'], tableSelector, contentType, paginateSelector, AmsifyTable.base_url+'/'+ajaxMethod, 1);

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

    var callback = defaultCallback;

    if(config !== undefined) {
      if(config.callback && typeof config.callback == "function") {
          callback = config.callback;
        }
    }

    $(tableSelector).css('opacity', 0.5);
    $('.section-body-loader').show();
    $.ajax({
      type    : "POST",
      url     : ajaxMethod,
      data    : { column : sortColumn, input : rowSearchInput, type : type, page : page, _token : _token},
      success : function (data) {
        //console.info('Success', data);
        if(contentType == 'table') {
          $(tableSelector).find('tbody').html(data['html']);
        } else {
          $(tableSelector).html(data['html']);  
        }

        $(paginateSelector).html(data['links']);
        $(tableSelector).css('opacity', '1');
        $('.section-body-loader').hide();
        // if(Amsify.detectIE() == false) {
        //   window.history.pushState('', '', '?page='+page);
        //   $("html, body").animate({ scrollTop: 0 }, "slow");
        // }
        if(callback && typeof callback == "function") {
            callback();
        }
        return true;
      },
      error   : function (data) {
        //console.info('Error', data);
        $(tableSelector).css('opacity', '1');
        $('.section-body-loader').hide();
        return false;
      } 
    });

  };







  function getSortIcon(rowHtml, type, rowSearchInput) {
        var result = [];
        // If css is bootstrap  
        if(type == 'bootstrap') {
         result['basic'] = '<span class="fa fa-sort"></span>';

         var htmlArray  = rowHtml.split('class=');
         var reqHtml    = $.trim(htmlArray[1]);

         if(reqHtml == '' || reqHtml == '"fa fa-sort"></span>') {
          result['insertHtml'] = '<span class="fa fa-sort-asc"></span>';
          result['sort_type']  = 'asc';
        } 
        else if(reqHtml == '"fa fa-sort-asc"></span>') {
          result['insertHtml'] = '<span class="fa fa-sort-desc"></span>';
          result['sort_type']  = 'desc';
        } 
        else {
          result['insertHtml'] = '<span class="fa fa-sort"></span>';
          result['sort_type']  = 'default';
        }

      }

        // If css is simple or default
        else {
          result['basic'] = ' <span class="sort-icon"><img src="'+AmsifyTable.base_url+'/images/arrow-updown.png"></span>';
          var htmlArray   = rowHtml.split('class="sort-icon">');
          var reqHtml     = $.trim(htmlArray[1]);
          if(reqHtml == '' || reqHtml == '<img src="'+AmsifyTable.base_url+'/images/arrow-updown.png"></span>') {
            result['insertHtml'] = '<span class="sort-icon"><img src="'+AmsifyTable.base_url+'/images/arrow-up.png"></span>';
            result['sort_type']  = 'asc';
          } 
          else if(reqHtml == '<img src="'+AmsifyTable.base_url+'/images/arrow-up.png"></span>') {
            result['insertHtml'] = '<span class="sort-icon"><img src="'+AmsifyTable.base_url+'/images/arrow-down.png"></span>';
            result['sort_type']  = 'desc';
          } 
          else {
            result['insertHtml'] = '<span class="sort-icon"><img src="'+AmsifyTable.base_url+'/images/arrow-updown.png"></span>';
            result['sort_type']  = 'default';
          }
        }

      return result;
    };




    function setDefaultSortIcon(sortSelector, type) {
      //var defaultIcon = '<span class="sort-icon">&harr;</span>';
      var defaultIcon = '<span class="sort-icon"><img src="'+AmsifyTable.base_url+'/images/arrow-updown.png"></span>';
      if(type == 'bootstrap') {
        defaultIcon = '<span class="fa fa-sort"></span>';      
      }
      $(sortSelector).append(defaultIcon);
    };




    function removeRow(tableSelector, rowSelector) {

      $(tableSelector+' '+rowSelector).css({"background-color":"#FF9999",'color':''});

      setTimeout(function() {
        $(tableSelector+' '+rowSelector).css({"background-color":"",'color':''}).effect("highlight", {}, maxTimeOut);
      }, maxTimeOut);

      $(tableSelector+' tbody').find(rowSelector).fadeOut(minTimeOut);
      setTimeout(function() {

        $(tableSelector+' tbody').find(rowSelector).remove();
      }, minTimeOut);
    };



    function addRow(tableSelector, rowContent) {

      $(tableSelector+" tbody").prepend(rowContent);
      $(tableSelector+" tbody tr:first").css({"background-color":"#CCFFCC",'color':''});

      setTimeout(function() {
        $(tableSelector+" tbody tr:first").css({"background-color":"",'color':''}).effect("highlight", {}, maxTimeOut);
      }, maxTimeOut);

    };


    function updateRow(tableSelector, rowSelector, rowContent) {

      $(tableSelector+" tbody").find(rowSelector).empty().html(rowContent);
      $(tableSelector+" "+rowSelector).css({"background-color":"#2FAFE5",'color':''});

      setTimeout(function() {
        $(tableSelector+" "+rowSelector).css({"background-color":'','color':''}).effect("highlight", {}, maxTimeOut);
      }, maxTimeOut);

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
       if(config.callback !== undefined) {
         defaultCallback = config.callback;
       }
     }
   };


 }(window.AmsifyTable = window.AmsifyTable || {}, jQuery));   
