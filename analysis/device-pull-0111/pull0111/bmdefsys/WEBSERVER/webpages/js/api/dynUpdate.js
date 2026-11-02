function dynUpdate_nw_usage() {
     
    var request = $.ajax({
        url: "/data.ria? DynUpdate= nw_usage",
        type: "POST",
        //data: {"cookie":uname},
        dataType: "json"
    });
    
    request.done(function(responseData,textStatus, jqXHR ) {
        // alert(jqXHR.status);

        // dialogAlert(responsedata.status);
    });
    request.fail(function(jqXHR, textStatus, errorThrown) {
           // alert(jqXHR.status);
    });
    request.always(function(responseData,textStatus, jqXHR ) {
           // alert(jqXHR.status);
    });
    
}
