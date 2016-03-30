$(function getVersion () {
    $("<header>").attr('id', 'main-header')
        .load( "pages/header.html", function () {
            $.ajax({
                url:'/version'
            }).success(function (data) {
                $('.version').html(data);
            });
        })
        .prependTo('body');

    var isScrollingDown = true,
        tempHeight = 0,
        gap = 0,
        height = 30;
    var header = $("#main-header");

    $(window).scroll(function(event) {
        console.log($('body').scrollTop());
        gap = tempHeight - $('body').scrollTop();
        console.log('gap',gap);
        console.log('isScrollingDown',isScrollingDown);
        if(gap < 0){
            height = 0;
        }else{
            height = 52;
        }
        if(gap < 0){
            isScrollingDown = true
        }
        // height += gap;
        // if(height > 30){
        //     height = 30;
        // }
        header.height(height); 
        // console.log('height', height);
        tempHeight = $('body').scrollTop();
    });;
});