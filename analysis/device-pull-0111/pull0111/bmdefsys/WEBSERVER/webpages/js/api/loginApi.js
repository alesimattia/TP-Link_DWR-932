/* jqXHR object has following properties or keys

--------------
    readyState
    status
    statusText
    responseXML and/or responseText when the underlying request responded with xml and/or text, respectively
    setRequestHeader(name, value) 
    which departs from the standard by replacing the old value with the new one rather 
    than concatenating the new value to the old one
    getAllResponseHeaders()
    getResponseHeader()
    statusCode()
    abort()
--------------

*/
var auth_id; 
function loginApi_login(uname,passwd) {
	passwd = encodeURIComponent(passwd);
    var request = $.ajax({
        url: "login.cgi",
        type: "POST",
        data: { "uname" : uname ,"passwd" : passwd},
        dataType: "json"
    });
    request.done(function( responseData,textStatus, jqXHR ) {                  
            /* Set the cookie Note API response will have qSessId as sessionId*/           
       if(responseData.login_fail){
            dialogAlert(global_lang["login1"]["login-faild"]);
        } else {            
            /* Set the cookie Note API response will have qSessId as sessionId*/           
	        var expires ="";
	        if(parseInt(responseData.remain)> 0) 
	        {
			    var date = new Date();
			    date.setTime(date.getTime() + (24 * 60 * responseData.remain * 1000));
			    var expires = ";expires=" + date.toGMTString();             	
	        }                                  
            document.cookie ="DWRLOGGEDID="+getCookie("qSessId")+expires;
            document.cookie ="DWRLOGGEDUSER="+uname+expires;
            document.cookie ="DWRLOGGEDTIMEOUT="+responseData.remain+expires;
            window.location = "controlPanel.html";
            return;           
        }

        /* Login is failed */
        if(jqXHR.status == 401) {
            alert(responseData.login_fail);
        }
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {
       		if(jqXHR.responseText.indexOf("IP:") > 0)
       		{
       			var ip = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
				var text = ip.exec(jqXHR.responseText);
     			dialogAlert(global_lang["login1"]["login-failed1"]+text+", "+global_lang["login1"]["login-failed2"]);
       		}
		   	else
				dialogAlert(global_lang["login1"]["login-failed"]);
				doget();
	//alert(textStatus);
	//alert(errorThrown);    
    });
    request.always(function(responseData,textStatus, jqXHR ) {
	//alert(responseData.login_fail);       
    });


}

function loginApi_timeout_start() { 

//alert(loginApi_timeout_start);
$("#timer").html(global_AuthTimeout + "||" + global_authDefaulTimeout);

    if ( global_authDefaulTimeout < 0)
    {
        clearInterval(global_AuthTimeoutHandler);
        //console.log(global_AuthTimeout);
		var post_data = { "logout" : getCookie("qSessId")};

         var request = $.ajax({
            url: "/login.cgi",
            type: "POST",
            data: JSON.stringify(post_data),
            dataType: "json"
        });        
        clearCookies();
        alert(global_lang['login1']['session-logout']);
        window.location = "index.html";
        return;
        
    } else {
		/* Check for final device timeout */		
		if ( global_AuthTimeout < 20 ) {		
			loginApi_check_auth_reset();
		}		
        global_AuthTimeout = global_AuthTimeout - 1;
		global_authDefaulTimeout = global_authDefaulTimeout - 1;
       // $("#tf1_cpLoggedName").html (global_AuthTimeout);
        
    }

}

function clearCookies() {

     clearInterval(global_AuthTimeoutHandler);
     clearInterval(global_up5sTimeoutHandler);
     clearInterval(global_nwUsageTimeoutHandler);
     document.cookie ="DWRLOGGEDID=;expires=Thu, 01-Jan-70 00:00:00 GMT;";
     document.cookie ="DWRLOGGEDUSER=;expires=Thu, 01-Jan-70 00:00:00 GMT;";
     document.cookie ="DWRLOGGEDTIMEOUT=;expires=Thu, 01-Jan-70 00:00:00 GMT;";
     document.cookie ="qSessId=;expires=Thu, 01-Jan-70 00:00:00 GMT;";

}

function loginApi_logout() {

    var conf = confirm(global_lang["login1"]["logout_alert"]);
    if (conf) {
		var post_data = { "logout" : getCookie("qSessId")};

         var request = $.ajax({
            url: "/login.cgi",
            type: "POST",
            data: JSON.stringify(post_data),
            dataType: "json"
        });
       clearCookies();          
       window.location = "index.html";     
    }

}

function loginApi_check_auth() {
    if (getCookie("qSessId") == null ) {
       
        alert(global_lang['login1']['session-logout']);
        window.location = "index.html";
        return;
    } else {
        var request = $.ajax({
            url: "login.cgi",
            type: "POST",
            data: { "check_valid" : "qSessId="+getCookie("qSessId")},
            dataType: "json"
        });
        request.done(function( responseData,textStatus, jqXHR ) {     
           
            if(responseData.login_fail){
               clearCookies();
               alert(global_lang['login1']['session-logout']);
               window.location = "index.html";
               return;
            }
            /* Login is failed */
            if(jqXHR.status == 401) {
                clearCookies();
                window.location = "index.html";
                return;
            }

            /* ReSet the timeout cookie as per latest timeout 
               Note: This happens when you refresh the control panel page and we need to revaidate the cookie            
            */
            var date = new Date();
            date.setTime(date.getTime() + (24 * 60 * 179 * 1000));
            var expires = ";expires=" + date.toGMTString();
            document.cookie ="DWRLOGGEDTIMEOUT="+179+expires;
            global_AuthTimeout = 179; 
			global_authDefaulTimeout = ui_config["login_timeout"];     
        });
        request.fail(function( jqXHR, textStatus, errorThrown) {      
               clearCookies();
               alert(global_lang['login1']['session-logout']);
               window.location = "index.html";
               return;
          
        });
        request.always(function(  responseData,textStatus, jqXHR ) {
           
        });
  }

}


function loginApi_check_auth_reset() {

    if (getCookie("qSessId") == null ) {
       
        alert(global_lang['login1']['session-logout']);
        window.location = "index.html";
        return;
    } else {
        var request = $.ajax({
            url: "login.cgi",
            type: "POST",
            data: { "check_valid" : "qSessId="+getCookie("qSessId")},
            dataType: "json"
        });
        request.done(function( responseData,textStatus, jqXHR ) {     
           
            if(responseData.login_fail){
               clearCookies();
               alert(global_lang['login1']['session-logout']);
               window.location = "index.html";
               return;
            }
            /* Login is failed */
            if(jqXHR.status == 401) {
                clearCookies();
                window.location = "index.html";
                return;
            }

            /* ReSet the timeout cookie as per latest timeout 
               Note: This happens when you refresh the control panel page and we need to revaidate the cookie            
            */
            var date = new Date();
            date.setTime(date.getTime() + (24 * 60 * 179 * 1000));
            var expires = ";expires=" + date.toGMTString();
            document.cookie ="DWRLOGGEDTIMEOUT="+179+expires;
            global_AuthTimeout = 179;			
			        
        });
        request.fail(function( jqXHR, textStatus, errorThrown) {           
               clearCookies();
               alert(global_lang['login1']['session-logout']);
               window.location = "index.html";
               return;
          
        });
        request.always(function(  responseData,textStatus, jqXHR ) {
           
        });
  }

}


function cpApi_get_authId() {
        loginApi_check_auth();

        var request = $.ajax({
            url: "/data.ria?token=1",
            type: "GET",           
            dataType: "text",
			async: false
            });
        request.done(function( responseData,textStatus, jqXHR ) {       
             auth_id = responseData;
        });
        request.fail(function( jqXHR, textStatus, errorThrown) { 
        });
        request.always(function(responseData,textStatus, jqXHR ) {  
               
        });

}
