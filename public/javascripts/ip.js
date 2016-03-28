var step = $('.js-limit').val();
var list = $('.page-number-list');
var currentPageNumber = 1;

$(function buildPageList () {
    $.ajax({
        url:'/ipDataCount'
    }).success(function (data) {
        var listLength = Math.ceil(data/step);
        buildList(listLength, currentPageNumber);
        getPageData(currentPageNumber, step);

        $('.js-go').click(function(event) {
            var pageInputValue = $('.js-page').val();
            if(pageInputValue > 0 && pageInputValue < listLength){
                buildList(listLength, pageInputValue);
            }            
        });
        $('.js-limit').change(function(event) {
            buildList(listLength, currentPageNumber);
        });
        $('.pre').click(function(event) {
            if(currentPageNumber > 1){
                currentPageNumber--;
            }
            buildList(listLength, currentPageNumber);
        });
        $('.next').click(function(event) {
            if(currentPageNumber < listLength){
                currentPageNumber++;
            }
            buildList(listLength, currentPageNumber);
        });
    });
    function buildList (listLength, currentPageNumber) {
        step = $('.js-limit').val();
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
            buildList(listLength, currentPageNumber);
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