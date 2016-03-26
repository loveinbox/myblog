;(function getVersion () {
    $("<header>").attr('id', 'main-header')
        .load( "pages/header.html", function () {
            $.ajax({
                url:'/version'
            }).success(function (data) {
                $('.version').html(data);
            });
        })
        .prependTo('body');
})();