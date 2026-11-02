function systemApi_languageSet(lang) {

			/* Get auth Id */
			cpApi_get_authId();
			//alert(auth_id);
			var post_data={"FileID": 1,"DEVICE":{ "language": parseInt(lang)},"authID":auth_id};	
			//alert(post_data);		

			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {  
				//clearCookies();
    			alert(global_lang['alerts_set']['language_save_success']);
    			window.location = "controlPanel.html"				  
    		});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		     	//alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });

}
function systemApi_languageGet(){
	var request= $.ajax({
			    	url: "/data.ria?FileID=1&sect_name=DEVICE",       
		       		 dataType: "json"
		   		 });
		    	request.done(function( responseData,textStatus, jqXHR ) {  
		    		ui_config.Dyn_Status["up_5s"]["lang"] = responseData["DEVICE"]["language"];
		    	});
		    	request.fail(function( jqXHR, textStatus, errorThrown) {	
		  	  	});
		   	  request.always(function(responseData,textStatus, jqXHR ) {       
		  	  });
	
	
}

function system_firmwareupgrade_get() {
 					
	var request = $.ajax({
	    url: "data.ria?DynUpdate=fw_info",       
        dataType: "json"
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
    		//alert(JSON.stringify(responseData));
    		ui_config["fw_info"] = responseData;
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
}

function systemApi_wizard_languageSet(lang) {

			/* Get auth Id */
			cpApi_get_authId();
			//alert(auth_id);
			var post_data={"FileID": 1,"DEVICE":{ "language": parseInt(lang)},"authID":auth_id};	
			//alert(post_data);		

			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {     		    
            
    		});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		     	//alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });

}

function systemApi_wizard_languageGet(){
	var request= $.ajax({
			    	url: "/data.ria?FileID=1&sect_name=DEVICE",       
		       		 dataType: "json"
		   		 });
		    	request.done(function( responseData,textStatus, jqXHR ) {  
		    		ui_config.Dyn_Status["up_5s"]["lang"] = responseData["DEVICE"]["language"];
		    	});
		    	request.fail(function( jqXHR, textStatus, errorThrown) {	
		  	  	});
		   	  request.always(function(responseData,textStatus, jqXHR ) {       
		  	  });
	
}

function systemApi_network_clearStat() {

			/* Get auth Id */
			cpApi_get_authId();
		
  
			var post_data={"CfgType":"reset_netstat","authID":auth_id};	
			//alert(post_data);		

			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {    
    			alert(global_lang['alerts_set']['packet_data_clear_success']);
    		});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		     	//alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });
}

function systemApi_SntpSet(status1,timezone,up_period,server1,server2,server3,dst_enable,start_m,start_w,start_d,start_clock,end_m,end_w,end_d,end_clock) {

			/* Get auth Id */
			cpApi_get_authId();
			//alert(auth_id);
			//console.log(status1);
			//var post_data={"FileID": 1,"SNTP": {"enable":status1 , "timezone": timezone, "update_period": up_period, "server1": server1, "server2": server2, "server3": server3}, "authID": auth_id};
            
			var post_data = {
				"FileID" : 1,
				"SNTP" : {"enable" : status1,
				"timezone" : timezone,
				"update_period" : up_period,
				"server1" : server1,
				"server2" : server2,
				"server3" : server3,
				"daylight_enable" : dst_enable,
				"daylight_start_m" : start_m,
				"daylight_start_w" : start_w,
				"daylight_start_d" : start_d,
				"daylight_start_clock" : start_clock,
				"daylight_end_m" : end_m,
				"daylight_end_w" : end_w,
				"daylight_end_d" : end_d,
				"daylight_end_clock" : end_clock
				},
				"authID": auth_id
			};
			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {
    			
    			

   			});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		     	//alert("try");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });
}

function systemApi_wizard_SntpSet(status1,timezone,up_period,server1,server2,server3,dst_enable,start_m,start_w,start_d,start_clock,end_m,end_w,end_d,end_clock) {
            //console.log("systemApi_wizard_SntpSet");
			/* Get auth Id */
			cpApi_get_authId();
			//alert(auth_id);
            //console.log("auth ok");
			//var post_data={"FileID": 1,"SNTP": {"enable":status1 , "timezone": timezone, "update_period": up_period, "server1": server1, "server2": server2, "server3": server3}, "authID": auth_id};
			
			//console.log(post_data);
			
			var post_data = {
				"FileID" : 1,
				"SNTP" : {"enable" : status1,
				"timezone" : timezone,
				"update_period" : up_period,
				"server1" : server1,
				"server2" : server2,
				"server3" : server3,
				"daylight_enable" : dst_enable,
				"daylight_start_m" : start_m,
				"daylight_start_w" : start_w,
				"daylight_start_d" : start_d,
				"daylight_start_clock" : start_clock,
				"daylight_end_m" : end_m,
				"daylight_end_w" : end_w,
				"daylight_end_d" : end_d,
				"daylight_end_clock" : end_clock
				},
				"authID": auth_id
			};

			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {
    		
   			});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		     	//alert("try");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });
}

function systemApi_datetimeSet(date) {

			/* Get auth Id */
			cpApi_get_authId();
			//alert(auth_id);

			var post_data={"date":date,"CfgType":"set_date","authID":auth_id}

			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {
    			
    		});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		     	//alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {		       
		    });

		    

}


function systemApi_wizard_datetimeSet(date) {
//console.log("systemApi_wizard_datetimeSet");
			/* Get auth Id */
			cpApi_get_authId();
			//alert(auth_id);
//console.log("auth ok");
			var post_data={"date":date,"CfgType":"set_date","authID":auth_id}
//console.log(post_data);
			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {
    			
    			 
    		});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		     	//alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {		       
		    });

		    

}

function systemApi_accountSet(uname,pass,auto_timeout,bm_pass) {

			/* Get auth Id */
			cpApi_get_authId();
			//alert(auth_id);

			var post_data={"FileID": 1, "DEVICE":{"web_usrname": uname, "web_passwd": bm_pass, "login_timeout": auto_timeout} , "authID":auth_id}; 


			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {    
    			clearCookies();
    			alert(global_lang['alerts_set']['account_save_success']);
    			window.location = "index.html";
              
    		});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		     	//alert("try");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });
}

/*
function UpdateTimeout(auto_timeout) {

			// Get auth Id 
			cpApi_get_authId();
			//alert(auth_id);

			var post_data={"FileID": 1, "DEVICE":{ "login_timeout": auto_timeout} , "authID":auth_id}; 


			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {    
    			clearCookies();
    			alert(global_lang['alerts_set']['account_save_success']);
    			//window.location = "index.html";
              
    		});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		     	//alert("try");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });
}
*/
function systemApi_wizard_accountSet(uname,pass) {
			/* Get auth Id */
			cpApi_get_authId();
			//alert(auth_id);

			var post_data={"FileID": 1, "DEVICE":{"web_usrname": uname, "web_passwd": pass} , "authID":auth_id}; 
			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {    
    			 
              
    		});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		     	//alert("try");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });
}



function systemApi_backUp() {

			/* Get auth Id */
			cpApi_get_authId();
	
			var post_data={"CfgType":"backup","file":["sms","router"],"authID":auth_id}; 

			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        contentType:"application/json",
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {   
    			//alert(JSON.stringify(responseData.path));	 
    			alert(global_lang['alerts_set']['config_file_save']);
    			window.location.href = responseData.path;
    		});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		    	//console.log(jqXHR);
		     	//alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });
}

function ProhibitionClick(){
	var $a = $(".leftMenuOne").find("a");
		$a.attr("href","javascript:;");
		$a.attr("onClick","javascript:;");
		
	$("#btnClose").click(function(){
			return false;
		});
		
	$("#ajax-content").find("input").attr("onClick","javascript:;");
	
	$("#nav li a").unbind("click");
	$("#nav li a").attr("href","javascript:;");
}

function redirectTimeoutFn(path) {
    if (--window.redirectTimeoutVar <= 0) {
    	parent.location.href=path;
    } else {
      $("#reboot_timeout").html(window.redirectTimeoutVar);
    }
}
function defaultRedirect(timeout, path) {
	$.ajaxSetup({async:true});
	$("#tf1_Progressbar").show();
    window.redirectTimeoutVar = timeout;
	$("#tf1_frm_statusBar div.usageDisplay").html(global_lang['system_popup']['rebooting_timeout']);
	$("#reboot_timeout").html(window.redirectTimeoutVar);
    setInterval("redirectTimeoutFn('" + path + "');", 1000);

}
function systemApi_reboot(value) {

			/* Get auth Id */
			cpApi_get_authId();
			
			var post_data={"CfgType":"reboot_reset","cmd": "reboot","authID":auth_id}; 
 
			//alert(JSON.stringify(post_data));
	
			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {
    			clearCookies();   
    			alert(global_lang['alerts_set']['restart_success']);
				var path = "index.html";
				ProhibitionClick();
				defaultRedirect(120,path,value);
    			//window.location = "index.html";
    		});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		    	//alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });
}

function systemApi_wizard_reboot() {

			/* Get auth Id */
			cpApi_get_authId();
			
			var post_data={"CfgType":"reboot_reset","cmd": "reboot","authID":auth_id}; 
 
			//alert(JSON.stringify(post_data));
	
			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {
    			 
    		});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		    	//alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });
}

function systemApi_resetTodefault(value) {

			/* Get auth Id */
			cpApi_get_authId();
			
	
			var post_data={"CfgType":"reboot_reset","cmd": "reset","authID":auth_id}; 
 
		//	alert(JSON.stringify(post_data));
	
			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {    
    			//console.log(jqXHR);
    			clearCookies();
    			alert(global_lang['alerts_set']['restart_success']);
				var path = "http://"+responseData.ip+"/";
				ProhibitionClick();
				defaultRedirect(120,path,value);
    			//window.location = "index.html";

    		});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		    	//console.log(jqXHR);
		     	clearCookies();
    			alert(global_lang['alerts_set']['restart_success']);
				var path = "index.html";
				defaultRedirect(120,path);
    			//window.location = "index.html";
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });
}

function systemApi_UpnpSet(status) {

			/* Get auth Id */
			cpApi_get_authId();
			
			var post_data={"FileID": 3, "Upnp": {"enable": parseInt(status,10)}, "authID": auth_id }
 
			
			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {
                if(responseData["cmd_status"] == "Fail"){
                    alert("Configuration saved failed");
                }else{
                    alert(global_lang['alerts_set']['config_save_success']);
                }
    		});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		    	//alert("try");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });
}
 
function systemApi_powersavingSet(suspendst,deepslepst) {

			/* Get auth Id */
			cpApi_get_authId();
		
			var post_data={"batt_idle_tm": parseInt(suspendst,10), "deep_sleep_tm": parseInt(deepslepst,10) ,"CfgType": "pwr_manag", "authID":auth_id} 
 
			
			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {    
    			alert(global_lang['alerts_set']['config_save_success']);
				system_powersaving_get();
				cp_powersaving_template();
    		});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		    	//alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });
}


function system_powersaving_get() {
 				
	var request = $.ajax({
	    url: "data.ria?FileID=1&sect_name=PWRMGR",        
        dataType: "json"		
	});
    request.done(function( responseData,textStatus, jqXHR ) {  
    		
    		ui_config["powersaving"] = responseData;
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
}

function systemApi_lcd_status_get() {
 				
	var request = $.ajax({
	    url: "data.ria?FileID=1&sect_name=lcd_status",        
        dataType: "json"		
	});
    request.done(function( responseData,textStatus, jqXHR ) {  
    		
    		ui_config["Lcd_status"] = responseData;
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
}

 
function systemApi_LcdOffSet(offtime) {

	/* Get auth Id */
	cpApi_get_authId();

	var post_data={"lcdoff_tm": parseInt(offtime,10),"CfgType": "lcd_status", "authID":auth_id}

	var request = $.ajax({
	url: "/webpost.cgi",
	type: "POST",
	data: JSON.stringify(post_data),
	dataType: "json"
	});

	request.done(function( responseData,textStatus, jqXHR ) {    
		alert(global_lang['alerts_set']['config_save_success']);
		//systemApi_lcd_status_get();
	});
	request.fail(function( jqXHR, textStatus, errorThrown) { 
		//alert("Invalid");
	});
	request.always(function(responseData,textStatus, jqXHR ) {	
	   
	});
}


function system_api_firmware_manual() {
	
    loginApi_check_auth();
	$(".meter-status").removeClass("active");
	$("#tf1_manualSt_init").addClass("active");
	$("#tf1_frm_statusBar span").width("0%");
	$("#tf1_frm_statusBar div.usageDisplay").html("");
	$("#tf1_btnManualStartUpdate").attr("disabled","disabled");
	$("#tf1_upgradeRouter").attr("disabled","disabled");
	global_AuthTimeout = 179;
	global_authDefaulTimeout = ui_config["login_timeout"];
	global_firmwareUpgradeTimeoutHandler = setInterval(function(){ system_api_firmware_loop()},3000);	
	$.ajaxFileUpload
    (
    {
    url:'/webupload.cgi',
    secureuri:false,
    fileElementId:'tf1_WebFUpload',
    dataType: 'json',
    success: function (data, status)
    {
    if(typeof(data.error) != 'undefined')
    {
    if(data.error != '')
    {
    alert(data.error);
    }else
    {
    //alert(msg); // returns location of uploaded file
    }
    }
    },
    error: function (data, status, e)
    {
    alert(e);
    }
    });

}

function system_api_firmware_loop() {
	
	system_api_fw_status();
	fwStatus_percent = parseInt(ui_config["fw_info"]["state"]["percent"],10);		
	width_perc = fwStatus_percent;
	width_perc = Math.round(width_perc);
	global_AuthTimeout = 179;
	global_authDefaulTimeout = ui_config["login_timeout"];
	if (width_perc == 0) {
		width_perc = 1;	
	}
	
	if  (ui_config["fw_info"]["state"]["state"] == 4 && ui_config["fw_info"]["state"]["error"] ==  2) {
		
		$("#tf1_frm_statusBar span").width("0%");
		clearInterval(global_firmwareUpgradeTimeoutHandler);
		global_firmwareUpgradeTimeoutHandler = false;		
		$("#tf1_frm_statusBar div.usageDisplay").html(global_lang['system_popup']['firmware_upload_fai']);
		$("#tf1_btnManualStartUpdate").removeAttr("disabled");
		$("#tf1_upgradeRouter").removeAttr("disabled","disabled");
		var $a = $(".leftMenuFour").find("a");
			$a.css("pointer-events","auto");
			$("#btnClose").css("pointer-events","auto");
		
	}  
	else if (ui_config["fw_info"]["state"]["state"] == 4 &&  ui_config["fw_info"]["state"]["error"] ==  0) {	
		/* Completed */
		$("#tf1_frm_statusBar div.usageDisplay").html(global_lang['system_popup']['firmware_complete']);
		//clearInterval(global_firmwareUpgradeTimeoutHandler);
		if (window.global_firmwareUpgradeTimeoutHandler){clearTimeout(window.global_firmwareUpgradeTimeoutHandler);}
		if (window.global_up5sTimeoutHandler){clearTimeout(window.global_up5sTimeoutHandler);}
		if (window.global_nwUsageTimeoutHandler){clearTimeout(window.global_nwUsageTimeoutHandler);}
		/*if (window.global_ussdsendTimeoutHandler){clearTimeout(window.global_ussdsendTimeoutHandler);}
		if (window.global_smsTimeoutHandler){clearTimeout(window.global_smsTimeoutHandler);}
		if (window.global_plmnSearchTimeoutHandler){clearTimeout(window.global_plmnSearchTimeoutHandler);}
		if (window.global_FotaUpgradeTimeoutHandler){clearTimeout(window.global_FotaUpgradeTimeoutHandler);}
		if (window.global_wifiPbcPinTimeoutHandler){clearTimeout(window.global_wifiPbcPinTimeoutHandler);}
		if (window.global_AuthTimeoutHandler){clearTimeout(window.global_AuthTimeoutHandler);}*/
		global_firmwareUpgradeTimeoutHandler = false;	
		//$(".install").hide();

		$(".meter-status").removeClass("active");
		$("#tf1_manualSt_reboot").addClass("active");
		var path = "index.html";
		defaultRedirect(120,path);
	} 
	else if  ( ui_config["fw_info"]["state"]["state"] == 9 ) {
		
		/* Uploading in progress */
		$("#tf1_frm_statusBar span").width("0%");
		$("#tf1_frm_statusBar div.usageDisplay").html(global_lang['system_popup']['firmware_updating']);
		$(".meter-status").removeClass("active");
		$("#tf1_manualSt_update").addClass("active");
		
/*	} else if ( ui_config["fw_info"]["state"]["state"] == 10 ) {
		
		$("#tf1_frm_statusBar div.usageDisplay").html(global_lang['system_popup']['rebooting']);
		$(".meter-status").removeClass("active");
		$("#tf1_manualSt_reboot").addClass("active");		
*/	
	}
}

function system_api_fota_reboot() {
	
			cpApi_get_authId();
			
			var post_data={"CfgType":"reboot_reset","cmd": "reboot","authID":auth_id}; 
 
			//alert(JSON.stringify(post_data));
	
			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {
    			clearCookies();   
				var path = "index.html";
				defaultRedirect(120,path);
    			//window.location = "index.html";
    		});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		    	//alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });
}

function system_api_fw_status() {
	
	var request = $.ajax({
        url: "data.ria?DynUpdate=fw_state",        
        dataType: "json",
        async: global_cploaded
    });
    request.done(function( responseData,textStatus, jqXHR ) {              
         ui_config["fw_info"]["state"] = responseData;
		 //console.log(responseData);
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	 
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });

}

function system_api_fota_download_status() {
	
	var request = $.ajax({
        url: "data.ria?DynUpdate=fota_download_fw_state",        
        dataType: "json",
        async: global_cploaded
    });
    request.done(function( responseData,textStatus, jqXHR ) {   
        ui_config["fota_fw_info"] = responseData;
		 //console.log("fota_download_status"+responseData);
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {
            console.log("fail fail fail fail fail fota_download_status, usb disconnected ??");
            //alert("fail fail fail fail fail fota_download_status");
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });

}

 
function system_api_autocheck() {
			
        /* Get auth Id */
    //cpApi_get_authId();
    disable_global_timer_when_busy();
    var request = $.ajax({
        url: "/data.ria?servercheck=1",          
        dataType: "json",
        async: true
        });
    request.done(function( responseData,textStatus, jqXHR ) {     
         if(responseData.check==0)
         {
            var strs_cur= new Array(); var strs_new= new Array(); 
            var result=0;
            strs_cur=responseData.current_version.split(".");
            strs_new=responseData.new_version.split(".");
            for(var i = 0;i < strs_cur.length;i++)
            {
                if(strs_cur[i] < strs_new[i]);
                {
                    result=1;
                }
            }
            if(result==1)
            {
                //ProhibitionClick();
                $("#tf1_Progressbar").show();
                $("#tf1_frm_statusBar span").width("0%");	
                $("#tf1_frm_statusBar div.usageDisplay").html(global_lang['validation_msgs']['Have_new_version']);
                $("#tf1_ProgressBakbar").hide();
                alert(global_lang['validation_msgs']['Have_new_version']);
                $("#tf1_btnRemoteStartUpdate").show();
            }
            else
            {
                $("#tf1_Progressbar").show();
                $("#tf1_frm_statusBar span").width("0%");
                $("#tf1_frm_statusBar div.usageDisplay").html(global_lang['validation_msgs']['No_new_version']);
                $("#tf1_ProgressBakbar").hide();
                alert(global_lang['validation_msgs']['No_new_version']);
                $("#tf1_btnRemote").show();
            }
         }
         else
         {
            $("#tf1_Progressbar").show();
            $("#tf1_frm_statusBar span").width("0%");
            $("#tf1_frm_statusBar div.usageDisplay").html(global_lang['validation_msgs']['No_new_version']);
            $("#tf1_ProgressBakbar").hide();
            alert(global_lang['validation_msgs']['No_new_version']);
            $("#tf1_btnRemote").show();
         }
         //auth_id = responseData;
         restore_global_timer_when_idle();
    });
    request.fail(function( jqXHR, textStatus, errorThrown) { 
        restore_global_timer_when_idle();
    });
    request.always(function(responseData,textStatus, jqXHR ) {  
           
    });
}

function disable_global_timer_when_busy()
{
    if (global_up5sTimeoutHandler)
        global_up5sTimeoutHandler = clearInterval(global_up5sTimeoutHandler);
    if (global_AuthTimeoutHandler)
        global_AuthTimeoutHandler = clearInterval(global_AuthTimeoutHandler);
}
function restore_global_timer_when_idle()
{
    global_up5sTimeoutHandler = setInterval(function(){cp_up_5s()},5000);
    global_AuthTimeoutHandler = setInterval(function(){loginApi_timeout_start()},1000);
}

function system_api_fota_autoupgrade() {
 		var download_result;
		ProhibitionClick();

		$("#tf1_btnRemoteStartUpdate").hide();
		 var request = $.ajax({
	        url: "/data.ria?download=1",
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {
    			download_result=responseData.download;	
			if(parseInt(download_result) != 0)
			{
				alert(global_lang['validation_msgs']['Down_version_fail']);
				$("#tf1_Progressbar").hide();
				$("#tf1_btnRemoteStartUpdate").hide();
				$("#tf1_btnRemote").show();
			}	
			else
			{
                disable_global_timer_when_busy();
				$("#tf1_upgradeRouter").attr("disabled","disabled");
				alert(global_lang['validation_msgs']['start_down']);
				system_api_fota_download_status();
	
				global_FotaUpgradeTimeoutHandler = setInterval(function(){ system_api_firmware_auto_loop()},1000);
				
			}
    		});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		    	//alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });
}
function system_api_FotaSuccessReboot(){
	cpApi_get_authId();
	var post_data={"CfgType":"reboot_reset","cmd":"reboot","authID":auth_id};
	var request = $.ajax({
		url:"/webpost.cgi",
		type: "POST",
		data: JSON.stringify(post_data),
		dataType: "json"
	});
	request.done(function(responseData,textStatus,jqXHR){
		clearInterval(global_FotaUpgradeTimeoutHandler);
		global_FotaUpgradeTimeoutHandler = false;		
		clearCookies();   
		var path = "index.html";
		defaultRedirect(120,path);
	});
	request.fail(function( jqXHR, textStatus, errorThrown) { 
		//alert("Invalid");
	});
	request.always(function(responseData,textStatus, jqXHR ) {	
	   
	});
}

function system_api_firmware_auto_loop() {
    global_authDefaulTimeout = ui_config["login_timeout"];// prevent ui session timeout then logout
    system_api_fota_download_status();
    console.log(ui_config["fota_fw_info"]);
    if(ui_config["fota_fw_info"]["thread_result"] != 0 && ui_config["fota_fw_info"]["thread_result"] != -1){
        if(ui_config["fota_fw_info"]["thread_result"] == 1)
        {
            alert(global_lang['validation_msgs']['internetdisconnect']);
        }
        else if(ui_config["fota_fw_info"]["thread_result"] == 2)
        {
            alert(global_lang['validation_msgs']['File_md5_wrong']);
        }
        else if(ui_config["fota_fw_info"]["thread_result"] == 3)
        {
            alert(global_lang['validation_msgs']['File_wrong']);
        }
        else if(ui_config["fota_fw_info"]["thread_result"] == 4)
        {
            alert(global_lang['validation_msgs']['No_version_fail']);
        }
        restore_global_timer_when_idle();
        
        clearInterval(global_FotaUpgradeTimeoutHandler);
        global_FotaUpgradeTimeoutHandler = false;	
        window.location = "controlPanel.html";	
    }
    else if(ui_config["fota_fw_info"]["thread_result"] == 0)
    {
        if(ui_config["fota_fw_info"]["bin_fw_filesize"] != 0 && ui_config["fota_fw_info"]["image_fw_filesize"] ==  0) {
            $("#tf1_manualSt_init").removeClass("active");
            $("#tf1_manualSt_update").addClass("active");  
            $("#tf1_frm_statusBar div.usageDisplay").html(global_lang['validation_msgs']['down_success']);
            
        } else if(ui_config["fota_fw_info"]["bin_fw_filesize"] == 0 && ui_config["fota_fw_info"]["image_fw_filesize"] ==  0) {
            $("#tf1_manualSt_init").removeClass("active");
            $("#tf1_manualSt_update").removeClass("active");
            $("#tf1_manualSt_reboot").addClass("active");   
            $("#tf1_frm_statusBar div.usageDisplay").html(global_lang['validation_msgs']['Upgrade_success']);
			system_api_FotaSuccessReboot();
            
        } else
        {
            $("#tf1_manualSt_init").addClass("active");
            $("#tf1_frm_statusBar div.usageDisplay").html(global_lang['validation_msgs']['start_down']);
        }
    }
    else
    {
        $("#tf1_frm_statusBar span").width(ui_config["fota_fw_info"]["download_percent"]+"%");
    }

}

/* Testing functionality  */
function checkNew(id) {
	

	if (id ==1) {  
	
		// Wifi ON/OFF 
		
		var request = $.ajax({
        url:"/data.ria?CfgType=get_apsta_onoff",
        dataType: "json"
		});
		
    request.done(function( responseData,textStatus, jqXHR ) {  
			//alert(JSON.stringify(responseData));
			 
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {     
   });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
		
	}


	if (id ==2) {   /// Post wifi 
		
			cpApi_get_authId();
		
			var post_data= {"apsta_turnon":0,"CfgType":"set_apsta_onoff","authID":auth_id};
			
			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {    
    			//alert(JSON.stringify(responseData));
    		});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		    	//alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });
	
	
	}
	
	if (id == 3 ) {
		
		cpApi_get_authId();
		
		var post_data= {"CfgType":"sms_action","sms_into_sim":"0","authID":auth_id} 
		var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {    
    			//alert(JSON.stringify(responseData));
    		});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		    	//alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });
		
	}
	
	if (id == 4) {
	
		cpApi_get_authId();
		
		var post_data= {"cmd":"random_wpa2key_hex","CfgType":"wifi_genkey","authID":auth_id} 
		var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {    
    			//alert(JSON.stringify(responseData));
    		});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		    	//alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });
		
		var request = $.ajax({
	    url: "data.ria?CfgType=get_wifi_genkey",       
        dataType: "json"
		});
		request.done(function( responseData,textStatus, jqXHR ) {  
				// alert(responseData.key);
		});
		request.fail(function( jqXHR, textStatus, errorThrown) {	
		});
		request.always(function(responseData,textStatus, jqXHR ) {       
		});
		
	}
	
	if (id ==5) {  
	
		// Wifi ON/OFF 
		
		var request = $.ajax({
        url:"/data.ria?FileID=10&sect_name=SMSC",
        dataType: "json"
		});
		
    request.done(function( responseData,textStatus, jqXHR ) {  
			//alert(JSON.stringify(responseData));
			 
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {     
   });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
		
	}
	
}

/**/
