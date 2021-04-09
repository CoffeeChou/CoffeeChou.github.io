$(document).ready(function() {
    $("div.top-btn a.btn").on("click", function(){
        window.scrollTo({top: 0, behavior: "smooth"});
        $("html body").animate({scrollTop:0});
        $("div.content_container").animate({scrollTop:0});
    });
});
