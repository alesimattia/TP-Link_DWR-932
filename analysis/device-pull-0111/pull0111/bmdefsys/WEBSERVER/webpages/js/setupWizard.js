/*
 Copyright (c) 2014 TeamF1, Inc. (www.TeamF1.com)
 All rights reserved.
 Created on 18th Nov 2014 - Sai
 */

/* Setup Wizard Panel */

var wiFiHtml = "";
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

function setup_showLte3GConnectionType(event) {
	var thisObj = event.target;
	IE_Chrome(event);
	$(".connectionLinks").removeClass("active");
	$(".wizardImfInfo").hide();
	$(".tab1").show();
	$(thisObj).addClass("active");
	$("#tf1_pageNextStep").val('tf1_lte3GScreen1');

}

function setup_showEthernetConnectionType(event) {
	var thisObj = event.target;
	IE_Chrome(event);
	$(".connectionLinks").removeClass("active");
	$(".wizardImfInfo").hide();
	$(".tab2").show();
	$(thisObj).addClass("active");
	$("#tf1_pageNextStep").val('tf1_routerEthernetScreen1');
}

function setup_showWifiHotSpotConnectionType(event) {
	var thisObj = event.target;
	IE_Chrome(event);
	$(".connectionLinks").removeClass("active");
	$(".wizardImfInfo").hide();
	$(".tab3").show();
	$(thisObj).addClass("active");
	$("#tf1_pageNextStep").val('tf1_wifiHotSpotScreen1');
}

function setup_nextStep(divId, step) {

	$(".screen").hide();
	$(".stepParent").removeClass("one");
	$(".stepChild").removeClass("two");
	$("#list" + step + " div.stepParent").addClass("one");
	$("#list" + step + " div.stepParent div.stepChild").addClass("two");
	if (divId == "tf1_lte3GScreen2") {
		$("#tf1_lte3GScreen2 div.setupConfig").html(wiFiHtml);
		system_accountinfo_get();
		$("#tf1_oldPassword").val("");
		$("#tf1_passwd").val("");
		$("#tf1_cnfPassword").val("");
	}

	$("#" + divId).show();
}

function setup_nextStepWifi(divId, step) {

	$(".screen").hide();
	$(".stepParent").removeClass("one");
	$(".stepChild").removeClass("two");
	$("#list" + step + " div.stepParent").addClass("one");
	$("#list" + step + " div.stepParent div.stepChild").addClass("two");
	$("#tf1_lte3GScreen2 div.setupConfig").html('');
	$("#tf1_routerEthernetScreen2 div.setupConfig").html(wiFiHtml);
	$("#" + divId).show();
}

function setup_nextStepHotSpot(divId, step) {

	$(".screen").hide();
	$(".stepParent").removeClass("one");
	$(".stepChild").removeClass("two");
	$("#list" + step + " div.stepParent").addClass("one");
	$("#list" + step + " div.stepParent div.stepChild").addClass("two");
	$("#tf1_lte3GScreen2 div.setupConfig").html('');
	$("#tf1_wifiHotSpotScreen2 div.setupConfig").html(wiFiHtml);
	$("#" + divId).show();
}

function setup_previousStep(divId, step) {
	$(".screen").hide();
	$(".stepParent").removeClass("one");
	$(".stepChild").removeClass("two");
	$("#list" + step + " div.stepParent").addClass("one");
	$("#list" + step + " div.stepParent div.stepChild").addClass("two");
	$("#" + divId).show();
}

function setup_moveTo() {

	$(".screen").hide();
	$(".stepParent").removeClass("one");
	$(".stepChild").removeClass("two");

	var divId = $("#tf1_pageNextStep").val();
	var step = 2;
	$("#list" + step + " div.stepParent").addClass("one");
	$("#list" + step + " div.stepParent div.stepChild").addClass("two");
	$("#" + divId).show();

	/* Screen1 of lte */
	if ($("#tf1_pageNextStep").val() == "tf1_lte3GScreen1") {
		setup_lte3GScreen1Onload();
	}
}

function setup_lte3GScreen1Onload() {

}
function check_wifi_str(obj){   
	if(!obj) return true;
	 var str=obj; 
	 var code;
	 for(var i=0 ; i<str.length; i++){
		code=str.charCodeAt(i);
		if (code<21 || code>126) {
		  return false;
		}
	}
	return true;
}
function setup_apnconfig1Validate() {
	var tf1_apn = $("#tf1_setup_apnManual").val();
	if(!check_wifi_str(tf1_apn))
		{
			alert(global_lang['alerts_set']['apn_enter']);
			$("#tf1_setup_apnManual").focus();
			return;
		}
	var txtFieldIdArr = new Array();
	txtFieldIdArr[0] = "tf1_setup_apnManual,"+global_lang['validation_msgs']['pls_enter_valid_APN'];
	/*
	txtFieldIdArr[1] = "tf1_setup_userName,Please enter User Name";
	txtFieldIdArr[2] = "tf1_setup_Password,Please enter Password";
	*/

	if (txtFieldArrayCheck(txtFieldIdArr) == false)
		return false;
		
	$("#tf1_lte3GScreen2 div.setupConfig").html(wiFiHtml);
	setup_nextStep('tf1_lte3GScreen2', 3);
	
	var curr = new Date().getFullYear();
			var opt = {}			
			opt.datetime = {preset: 'datetime',minDate: new Date(2000,3,10,9,22),maxDate: new Date(2099,7,30,15,44),stepMinute: 1,dateFormat:"yy-mm-dd"};
			$('#tf1_setDateTime').val($('#tf1_setDateTimeValue').val());
			$('#tf1_setDateTime').scroller('destroy').scroller(
				$.extend(
					opt["datetime"], { 					
						mode: "scroller", 
						display: "inline" 
					}
				)			
			);
			setup_moveTo();
}

function setup_lte3GScreen1Reset() {

}

function setup_apnModeChange() {
	var apnSelectMode = comboSelectedValueGet('tf1_setup_apnMode');

	switch(apnSelectMode) {
		case "0" :
			// Auto
			fieldStateChangeWr('tf1_setup_apnManual tf1_setup_apnDialInNumber', '', '', '');
			vidualDisplay('tf1_setup_apnManual tf1_setup_apnDialInNumber break_setup_apnManual break_setup_apnDialInNumber tf1_apnMethod', 'hide');
			vidualDisplay('tf1_setup_apnAuto', "configRow");
			vidualDisplay('break_setup_apnAuto', "break");
			$("#tf1_setup_userName").attr("readonly","readonly");
			$("#tf1_setup_Password").attr("readonly","readonly");
			setup_AutoApnChange();
			break;

		case "1" :
			// Manual
			fieldStateChangeWr('', '', 'tf1_setup_apnManual tf1_setup_apnDialInNumber', '');
			vidualDisplay('tf1_setup_apnManual tf1_setup_apnDialInNumber break_setup_apnManual break_setup_apnDialInNumber tf1_apnMethod', 'configRow');
			vidualDisplay('break_setup_apnManual break_setup_apnDialInNumber ', 'break');
			vidualDisplay('tf1_setup_apnAuto', "hide");
			vidualDisplay('break_setup_apnAuto', "hide");
			$("#tf1_setup_userName").removeAttr("readonly");
			$("#tf1_setup_Password").removeAttr("readonly");
			//setup_AutoApnChange();
			var selectedId = document.getElementById("tf1_apnAuth").selectedIndex;
			if (selectedId == -1) {
				$("#tf1_apnAuth").val(0);
			}
			if(ui_config.Dyn_Status["up_5s"]["sim_status"]["status"] == 0){
				$("#tf1_setup_apnManual").val('');
				$("#tf1_setup_apnManual").attr('readonly','readonly');
				$("#tf1_setup_userName").attr('readonly','readonly');
				$("#tf1_setup_Password").attr('readonly','readonly');
			}
			break;
	}
}

/*
function setup_encryptionModeChange() {
	var encryptSelectMode = comboSelectedValueGet('tf1_setup_encryptionMode');

	switch(encryptSelectMode) {

		case "0" :
			// No Encryption
			fieldStateChangeWr('tf1_authenticationType tf1_wpaMode tf1_cipherType tf1_preSharedkey tf1_key', 'tf1_keyTable', '', '');
			vidualDisplay('tf1_authenticationType tf1_wpaMode tf1_cipherType tf1_preSharedkey tf1_key tf1_keyTable tf1_setup_basicEncryption', 'hide');
			vidualDisplay('break_authenticationType break_wpaMode break_cipherType break_preSharedkey break_key', 'hide');
			break;

		case 2:
			// Basic Protechtion
			fieldStateChangeWr('tf1_wpaMode tf1_cipherType tf1_preSharedkey', '', 'tf1_authenticationType tf1_key', 'tf1_keyTable');
			vidualDisplay('tf1_authenticationType tf1_key tf1_keyTable', 'configRow');
			vidualDisplay('break_authenticationType break_key break_keyTable', 'break');
			vidualDisplay('tf1_wpaMode tf1_cipherType tf1_preSharedkey', 'hide');
			vidualDisplay('break_wpaMode break_cipherType break_preSharedkey', 'hide');
			break;

		case "3" :
			// Advanced Encryption
			fieldStateChangeWr('tf1_authenticationType tf1_key', 'tf1_keyTable', 'tf1_wpaMode tf1_cipherType tf1_preSharedkey', '');
			vidualDisplay('tf1_wpaMode tf1_cipherType tf1_preSharedkey', 'configRow');
			vidualDisplay('break_wpaMode break_cipherType break_preSharedkey', 'break');
			vidualDisplay('tf1_authenticationType tf1_key tf1_keyTable tf1_setup_basicEncryption', 'hide');
			vidualDisplay('break_authenticationType break_key break_keyTable', 'hide');
			break;
	}
	setup_wifi_changeWpaMode();
}

*/
function setup_onloadFn() {
	
	cp_setupwizard_get();
	wifi_status_get2();
	cp_wizard_template();	
	setup_apnModeChange();
	setup_encryptionModeChange();
	
	//wifi_SecurityprotectionSelect();
	//wifi_changeWpaMode();
	
	wiFiHtml = $("#tf1_lte3GScreen2 div.setupConfig").html();
	onloadCall2();
}


function setup_encryptionModeChange() {
	/* This function is Global from globalMgmt.js */
	var wifi_protection = parseInt(comboSelectedValueGet('tf1_setup_encryptionMode'), 10);
	//console.log (wifi_protection);
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

 

function setup_ethernetWifiValidate() {

	var txtFieldIdArr = new Array();
	txtFieldIdArr[0] = "tf1_wifi2point4G,"+global_lang['validation_msgs']['pls_enter_wifi_access_name'];
	txtFieldIdArr[1] = "tf1_preSharedkey,"+global_lang['validation_msgs']['pls_enter_valid_key'];

	if (txtFieldArrayCheck(txtFieldIdArr) == false)
		return false;

	setup_nextStep('tf1_routerEthernetScreen3', 4);

}

function setup_adminSettingValidate() {

	var txtFieldIdArr = new Array();
	txtFieldIdArr[0] = "tf1_username,"+ global_lang['validation_msgs']['pls_enter_valid_user_name'];
	txtFieldIdArr[1] = "tf1_primarySntpServer2,"+ global_lang['validation_msgs']['pls_enter_primary_server'];
    txtFieldIdArr[2] = "tf1_secondarySntpServer2,"+ global_lang['validation_msgs']['pls_enter_Secondary_server'];
	txtFieldIdArr[3] = "tf1_tertiarySntpServer2,"+ global_lang['validation_msgs']['pls_enter_teritary_server'];
	txtFieldIdArr[4] = "tf1_synchronization2,"+ global_lang['validation_msgs']['pls_enter_sync_cycle'];
	
	/* When SNTP is off */
	if ($("#tf1_sntpEnableDisable2").attr("class") == "enable-disable-off" ) {
		txtFieldIdArr[5] = "tf1_setDateTimeValue,"+ global_lang['validation_msgs']['pls_select_dataTime'];
	}
	
	if (txtFieldArrayCheck(txtFieldIdArr) == false)
		return false;
	 var pwdObj = document.getElementById('tf2_passwd');
     var cnfPwdObj = document.getElementById('tf2_cnfPassword');
    
    if (pwdObj && !pwdObj.disabled && cnfPwdObj && !cnfPwdObj.disabled && pwdObj.value != cnfPwdObj.value) {
        dialogAlert(global_lang['validation_msgs']['cfpwd_not_match'], "Information", "info");
        document.getElementById('tf2_passwd').focus();
        return false;
    }
	
	var SyncObj = document.getElementById("tf1_synchronization2");
    if (!numericValueRangeCheck(SyncObj, '', '', 1, 24, true, global_lang['validation_msgs']['invalid_sync_cycle'], '')) 
        return false;
		
		
	if (ipaddrValidateCommon('tf1_primarySntpServer2') == false) 
        return false;
    
    if (ipaddrValidateCommon('tf1_secondarySntpServer2') == false) 
        return false;
		
	 if (ipaddrValidateCommon('tf1_tertiarySntpServer2') == false) 
        return false;
	
	if ($("#tf1_sntpEnableDisable2").attr("class") == "enable-disable-off" ) {
	
		if ($("#tf1_setDateTimeValue").is(':disabled') == false && $("#tf1_setDateTimeValue").val() == "_ _ / _ _ / _ _ _ _   _ _ : _ _ _ _"){	
			alert(global_lang['validation_msgs']['pls_select_dataTime']);
			return false;
		}
	}
	var old_pass = $("#tf2_oldPassword").val();
	var pwdObj = $("#tf2_passwd").val();
	var cnfPwdObj = $("#tf2_cnfPassword").val();
	if(old_pass == "" && pwdObj == "" && cnfPwdObj == ""){
		setup_nextStep('tf1_lte3GScreen3', 4);
	}else{
		old_password();
	}

	

}
function old_password(){
	var request = $.ajax(
			{
				type: "GET",
				url: "/data.ria?FileID=1&sect_name=DEVICE",
			dataType: "json"
		});
	request.done(function( responseData,textStatus, jqXHR ) {
		var old_pass = $("#tf2_oldPassword").val();
		old_pass = encode_passwd(old_pass);
		if(old_pass != responseData.DEVICE.web_passwd){
			alert(global_lang['alerts_set']['Old_password']);
			return;
		}else{
			setup_nextStep('tf1_lte3GScreen3', 4);
		}
	});
}
function setup_wifiHotSpotWifiValidate() {
	var tf1_apn = $("#tf1_wifi2point4G").val();
	if(!check_wifi_str(tf1_apn) || tf1_apn =="")
		{
			alert(global_lang['alerts_set']['ssid_enter']);
			$("#tf1_wifi2point4G").focus();
			return;
		}
	var txtFieldIdArr = new Array();
	txtFieldIdArr[0] = "tf1_wifi2point4G,"+global_lang['validation_msgs']['pls_enter_wifi_access_name'];
	txtFieldIdArr[1] = "tf1_wifi5G,Please enter valid Access Name for Wi-Fi 5 GHz";
	txtFieldIdArr[2] = "tf1_preSharedkey,"+global_lang['validation_msgs']['pls_enter_valid_key'];

	if (txtFieldArrayCheck(txtFieldIdArr) == false)
		return false;
		
	/* [start] validation for Basic Protection */	
	var security = comboSelectedValueGet('tf1_setup_encryptionMode');	
	var selKeyIndex = radioCheckedValueGet('tf1_rdbWepKey0');
	if (security == "2") {
		
		 if ( $("#tf1_txtWepKey"+selKeyIndex).val() == "" ) {
			alert(global_lang['validation_msgs']['pls_generate_wep_keys']);
			return false; 			
		 } 
		if ( $("#tf1_txtWepKey"+selKeyIndex).val().length != wepKeyLenGet('tf1_toggle_keyType'+selKeyIndex)) {
			alert(global_lang['validation_msgs']['change_wep_key']);
			return false; 
		}			 
	}
	/* [end] validation for Basic Protection */	
	
	passphraseval = $("#tf1_preSharedkey").val();
	if (security == "3")
	{
		if(passphraseval.length<8){
			alert(global_lang['alerts_set']['wifi_password']);
			return false;
		}		
	}

	setup_nextStep('tf1_lte3GScreen2', 3);
	var curr = new Date().getFullYear();
			var opt = {}			
			opt.datetime = {preset: 'datetime',minDate: new Date(1980,1,6,1,28),maxDate: new Date(2099,7,30,15,44),stepMinute: 1,dateFormat:"yy-mm-dd"};
			$('#tf1_setDateTime').val($('#tf1_setDateTimeValue').val());
			$('#tf1_setDateTime').scroller('destroy').scroller(
				$.extend(
					opt["datetime"], { 					
						mode: "scroller", 
						display: "inline" 
					}
				)			
			);
			timeEnableDisableOnload2({imageId:'tf1_sntpEnableDisable2', disableIndividual:'tf1_primarySntpServer2 tf1_secondarySntpServer2 tf1_tertiarySntpServer2 tf1_synchronization2', disableGrp:'', enableIndividual:'', enableGrp:'', hideClass:'hide', showClass:'configRow', breakDivs:'break_primarySntpServer2 break_secondarySntpServer2 break_tertiarySntpServer2  break_synchronization2', breakClass:'break', imagesInfo:{disableImages:'', enableImages:'', disableClass:'', enableClass:''}});
			deviceTimeOnload2();
		 
}

function setup_hotspotConnectionValidate() {

	var txtFieldIdArr = new Array();
	txtFieldIdArr[0] = "tf1_setup_hotspotPresharedKey,Please enter valid Pre Shared Key";
	if (txtFieldArrayCheck(txtFieldIdArr) == false)
		return false;

	$("#tf1_wifiHotSpotScreen2 div.setupConfig").html(wiFiHtml);
	setup_nextStepHotSpot('tf1_wifiHotSpotScreen2', 3);

}

function setup_HotSpotsList() {

	vidualDisplay("tf1_hotSpotsList", "configRow");
	datatable("tf1_HotSpotsTbl");

}

function setup_hotSpotClose() {
	vidualDisplay("tf1_hotSpotsList", "hide");
}

function setup_hotSpotSet() {
	$("#tf1_hotspot1").html("Test1");
	$("#tf1_hotspot2").html("B/G/N mixed");
	$("#tf1_hotspot3").html("11");
	$("#tf1_hotspot4").html("WPA-PSK/WPA2-PSK");
	$("#tf1_hotspot5").html("AES");
	$("#tf1_setup_hotspotPresharedKey").val('2dsfsdfsd');
	vidualDisplay("tf1_hotSpotsList", "hide");
}

function setup_hotSpotRefresh() {

	vidualDisplay("tf1_hotSpotsList", "hide");
	vidualDisplay("tf1_hotSpotsList", "configRow");
	$("#tf1_hotSpotsList_div").show("slow");

}



function deviceTimeOnload2() {	
	onloadCall(timeEnableDisableOnload2, {imageId:'tf1_sntpEnableDisable2', disableIndividual:'tf1_primarySntpServer2 tf1_secondarySntpServer2 tf1_tertiarySntpServer2 tf1_synchronization2', disableGrp:'', enableIndividual:'', enableGrp:'', hideClass:'hide', showClass:'configRow', breakDivs:'break_primarySntpServer break_secondarySntpServer2 break_tertiarySntpServer2  break_synchronization2', breakClass:'break', imagesInfo:{disableImages:'', enableImages:'', disableClass:'', enableClass:''}});
	
	timeEnableDisableOnload2({imageId:'tf1_sntpEnableDisable2', disableIndividual:'tf1_primarySntpServer2 tf1_secondarySntpServer2 tf1_tertiarySntpServer2 tf1_synchronization2', disableGrp:'', enableIndividual:'', enableGrp:'', hideClass:'hide', showClass:'configRow', breakDivs:'break_primarySntpServer2 break_secondarySntpServer2 break_tertiarySntpServer2 break_synchronization2', breakClass:'break', imagesInfo:{disableImages:'', enableImages:'', disableClass:'', enableClass:''}});
	
	
	if ($("#tf1_sntpEnableDisable2").attr("class") == "enable-disable-off" ) {
	
		$("#tf1_setDateTimeBlock_div").attr("class","");
		
	} else {
		
		$("#tf1_setDateTimeBlock_div").attr("class","hide");
	}
 
}

function timeEnableDisableOnload2(data){
	onAnchorToggle(data);
	if ($("#tf1_sntpEnableDisable2").attr("class") == "enable-disable-off" ) {
	
		$("#tf1_setDateTimeBlock_div").attr("class","");
		
	} else {
		
		$("#tf1_setDateTimeBlock_div").attr("class","hide");
	}
}


function setup_wifi_changeWpaMode() {

 	var wpaMode = comboSelectedValueGet('tf1_wpaMode');
	$("#tf1_cipherType option[value='AES']").remove();
	$("#tf1_cipherType option[value='TKIP']").remove();
	$("#tf1_cipherType option[value='Auto']").remove();
	
	switch (wpaMode) {	
		case 'Auto' :
			$("#tf1_cipherType").append('<option value="Auto">AES / TKIP</option>');
		break;	
		case 'WPA2' :		
		case 'WPA' :
		
		$("#tf1_cipherType").append('<option value="AES">AES</option>');
		$("#tf1_cipherType").append('<option value="TKIP">TKIP</option>');
		break;	
		
	}
	
}

function encode_passwd_wizard(passtext)
{//encode login password,encode like sample: "1250" <= "12"+'50' <= "12"+2<= "122" <= 122 <= 'z'
    var i = 0;
    var encode_str = "";
    passtext = passtext;//'Login' flag of encode password 
    var digital = "0123456789";
    for (i = 0; i < passtext.length; ++i)
    {
        var num = passtext.charCodeAt(i)+"";
        if (num.length == 1)
            encode_str += "00"+digital.charCodeAt(parseInt(num));
        else if (num.length == 2)
            encode_str += "0"+num.substr(0,1) + digital.charCodeAt(parseInt(num.substr(1,1)));
        else if (num.length == 3)
            encode_str += num.substr(0,2) + digital.charCodeAt(parseInt(num.substr(2,1)));
        else
            encode_str += "0000";
    }
    return encode_str;
}
function redirectTimeoutFn(path) {
    if (--window.redirectTimeoutVar <= 0) {
    	parent.location.href=path;
    } else {
      $("#reboot_timeout").html(window.redirectTimeoutVar);
    }
}
function defaultRedirect(timeout, path,value) {
	$.ajaxSetup({async:true});
	$("#tf1_Progressbar").show();
    window.redirectTimeoutVar = timeout;
	if(value == 0){
		$("#tf1_frm_statusBar div.usageDisplay").html(global_lang['system_popup']['reseting_timeout']);
	}else{
		$("#tf1_frm_statusBar div.usageDisplay").html(global_lang['system_popup']['rebooting_timeout']);
	}
	//$("#tf1_frm_statusBar div.usageDisplay").html(global_lang['system_popup']['rebooting_timeout']);
	$("#reboot_timeout").html(window.redirectTimeoutVar);
    setInterval("redirectTimeoutFn('" + path + "');", 1000);
	
	$(".btnSubmit").attr("onClick","javascript:;");
	
	$("#btnClose").click(function(){
			return false;
		});
}

function setup_saveSetting(event,frmId){
//console.log(" setup_saveSetting");//
	 
	//$(event.target).val("Please wait..."); 
	
	auto_cnn = parseInt($("#tf1_setup_apnMode").val(),10);
	allow_roaming = parseInt($("#tf1_allowroaming_cpwizard").val(),10);
	apn_name = encodeURIComponent($("#tf1_setup_apnManual").val());
	apn_uname = encodeURIComponent($("#tf1_setup_userName").val());
	apn_passwd = encodeURIComponent($("#tf1_setup_Password").val());
	wifi_ssid= encodeURIComponent($("#tf1_wifi2point4G").val());
	wifi_encrymode= $("#tf1_setup_encryptionMode").val();
	username = $("#tf1_username").val();
	passwd  =$("#tf1_passwd").val();
	if(passwd.length < 8 || passwd.length > 30){
	  alert(global_lang['alerts_set']['Password_rules']);
	  return
   }
   var btn = 0;
   var pwdRegex = new RegExp('(?=.*[0-9])');
   var pwdRegex1 = new RegExp('(?=.*[A-Z])');
   var pwdRegex2 = new RegExp('(?=.*[a-z])');
   var pwdRegex3 = new RegExp('(?=.*[^a-zA-Z0-9])');
   if(pwdRegex.test(passwd)){
	   btn = btn + 1;
   }if(pwdRegex1.test(passwd)){
	   btn = btn + 1;
   }if(pwdRegex2.test(passwd)){
	   btn = btn + 1;
   }if(pwdRegex3.test(passwd)){
	   btn = btn + 1;
   } 
   if(btn < 3){
	   alert(global_lang['alerts_set']['Password_rules']);
	  return
   }
	var bm_pass = encode_passwd(passwd); 
	passwd = CryptoJS.MD5(passwd)+"";
	sntpst = $("#tf1_sntpEnableDisable2value").val();
	server1 = $("#tf1_primarySntpServer2").val();
	server2= $("#tf1_secondarySntpServer2").val();
	server3= $("#tf1_tertiarySntpServer2").val();
	up_period=$("#tf1_synchronization2").val();
 	date = $("#tf1_setDateTimeValue").val();	
	/* For Valid Date & Time settings */
    var ampm_flag = date.indexOf("PM");
    var dateArry = date.split(" ");
    var dateArry1 = dateArry[0].split("-");
    var dateArry2 = dateArry[1].split(":");
    if(ampm_flag > 0)
        dateArry2[0] = parseInt(dateArry2[0])+12;
    var currentTime = new Date(dateArry1[0], parseInt(dateArry1[1]) - 1, dateArry1[2], dateArry2[0], dateArry2[1]);
    var seconds = currentTime.getUTCSeconds();
    var minutes = currentTime.getUTCMinutes();
    var hours = currentTime.getUTCHours();
    var month = currentTime.getUTCMonth();
    var day = currentTime.getUTCDate();
    var year = currentTime.getUTCFullYear();
    var dateObject = new Date(year,month, day, hours,minutes);
    var dateStr = $.scroller.formatDate("yyyy-mm-dd HH:ii:00",dateObject);
	timezone=$("#tf1_timezone2").val();
	language = $("#tf1_Language").val();
	
	auth =$("#tf1_apnAuth").val();
	//console.log(apn_name);//
	//console.log(username);//
	//console.log(passwd);//
	 var security, wpa_auth;
	 passphraseval = $("#tf1_preSharedkey").val();
	 passphraseval = encode_passwd_wizard(passphraseval);
			protection_val = $("#tf1_setup_encryptionMode").val();
			wpaMode_val = $("#tf1_wpaMode").val();
			cipherType_val = $("#tf1_cipherType").val();
			wep_key_index  = "";
			wep_key  = ""
			
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
				wep_key = encode_passwd_wizard(wep_key); 				
			} else if (wpaMode_val == "WPA" && cipherType_val == "TKIP") {				
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
	 
	 cpApi_get_authId();
    var post_data = {"COMMON":
					 {"roaming_conx":allow_roaming},
					 "APN_0":{"type":auto_cnn,"apn":apn_name,"uname":apn_uname,"passwd":apn_passwd,"auth":parseInt(auth,10)},
					 "AP1":{"ssid":wifi_ssid,"security":security,"wpa_auth":wpa_auth,"wpa_passphrase":passphraseval,"wep_key":wep_key,"wep_key_index":wep_key_index},					
					 "CfgType":"set_quicksetting","authID":auth_id
					 };

    var request = $.ajax({
        url: "/webpost.cgi",
        type: "POST",
        data: JSON.stringify(post_data),
        dataType: "json"
    });
    
    request.done(function(responseData,textStatus, jqXHR ) {
		 
		   systemApi_wizard_languageSet(language);
		   systemApi_wizard_SntpSet(sntpst,timezone,up_period,server1,server2,server3);
		   systemApi_wizard_datetimeSet(dateStr);  
		   systemApi_wizard_reboot();	
		   var old_pass = $("#tf2_oldPassword").val();
	       var pwdObj = $("#tf2_passwd").val();
	       var cnfPwdObj = $("#tf2_cnfPassword").val();
	       if(old_pass == "" && pwdObj == "" && cnfPwdObj == ""){
			
	       }else{
			 systemApi_wizard_accountSet(username,bm_pass);
	       }		   
		   clearCookies();  		   	  		   
		   alert(global_lang['alerts_set']['setup_wizard_config_save']);			      
		   //window.location = "index.html";
			var path = "index.html";
			defaultRedirect(90,path);
    });
    request.fail(function(jqXHR, textStatus, errorThrown) {
           
    });
    request.always(function(responseData,textStatus, jqXHR ) {
            
    });

}

function setup_AutoApnChange() {

	var selectedId = document.getElementById("tf1_setup_apnAuto").selectedIndex;
	 if ( selectedId == -1) {
		selectedId = 0; 
	 }
	 if(parseInt(ui_config["cp_wizard_info"]["apn"]["apn_list"]["apn_count0"]) > 0 )
	 {
		$("#tf1_setup_apnManual").val(HTMLDecode(ui_config["cp_wizard_info"]["apn"]["apn_list"]["multi_apn0"][selectedId]["apn"]));
		$("#tf1_setup_userName").val(HTMLDecode(ui_config["cp_wizard_info"]["apn"]["apn_list"]["multi_apn0"][selectedId]["uname"]));
		$("#tf1_setup_Password").val(HTMLDecode(ui_config["cp_wizard_info"]["apn"]["apn_list"]["multi_apn0"][selectedId]["pwd"]));		 
	 }
	/* 
	$("#tf1_apnAuth").val(ui_config["cp_wizard_info"]["apn"]["apn_list"]["multi_apn0"][selectedId]["auth"]);
	*/

}
	
	


