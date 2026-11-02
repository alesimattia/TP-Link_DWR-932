

var global_macWhiteFilterlen;

var global_macBlackFilterlen;


function wifi_clients_get() {

	var request = $.ajax({
        url: "data.ria?CfgType=get_client_list",        
        dataType: "json",
		async: global_cploaded
    });
    request.done(function( responseData,textStatus, jqXHR ) {
    	ui_config["wi-fi_clients"] = responseData;
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	 
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
}

function wifi_status_DetailsValidate(){
	var enable =$("#tf1_wifiEnable2point4GhValue").val();
			var channel = $("#tf1_wifi2point4wifi").val();
			var wlan_mode = $("#tf1_wifi2point4Mode").val();
			var channel_width = $("#tf1_wifi2point4ChannelWidth").val();

	        cpApi_get_authId();           
            var post_data={"AP1":{"enable":parseInt(enable,10),"channel":parseInt(channel,10),"bm_wlan_mode":parseInt(wlan_mode,10),"ch_width":parseInt(channel_width,10)},"CfgType":"wifi_ap","authID":auth_id};
            var request = $.ajax({
            url: "/webpost.cgi",
            type: "POST",
            data: JSON.stringify(post_data),
            dataType: "json",
			async:false
            });
            
            request.done(function( responseData,textStatus, jqXHR ) {								  
			   //ui_config["wi-fi_wps_status"] = responseData;
			   win.close();
			   if (global_wifiTimeoutHandler)
					global_wifiTimeoutHandler = clearInterval(global_wifiTimeoutHandler);
			   cp_wifi_template();
               alert(global_lang['alerts_set']['config_save_success']); 
			   HideDialog('tf1_dialog', 'tf1_overlay');
            });
            request.fail(function( jqXHR, textStatus, errorThrown) { 
               // alert("Invalid");
            });
            request.always(function(responseData,textStatus, jqXHR ) {  
               
            });
}

function wifi_clients_get2() {

	var request = $.ajax({
        url: "data.ria?CfgType=get_client_list",        
        dataType: "json"
		
    });
    request.done(function( responseData,textStatus, jqXHR ) {

    	ui_config["wi-fi_clients"] = responseData;
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	 
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
}

function wifi_status_get() {
	var request = $.ajax({
        url: "data.ria?CfgType=get_wifi_cfg",        
        dataType: "json",
		async: global_cploaded
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
        	ui_config["wi-fi_status"] = responseData;
        	ui_config["wi-fi_status"]["wifi"]["AP1"]["wpa_passphrase"] = htmlEncode(decode_passwd(responseData["wifi"]["AP1"]["wpa_passphrase"]));
        	ui_config["wi-fi_status"]["wifi"]["AP1"]["wep_key"] = decode_passwd(responseData["wifi"]["AP1"]["wep_key"]);
			ui_config["wi-fi_wps_status"] = responseData["wps"];        		
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	 
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
}

function wifi_status_get2() {
	var request = $.ajax({
        url: "data.ria?CfgType=get_wifi_cfg",        
        dataType: "json"		
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
        	ui_config["wi-fi_status"] = responseData;
        	ui_config["wi-fi_status"]["wifi"]["AP1"]["wpa_passphrase"] = htmlEncode(decode_passwd(responseData["wifi"]["AP1"]["wpa_passphrase"]));
        	ui_config["wi-fi_status"]["wifi"]["AP1"]["wep_key"] = decode_passwd(responseData["wifi"]["AP1"]["wep_key"]);  
		   // ui_config["wi-fi_wps_status"] = responseData["wps"];
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	 
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
}


function wifi_api_getDetails() {

	var request = $.ajax({
        url: "data.ria?CfgType=get_wifi_cfg",
        dataType: "json"
    });
    
    request.done(function(responseData,textStatus, jqXHR ) {
        ui_config["wi-fi_status"] = responseData;
		ui_config["wi-fi_status"]["wifi"]["AP1"]["wpa_passphrase"] = htmlEncode(decode_passwd(responseData["wifi"]["AP1"]["wpa_passphrase"]));
		ui_config["wi-fi_status"]["wifi"]["AP1"]["wep_key"] = decode_passwd(responseData["wifi"]["AP1"]["wep_key"]);  
		ui_config["wi-fi_wps_status"] = responseData["wps"];
    });
    request.fail(function(jqXHR, textStatus, errorThrown) {
           
    });
    request.always(function(responseData,textStatus, jqXHR ) {
            
    });

	
}

function wifi_macTemplate() {    
    var mac_data = ui_config["wi-fi_status"]["wifi"]["WiFi_2.4G_MAC_Filter"];
	var tmpl_mac_data = new Object();    
	tmpl_mac_data.whiteList = new Array();
	tmpl_mac_data.blackList = new Array();
	tmpl_mac_data.blackListKeys = new Array();	
	tmpl_mac_data.mode = 0;
    for(var i = 0 ;i < mac_data.length ; i++)
    {
		//tmpl_mac_data.mode = ui_config["wi-fi_status"]["wifi"]["WiFi_2.4G_MAC_Filter"]["mode"];
		$.each( mac_data[i], function( key, value ) {
		     if (key.search("mode") != -1) {
		       tmpl_mac_data.mode = value;
		     }
		});    	    

		$.each( mac_data[i], function( key, value ) {
		     if (key.search("o_mac") != -1) {
		       tmpl_mac_data.whiteList[tmpl_mac_data.whiteList.length] = value;
		     } else if (key.search("x_mac") != -1) {
		        tmpl_mac_data.blackList[tmpl_mac_data.blackList.length] = value;
				tmpl_mac_data.blackListKeys[tmpl_mac_data.blackListKeys.length] = key;
		     }
		});	
    }
	global_macWhiteFilterlen = tmpl_mac_data.whiteList.length;
	global_macBlackFilterlen = tmpl_mac_data.blackList.length;      
	var pagefn = doT.template(document.getElementById('tf1_script_macTemplate').text); 
	//console.log(tmpl_mac_data);
	$("#tf1_macTemplate").html(pagefn(tmpl_mac_data));     
}

function wifi_onloadMacFilter() {
  
    
    wifi_api_getDetails();
    wifi_macTemplate();
	
	if (global_macBlackFilterlen > 0 ) {
	
		datatable("tf1_wifiMacBlackFilterTbl");
	
	}
	$("#tf1_btn_macFilter").val(global_lang['common']['apply']);
	/*
	onloadCall(wifi_onloadMacFilterToggle, {
		imageId : '',
		disableIndividual : '',
		disableGrp : '',
		enableIndividual : '',
		enableGrp : '',
		hideClass : 'hide',
		showClass : 'configRow',
		breakDivs : '',
		breakClass : 'break',
		imagesInfo : {
			disableImages : '',
			enableImages : '',
			disableClass : '',
			enableClass : ''
		}
	});
	
	enableTextFieldByAnchorClick('tf1_macFilterMode', '','','tf1_MacFilterBlock');
	
	*/
    var mac_data = ui_config["wi-fi_status"]["wifi"]["WiFi_2.4G_MAC_Filter"];	
    var mac_filter_mode = 0;
    for(var i = 0 ;i < mac_data.length ; i++)
    {
		$.each( mac_data[i], function( key, value ) {
		     if (key.search("mode") != -1) {
		       mac_filter_mode = value;
		     }
		});    	    
    }	 
   // if(ui_config["wi-fi_status"]["wifi"]["MAC_Filter"]["mode"] == 2){
    if(mac_filter_mode == 2){
        $("#tf1_MacFilterBlock_div").show();
    }
    else{
        $("#tf1_MacFilterBlock_div").hide();
    }
   
}

function hideorshowMacFilterBlock(){
    if($("#tf1_macFilterMode").attr("class") == "enable-disable-on" ){
        $("#tf1_MacFilterBlock_div").hide();
    }else{
        $("#tf1_MacFilterBlock_div").show();
    }
}

function wifi_onloadMacFilterToggle(toggleObj, thisObj) {
	onAnchorToggle(toggleObj);
	var imgId = thisObj.id;
	switch(imgId) {
		case 'tf1_macFilterMode':
			enableTextFieldByAnchorClick('tf1_macFilterMode', '','','tf1_MacFilterBlock');
		break;	 

	}
}

function wifi_macFilterReset(frmId) {
    $("#" + frmId).reset();
   	resetImgOnOff(frmId);  

}

function wifi_macFilter_addFormReset(){
	$("#tf1_macAddress").val("");
}


function wifi_showCurrentList() {

    var selFilter = radioCheckedValueGet('tf1_macFmethod');

    if (selFilter == "o") {
         $("#tf1_wifiMacBlackFilterTbl").hide();
         $("#tf1_wifiMacWhiteFilterTbl").show();
         if (global_macWhiteFilterlen > 0 ){
            datatable('tf1_wifiMacWhiteFilterTbl');
            }
         $("#tf1_currentFilterCounter").html("Current White List ( " +global_macWhiteFilterlen+" / 10 )");

    } else {
        $("#tf1_wifiMacWhiteFilterTbl").hide();
         $("#tf1_wifiMacBlackFilterTbl").show();
         
         if (global_macBlackFilterlen > 0 ){
        datatable('tf1_wifiMacBlackFilterTbl');
        }
        $("#tf1_currentFilterCounter").html("Current Black List (  " +global_macBlackFilterlen+" / 10 )");
    }

}


function IsInArray(usedListKeys_value,val){  
    var testStr=','+usedListKeys_value.join(",")+",";  
    return testStr.indexOf(","+val+",")!=-1;  
}
function wifi_api_addMac() {

     var selFilter = radioCheckedValueGet('tf1_macFmethod');
	 //$("#tf1_btn_macFilterAdd").val(global_lang['common']['please_wait']);
	 
     cpApi_get_authId();

    if (selFilter == "o") {

        var mac_post_data = 
        {
            "type":"add",           
            "num":1,
            "CfgType":"WiFi_2.4G_MAC_Filter_List",
            "authID":auth_id
        };
		
        mac_post_data["keyid0"] = "o_mac"+(global_macWhiteFilterlen + 1);
        mac_post_data["macaddr0"] = $("#tf1_macAddress").val();

    } else {

        var mac_post_data = 
        {
            "type":"add",       
            "num":1,
            "CfgType":"WiFi_2.4G_MAC_Filter_List",
            "authID":auth_id
        };
		var mac_data = ui_config["wi-fi_status"]["wifi"]["WiFi_2.4G_MAC_Filter"];
		var idx = 0;	
		var usedListKeys = new Array();	
		for(var i = 0 ;i < mac_data.length ; i++)
		{
			$.each( mac_data[i], function( key, value ) {
				if (key.search("x_mac") != -1) {
					usedListKeys[usedListKeys.length] = key;
				 }
			});	
		}		
		while(usedListKeys.toString().indexOf("x_mac"+idx) != -1)
		{
			idx++;						
		}
		mac_post_data["keyid0"] = "x_mac"+idx;	 
        //mac_post_data["keyid0"] = "x_mac"+(parseInt($("#tf1_nextMacId").val().replace("x_mac",""),10)+1);
        mac_post_data["macaddr0"] = $("#tf1_macAddress").val();
		var usedListKeys_value = new Array();
		for(var i = 0 ;i < mac_data.length ; i++)
		{
			$.each( mac_data[i], function( key, value ) {
				if (key.search("x_mac") != -1) {
					usedListKeys_value[usedListKeys_value.length] = value.toLowerCase();
				 }
			});	
		}
		mac_post_data["macaddr0"] = mac_post_data["macaddr0"].toLowerCase();
		if(IsInArray(usedListKeys_value,mac_post_data["macaddr0"])){
			alert(global_lang['alerts_set']['mac_add_failed']);
			return false;
		};
    }

    var request = $.ajax({
        url: "/webpost.cgi",
        type: "POST",
        data: JSON.stringify(mac_post_data),
        dataType: "json"
    });
    
    request.done(function(responseData,textStatus, jqXHR ) {
         alert(global_lang['alerts_set']['mac_add_success']);
		 $("#tf1_btn_macFilterAdd").val(global_lang['common']['apply']);
		 wifi_onloadMacFilter();
		 $(".configForm").show();
	     $(".configTableForm").hide();
		 
		 if (selFilter == "x") {		 
		 	$("#tf1_macFmethod2").attr("checked","checked");
			wifi_showCurrentList();		 
		 }
    });
    request.fail(function(jqXHR, textStatus, errorThrown) {
           
    });
    request.always(function(responseData,textStatus, jqXHR ) {
            
    });

}

function wifi_macFilterValidate(frmId) {

    

     //$("#tf1_btn_macFilter").val(global_lang['common']['please_wait']);
	 $("#tf1_showPleaseWait").show();

     

         var mac_post_data = 
        {
            "type":"del",
            "CfgType":"WiFi_2.4G_MAC_Filter_List"
  
        };

        var delKeyString = "";
        var delKeyArray = new Array();

       $(".chkBlack").each(function( index ) {
          if ($(this).is(":checked")) {
                delKeyArray[delKeyArray.length] = $(this).attr("chk-id");
          }
       });

       delKeyString = delKeyArray.join(",");

          if (delKeyArray.length > 0)  {
            mac_post_data["keyid"] = delKeyString
            //console.log(mac_post_data);
            cpApi_get_authId();
            mac_post_data["authID"] = auth_id;
            var request = $.ajax({
                url: "/webpost.cgi",
                type: "POST",
                data: JSON.stringify(mac_post_data),
                dataType: "json"
            });
            
            request.done(function(responseData,textStatus, jqXHR ) {
                   $(".chkBlack").each(function( index ) { 

					  if ($(this).is(":checked")) {
							$(this).parent().parent().remove();
			
					  }         
	
			
		   		});
            });
            request.fail(function(jqXHR, textStatus, errorThrown) {
                   
            });
            request.always(function(responseData,textStatus, jqXHR ) {
                    
            });

          }
    

    /* Update even the Mode */
	if ($("#tf1_macFilterMode").attr("class") == "enable-disable-on" ) {
		
		var macMode = 2;
		var hidvalueChange = 1;
		
	} else {
		
		var macMode = 0;
		var hidvalueChange = 0;
	}
	 /*Only When mode is changed update the Mode */
	if ($("#tf1_hid_macFilterMode").val() !=  hidvalueChange ) {
		
      mac_post_data = 
        {
            "mode": macMode,
            "CfgType":"mac_filter_list"

        };

        //console.log(mac_post_data);
        cpApi_get_authId();
        mac_post_data["authID"] = auth_id;

        var request = $.ajax({
                url: "/webpost.cgi",
                type: "POST",
                data: JSON.stringify(mac_post_data),
                dataType: "json"
            });
            
            request.done(function(responseData,textStatus, jqXHR ) {
				
				
            });
            request.fail(function(jqXHR, textStatus, errorThrown) {
                   
            });
            request.always(function(responseData,textStatus, jqXHR ) {
                    
            });
	  
	}
	
	$("#tf1_showPleaseWait").hide();
	alert(global_lang['alerts_set']['mac_update_success']);
	wifi_onloadMacFilter();

}


function wifi_api_usePinMode() {
	
	cpApi_get_authId();
	
	var pinMode = 0;	
	
	if ($("#tf1_wifiEnablePin").attr("class") == "enable-disable-on") {
		pinMode = 1;
	}	
    var post_data={"use_pin_mode":pinMode,"CfgType":"wps","authID":auth_id}
	
	var request = $.ajax({
            url: "/webpost.cgi",
            type: "POST",
            data: JSON.stringify(post_data),
            dataType: "json"
            });
            
            request.done(function( responseData,textStatus, jqXHR ) {                                
            
            });
            request.fail(function( jqXHR, textStatus, errorThrown) { 
              //  alert("Invalid");
            });
            request.always(function(responseData,textStatus, jqXHR ) {  
               
            });
	
	
	
}

function wifiApi_stopwps() {

            /* Get auth Id */
            cpApi_get_authId();
           
            var post_data={"cmd":"wps_stop","CfgType":"wps_action","authID":auth_id};  
           

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

function wifiApi_startPBC() {
			$("#tf1_wifiPbcStart").attr("disabled","disabled");
			$("#tf1_wifi_pbcAbort").attr("disabled","disabled");
            /* Get auth Id */
            cpApi_get_authId();           
            var post_data={"cmd":"pbc_start","CfgType":"wps_action","authID":auth_id};   

            var request = $.ajax({
            url: "/webpost.cgi",
            type: "POST",
            data: JSON.stringify(post_data),
            dataType: "json"
            });
            
            request.done(function( responseData,textStatus, jqXHR ) {
					$("#tf1_wifiPbcStart").removeAttr("disabled");
					$("#tf1_wifi_pbcAbort").removeAttr("disabled");
				   wifi_status_get2();
                   global_wifiPbcPinTimeoutHandler = setInterval(function(){ wifi_api_loop()},3000);                    
            });
            request.fail(function( jqXHR, textStatus, errorThrown) { 
                //alert("Invalid");
            });
            request.always(function(responseData,textStatus, jqXHR ) {  
               
            });
}


function wifi_wpsstatus_get() {
    var request = $.ajax({
        url:"data.ria?DynUpdate=wps_status", 
        dataType: "json",
		async: true
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
            ui_config["wi-fi_wps_status"] = responseData; 
			if ( ui_config["wi-fi_wps_status"]["wps_status"] == "0" || (ui_config["wi-fi_wps_status"]["wps_status"] == "-1" && parseInt(ui_config["wi-fi_wps_status"]["conn_timer"]) > 120)) 		{		
				ui_config["wi-fi_wps_status"]["wps_stop"] = "1";
				clearInterval(global_wifiPbcPinTimeoutHandler);
				global_wifiPbcPinTimeoutHandler = false;		
				wifi_onloadWps();
			} else {
				if ($("#tf1_wps_statusMeter").length > 0) {
					con_timer = parseInt(ui_config["wi-fi_wps_status"]["conn_timer"],10);		
					width_perc = (con_timer/120)*100;
					width_perc = Math.round(width_perc);
					//console.log(width_perc);
					$("#tf1_wps_statusMeter").width(width_perc+"%");
					$(".usageDisplay").html(global_lang['wifi_popup']['searching_incoming_clients']);		
				}					
			}                    
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {     
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
}

function wifi_api_loop() {	
	wifi_wpsstatus_get();		
}

function wifiApi_startPin(modest,pinno) {
            /* Get auth Id */
    
            cpApi_get_authId();
           
            var post_data={"use_pin_mode":modest,"cmd":"pin_start","wps_pin":pinno,"CfgType":"wps_action","authID":auth_id};  

            var request = $.ajax({
            url: "/webpost.cgi",
            type: "POST",
            data: JSON.stringify(post_data),
            dataType: "json"
            });
            
            request.done(function( responseData,textStatus, jqXHR ) {   
                  wifi_status_get2();
                  global_wifiPbcPinTimeoutHandler = setInterval(function(){ wifi_api_loop()},3000);            
            
            });
            request.fail(function( jqXHR, textStatus, errorThrown) { 
                //alert("Invalid");
            });
            request.always(function(responseData,textStatus, jqXHR ) {  
               
            });
			
			
}




function wifiApi_enrollPin_set(enrollpinno) {

            /* Get auth Id */
            cpApi_get_authId();
           
            var post_data={"enrollee_pin":enrollpinno,"CfgType":"wps","authID":auth_id};  
           

            var request = $.ajax({
            url: "/webpost.cgi",
            type: "POST",
            data: JSON.stringify(post_data),
            dataType: "json"
            });
            
            request.done(function( responseData,textStatus, jqXHR ) {   
                alert(global_lang['alerts_set']['enroll_pin_success']);                 
                wifi_generate_wpspin();
            });
            request.fail(function( jqXHR, textStatus, errorThrown) { 
                //alert("Invalid");
            });
            request.always(function(responseData,textStatus, jqXHR ) {  
               
            });
}

/* wifi-mode get */

function wifi_2point4status_OnOffget() {
    var request = $.ajax({
        url:"/data.ria?CfgType=get_apsta_onoff",        
        dataType: "json"
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
						  
		ui_config["wi-fi_enable-disable"] = responseData;
           
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {     
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
}

/* wifi-mode Set */

function wifiApi_wifimode_set() {

            /* Get auth Id */
            cpApi_get_authId();
            
			var wifi_turnOnOffSt = parseInt($("#tf1_wifiEnable2point4GhValue").val(),10);
			var wifi_channel_val = parseInt($("#tf1_wifi2point4wifi").val(),10);
			
			 
		    
            var post_data={"apsta_turnon":wifi_turnOnOffSt,"wifi_channel":wifi_channel_val,"CfgType":"set_apsta_onoff","authID":auth_id};  
           

            var request = $.ajax({
            url: "/webpost.cgi",
            type: "POST",
            data: JSON.stringify(post_data),
            dataType: "json"
            });
            
            request.done(function( responseData,textStatus, jqXHR ) {   
            	alert(global_lang['alerts_set']['config_save_success']);
			});
            request.fail(function( jqXHR, textStatus, errorThrown) { 
               // alert("Invalid");
            });
            request.always(function(responseData,textStatus, jqXHR ) {  
               
            });
}


function wpa2_key_get(){
	
		
			
		cpApi_get_authId();
		
		var post_data= {"cmd":"random_wpa2key","CfgType":"wifi_genkey","authID":auth_id} 
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
		
		var request = $.ajax({
	    url: "data.ria?CfgType=get_wifi_genkey",       
        dataType: "json"
		});
		request.done(function( responseData,textStatus, jqXHR ) {  
			document.getElementById("tf2_preSharedkey").value = responseData.key;
			document.getElementById("tf1_preSharedkey").value = responseData.key;	 	 
		});
		request.fail(function( jqXHR, textStatus, errorThrown) {	
		});
		request.always(function(responseData,textStatus, jqXHR ) {       
		});
		

}
