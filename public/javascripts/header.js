(function getVersion () {
    $("<header>").attr('id', 'main-header').load( "pages/header.html")
        .prependTo('body');
    $.ajax({
        url:'/version'
    }).success(function (data) {
        $('.version').html(data);
    });
})();