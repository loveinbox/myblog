var step = $('.js-limit').val();
var list = $('.page-number-list');
var listLength = 1;
var recordCount = 1;
var currentPageNumber = 1;

$(function buildPageList () {
    $.ajax({
        url:'/ipDataCount'
    }).success(function (data) {
        recordCount = data;
        listLength = Math.ceil(recordCount/step);
        buildList();
        getPageData(currentPageNumber, step);

        $('.js-go').click(function(event) {
            var pageInputValue = $('.js-page').val();
            currentPageNumber = pageInputValue;
            if(pageInputValue > 0 && pageInputValue < listLength){
                buildList();
            }            
        });
        $('.js-limit').change(function(event) {
            currentPageNumber = 1;
            listLength = Math.ceil(recordCount/step);
            buildList();
        });
        $('.pre').click(function(event) {
            if(currentPageNumber > 1){
                currentPageNumber--;
            }
            buildList();
        });
        $('.next').click(function(event) {
            if(currentPageNumber < listLength){
                currentPageNumber++;
            }
            buildList();
        });
    });
    function buildList () {
        step = $('.js-limit').val();
        listLength = Math.ceil(recordCount/step);
        var recordStart = (currentPageNumber - 1) * step;
        getPageData(recordStart, step);

        list.empty();
        for (var i = 0, pageNumber = 1; i < listLength; i++) {
            if(i == currentPageNumber - 1){
                $('<li>').addClass('active').html(pageNumber).appendTo(list);
            }else{
                if(listLength < 7){
                    $('<li>').html(pageNumber).appendTo(list);
                }else{
                    if(i === listLength - 1 || i === listLength - 2 || i === 1 || i === 0){
                        $('<li>').html(pageNumber).appendTo(list);
                    }else{
                        if(i === listLength - 3 || i === currentPageNumber - 2){
                            $('<li>').html('...').appendTo(list);
                        }
                    }                    
                }
            }
            pageNumber++;
        } 
        $('.page-number-list li').click(function(event) {
            currentPageNumber = $(this).html();
            buildList();
        });
    }
});

function getPageData (page, limit) {
    if(page === ''){
        page = 0;
    }
    $.ajax({
        url:'/ipData?page=' + (page - 1) + '&limit='+ limit,
        contentType: "application/json; charset=UTF-8"
    }).success(function (data) {
        $('#tbody').empty();
        var rows = JSON.parse(data).rows;
        $.each(rows, function (index, value) {
            var tr = $('<tr>');
            $('<td>').html(value['id']).appendTo(tr);
            $('<td>').html(value['time']).slice(-13).appendTo(tr);
            $('<td>').html('IP: ' + value['ip'] + '<br>' + 'RA: ' + value['remoteAddress']).appendTo(tr);
            $('<td>').html(value['host']).appendTo(tr);
            $('<td>').html(value['headers']).appendTo(tr);
            tr.prependTo(tbody);
        });
    });
}