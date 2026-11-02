/*
 Copyright (c) 2014 TeamF1, Inc. (www.TeamF1.com)
 All rights reserved.
 Created on 18th Nov 2014 - Sai
 */

/* WiFi page */

function wifi_default() {
	datatable('tf1_inboxTbl');
}

function wifi_onloadStatusDetails() {
	
	wifi_2point4status_OnOffget();
	wifi_status_get();
	/*
	var tmpl_wifi_controlData = {   
									"wifi_turnOnOff":ui_config["wi-fi_enable-disable"]["apsta_turnon"],
									"channel":ui_config["wi-fi_status"]["wifi"]["AP1"]["channel"]
								};	
	*/
	var tmpl_wifi_controlData = {   
									"wifi_turnOnOff":ui_config["wi-fi_status"]["wifi"]["WiFi"]["turn_on"],
									"channel":ui_config["wi-fi_status"]["wifi"]["AP1"]["channel"],
									"mode":ui_config["wi-fi_status"]["wifi"]["AP1"]["bm_wlan_mode"],
									"channel_width":ui_config["wi-fi_status"]["wifi"]["AP1"]["ch_width"],
									"max_sta":ui_config["wi-fi_status"]["wifi"]["AP1"]["max_sta"]
								};		
	
	var dataTemplate = $("#tf1_script_wifiControlTemplate").html();
    var populated_dataTemplate = doT.template(dataTemplate)(tmpl_wifi_controlData);
    $("#tf1_tmpl_wifi2point4gStatus").html(populated_dataTemplate);    
	$("#tf1_btnBlock").html($("#tf1_hdButtonBlock").html());
	
	showTabs();
	onloadCall(wifi_enableDisableStatusDetailsOnLoad, {
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
	enableTextFieldByAnchorClick('tf1_wifiEnable2point4Gh', 'tf1_wifi2point4Mode tf1_wifi2point4ChannelWidth tf1_wifi2point4wifi', 'break_wifi2point4Mode break_wifi2point4ChannelWidth break_wifi2point4wifi');
	enableTextFieldByAnchorClick('tf1_wifiEnable5Gh', 'tf1_wifi5Mode tf1_wifi5ChannelWidth tf1_wifi5wifi', 'break_wifi5Mode break_wifi5ChannelWidth break_wifi5wifi');
	wifi_ModeSelect();
	wifi_ChannelSelect();

}

function wifi_enableDisableStatusDetailsOnLoad(toggleObj, thisObj) {
	onAnchorToggle(toggleObj);
	var imgId = thisObj.id;
	switch(imgId) {
		case 'tf1_wifiEnable2point4Gh':
			enableTextFieldByAnchorClick('tf1_wifiEnable2point4Gh', 'tf1_wifi2point4Mode tf1_wifi2point4ChannelWidth tf1_wifi2point4wifi', 'break_wifi2point4Mode break_wifi2point4ChannelWidth break_wifi2point4wifi');
			break;
		case 'tf1_wifiEnable5Gh':
			enableTextFieldByAnchorClick('tf1_wifiEnable5Gh', 'tf1_wifi5Mode tf1_wifi5ChannelWidth tf1_wifi5wifi', 'break_wifi5Mode break_wifi5ChannelWidth break_wifi5wifi');
			break;

	}
}

function wifi_ChannelSelect()
{
	var wifi_channel = parseInt(comboSelectedValueGet('tf1_wifi2point4wifi'), 10);
	var wifi_mode = parseInt(comboSelectedValueGet('tf1_wifi2point4Mode'), 10);	
	if(wifi_mode == 2 || wifi_mode == 4)
	{
		switch(wifi_channel) {
			case 12:
			case 13:
				$("#tf1_wifi2point4ChannelWidth").val('0');
				$("#tf1_wifi2point4ChannelWidth").attr("disabled","disabled");
				break;	
			default:
				$("#tf1_wifi2point4ChannelWidth").removeAttr("disabled");
				break;			
		}		
	}		
}

function wifi_ModeSelect()
{
	var wifi_mode = parseInt(comboSelectedValueGet('tf1_wifi2point4Mode'), 10);
	var wifi_channel = parseInt(comboSelectedValueGet('tf1_wifi2point4wifi'), 10);
	if(wifi_channel != 12 && wifi_channel != 13)
	{
		switch(wifi_mode) {
			case 0: //B only
			case 1: // B/G mixed
			case 3:	//G only
				$("#tf1_wifi2point4ChannelWidth").val('0');
				$("#tf1_wifi2point4ChannelWidth").attr("disabled","disabled");
				break;	
			case 2: //B/G/N mixed
			case 4: //N only
				$("#tf1_wifi2point4ChannelWidth").removeAttr("disabled");
				break;			
		}		
	}
	
}
function wifi_statusDetailsValidate(frmId) {
			win.alert_msg("",global_lang['wifi_popup']['wifi_ready']);
			setHiddenChks(frmId);
			//setInterval("wifi_status_DetailsValidate()",1000);
			global_wifiTimeoutHandler = setInterval(function(){wifi_status_DetailsValidate()},1000); 
//			wifiApi_wifimode_set();
			

}

function wifi_statusDetailsReset(frmId) {
	$("#" + frmId).reset();
	
	resetImgOnOff(frmId);
	
	enableTextFieldByAnchorClick('tf1_wifiEnable2point4Gh', 'tf1_wifi2point4Mode tf1_wifi2point4ChannelWidth tf1_wifi2point4wifi', 'break_wifi2point4Mode break_wifi2point4ChannelWidth break_wifi2point4wifi');
	/*
	enableTextFieldByAnchorClick('tf1_wifiEnable5Gh', 'tf1_wifi5Mode tf1_wifi5ChannelWidth tf1_wifi5wifi', 'break_wifi5Mode break_wifi5ChannelWidth break_wifi5wifi');
	*/
}

function wifi_onloadStatus(){
	//wifi_clients_get();
	wifi_status_get2();
	internet_api_lanInfo_get();
	wifi_status_template();
}

/* WPS section starts */
function wifi_onloadWps() {
	if(ui_config["wi-fi_status"]["wifi"]["WiFi"]["turn_on"]==0)
	{
		alert(global_lang['wifi_popup']['wps_wifi_off']);
		return;
	}
	if(ui_config["wi-fi_status"]["wifi"]["AP1"]["security"]==2)
	{
		alert(global_lang['wifi_popup']['wps_protection_off']);
		return;
	}
	if(ui_config["wi-fi_status"]["wifi"]["AP1"]["hidden"]==1)
	{
		alert(global_lang['wifi_popup']['wps_ssid_off']);
		return;
	}
	showTabs();	
	 if(ui_config["wi-fi_wps_status"]["wps_stop"] != "1")	
	 {
		wifi_wpsstatus_get(); 	
	 }		
	ui_config["wi-fi_wps_status"]["wps_stop"] = "0";
	wifi_wps_template();
	
	onloadCall(wifi_enableDisablePinOnLoad, {
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
	enableTextFieldByAnchorClick('tf1_wifiEnablePin', '', '', 'tf1_pinBlock');	
	$("#tf1_btnBlock").html($("#tf1_hdButtonBlock").html());
	
	/* PIN or PBC are in progress */
	
	if (ui_config["wi-fi_wps_status"]["wps_status"] == "1" ) {
	
		if (ui_config["wi-fi_wps_status"]["wps_mode"] == "1" ) { /* PIN */
			$("#tf1_pbcSection").hide();
			 $("#tf1_wifiEnablePin").attr("class","enable-disable-on-noclick");
			 $("#tf1_wifi_startPin").hide();
			 $("#tf1_wifi_abortPin").show();
			 $("#tf1_wps_generate").attr("disabled","disabled");
			 $("#tf1_wps_default").attr("disabled","disabled");
			 
			 
			 
		} 
		
		if (ui_config["wi-fi_wps_status"]["wps_mode"] == "0" ) { /* PBC */			
			
				$("#tf1_pinSection").hide();
				$("#tf1_wps_status_div").show();	
				$("#tf1_wifiPbcStart").hide();
				$("#tf1_wifi_pbcAbort").show();
			
		} 
		
		/* This happens when WPS status is running and Hnadler is not active */
		con_timer = parseInt(ui_config["wi-fi_wps_status"]["conn_timer"],10);	
		width_perc = (con_timer/120)*100;
		width_perc = Math.round(width_perc);		
		$("#tf1_wps_statusMeter").width(width_perc+"%");
	    $(".usageDisplay").html(global_lang['wifi_popup']['searching_incoming_clients']);
	 
		if (global_wifiPbcPinTimeoutHandler == false) {
				 
		 global_wifiPbcPinTimeoutHandler = setInterval(function(){ wifi_api_loop()},3000); 
		
		}
				
	}
	
	if (ui_config["wi-fi_wps_status"]["wps_status"] == "-1") {	
		$("#tf1_wps_status_div").hide();	
	}
	
	if (ui_config["wi-fi_wps_status"]["wps_status"] == "0" && ui_config["wi-fi_wps_status"]["str_err"] == "timeout") { 
	
		$(".usageDisplay").html(global_lang['wifi_popup']['search_fail']);
		setTimeout("$('#tf1_wps_status_div').hide();",3000);
	
	} else if (ui_config["wi-fi_wps_status"]["wps_status"] == "0" && ui_config["wi-fi_wps_status"]["str_err"] == "stop") { 
	
		$("#tf1_wps_status_div").hide();
		//alert(global_lang['wifi_popup']['search_success']);
	
	} else if (ui_config["wi-fi_wps_status"]["wps_status"] == "0") {		
		$(".usageDisplay").html(global_lang['wifi_popup']['search_fail']);		
	}
	

}

function wifi_enableDisablePinOnLoad(toggleObj, thisObj) {
	onAnchorToggle(toggleObj);
	var imgId = thisObj.id;
	switch(imgId) {
		case 'tf1_wifiEnablePin':
			enableTextFieldByAnchorClick('tf1_wifiEnablePin', '', '', 'tf1_pinBlock');
			//wifi_api_usePinMode();
			break;
	}

}
 


function wifi_statusDetailsWpsValidate(frmId) {
	setHiddenChks(frmId);
	//dialogAlert("This mock-up version does not support form actions", "Information", "info");

}

function wifi_statusDetailsWpsReset(frmId) {
	$("#" + frmId).reset();
	resetImgOnOff(frmId);
	wifi_changeWpsType();
	enableTextFieldByAnchorClick('tf1_wifiEnableWps', '', '', 'tf1_wifiWpsConfig');
	enableTextFieldByAnchorClick('tf1_wifiWpsPnbPinEnable', 'tf1_wifiWpsPnbPin tf1_wifiWpsPnbEnrollPin', 'break_wifiWpsPnbPin break_wifiWpsPnbEnrollPin', '');

}

/* WPS section ends */

/* Clients List start */

function wifi_onload2GClientsList() {
	
	//$("#tf1_wifi_client_btns").hide();
	wifi_clients_get2();
	wifi_clients_template();
	//$("#tf1_wifi_client_btns input.apply").val(global_lang["common"]["apply"]);
	//$("#tf1_wifi_client_btns input.cancel").val(global_lang["common"]["cancel"]);
	//$("#tf1_wifi_client_btns").show(global_lang['common']['please_wait']);
	//showTabs();
	onloadCall();
	//$("#tf1_btnBlock").html($("#tf1_hdButtonBlock").html());



	
	//if (ui_config["wi-fi_clients"]["client_num"] != 0) {
	if (ui_config["wi-fi_clients"]["WiFi_2.4G_clilist_num"] != 0) {
		datatable('tf1_wifi2gClientTbl');
	}
}

function wifi_onload5GClientsList() {
	showTabs();
	datatable('tf1_wifi5gClientTbl');
	onloadCall();
	$("#tf1_btnBlock").html($("#tf1_hdButtonBlock").html());
}

function wifi_2point4ClientsListValidate(frmId) {
	setHiddenChks(frmId);	
	var deleteFlag = false;
	var deleteCount = 0;
	var idx = 0;
	var mac_data = ui_config["wi-fi_status"]["wifi"]["WiFi_2.4G_MAC_Filter"];
	var usedListKeys = new Array();	
	for(var i = 0 ;i < mac_data.length ; i++)
	{
		$.each( mac_data[i], function( key, value ) {
			if (key.search("x_mac") != -1) {
				usedListKeys[usedListKeys.length] = key;
			 }
		});	
	}		
	var mac_post_data = 
			{
				"type":"clilist_mode",                   
				"CfgType":"WiFi_2.4G_MAC_Filter_List",            
				"mode" : 2
			};
	//alert($(".clientsList").val());
	
	var clientsList = new Array();
	//var number = ui_config["wi-fi_clients"]["WiFi_2.4G_clilist_num"];
	//var number1 = ui_config["wi-fi_status"]["wifi"]["WiFi_2.4G_MAC_Filter"];
	$(".clientsList").each(function(value){
				if ($(this).val() == "0")
					clientsList.push($(".clientsList").val());
			})
	//alert(clientsList.length);
	//return false;
	var number_s = clientsList.length + (mac_data.length-1);
	if(number_s > 10){
		alert(global_lang['wifi_popup']['mac_limit']);
		return false;
	}
	$(".clientsList").each(function(value,index){		 
		
		if ($(this).val() == "0") {			
			deleteFlag = true;					
			while(usedListKeys.toString().indexOf("x_mac"+idx) != -1)
			{
				idx++;						
			}			
			mac_post_data["keyid"+deleteCount] = "x_mac"+idx;
			mac_post_data["macaddr"+deleteCount] = $(this).attr("mac");	    
			deleteCount = deleteCount + 1; 
			idx++;
	 	}
	});
	
	
	if ( deleteFlag == true ) {
		
		cpApi_get_authId();
		mac_post_data["authID"] = auth_id;
		mac_post_data["num"] = deleteCount;
		
		var request = $.ajax({
				url: "/webpost.cgi",
				type: "POST",
				data: JSON.stringify(mac_post_data),
				dataType: "json"
		});
	
		
		request.done(function(responseData,textStatus, jqXHR ) {
							  
		   $(".clientsList").each(function(value,index){

				if ($(this).val() == "0") {					
					$(this).parent().parent().remove();	
				}
				
	        });
		   
		   alert(global_lang['alerts_set']['client_delete_success']);
			 
		});
		request.fail(function(jqXHR, textStatus, errorThrown) {
			   
		});
		request.always(function(responseData,textStatus, jqXHR ) {
				
		});		
		
		wifi_onload2GClientsList();	
		
   } else {	   
	 alert(global_lang['validation_msgs']['pls_select_client']); 
   }
}

function wifi_2point4ClientsListReset(frmId) {
	$("#" + frmId).reset();
	resetImgOnOff(frmId);
}

function wifi_5gClientsListValidate(frmId) {
	setHiddenChks(frmId);
	//dialogAlert("This mock-up version does not support form actions", "Information", "info");
}

function wifi_5gClientsListReset(frmId) {
	$("#" + frmId).reset();
	resetImgOnOff(frmId);
}

/* Clients List end */

/* Wii Security starts */
function wifi_onloadSecurity2point4() {
	showTabs();	
	wifi_status_get2();
	wifi_security_template();
	wifi_SecurityprotectionSelect();
	wifi_changeWpaMode();	
	$("#tf1_btnBlock").html($("#tf1_hdButtonBlock").html());
	onloadCall();
	onloadCall2();
}

function wifi_onloadSecurity5gSsId() {
	showTabs();
	onloadCall();
	onloadCall2();
	$("#tf1_btnBlock").html($("#tf1_hdButtonBlock").html());
	wifi_SecurityprotectionSelect();
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
function v_HexText(s){
    var ret = /^[0-9a-fA-F]+$/.test(s);
	if (!ret)
		return '-1';
	else
		return '';
}
function wifi_Security2point4Validate(frmId) {
	var tf1_apn = $("#tf1_ssidWi-Fi2point4g").val();
	var tf1_pass = $("#tf2_preSharedkey").val();
	if(!check_wifi_str(tf1_apn) || tf1_apn =="")
		{
			alert(global_lang['alerts_set']['ssid_enter'])
			return;
		}
	if(!check_wifi_str(tf1_pass) || tf1_pass =="")
		{
			alert(global_lang['alerts_set']['wifi_pass_enter'])
			return;
		}
	if (tf1_pass.length == 64){ //should be 64 hex digits
		if(v_HexText(tf1_pass) != ''){
			alert(global_lang['alerts_set']['wifi_pass_limit']);
			return;
		}
	}else if (tf1_pass.length < 8 || tf1_pass.length > 63){ //should be 8~63 ASCII
		alert(global_lang['alerts_set']['wifi_pass_limit']);
		return;
	}
	
	var txtFieldIdArr = new Array();
	txtFieldIdArr[0] = "tf1_ssidWi-Fi2point4g,"+global_lang['validation_msgs']['pls_enter_valid_SSID'];
	txtFieldIdArr[1] = "tf1_maxClientnum,"+global_lang['validation_msgs']['pls_enter_max_client_num'];
	txtFieldIdArr[2] = "tf1_preSharedkey,"+global_lang['validation_msgs']['pls_enter_valid_key'];
	

	if (txtFieldArrayCheck(txtFieldIdArr) == false)
	{
		e.stopPropagation();
		return false;		
	}
	
	/* WEP validation */	
	var security = comboSelectedValueGet('tf1_protection');	
	var selKeyIndex = radioCheckedValueGet('tf1_rdbWepKey0');
	if (security == "2") {
		
		 if ( $("#tf1_txtWepKey"+selKeyIndex).val() == "" ) {
			alert(global_lang['validation_msgs']['pls_generate_wep_keys']);
			e.stopPropagation();
			return false; 
		 }
		 if ( $("#tf1_txtWepKey"+selKeyIndex).val().length != wepKeyLenGet('tf1_toggle_keyType'+selKeyIndex)) {
			alert(global_lang['validation_msgs']['change_wep_key']);
			e.stopPropagation();
			return false; 
		 }		 
		 
		
	}
	
	setHiddenChks(frmId);
	wifi_securitysettings_set();
	wifi_status_get2();	
    cp_mainInfo_template();
	
}

function wifi_Security2point4Reset(event,frmId) {
	$("#" + frmId).reset();
	resetImgOnOff(frmId);	
	if ($("#tf1_ssidVisibilityValue").val() == "1") {
		$("#tf1_ssidVisibility").attr("class","enable-disable-off");
	} else {
		$("#tf1_ssidVisibility").attr("class","enable-disable-on");
	}
	wifi_SecurityprotectionSelect();
	
	/*Added line for reset the textbox with  checkbox */
	wifi_showKey(event,'tf1_preSharedkey');
}

function wifi_Security5gValidate(frmId) {
	var txtFieldIdArr = new Array();
	txtFieldIdArr[0] = "tf1_ssidWi-Fi5g,Please enter valid SSID Wi-Fi";
	txtFieldIdArr[1] = "tf1_maxClientnum,Please enter max Client Number";
	txtFieldIdArr[2] = "tf1_preSharedkey,Please enter valid pre-shared Key";
	txtFieldIdArr[3] = "tf1_key,Please enter valid Key";

	if (txtFieldArrayCheck(txtFieldIdArr) == false)
		return false;
	setHiddenChks(frmId);

	//dialogAlert("This mock-up version does not support form actions", "Information", "info");
}

/**
 * This function calls when user selects drop down item from "Securityprotection" select box
 * Select box onchange event
 * @method wifi_SecurityprotectionSelect
 */
function wifi_SecurityprotectionSelect() {
	/* This function is Global from globalMgmt.js */
	var wifi_protection = parseInt(comboSelectedValueGet('tf1_protection'), 10);
	switch(wifi_protection) {
		case 0 :
			// No Protection
			fieldStateChangeWr('tf1_authenticationType tf1_wpaMode tf1_cipherType tf1_preSharedkey tf1_key', 'tf1_keyTable', '', '');
			vidualDisplay('tf1_authenticationType tf1_wpaMode tf1_cipherType tf1_preSharedkey tf1_key tf1_keyTable', 'hide');
			vidualDisplay('break_authenticationType break_wpaMode break_cipherType break_preSharedkey break_key', 'hide');
			break;
			
		case 2:
			// Basic Protechtion
			fieldStateChangeWr('tf1_wpaMode tf1_cipherType tf1_preSharedkey', '', 'tf1_authenticationType tf1_key', 'tf1_keyTable');
			$("#tf1_txtWepKey0").attr("title",document.getElementById('tf1_txtWepKey0').value);
			vidualDisplay('tf1_authenticationType tf1_key tf1_keyTable', 'configRow');
			vidualDisplay('break_authenticationType break_key break_keyTable', 'break');
			vidualDisplay('tf1_wpaMode tf1_cipherType tf1_preSharedkey', 'hide');
			vidualDisplay('break_wpaMode break_cipherType break_preSharedkey', 'hide');
			break;

		case 3:
			// Advanced Protechtion
			fieldStateChangeWr('tf1_authenticationType tf1_key', 'tf1_keyTable', 'tf1_wpaMode tf1_cipherType tf1_preSharedkey', '');
			vidualDisplay('tf1_wpaMode tf1_cipherType tf1_preSharedkey', 'configRow');
			vidualDisplay('break_wpaMode break_cipherType break_preSharedkey', 'break');
			vidualDisplay('tf1_authenticationType tf1_key tf1_keyTable', 'hide');
			vidualDisplay('break_authenticationType break_key break_keyTable', 'hide');
			break;
	}
	
	wifi_changeWpaMode();
}

function wifi_Security5gReset(frmId) {
	$("#" + frmId).reset();
	resetImgOnOff(frmId);
	wifi_SecurityprotectionSelect();
}

/* Wii Security ends */

function IE_Chrome(event){
	var uaAutoScroll = navigator.userAgent.toLowerCase();
	var browser = window.navigator.userAgent;
	if (browser.indexOf("Chrome") == -1)
		{
			if (browser.indexOf("Firefox") == -1)
			{
				if (browser.indexOf("MSIE") == -1)
				{
                                }
				else
					browser = "MSIE";
			}
			else
				browser = "Firefox";
		}
		else
			browser = "Chrome";
	if (browser == "MSIE" || "ActiveXObject" in window || uaAutoScroll.indexOf("rv:11") > -1) {  
		event.returnValue = false;  
	} else {
		event.preventDefault();
	}
}
function wifi_addMacFilterForm(event) {

    IE_Chrome(event);	
	
	if (parseInt($("#tf1_macCount").html(),10) == parseInt($("#tf1_macCountMax").html(),10) ) {
		
		alert(global_lang['wifi_popup']['mac_limit']);
		return false;
	}
	
 	$("#tf1_macAddress").val('');
    var selFilter = radioCheckedValueGet('tf1_macFmethod');
     if (selFilter == "o") {
        $("#tf1_h4NewMac").html("Add New MAC - White List");
     } else {
        $("#tf1_h4NewMac").html(global_lang['wifi_popup']['mac_filter_add_black_list']);
     }
    /*Close Block */
    $(".configForm").hide();

    /*Open Block */
    $("#tf1_wifiMacFilterForm").show();
}
function wifi_macFilterValidate_mac(){
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
	//alert(global_lang['alerts_set']['mac_update_success']);
	wifi_onloadMacFilter();
}

function wifi_macFilter() {
	wifi_macFilterValidate_mac();
    var txtFieldIdArr = new Array();
    txtFieldIdArr[0] = "tf1_macAddress,"+ global_lang['validation_msgs']['pls_enter_mac_address'];
    

    if (txtFieldArrayCheck(txtFieldIdArr) == false)
        return false;

    macObj = document.getElementById('tf1_macAddress');
    if (!(macAddrValidate(macObj.value, true, "", '', macObj))) {
        macObj.focus();
        return false;
    }

      wifi_api_addMac();
}

function wifi_formClose(event) {

	IE_Chrome(event);
	$(".configForm").show();
	$(".configTableForm").hide();

}

/*
function wifi_onloadMacFilter() {
	datatable('tf1_wifiMacFilterTbl');

	onloadCall(wifi_enableDisableMacFilter, {
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

}


function wifi_enableDisableMacFilter(toggleObj, thisObj) {

	onAnchorToggle(toggleObj);
	var imgId = thisObj.id;

	var currentClass = $(thisObj).attr("class");

	if (currentClass == ON_ANCHOR) {

		vidualDisplay('tf1_MacFilterBlock', '');

		var selFilter = radioCheckedValueGet('tf1_macFmethod')

		if (selFilter == "0") {

			$("#tf1_currentFilterCounter").html("Current White List ( 2 / 10 )");

		} else {
			$("#tf1_currentFilterCounter").html("Current Black List ( 2 / 10 )");
		}

		$("#tf1_currentFilterCounter").show();

	} else {

		vidualDisplay('tf1_MacFilterBlock', 'hide');
		$("#tf1_currentFilterCounter").hide();

	}

}

function wifi_showCurrentList() {

	var selFilter = radioCheckedValueGet('tf1_macFmethod')

	if (selFilter == "0") {

		$("#tf1_currentFilterCounter").html("Current White List ( 2 / 10 )");

	} else {
		$("#tf1_currentFilterCounter").html("Current Black List ( 2 / 10 )");
	}

}
*/

function wifi_startpin(){
    var pinmodest;
    var enrollpin;
	 pinmodest = $("#tf1_wifiEnablePinValue").val();
	 enrollpin = $("#tf1_enterPin").val();
	 $("#tf1_wps_status_div").show();
	 $("#tf1_pbcSection").hide();
	 $("#tf1_wifiEnablePin").attr("class","enable-disable-on-noclick");
	 $("#tf1_wifi_startPin").hide();
	 $("#tf1_wifi_abortPin").show();
	 $("#tf1_wps_generate").attr("disabled","disabled");
	 $("#tf1_wps_default").attr("disabled","disabled");	
	 $("#tf1_wps_statusMeter").width("1%");
	 $(".usageDisplay").html(global_lang['wifi_popup']['searching_incoming_clients']);
	 wifiApi_startPin(pinmodest,enrollpin);
}

function wifi_generatenew(){
	wifi_generate_wpspin();
}


function wifi_usedefault(){
	wifi_default_wpspinget();
}

function wifi_setPBC(){
	$("#tf1_wps_status_div").show();
	$("#tf1_pinSection").hide();
	$("#tf1_wps_status_div").show();	
	$("#tf1_wifiPbcStart").hide();
	$("#tf1_wifi_pbcAbort").show();
	$("#tf1_wps_statusMeter").width("1%");
	$(".usageDisplay").html(global_lang['wifi_popup']['searching_incoming_clients']);
	wifiApi_startPBC();
}

function wifi_abortPbc() {
	$.ajaxSetup({async:true});
	clearInterval(global_wifiPbcPinTimeoutHandler);
	//$("#tf1_wifi_pbcAbort").val(global_lang['wifi_popup']['stoping']); 
	$("#tf1_wps_status_div").hide();	
	global_wifiPbcPinTimeoutHandler = false;	

	wifiApi_stopwps();	 
	wifi_onloadWps();
}

function wifi_abortPin() {
	
	clearInterval(global_wifiPbcPinTimeoutHandler);
	$("#tf1_wifi_abortPin").val(global_lang['wifi_popup']['stoping']);
	$("#tf1_wps_status_div").hide();
	global_wifiPbcPinTimeoutHandler = false;	
	wifiApi_stopwps();	 
	wifi_onloadWps();
}
/*Wifi Mac filter ends */

/* wi-fi Clients list Template Function */
function wifi_clients_template() {

    //var tmpl_clients_data = ui_config["wi-fi_clients"]["clilist"];
    var tmpl_clients_data = ui_config["wi-fi_clients"]["WiFi_2.4G_clilist"];		 
    var dataArrayTemplate = $("#wifi_ClientTemplate").html();
    var populatedDataArrayTemplate = doT.template(dataArrayTemplate)(tmpl_clients_data);
    $("#tf1_wifiClientsTblbody").html(populatedDataArrayTemplate);
	if(tmpl_clients_data.length == 1){
		$(".mac_one").attr("onmouseover","this.disabled='ture'")
	}
}

/* wi-fi status Template Function */
function wifi_status_template() {

    var tmpl_status_data = {  
    					"wifi_wps":"ON",
    					"wifi2point4":ui_config["wi-fi_status"]["wifi"]["WiFi"]["turn_on"],
    					"Clientlist":ui_config.Dyn_Status["up_5s"]["clientNum"]["ssid1"],
    					"SSIDname":ui_config["wi-fi_status"]["wifi"]["AP1"]["ssid"],
    					//"Encryption":ui_config["wi-fi_status"]["wifi"]["AP1"]["wpa_auth"],
    					"dhcp_service":ui_config["lan"]["DHCP4S"]["enable"],
						"ip_addr":ui_config["lan"]["LAN"]["ip4_addr"],
						"signallevel":ui_config.Dyn_Status["up_5s"]["signal"]["wifi"]["level"],
    					"MacAddr":ui_config.Dyn_Status["about_sys"]["lan_mac"]
					};
					
	var security = parseInt(ui_config["wi-fi_status"]["wifi"]["AP1"]["security"],10);				  
			switch (security) {
																	  
					case 1 :
					
						 
							tmpl_status_data.protection = "0";
							tmpl_status_data.wpaMode = "No Protection";
							tmpl_status_data.cipherType = "";
						 
					
					break;
					
					case 3 :
					
						tmpl_status_data.protection = "2";						
						var wpaAuth = parseInt(ui_config["wi-fi_status"]["wifi"]["AP1"]["wpa_auth"],10);
						if ( wpaAuth == 1) {							
							tmpl_status_data.wpaMode = "WPA";
							tmpl_status_data.cipherType = " - TKIP";							
							
						} else if ( wpaAuth == 2)  {
							tmpl_status_data.wpaMode = "WPA";
							tmpl_status_data.cipherType = " - AES";	
							
						}  else if ( wpaAuth == 3)  {
							
							tmpl_status_data.wpaMode = "WPA2";
							tmpl_status_data.cipherType = " - TKIP";	
							
						}  else if ( wpaAuth == 4)  {
							tmpl_status_data.wpaMode = "WPA2";
							tmpl_status_data.cipherType = " - AES";	
							
						}  else if ( wpaAuth == 5)  {
							tmpl_status_data.wpaMode = "Auto (WPA or WPA2)";
							tmpl_status_data.cipherType = " - AES / TKIP";	
							
						} 
					
					break;																	  
				
				
			}				
	
    var pagefn = doT.template(document.getElementById('wifistatusinfoTemplate').text);
    $("#tf1_tmpl_wifistatus_info").html(pagefn(tmpl_status_data));
	if(ui_config["wi-fi_status"]["wifi"]["WiFi"]["turn_on"]==0)
	{
		$(".wps_status").html(global_lang["common"]["off"]);
	}
	if(ui_config["wi-fi_status"]["wifi"]["AP1"]["security"]==2)
	{
		$(".wps_status").html(global_lang["common"]["off"]);
	}
	if(ui_config["wi-fi_status"]["wifi"]["AP1"]["hidden"]==1)
	{
		$(".wps_status").html(global_lang["common"]["off"]);
	}

}


/* wi-fi2point4 Template Function 
function wifi_2point4_template() {

    var tmpl_2point4status_data = {
    								"enablewifi2point4":ui_config["wi-fi_status"]["wifi"]["AP1"]["enable"],
    							  };
				
    var pagefn = doT.template(document.getElementById('wifi2point4statusinfoTemplate').text);
    $("#tf1_tmpl_wifi2point4status_info").html(pagefn(tmpl_2point4status_data));

}
*/


/* wi-fi2point4 Template Function */
function wifi_wps_template() {
	wifi_status_get2();			
   // var tmpl_wps_data = {
    					//	"enablepinmode":ui_config["wi-fi_wps_status"]["wps_mode"],
    					//	"enrolleepin":ui_config["wi-fi_wps_status"]["wps_pin"]
    					//	"status":ui_config["wi-fi_wps_status"]["wps_status"] ,
    					//	"coonection_status":ui_config["wi-fi_wps_status"]["conn_status"],
    					//	"connectiontimer":ui_config["wi-fi_wps_status"]["conn_timer"] ,
    					//	"error_status":ui_config["wi-fi_wps_status"]["str_err"]
    					//};
     var tmpl_wps_data = {
    						"enablepinmode":ui_config["wi-fi_status"]["wifi"]["WPS"]["use_pin_mode"],
    						"enrolleepin":ui_config["wi-fi_status"]["wifi"]["WPS"]["enrollee_pin"]
    					 };		
    var pagefn = doT.template(document.getElementById('wifiwpsstatusinfoTemplate').text);
    $("#tf1_tmpl_wifiwpsstatus_info").html(pagefn(tmpl_wps_data));
	if(ui_config.Dyn_Status["up_5s"]["lang"] == 3){
		$(".wps_label").css("width","68px");
	}else{
		$(".wps_label").css("width","150px");
	}

}


/* wi-fi_security Template Function  */
function wifi_security_template() {

    var tmpl_wifisecurity_data = {
    								"SSID":ui_config["wi-fi_status"]["wifi"]["AP1"]["ssid"],
									"broadcastSSID": ui_config["wi-fi_status"]["wifi"]["AP1"]["hidden"],
									"passphrase": ui_config["wi-fi_status"]["wifi"]["AP1"]["wpa_passphrase"],
									"wepKey": ui_config["wi-fi_status"]["wifi"]["AP1"]["wep_key"],
									"wepKeyIndex": ui_config["wi-fi_status"]["wifi"]["AP1"]["wep_key_index"],
									"max_sta":ui_config["wi-fi_status"]["wifi"]["AP1"]["max_sta"]
    							  };
			var security = parseInt(ui_config["wi-fi_status"]["wifi"]["AP1"]["security"],10);
			
		
			
			switch (security) {
																	  
					case 1 : /* Disabled */
					
						if (ui_config["wi-fi_status"]["wifi"]["AP1"]["wpa_auth"] == "1") {
							tmpl_wifisecurity_data.protection = "0";
							tmpl_wifisecurity_data.wpaMode = "";
							tmpl_wifisecurity_data.cipherType = "";
						}
					
					break;
					
					case 2 : /* WEP */
						tmpl_wifisecurity_data.protection = "2";
						tmpl_wifisecurity_data.wpaMode = "";
						tmpl_wifisecurity_data.cipherType = "";					
						
					break;
					
					case 3 : /* WPA */
					
						tmpl_wifisecurity_data.protection = "3";						
						var wpaAuth = parseInt(ui_config["wi-fi_status"]["wifi"]["AP1"]["wpa_auth"],10);
						
						 
						if ( wpaAuth == 1) {							
							tmpl_wifisecurity_data.wpaMode = "WPA";
							tmpl_wifisecurity_data.cipherType = "TKIP";							
							
						} else if ( wpaAuth == 2)  {
							tmpl_wifisecurity_data.wpaMode = "WPA";
							tmpl_wifisecurity_data.cipherType = "AES";
							
						}  else if ( wpaAuth == 3)  {
							
							tmpl_wifisecurity_data.wpaMode = "WPA2";
							tmpl_wifisecurity_data.cipherType = "TKIP";	
							
						}  else if ( wpaAuth == 4)  {
							tmpl_wifisecurity_data.wpaMode = "WPA2";
							tmpl_wifisecurity_data.cipherType = "AES";	
							
						}  else if ( wpaAuth == 5)  {
							tmpl_wifisecurity_data.wpaMode = "Auto";
							tmpl_wifisecurity_data.cipherType = "Auto";	
							
						} 
						 
					break;																	  
				
				
			}
				
    var pagefn = doT.template(document.getElementById('wifisecurityinfoTemplate').text);
    $("#tf1_tmpl_wifisecurity_info").html(pagefn(tmpl_wifisecurity_data));

}

function tf1_maxClientnum_suggest (){
  var max_sta=parseInt($('#tf1_maxClientnum').val());
		 if(max_sta >16){
            setTimeout(function(){
				alert(global_lang['wifi_popup']['wifi_maxnumber_clients']);
			},1)
		}
}

function wifi_securitysettings_set(){
			var security, wpa_auth;
			
			ssidval = encodeURIComponent($("#tf1_ssidWi-Fi2point4g").val());
			broadcastSSIDval = $("#tf1_ssidVisibilityValue").val();
			
			if (broadcastSSIDval == "0") {
				broadcastSSIDval = 1;
			} else {
				
				broadcastSSIDval = 0;
			}
			passphraseval = $("#tf1_preSharedkey").val();
			protection_val = $("#tf1_protection").val();
			wpaMode_val = $("#tf1_wpaMode").val();
			cipherType_val = $("#tf1_cipherType").val();
			wep_key_index  = "";
			wep_key  = ""
			
			if ( protection_val == "3" ) {
				if(passphraseval.length<8){
					alert(global_lang['alerts_set']['wifi_password']);
					return false;
				}	
			}	
			
			if ( protection_val == "0" ) {
				
				security = 1;
				wpa_auth = 1;
				passphraseval = "";
				
			} else if ( protection_val == "2" ) {
				
				security = 2;
				wpa_auth = "";
				passphraseval = "";
				wep_key_index = radioCheckedValueGet('tf1_rdbWepKey0');
				wep_key = $("#tf1_txtWepKey"+wep_key_index).val();			
			}else if (wpaMode_val == "WPA" && cipherType_val == "TKIP") {
				
				security = 3;
				wpa_auth = 1;
				
				
			} else if (wpaMode_val == "WPA" && cipherType_val == "AES") {
				
				security = 3;
				wpa_auth = 2;
				
			} else if (wpaMode_val == "WPA2" && cipherType_val == "TKIP") {
				
				security = 3;
				wpa_auth = 3;
				
			} else if (wpaMode_val == "WPA2" && cipherType_val == "AES") {
				
				security = 3;
				wpa_auth = 4;
				
			} else {
			
				security = 3;
				wpa_auth = 5;
				
			}
		
	passphraseval = encode_passwd(passphraseval); 	
	wep_key = encode_passwd(wep_key); 	
				cpApi_get_authId();	
				var max_sta = parseInt($('#tf1_maxClientnum').val());
            var post_data={"AP1":{"ssid":ssidval,"hidden":broadcastSSIDval,"mfilter_max":max_sta,"security":security,"wpa_auth":wpa_auth,"wpa_passphrase":passphraseval,"wep_key":wep_key,"wep_key_index":wep_key_index},"CfgType":"wifi_ap","authID":auth_id};
			
            var request = $.ajax({
            url: "/webpost.cgi",
            type: "POST",
            data: JSON.stringify(post_data),
            dataType: "json"
            });
            
            request.done(function( responseData,textStatus, jqXHR ) {								  
			     alert(global_lang['alerts_set']['setting_save_success']);
            });
            request.fail(function( jqXHR, textStatus, errorThrown) { 
				///console.log(jqXHR);				  
                //alert("Invalid");
            });
            request.always(function(responseData,textStatus, jqXHR ) {  
               
            });

}

function wifi_changeWpaMode() {

 	var wpaMode = comboSelectedValueGet('tf1_wpaMode');
	$("#tf1_cipherType option[value='AES']").remove();
	//$("#tf1_cipherType option[value='TKIP']").remove();
	$("#tf1_cipherType option[value='Auto']").remove();
	
	switch (wpaMode) {	
		case 'Auto' :
			$("#tf1_cipherType").append('<option value="Auto">AES / TKIP</option>');
			$("#tf1_cipherType").val('Auto');
		break;	
		case 'WPA2' :		
		case 'WPA' :
		
		$("#tf1_cipherType").append('<option value="AES">AES</option>');
		//$("#tf1_cipherType").append('<option value="TKIP">TKIP</option>');
		$("#tf1_cipherType").val('AES');
		break;	
		
	}
	
	
	
	
}

function wifi_showKey(event,keyId) {

	if ($(event.target).is(':checked')) {
		$("#"+keyId).attr("type","text");
	} else {		
		$("#"+keyId).attr("type","password");		
		
	}
	
}


/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */
var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */
var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
function hex_md5(s){ return binl2hex(core_md5(str2binl(s), s.length * chrsz));}
function b64_md5(s){ return binl2b64(core_md5(str2binl(s), s.length * chrsz));}
function str_md5(s){ return binl2str(core_md5(str2binl(s), s.length * chrsz));}
function hex_hmac_md5(key, data) { return binl2hex(core_hmac_md5(key, data)); }
function b64_hmac_md5(key, data) { return binl2b64(core_hmac_md5(key, data)); }
function str_hmac_md5(key, data) { return binl2str(core_hmac_md5(key, data)); }

/*
 * Perform a simple self-test to see if the VM is working
 */
function md5_vm_test()
{
  return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
}

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length
 */
function core_md5(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << ((len) % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;

    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
  }
  return Array(a, b, c, d);

}

/*
 * These functions implement the four basic operations the algorithm uses.
 */
function md5_cmn(q, a, b, x, s, t)
{
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
}
function md5_ff(a, b, c, d, x, s, t)
{
  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
function md5_gg(a, b, c, d, x, s, t)
{
  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
function md5_hh(a, b, c, d, x, s, t)
{
  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5_ii(a, b, c, d, x, s, t)
{
  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/*
 * Calculate the HMAC-MD5, of a key and some data
 */
function core_hmac_md5(key, data)
{
  var bkey = str2binl(key);
  if(bkey.length > 16) bkey = core_md5(bkey, key.length * chrsz);

  var ipad = Array(16), opad = Array(16);
  for(var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);
  return core_md5(opad.concat(hash), 512 + 128);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function bit_rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * Convert a string to an array of little-endian words
 * If chrsz is ASCII, characters >255 have their hi-byte silently ignored.
 */
function str2binl(str)
{
  var bin = Array();
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < str.length * chrsz; i += chrsz)
    bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (i%32);
  return bin;
}

/*
 * Convert an array of little-endian words to a string
 */
function binl2str(bin)
{
  var str = "";
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < bin.length * 32; i += chrsz)
    str += String.fromCharCode((bin[i>>5] >>> (i % 32)) & mask);
  return str;
}

/*
 * Convert an array of little-endian words to a hex string.
 */
function binl2hex(binarray)
{
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i++)
  {
    str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) +
           hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);
  }
  return str;
}

/*
 * Convert an array of little-endian words to a base-64 string
 */
function binl2b64(binarray)
{
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i += 3)
  {
    var triplet = (((binarray[i   >> 2] >> 8 * ( i   %4)) & 0xFF) << 16)
                | (((binarray[i+1 >> 2] >> 8 * ((i+1)%4)) & 0xFF) << 8 )
                |  ((binarray[i+2 >> 2] >> 8 * ((i+2)%4)) & 0xFF);
    for(var j = 0; j < 4; j++)
    {
      if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
      else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
    }
  }
  return str;
}



function wepKeyLenGet(toggleId){
	
	 if ($("#"+toggleId).attr("class") == "enable-disable2-off") {
		 	encrMethod = 128;
	 } else {
		 encrMethod = 64;		 
	 }
    
    var keyLen = 0;
    switch (parseInt(encrMethod, 10)) {
        case 152: /* 152 bit */
            keyLen = 32; /* 32 hex chars */
            break;
        case 128: /* 126 bit */
            keyLen = 26; /* 26 hex chars */
            break;
        case 64: /* 64 bit */
        default:
            keyLen = 10; /* 10 hex chars */
    }
    return keyLen;
}



function generateWepKeys(){
    
    var wepPsk = document.getElementById('tf1_key').value;
    if (wepPsk == "") {
        /* document.getElementById('tf1_txtWepPskErr').innerHTML = "Enter Pass Phrase"; */
		alert(global_lang['validation_msgs']['pls_enter_wep_phrase']);
        return
    }
	var keyLen = wepKeyLenGet('tf1_toggle_keyType0');
    document.getElementById('tf1_txtWepKey0').value = hex_md5(wepPsk).substr(0, keyLen);
	$("#tf1_txtWepKey0").attr("title",document.getElementById('tf1_txtWepKey0').value);
    wepPsk += document.getElementById('tf1_txtWepKey0').value;
	
	keyLen = wepKeyLenGet('tf1_toggle_keyType1');
    document.getElementById('tf1_txtWepKey1').value = hex_md5(wepPsk).substr(0, keyLen);
	$("#tf1_txtWepKey1").attr("title",document.getElementById('tf1_txtWepKey1').value);
    wepPsk += document.getElementById('tf1_txtWepKey1').value;
	
	keyLen = wepKeyLenGet('tf1_toggle_keyType2');
    document.getElementById('tf1_txtWepKey2').value = hex_md5(wepPsk).substr(0, keyLen);
	$("#tf1_txtWepKey2").attr("title",document.getElementById('tf1_txtWepKey2').value);
    wepPsk += document.getElementById('tf1_txtWepKey2').value;
	
	keyLen = wepKeyLenGet('tf1_toggle_keyType3');
    document.getElementById('tf1_txtWepKey3').value = hex_md5(wepPsk).substr(0, keyLen);
	$("#tf1_txtWepKey3").attr("title",document.getElementById('tf1_txtWepKey3').value);
    wepPsk += document.getElementById('tf1_txtWepKey3').value;
}


function wifi_keyTypeChange() {
	alert(global_lang['validation_msgs']['change_wep_key']);	
}




