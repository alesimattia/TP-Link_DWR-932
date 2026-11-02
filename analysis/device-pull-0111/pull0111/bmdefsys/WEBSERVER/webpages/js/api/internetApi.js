function internetApi_get() {
     
    var request = $.ajax({
        url: "internet.php",
       //type: "POST",
        //data: {"cookie":uname},
        dataType: "json"
    });
    
    request.done(function(responseData,textStatus, jqXHR ) {
        // alert(jqXHR.status);
    });
    request.fail(function(jqXHR, textStatus, errorThrown) {
    });
    request.always(function(responseData,textStatus, jqXHR ) {
    });
    
}


function internet_onloadInternetApnConfig() {
	
	internet_apninfo_get();	
	internet_apnget_template();
	internet_apnModeSelect();
	onloadCall();
}


function internet_onloadConnmodeConfig() {	
	
	internet_apninfo_get();
	internet_cnmode_get_template();
	internet_changeConnectionModeOne($("#tf1_autoConnectionOnOff").val());
}



function internet_apninfo_get(){
	
	var request = $.ajax({
	    url: "data.ria?CfgType=get_apn_cfg",       
        dataType: "json"
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
			  
    		ui_config["apn_info"] = responseData;
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });

}


/*APN info template */
function internet_cnmode_get_template(){
   var tmpl_cnmodeinfo_data = ui_config["apn_info"];  
   
   var pagefn = doT.template(document.getElementById('cnmodeinfoTemplate').text);
   $("#tf1_tmpl_cnmode_info").html(pagefn(tmpl_cnmodeinfo_data));

}

/*Conection Mode Settings template */
function internet_apnget_template(){
   var tmpl_fwinfo_data = ui_config["apn_info"];   
   var pagefn = doT.template(document.getElementById('apninfoTemplate').text);
   $("#tf1_tmpl_apn_info").html(pagefn(tmpl_fwinfo_data));

}


/**
 * function for validate form when user clicks on submit button
 * OnSubmit event
 * @method pageValidate
 * @param frmId - Form ID
 */
function internet_ApnConfigValidate(frmId) {
	if(ui_config.Dyn_Status["up_5s"]["sim_status"]["status"] == 0){
		alert(global_lang['alerts_set']['no_sim_status']);
		return false;
	}
	var txtFieldIdArr = new Array();
	txtFieldIdArr[0] = "tf1_apn,"+global_lang['validation_msgs']['pls_enter_valid_APN'];
	//txtFieldIdArr[1] = "tf1_DialNumber,Please enter valid DialNumber";
	//txtFieldIdArr[2] = "tf1_userName,Please enter valid UserName";
	//txtFieldIdArr[3] = "tf1_Password,Please enter valid Password";	
	if (txtFieldArrayCheck(txtFieldIdArr) == false)
		return false;
	internet_ApnConfig();
	//internet_api_ApnConfig();	 
}
function check_wifi_str(obj){   
	if(!obj) return true;
	 var str=obj; 
	 var code;
	 for(var i=0 ; i<str.length; i++){
		code=str.charCodeAt(i);
		if (code<21 || code>126 || code == 32) {
		  return false;
		}
	}
	return true;
}
function internet_ApnConfig(){
	type = $("#tf1_apnMode").val();
	if (type == "Auto") {
		type  = 0;	
	}
	else { 
		type  = 1;	
	}
	if(type == 1 && ui_config.Dyn_Status["up_5s"]["ipv4"]["status"] == "Connected"){
		//alert(global_lang['alerts_set']['apn_network_state']);
		if( win.confirm(global_lang["login1"]["information"],global_lang['alerts_set']['apn_network_state'],function (r){
		//win.alertEx('结果：' + (r ? "是" : "不是"))
			if(r){internet_api_ApnConfig();}
				})){
						}else{return;}
	}else{
		internet_api_ApnConfig();
	}
}
function internet_api_ApnConfig() {
	
	/* Get auth_id */
    cpApi_get_authId();
	
	type = $("#tf1_apnMode").val();
	if (type == "Auto") {
		type  = 0;	
	}
	else { 
		type  = 1;	
	}
	
	auth =$("#tf1_apnAuth").val();
	var tf1_apn = $("#tf1_apn").val();
	if(!check_wifi_str(tf1_apn))
		{
			alert(global_lang['alerts_set']['apn_enter'])
			return;
		}
	var post_data = {
						"CfgType":"apn",
						"authID":auth_id,
						"APN_0":{
									"type":parseInt(type,10),
									"apn": encodeURIComponent(tf1_apn),
									"uname": encodeURIComponent($("#tf1_userName").val()),							
									"passwd": encodeURIComponent($("#tf1_Password").val()),
									"re_passwd": $("#tf1_Password").val(),
									"auth":parseInt(auth,10),
									"pdp_type":0						
								}
					 };
					 
			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});			 
			//console.log(post_data);
			request.done(function( responseData,textStatus, jqXHR ) {
				if(responseData.cmd_status == "Done"){
					alert(global_lang['alerts_set']['apn_save_success']);
				}else{
					alert(global_lang['alerts_set']['apn_save_failed']);
				}
    			$("#tf1_dialog").hide();  			    
    			$("#tf1_overlay").hide();  			    
          	});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		     	//alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    }); 
	
}


function internet_api_cnmodeConfig() {
	
	/* Get auth_id */
    cpApi_get_authId();
	var cnmodeTmp = '{';
	var autoCn = parseInt($("#tf1_autoConnectionOnOff").val(),10);
	if(parseInt(ui_config["apn_info"]["apn"]["COMMON"]["auto_conx"],10) != autoCn)
	{
		cnmodeTmp += '"auto_conx"';
		cnmodeTmp += ': ';
		cnmodeTmp += autoCn;
		
	}
	var autoRoaming = parseInt($("#tf1_autoRoaming").val(),10);
	if(parseInt(ui_config["apn_info"]["apn"]["COMMON"]["roaming_conx"],10) != autoRoaming)
	{
		if(cnmodeTmp.length != 1)
		{
			cnmodeTmp += ',';
		}
		cnmodeTmp += '"roaming_conx"';
		cnmodeTmp += ': ';
		cnmodeTmp += autoRoaming;
	}
	var netpref = parseInt($("#tf1_netPref").val(),10);
	if(parseInt(ui_config["apn_info"]["apn"]["COMMON"]["netpref_value"],10) != netpref)
	{
		if(cnmodeTmp.length != 1)
		{
			cnmodeTmp += ',';
		}
		cnmodeTmp += '"netpref_value"';
		cnmodeTmp += ': ';
		cnmodeTmp += '"'+netpref+'"';
	}
	cnmodeTmp += '}';
	var post_data = {"CfgType":"apn", "authID":auth_id, "COMMON": eval("("+cnmodeTmp+")")};
	
	 /*
	var post_data = {
						"CfgType":"apn",
						"authID":auth_id,
						 "COMMON":{
							 		"auto_conx": parseInt($("#tf1_autoConnectionOnOff").val(),10),
									"roaming_conx": parseInt($("#tf1_autoRoaming").val(),10),
									"netpref_value":  $("#tf1_netPref").val()
							}
					 };
	*/				 
			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});			 
			//console.log(post_data);
			request.done(function( responseData,textStatus, jqXHR ) {  
			
			
					/* setting the global variable when it is disconnected */
							if (parseInt($("#tf1_netPref").val(),10) == 8) {
								global_disconnect_service = "2G";	
							} else if (parseInt($("#tf1_netPref").val(),10) == 7) {
								global_disconnect_service = "3G";						
						  	} else if (parseInt($("#tf1_netPref").val(),10) == 6) {
							   global_disconnect_service = "LTE";
						   	} else {
							   global_disconnect_service = null;
						   	}
				
					  if ($("#tf1_autoConnectionOnOff").val() == 0) {
						  
			  			/*If it is disconnect connect first to make sure that API 
							is updated with latest Connection changed settings
						*/
						/*
						  if ($("#tf1_modeConfig_connectDisconnect").val() == "0") {							
							internet_api_manualConnectDisconnect(1);									
						  } else {
							  
							global_disconnect_service = null;  
						  }
						  */
						  internet_api_manualConnectDisconnect($("#tf1_modeConfig_connectDisconnect").val());
						  
						   if ( $("#tf1_modeConfig_connectDisconnect").val() == 1) {
						  		alert(global_lang['alerts_set']['cnmode_success']);
						   } else {
							   alert(global_lang['alerts_set']['cnmode_success1']);
						   }
					  } else {								  
    				    alert(global_lang['alerts_set']['cnmode_success1']); 
					  }
					/* Reload all the up_5s */
					cp_up_5s_2();					
					
          	});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		     	//alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    }); 
	
}

function internet_api_manualConnectDisconnect(manualConnect) {
	cpApi_get_authId();	 
	var ifc = "all";
	manualConnect = parseInt(manualConnect,10);
	if ( manualConnect == 1) {
		ifc = "lte";	
	}
	var post_data = {
					  "connect":manualConnect,
					  "ifc":ifc,
					  "CfgType":"connect_btn",
					  "authID":auth_id
					 };
					 
	 var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});			 
			//console.log(post_data);
			request.done(function( responseData,textStatus, jqXHR ) {    
    			
          	});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		     	//alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
	}); 
		
}


function internet_plmnmode_get(){
	
	var request = $.ajax({
	    url: "data.ria?CfgType=get_plmn_cfg",       
        dataType: "json"
        
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
    		ui_config["plmn_info"] = responseData;			
			ui_config["plmnlist_info"] = ui_config["plmn_info"]["plmnlist"];
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
}

function internet_plmnlist_get(){    
    var request = $.ajax({
        url: "data.ria?DynUpdate=get_plmnsrch_list",       
        dataType: "json",
		async: true
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
           ui_config["plmnlist_info"] = responseData;
		   ui_config["plmn_info"]["plmnlist"] = responseData;
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {    
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
}

function internet_api_plmnSearch() {
	
	/* Get auth Id */
	ui_config["plmnlist_info"]["plmn_state"] = "1";
	cpApi_get_authId();
	var post_data = {"CfgType":"plmn_search","authID":auth_id};	
	var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) { 			  
				global_plmnSearchTimeoutHandler = setInterval(function(){internet_plmnSearch_loop()},3000);
				clearInterval(global_up5sTimeoutHandler);
				clearInterval(global_nwUsageTimeoutHandler);
    		});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		     	//alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });
	

}

function internet_plmnSearch_loop() {
	
	if (ui_config["plmnlist_info"]["plmn_state"] == "1") {	
		internet_plmnlist_get();
	} else {		
		clearInterval(global_plmnSearchTimeoutHandler);
		cp_up_5s();
		cp_nw_usage();
	    global_up5sTimeoutHandler = setInterval(function(){cp_up_5s()},5000); 
		global_nwUsageTimeoutHandler = setInterval(function(){cp_nw_usage()},5000); 
		internet_plmnMode();
	}
	
}


function internet_api_plmnSet() {
	
	/* Get auth Id */
	
	cpApi_get_authId();	
	var rat = null;
	var plmnMode =  parseInt(comboSelectedValueGet('tf1_plmnMode'), 10);	
	if ( plmnMode == 0 ) {	
		var post_data = {"sel_mode":0,"oper_name":"","mcc":0,"mnc":0,"CfgType":"plmn","authID":auth_id};	
	} else {
		 var plmnOperator = parseInt(radioCheckedValueGet("tf1_plmnOperator0"),10);
		 //console.log(plmnOperator);	 
		  var post_data = {
			  				"sel_mode":1,
							"oper_name": ui_config["plmn_info"]["plmnlist"]["plmnlist"][plmnOperator]["opname"],
							"mcc":parseInt(ui_config["plmn_info"]["plmnlist"]["plmnlist"][plmnOperator]["mcc"],10),
							"mnc":parseInt(ui_config["plmn_info"]["plmnlist"]["plmnlist"][plmnOperator]["mnc"],10),
							"rat":ui_config["plmn_info"]["plmnlist"]["plmnlist"][plmnOperator]["rat"],							
							"CfgType":"plmn",
							"authID":auth_id
						  };
							if (parseInt(ui_config["plmn_info"]["plmnlist"]["plmnlist"][plmnOperator]["rat"],10) == 4) {
								rat = "2G";	
							} else if (parseInt(ui_config["plmn_info"]["plmnlist"]["plmnlist"][plmnOperator]["rat"],10) == 5) {
								rat = "3G";						
						  	} else if (parseInt(ui_config["plmn_info"]["plmnlist"]["plmnlist"][plmnOperator]["rat"],10) == 8) {
							   rat = "4G";
						   	} else {
							   rat = null;
						   	}
						
	}
	var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});

    		request.done(function( responseData,textStatus, jqXHR ) {
				//alert(ui_config["plmn_info"]["plmnlist"]["plmnlist"][plmnOperator]["rat"]);
                global_disconnect_service = rat;
				cp_up_5s_2();
			    alert(global_lang['alerts_set']['plmn_config_success']);
    		});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		     	//alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });
	

}

function internet_simcardpinlock_get(){
	
	var request = $.ajax({
	    url:"data.ria?DynUpdate=pin_sim",        
        dataType: "json"       
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
    	
    		ui_config["simpin_info"] = responseData;
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });

}

function internetApi_plmnoperatorCfgSet() {
			
			for (i=0;i<$(".chk_id:checked");i++){
				tag =$("#tf1_inboxdel").val();
				application_api_smsinboxDelete(tag);
				$(".chk_id:checked").closest("tr").remove();
			}
			/* Get auth Id */
			cpApi_get_authId();
			var post_data={"CfgType":"plmn ","sel_mode":1,"oper_name":"CHT","mcc":466,"mnc":92,"rat":"0x02","authID":auth_id};	
		

			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {    
    			//alert("Language changed successfully");  			    
            
    		});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		     	//alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });

}

function internet_api_lanInfo_get() {

	var request = $.ajax({
        url: "data.ria?CfgType=get_cfg&filetype=lan",        
        dataType: "json",
		async: global_cploaded

    });
   
    request.done(function( responseData,textStatus, jqXHR ) {   
//	    ui_config["lan"] = parseINIString(responseData);
        ui_config["lan"] = responseData["lan"];
        //console.log(ui_config["lan"]);
        //console.log(ui_config["lan"]["LAN"]["ip4_addr"]);
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	 
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
}


/* enable Sim Pin  Lock*/
function internetApi_simpin_enable() {

			/* Get auth Id */
			cpApi_get_authId();
			
			var post_data={"cmd":0,"pin_code":$("#tf1_Pincode").val(),"CfgType":"pin_action","authID":auth_id};	
		

			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {    
				internet_onloadInternetsimcardPinlock();
			});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		     	//alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });
/*			
			cpApi_get_authId();
			
			var post_data={"cmd":2,"pin_code":$("#tf1_Pincode").val(),"CfgType":"pin_action","authID":auth_id};	
		

			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {    
				internet_onloadInternetsimcardPinlock();	
			});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		     	//alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });
*/
}

/* disable Sim Pin Lock*/
function internetApi_simpin_disable() {

			/* Get auth Id */
			cpApi_get_authId();
			
			var post_data={"cmd":1,"pin_code":$("#tf1_Pincode").val(),"CfgType":"pin_action","authID":auth_id};	
		

			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {    
				internet_onloadInternetsimcardPinlock();				  
    		});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		     	//alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });

}

/* Sim Pin  unLock*/
function internetApi_simpin_unlock() {		
			cpApi_get_authId();
			
			var post_data={"cmd":2,"pin_code":$("#tf1_Pincode").val(),"CfgType":"pin_action","authID":auth_id};	
		

			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {    
				internet_onloadInternetsimcardPinlock();	
			});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		     	//alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });
}

/* Change Sim Pin code*/
function internetApi_simpin_change() {

			/* Get auth Id */
			cpApi_get_authId();
			
			var post_data={"cmd":4,"pin_code":$("#tf1_currentPin").val(),"new_pin":$("#tf1_newPin").val(),"CfgType":"pin_action","authID":auth_id};	
		

			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {   
				internet_onloadInternetsimcardPinlock();				  
    		});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		     	//alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });

}


/* Unblock Sim */
function internetApi_simpin_unblock() {

			/* Get auth Id */
			cpApi_get_authId();
			
			var post_data={"cmd":3,"puk_code":$("#tf1_PUKcode").val(),"pin_code":$("#tf1_newPin").val(),"CfgType":"pin_action","authID":auth_id};	
		

			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {    
				internet_onloadInternetsimcardPinlock();				  
    		});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		     	//alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });

}




