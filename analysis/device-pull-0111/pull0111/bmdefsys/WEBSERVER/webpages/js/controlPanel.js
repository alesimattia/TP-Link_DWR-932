/* Create Global configuration variables for all get Config */
var aa = new Array();
var bb = null;
var plmn_sim=null;
var newSms = 0;
ui_config = new Object();
ui_config.Dyn_Status = new Object();
ui_config.Dyn_Status["up_5s"] = new Object();
ui_config.Dyn_Status["up_5s"]["sim_status"] = new Object();
ui_config.Dyn_Status["up_5s"]["sim_status"]["status"] = new Object();
ui_config.Dyn_Status["about_sys"] = new Object();
ui_config.Dyn_Status["nw_usage"] = new Object();
ui_config.Dyn_Status["cp_conn_mode"] = new Object();
ui_config["lan"] = new Object();
ui_config["wi-fi_clients"] = new Object();
ui_config["wpsstatus"] = new Object(); 
ui_config["wi-fi_status"] = new Object();
ui_config["sys_log"]  = new Object();
ui_config["ussd"]	= new Object();
ui_config["sntp"]   = new Object();
ui_config["sntp"]["SNTP"]   = new Object();
ui_config["fw_info"]  = new Object();	
ui_config["account"]  = new Object(); 	
ui_config["apn_info"] = new Object(); 
ui_config["plmn_info"] = new Object();
ui_config["simpin_info"] = new Object();
ui_config["powersaving"]  = new Object();
ui_config["date"]	= new Object();
ui_config["Upnp_status"] = new Object();
ui_config["Lcd_status"] = new Object();
ui_config["firewall_info"] = new Object();
//ui_config["modelinfo"] = new Object();
ui_config["net_stat"]  = new Object();
ui_config["wi-fi_generate_pin-info"] = new Object();
ui_config["wi-fi_default_pin-info"] = new Object();
ui_config["web_info"] = new Object();
ui_config["wi-fi_wps_status"] = new Object();
ui_config["plmnlist_info"] = new Object();
ui_config["firewall_ipfilterinfo"] = new Object();
ui_config["firewall_portfwdinfo"] = new Object();
ui_config["fota_fw_info"]  = new Object();	



global_cploaded = false;
var global_plmnSearchTimeoutHandler = false;
var global_ussdsendTimeoutHandler = false;
var global_wifiPbcPinTimeoutHandler = false;
var global_firmwareUpgradeTimeoutHandler = false;
var global_FotaUpgradeTimeoutHandler = false;
var global_stat_count = 0;
var global_contact_loop = 5; 

var global_internet_popup_content = "";
var global_wifi_popup_content = "";
var global_application_popup_content = "";
var global_system_popup_content = "";
var global_help_popup_content = "";
var global_setupWizard_popup_content = "";

/* SMS sent handler */
var global_smsTimeoutHandler = false;
var global_smsTimeout = 0;

var global_restoreTimeout = null;

var global_disconnect_service = null;

/* Control Panel */

function controlPanel_default() {

}

function controlPanel_onloadPopupSystem() {
	showTabs();
}

function controlPanel_onloadPopupInternet() {
	showTabs();
}

function controlPanel_onloadPopupWifi() {
	showTabs();
}

function controlPanel_onloadPopupApplications() {
	showTabs();
	datatable('tf1_simContactsTbl');
}

function controlPanel_onloadPopupHelp() {

	showTabs();

}


function doSystemNameGet() {
		var request = $.ajax(
			{
				type: "GET",
				url: "/data.ria?DynUpdate=about_sys",
			dataType: "json"
		});
	request.done(function( responseData,textStatus, jqXHR ) {
		document.title = "D-Link - "+responseData.model_name;
		systemName = responseData.model_name;
		$("#systemName").html(responseData.model_name);
	});
}

$(document).ready(function() {
	 $.ajaxSetup({
		beforeSend: function (XMLHttpRequest) {
		var randomNum = Math.random().toFixed(6).slice(-6); 
        i++;
        if(i>6){
            clearInterval(timer); 
        }
		XMLHttpRequest.setRequestHeader("X-Csrf-Token", randomNum);
		var timer = setInterval(randomNum, 1000); 
	
		},
	});
	$("body").on("click", "#btnClose", function(e) {
		HideDialog('tf1_dialog', 'tf1_overlay');
		e.preventDefault();
	});
	$("body").on("click", ".submitRowPopup > .btnSubmit", function(e) {
		HideDialog('tf1_dialog', 'tf1_overlay');
		e.preventDefault();
	});
		
	doSystemNameGet();
	window.onresize = function(event) {
		var leftPx = $(window).innerWidth() / 2 - $(".configDialog").width() / 2;
		leftPx = Math.round(leftPx);
		var topPx = $(window).innerHeight() / 2 - $(".configDialog").height() / 2;
		topPx = Math.round(topPx);
		$(".configDialog").css('left', leftPx + 'px');
		$(".configDialog").css('top', topPx + 'px');

		leftPx = $(window).innerWidth() / 2 - $(".errorPopup").width() / 2;
		leftPx = Math.round(leftPx);
		topPx = $(window).innerHeight() / 2 - $(".errorPopup").height() / 2;
		topPx = Math.round(topPx);
		$(".errorPopup").css('left', leftPx + 'px');
		$(".errorPopup").css('top', topPx + 'px');

	}

	
    /* Initiate the setIntervl to check auth every 2 seconds */


    loginApi_check_auth();
	var requestTimeout = $.ajax({
        url: "data.ria?FileID=1&sect_name=DEVICE",        
        dataType: "json"
    });
    requestTimeout.done(function( responseData,textStatus, jqXHR ) {              
         global_authDefaulTimeout = responseData["DEVICE"]["login_timeout"];
		 ui_config["login_timeout"] = global_authDefaulTimeout;
		 if (parseInt(global_authDefaulTimeout,10) < 300) {
			global_authDefaulTimeout = 300;
			ui_config["login_timeout"] = global_authDefaulTimeout;
		 }
    });
    requestTimeout.fail(function( jqXHR, textStatus, errorThrown) {	 
    });
    requestTimeout.always(function(responseData,textStatus, jqXHR ) {       
    });
	 
     global_AuthTimeoutHandler = setInterval(function(){loginApi_timeout_start()},1000);
     cp_nw_usage();
	 system_netstat_get();
	 
	 
	 cp_up_5s();
	 
 	$(this).mousemove(function (e)
	{
		global_AuthTimeout = 179;
		global_authDefaulTimeout = ui_config["login_timeout"];
	});
	$(this).keypress(function (e)
	{
		global_AuthTimeout = 179;
		global_authDefaulTimeout = ui_config["login_timeout"];
	});
	 
	
	/*
	var requestTimeout = $.ajax({
        url: "data.ria?FileID=1&sect_name=DEVICE",        
        dataType: "json"
    });
    requestTimeout.done(function( responseData,textStatus, jqXHR ) {              
         global_authDefaulTimeout = responseData["DEVICE"]["login_timeout"];
		 ui_config["login_timeout"] = global_authDefaulTimeout;
    });
    requestTimeout.fail(function( jqXHR, textStatus, errorThrown) {	 
    });
    requestTimeout.always(function(responseData,textStatus, jqXHR ) {       
    });

	 */
	 
	 cp_about_sys();
	 cp_wifi_template();
     cp_messages_template();
     cp_internetInfo_template();
	 
	 var request2 = $.ajax({
      //  url: "data.ria?FileID=2&sect_name=COMMON",        
        url: "data.ria?CfgType=get_apn_cfg",        
        dataType: "json",
        async: global_cploaded
    });
    request2.done(function( responseData,textStatus, jqXHR ) {              
         ui_config.Dyn_Status["cp_conn_mode"] = responseData;         
    });
    request2.fail(function( jqXHR, textStatus, errorThrown) {	 
    });
    request2.always(function(responseData,textStatus, jqXHR ) {       
    });
	 
	 cp_connectionMode_template();
	 cp_powersaving_template();
	 
	 
	 
	 cp_toggleConnection();
		onloadCall(cp_enableDisableConnectionOnLoad, {
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
	 
	 wifi_status_get();
	 cp_wifi_template();
     internet_api_lanInfo_get();
     cp_mainInfo_template();
	 global_cploaded = true;
	 
     global_up5sTimeoutHandler = setInterval(function(){cp_up_5s()},5000); 
	 index_getSMSStoreStatus();
     //global_nwUsageTimeoutHandler = setInterval(function(){cp_nw_usage()},5000);     
     
// || ui_config.Dyn_Status["up_5s"]["signal"]["modem"]["opname"] 
     	if(ui_config.Dyn_Status["up_5s"]["ipv4"]["op_name"]== "PIN LOCK")	
			{
				dialogAlert(global_lang["cpsection"]["link_pin_lock"],"Information","info");
			}
		else if(ui_config.Dyn_Status["up_5s"]["ipv4"]["op_name"] == "PUK LOCK"){
				dialogAlert(global_lang["cpsection"]["link_puk_lock"],"Information","info");
		}
		firstLoginGet();
});
function formatTimeNum(val){
	if(val < 10){
		val = "0" + val.toString();
	}
	return val.toString();
}
function secondsToTime(seconds){
 
	var numdays = Math.floor(seconds / 86400);
	var numhours = formatTimeNum(Math.floor((seconds % 86400) / 3600));
	var numminutes = formatTimeNum(Math.floor(((seconds % 86400) % 3600) / 60));
	var numseconds = formatTimeNum(((seconds % 86400) % 3600) % 60);

	if ( numdays > 0) {

		return numdays + "d " + numhours + ":" + numminutes + ":" + numseconds;

	} else {

	     return numhours + ":" + numminutes + ":" + numseconds;

	}

}
var sms_store_flag = 0;
function index_getSMSStoreStatus()
{   
		var tmp_sms_store_flag = ui_config.Dyn_Status["up_5s"]["sms_store"];
        if(sms_store_flag != tmp_sms_store_flag){
			if(tmp_sms_store_flag == 1)
			{
				alert(global_lang['alerts_set']['sms_sim_full']);
			}
			else if(tmp_sms_store_flag == 2)
			{
				alert(global_lang['alerts_set']['sms_local_full']);
			}
			else if(tmp_sms_store_flag == 3)
			{
				alert(global_lang['alerts_set']['sms_sim_local_full']);
			}
			sms_store_flag = tmp_sms_store_flag;
		} 	
/*
	var request = $.ajax({
        url: "data.ria?DynUpdate=up_5s",        
        dataType: "json"
       
    });
    request.done(function( responseData,textStatus, jqXHR ) {              
        if(sms_store_flag != responseData.sms_store){
			if(responseData.sms_store == 1)
			{
				alert(global_lang['alerts_set']['sms_sim_full']);
			}
			else if(responseData.sms_store == 2)
			{
				alert(global_lang['alerts_set']['sms_local_full']);
			}
			else if(responseData.sms_store == 3)
			{
				alert(global_lang['alerts_set']['sms_sim_local_full']);
			}
			sms_store_flag = responseData.sms_store;
		}  
		
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {
			
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
*/
}

function cp_enableDisableConnectionOnLoad(toggleObj, thisObj) {
	onAnchorToggle(toggleObj);
	var imgId = thisObj.id;
	switch (imgId) {

		case 'tf1_cpConnect':
			//cp_toggleConnection();
			
			if ( $("#tf1_cpConnect").attr("class") == "enable-disable1-on") {
			        //internet_api_manualConnectDisconnect(1);
				$("#tf1_cp_connStr").html("Connecting...");
				//$("#tf1_cpTime").attr("class","enable-disable-on-noclick");
				
			} else if ($("#tf1_cpConnect").attr("class") == "enable-disable1-off" ) {
			//	internet_api_manualConnectDisconnect(0);
				$("tf1_cp_connStr").html("DisConnecting...");
				//$("#tf1_cpTime").attr("class","enable-disable-off-noclick");
			}

			global_cploaded = false;
			cp_up_5s();
			global_cploaded = true;
			break;
			
		 case 'tf1_cpConnectDissconnect':
			//cp_toggleConnection();
			
			if ( $("#tf1_cpConnectDissconnect").attr("class") == "enable-disable-on") {
				internet_api_manualConnectDisconnect(1);
				$("#tf1_cp_connStr").html("Connecting...");
				//$("#tf1_cpTime").attr("class","enable-disable-on-noclick");
				$("#tf1_cpConnect").attr("class","enable-disable-on-noclick");
				
				
			} else if ($("#tf1_cpConnectDissconnect").attr("class") == "enable-disable-off" ) {
				internet_api_manualConnectDisconnect(0);
				$("tf1_cp_connStr").html("DisConnecting...");
				//$("#tf1_cpTime").attr("class","enable-disable-off-noclick");
				$("#tf1_cpConnect").attr("class","enable-disable-on-noclick");
			}
			global_cploaded = false;
			cp_up_5s();
			global_cploaded = true;
			break;
			case 'tf1_cpAlwaysConnect':
		   if ( $("#tf1_cpAlwaysConnect").attr("class") == "enable-disable-on") {
				internet_api_manualConnectDisconnect(1);
				$("#tf1_cp_connStr").html("Connecting...");
				$("#tf1_cpConnect").attr("class","enable-disable-on-noclick");				
			} else if ($("#tf1_cpAlwaysConnect").attr("class") == "enable-disable-off" ) {
				internet_api_manualConnectDisconnect(0);
				$("tf1_cp_connStr").html("DisConnecting...");
				$("#tf1_cpConnect").attr("class","enable-disable-on-noclick");
			}
			global_cploaded = false;
			cp_up_5s();
			global_cploaded = true;
			break;

	}

}

function cp_toggleConnection() {

	if ($("#tf1_cpConnect").attr("class") == "enable-disable1-on") {
		$("#tf1_cpTime").show();
		$("#tf1_displayTime").show();
		$("#tf1_cpConAlways").css("color", "#40464B");
		$("#tf1_cpConOnDemand").css("color", "#40464B");
		$("#tf1_cpConManual").css("color", "#40464B");
		
		
	    if (ui_config.Dyn_Status["cp_conn_mode"]["apn"]["COMMON"]["auto_conx"] == "1" ) {		
		
			$("#tf1_cpAlwaysConnect").attr("class", "connectionTypeActive");		
			$("#tf1_cpManualConnect").attr("class", "connectionType");
		
		} else  {			
			$("#tf1_cpAlwaysConnect").attr("class", "connectionType");		
			$("#tf1_cpManualConnect").attr("class", "connectionTypeActive");		
		}

	} else {
		if (ui_config.Dyn_Status["cp_conn_mode"]["apn"]["COMMON"]["auto_conx"] == "0" ) {					
			$("#tf1_cpAlwaysConnect").attr("class", "connectionType");		
			$("#tf1_cpManualConnect").attr("class", "connectionTypeActive");	
			$("#tf1_cpConnectDissconnect").show();
		}else{
			
			$("#tf1_cpTime").hide();
		$("#tf1_displayTime").hide();
		$("#tf1_cpConAlways").css("color", "#BFBFBF");
		$("#tf1_cpConOnDemand").css("color", "#BFBFBF");
		$("#tf1_cpConManual").css("color", "#BFBFBF");
		$("#tf1_cpConDis").css("color", "#BFBFBF");
		$("#tf1_cpConnectDissconnect").hide();
		$("#tf1_cpAlwaysConnect").attr("class", "connectionTypeActive");		 
		$("#tf1_cpManualConnect").attr("class", "connectionType");
		}

		//$("#tf1_cpAlwaysConnect").attr("disabled", "disabled");	 
		//$("#tf1_cpManualConnect").attr("disabled", "disabled");

		//$("#tf1_cpAlwaysConnect").css("cursor", "default");	 
		//$("#tf1_cpManualConnect").css("cursor", "default");

	}
        $("#tf1_cpAlwaysConnect").removeAttr("disabled");		
		$("#tf1_cpManualConnect").removeAttr("disabled");
		$("#tf1_cpAlwaysConnect").css("cursor", "pointer");
		$("#tf1_cpManualConnect").css("cursor", "pointer");
}


function cp_connectionType(imgId) {

	/*if ($("#tf1_cpConnect").attr("class") == "enable-disable-off") {
		return;
	}*/
	$(".connectionTypeActive").attr("class", "connectionType");
	var thisObj = "#" + imgId;
	$(thisObj).attr("class", "connectionTypeActive");

	if (imgId == "tf1_cpAlwaysConnect" || imgId == "tf1_cpDemandConnect" || imgId == "tf1_cpManualConnect" || imgId == "tf1_cpConnectDissconnect") {
		if ($(thisObj).attr("class") == "connectionTypeActive" && imgId != "tf1_cpConnectDissconnect") {
			$("#tf1_cpAlwaysConnect").attr("class", "connectionType");
			$("#tf1_cpDemandConnect").attr("class", "connectionType");
			$("#tf1_cpManualConnect").attr("class", "connectionType");
			$(thisObj).attr("class", "connectionTypeActive");
		}

		if (imgId == "tf1_cpManualConnect" && $(thisObj).attr("class") == "connectionType") {
			$("#tf1_cpConnectDissconnect").show();
			$("#tf1_cpConDis").css("color", "#0071C7");
		}

		if (imgId == "tf1_cpManualConnect" && $(thisObj).attr("class") == "connectionTypeActive") {
			$("#tf1_cpConnectDissconnect").show();
			$("#tf1_cpConDis").css("color", "#0071C7");
		}

		if (imgId != "tf1_cpConnectDissconnect" && imgId != "tf1_cpManualConnect" && $(thisObj).attr("class") == "connectionTypeActive") {
			$("#tf1_cpConnectDissconnect").hide();
			$("#tf1_cpConDis").css("color", "#BFBFBF");
		}

	}
	
	cp_api_cnmodeConfig(imgId);
	
}


function cp_api_cnmodeConfig(imgId) {
	
	/* Get auth_id */
    cpApi_get_authId();
	var autoConnect = 1;
	//console.log(imgId);
	if (imgId == "tf1_cpManualConnect") {
		autoConnect = 0; /*manual */
		ui_config.Dyn_Status["cp_conn_mode"]["apn"]["COMMON"]["auto_conx"] = "0";
	} else { /*Auto */
		ui_config.Dyn_Status["cp_conn_mode"]["apn"]["COMMON"]["auto_conx"] = "1";	
	}
	 
	var post_data = {
						"CfgType":"apn",
						"authID":auth_id,
						 "COMMON":{
							 		"auto_conx": autoConnect									
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
				
					  
						
					
          	});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		     	//alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    }); 
	
}
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
function closeDiv(event, divId) {
	IE_Chrome(event);
	$("#" + divId).hide();

}

function openDiv(event, divId) {

	IE_Chrome(event);
	$("#" + divId).fadeIn(300);

}
function getNetworkStr(status) {
    var wan_network_list = {
        "TD-LTE":"LTE",
        "LTE FDD":"LTE",
		"LTE":"LTE",
		"HSPA":"H",
		"HSPA+":"H+",
        "TD-SCDMA":"3G",
        "TDSCDMA":"3G",
        "WCDMA":"3G",
        "UMTS":"3G",
        "Edge":"E",
        "GSM":"2G",
        "CDMA-1X":"G",
        "CDMA-1XEVDO":"3G"	
		
    };

    if (status in wan_network_list) {
        return wan_network_list[status];
    }
	else
		return "";
}

function showSMS(event) {

	var anchorObject = event.target;
	$("#tf1_simDetails").toggle("slow", function() {
		$(anchorObject).html($(this).is(':visible') ? 'Hide' : 'Show');
	});

}

function cp_up_5s() {
   
	var request = $.ajax({
        url: "data.ria?DynUpdate=up_5s",        
        dataType: "json",
        async: global_cploaded
    });
    request.done(function( responseData,textStatus, jqXHR ) {          
         ui_config.Dyn_Status["up_5s"] = responseData;
		 ui_config.Dyn_Status["up_5s"]["system_date"] = responseData.system_date;
		 ui_config.Dyn_Status["up_5s"]["sim_status"]["status"] = responseData["sim_status"]["status"];
		 $("#setLanguage_index").val(ui_config.Dyn_Status["up_5s"]["lang"]);
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {
			if(jqXHR.status == 401) {
				window.location = "index.html";
			}
    });
    request.always(function(responseData,textStatus, jqXHR ) { 
    
    });
	
   if ( global_cploaded == false) {
	  
	 if(ui_config.Dyn_Status["up_5s"]["ipv4"]["status"] == "Disconnected") {
	 	//internet_api_manualConnectDisconnect(1);
		//internet_api_manualConnectDisconnect(0);
		
		var request_netPref = $.ajax({
	    url: "data.ria?CfgType=get_apn_cfg",       
        dataType: "json"
    	});
		request_netPref.done(function( responseData,textStatus, jqXHR ) {  
			if (parseInt(responseData["apn"]["COMMON"]["netpref_value"],10) == 8) {
				global_disconnect_service = "2G";	
			} else if (parseInt(responseData["apn"]["COMMON"]["netpref_value"],10) == 7) {
				global_disconnect_service = "3G";						
			} else if (parseInt(responseData["apn"]["COMMON"]["netpref_value"],10) == 6) {
			   global_disconnect_service = "4G";
			} else {
			   global_disconnect_service = null;
			}  
    		
		});
		request_netPref.fail(function( jqXHR, textStatus, errorThrown) {	
		});
		request_netPref.always(function(responseData,textStatus, jqXHR ) {       
		});
		
	 }    
    /* Language setting */

	var localeLng = langString(ui_config.Dyn_Status["up_5s"]["lang"]);

	var opts = {language: localeLng, pathPrefix: "/lang"};
	opts.callback = function(data, defaultCallback) {
			          global_lang = data;
		              defaultCallback(data);
	}
	$("[data-localize]").localize("lang", opts)
	var lang_url = "/lang/lang-"+localeLng+".json";
	var request = $.ajax({
		url: lang_url,       
		dataType: "json"
	});
	request.done(function( responseData,textStatus, jqXHR ) {  
		global_lang = responseData;
	});
	request.fail(function( jqXHR, textStatus, errorThrown) {	
	});
	request.always(function(responseData,textStatus, jqXHR ) {       
	});		 
 }
	cp_nw_usage();
	var request2 = $.ajax({
        url: "data.ria?CfgType=get_apn_cfg",        
        dataType: "json",
        async: global_cploaded
    });
    request2.done(function( responseData,textStatus, jqXHR ) {              
         ui_config.Dyn_Status["cp_conn_mode"] = responseData;         
    });
    request2.fail(function( jqXHR, textStatus, errorThrown) {
		if(jqXHR.status == 401) {
			window.location = "index.html";
		}
    });
    request2.always(function(responseData,textStatus, jqXHR ) {       
    });
    //index_getSMSStoreStatus();
	cp_connectionMode_template();	
	cp_toggleConnection();
	cp_messages_template();
	cp_wifi_template();
	cp_internetInfo_template();	
	
}

function cp_up_5s_2() {
   
	var request = $.ajax({
        url: "data.ria?DynUpdate=up_5s",        
        dataType: "json"
       
    });
    request.done(function( responseData,textStatus, jqXHR ) {              
         ui_config.Dyn_Status["up_5s"] = responseData;         
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	 
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
	
	var request2 = $.ajax({
        url: "data.ria?CfgType=get_apn_cfg",        
        dataType: "json"
        
    });
    request2.done(function( responseData,textStatus, jqXHR ) {              
         ui_config.Dyn_Status["cp_conn_mode"] = responseData;         
    });
    request2.fail(function( jqXHR, textStatus, errorThrown) {	 
    });
    request2.always(function(responseData,textStatus, jqXHR ) {       
    });
	
	cp_connectionMode_template();
	cp_toggleConnection();	
	cp_internetInfo_template();	
	
}

function cp_about_sys() {

	var request = $.ajax({
        url: "data.ria?DynUpdate=about_sys",        
        dataType: "json",
        async: global_cploaded
    });
    request.done(function( responseData,textStatus, jqXHR ) {              
         ui_config.Dyn_Status["about_sys"] = responseData;
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	 
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });


}

function cp_nw_usage() {

	var request = $.ajax({
        url: "data.ria?DynUpdate=nw_usage",       
        dataType: "json",
	    async: false
 		//async: global_cploaded
    });
    request.done(function( responseData,textStatus, jqXHR ) {              
         ui_config.Dyn_Status["nw_usage"] = responseData;
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	 
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });


}


function wifi_wps_get() {

	var request = $.ajax({
        url: "data.ria?DynUpdate=wps_status",        
        dataType: "json"
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
    	ui_config["wpsstatus"] = responseData;
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	 
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
}



function application_logs_get() {
 					
	var request = $.ajax({
	    url: "data.ria?CfgType=get_log",        
        dataType: "text"
        
    });
    //  data.ria?FileID=1&sect_name=System_Log   : For Remote Logs
    request.done(function( responseData,textStatus, jqXHR ) {  
    		ui_config["sys_log"] = responseData;
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	 
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
}
 
function encode_passwd(passtext)
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

function decode_passwd(passtext)
{
	//encode login password,encode like sample: "1250" <= "12"+'50' <= "12"+2<= "122" <= 122 <= 'z'
	var str = new String;
	var passwd = new String;
	for(var i = 0; i < passtext.length;i += 4)
	{
			j = i;str = "";
			if(passtext[j] == '0')
			{//"0550" => "52" => 52 => '4'
				
				if (passtext[j + 1] != '0'){
					str += passtext[j + 1];
				}
				if (passtext[j + 2] == '4')
				{				
					str += (parseInt(passtext[j + 3]) - 8).toString();
				}		
				else// '5'
				{
					str += (parseInt(passtext[j + 3]) + 2).toString();
				}
			}
			else
			{//"1250" => "122" => 122 => 'z'
				str +=passtext[j];
				str += passtext[j + 1];
				if (passtext[j + 2] == '4')
					str += (parseInt(passtext[j + 3]) - 8).toString();
				else// '5'
					str += (parseInt(passtext[j + 3]) + 2).toString();
			}
			passwd += String.fromCharCode(str);
	}
	return passwd;
}

function system_accountinfo_get() {
 					
	var request = $.ajax({
	    url: "data.ria?FileID=1&sect_name=DEVICE",       
        dataType: "json"
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
    		ui_config["account"] = responseData;
			ui_config["account"]["DEVICE"]["web_passwd"] = decode_passwd(ui_config["account"]["DEVICE"]["web_passwd"]);
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
}


function system_webinfo_get() {
                    
    var request = $.ajax({
        url: "data.ria?FileID=1&sect_name=WEBSVC",       
        dataType: "json"
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
            ui_config["web_info"] = responseData;
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {    
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
}

function system_sntp_get() {
 					
	var request = $.ajax({
	    url: "data.ria?FileID=1&sect_name=SNTP",       
        dataType: "json"
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
    		
    		ui_config["sntp"] = responseData;

    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
 }
  



function system_netstat_get() {
              
    var request = $.ajax({
        url: "data.ria?FileID=16&sect_name=NWSTAT",        
        dataType: "json",
		async: global_cploaded
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
            
            ui_config["net_stat"] = responseData;
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {    
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
}

function system_netstat_get2() {
              
    var request = $.ajax({
        url: "data.ria?FileID=16&sect_name=NWSTAT",        
        dataType: "json"
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
         ui_config["net_stat"] = responseData;
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {    
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
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



function system_Upnp_get(){
	
	var request = $.ajax({
	    url:"/data.ria?FileID=3&sect_name=Upnp",        
        dataType: "json"       
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
    	  //alert(JSON.stringify(responseData));
        ui_config["Upnp_status"] = responseData;
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });

}



/* To get the model Name */
/*
function system_config_get(){
	var request = $.ajax({
	    url:"data.ria?FileID=8",        
        dataType: "text"
       
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
    		ui_config["modelinfo"] = parseINIString(responseData);
    		   		
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	
    	
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });

}
*/
function get_system_restore_state(){
	var request = $.ajax({
		url:"data.ria?DynUpdate=restore_state" ,        
	    dataType: "json"
	  
	});
	request.done(function( responseData,textStatus, jqXHR ) {
			if(responseData.cmd_status =="Done")
			{
			    clearCookies();
			    if (window.global_restoreTimeout){clearTimeout(window.global_restoreTimeout);}
	   			alert(global_lang['alerts_set']['restart_success']);
			    window.location = "index.html";					
			}
			else if(responseData.cmd_status =="Fail")
			{
				if (window.global_restoreTimeout){clearTimeout(window.global_restoreTimeout);}			
				alert(global_lang['validation_msgs']['fail_restore_config_file']);
			}
			else
			{
				if (window.global_restoreTimeout){clearTimeout(window.global_restoreTimeout);}
				window.global_restoreTimeout = setTimeout(get_system_restore_state, 3000);			
			}

	});
	request.fail(function( jqXHR, textStatus, errorThrown) {	
		
	});
	request.always(function(responseData,textStatus, jqXHR ) {       
	});	
	
}
/* To restore the system configuration file (both for sms and router) */
function system_restore(){


    $.ajaxFileUpload
    (
    {
    url:'/webupload.cgi',
    secureuri:false,
    fileElementId:'tf1_WebCFGUpload',
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
    }
	)
	if (window.global_restoreTimeout){clearTimeout(window.global_restoreTimeout);}
	window.global_restoreTimeout = setTimeout(get_system_restore_state, 3000);	
}

/* Function to Get the sim card Contacts */
function application_simContacts_get(){

	//alert(1);
	var request = $.ajax({
	    url:"data.ria? CfgType=sms_action&cont=contact&index=0",        
        dataType: "text"
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
   			//alert(JSON.stringify(responseData));  		
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	
    	
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });

}

function wifi_generate_wpspin() {
    var request = $.ajax({
        url:"data.ria?DynUpdate=wps_pin&cmd=generate_pin",        
        dataType: "json"
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
            ui_config["wi-fi_generate_pin-info"] = responseData;
            $("#tf1_enterPin").val(ui_config["wi-fi_generate_pin-info"]["pin_enrollee"]);
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {     
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
}

function wifi_default_wpspinget() {
    var request = $.ajax({
        url:"data.ria?DynUpdate=wps_pin&cmd=default_pin", 
        dataType: "json"
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
            ui_config["wi-fi_default_pin-info"] = responseData;
            $("#tf1_enterPin").val(ui_config["wi-fi_default_pin-info"]["pin_enrollee"]);
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {     
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
}



/* controlpanel_internet info Template Function */
function cp_internetInfo_template(){	
   
	total = (ui_config.Dyn_Status["nw_usage"]["tx"] + ui_config.Dyn_Status["nw_usage"]["rx"])/1048576;
	
	if (ui_config["net_stat"]["NWSTAT"]["quota_limit"] == "0" ) {
		max_data = "";
	} else {	
		max_data = ui_config["net_stat"]["NWSTAT"]["quota_limit"];
		max_data = max_data * 80/100;	
		
		if (parseInt(total,10)  > max_data && global_stat_count % 10 == 0) {			
			alert(global_lang['cpsection']['data_limit']);
		}
		
		max_data = max_data + " MB";
		global_stat_count = global_stat_count + 1;
	}
	

    if(total < 1){
        total = total * 1024;
        unit  = " KB";
    }
    else{
        total = total;
        unit =" MB";
    }    
   
    //total = parseInt(total,10);
    total = total.toFixed(2) + unit;
   
    var tmpl_internet_data = {      
                               "operator_name":ui_config.Dyn_Status["up_5s"]["ipv4"]["op_name"] || ui_config.Dyn_Status["up_5s"]["signal"]["modem"]["opname"],
                               "signal_level":ui_config.Dyn_Status["up_5s"]["signal"]["modem"]["level"],
							   "signal_strength":ui_config.Dyn_Status["up_5s"]["signal"]["modem"]["strength"],
							   "network_type":global_disconnect_service || ui_config.Dyn_Status["up_5s"]["signal"]["modem"]["service"],
                               "total_mb":total,
							   "packetdata_maxlimit":max_data
                            };
	if(ui_config.Dyn_Status["up_5s"]["signal"]["modem"]["service"]=="none"){
		tmpl_internet_data.operator_name = ui_config.Dyn_Status["up_5s"]["ipv4"]["op_name"] || ui_config.Dyn_Status["up_5s"]["signal"]["modem"]["opname"];
		tmpl_internet_data.total_mb = 0 + unit;
		
	}else{
		if(ui_config.Dyn_Status["up_5s"]["signal"]["modem"]["spn"]==""){
			tmpl_internet_data.operator_name = ui_config.Dyn_Status["up_5s"]["ipv4"]["op_name"] || ui_config.Dyn_Status["up_5s"]["signal"]["modem"]["opname"];
		}else{
			tmpl_internet_data.operator_name = ui_config.Dyn_Status["up_5s"]["signal"]["modem"]["spn"];
		}
	}
    var pagefn = doT.template(document.getElementById('cp_internetTemplate').text);
    $("#tf1_tmpl_cpinternetinfo").html(pagefn(tmpl_internet_data));

}

/* controlpanel_internet info Template Function */
function cp_mainInfo_template(){
	var ssid = HTMLDecode(ui_config["wi-fi_status"]["wifi"]["AP1"]["ssid"]).replace(/</g,"&lt;");
    var tmpl_main_data = {      
                               "SSIDname":ssid,
                               "ip_addr":ui_config["lan"]["LAN"]["ip4_addr"]
                         };
  
    var pagefn = doT.template(document.getElementById('cp_mainTemplate').text);
    $("#tf1_tmpl_cpmaininfo").html(pagefn(tmpl_main_data));

}


/* controlpanel_connection info Template Function */
function cp_connectionMode_template(){
	
 	connectiontime =  secondsToTime(ui_config.Dyn_Status["nw_usage"]["period"]);
    var tmpl_connection_data = {
								"ipv4connection_status":ui_config.Dyn_Status["up_5s"]["ipv4"]["status"],
                                "autoconnection":ui_config.Dyn_Status["cp_conn_mode"]["apn"]["COMMON"]["auto_conx"],
								"connectiontime":connectiontime
								};
	
	//console.log(JSON.stringify(tmpl_connection_data));
    var pagefn = doT.template(document.getElementById('cp_connectionModeTemplate').text);
	$("#tf1_tmpl_cp_connectionMode").html(pagefn(tmpl_connection_data));
	if(ui_config.Dyn_Status["up_5s"]["lang"] == 6 && $("#tf1_cp_connStr").text() == "Disconnessione in corso..."){
		$("#tf1_cpConnect").css("margin","-4px 9px 0 0");
	}else{
		$("#tf1_cpConnect").css("margin","7px 9px 0 0");
	}

}


/* controlpanel_wifi info Template Function */
function cp_wifi_template(){
  	wifi_status_get();
    var tmpl_wifi_data = {      
                                "Clientlist":ui_config.Dyn_Status["up_5s"]["clientNum"]["ssid1"],
								"wifi_signal_level":ui_config["wi-fi_status"]["wifi"]["WiFi"]["turn_on"],
								"max_sta":ui_config["wi-fi_status"]["wifi"]["AP1"]["max_sta"]
                          };
    var pagefn = doT.template(document.getElementById('cp_wifiTemplate').text);
    $("#tf1_tmpl_cpwifiinfo").html(pagefn(tmpl_wifi_data));

}

/* controlpanel_Messages info Template Function */
function cp_messages_template(){
    application_simDrafts_get();
    application_simInbox_get();
    var tmpl_messages_data = {      
                                "inbox_tot":ui_config["app_getsimInbox"]["total"],
                               // "outbox_tot":,
                                "drafts_tot":ui_config["app_getsimDrafts"]["total"],
								"new_sms":ui_config.Dyn_Status["up_5s"]["new_sms"]
                            };

    var pagefn = doT.template(document.getElementById('cp_messagesTemplate').text);
    $("#tf1_tmpl_cpmessages").html(pagefn(tmpl_messages_data));

}

/* controlpanel_Messages info Template Function */
function cp_powersaving_template(){

   	system_powersaving_get();
    var tmpl_powersaving_data = {      
                                "batteryidletime":ui_config["powersaving"]["PWRMGR"]["batt_idle_tm"],
								"deepsleeptime":ui_config["powersaving"]["PWRMGR"]["deep_sleep_tm"]
                            };

    var pagefn = doT.template(document.getElementById('cp_powersavingTemplate').text);
    $("#tf1_tmpl_cppowersaving").html(pagefn(tmpl_powersaving_data));

}


function cp_setupwizard_get() {

    var request = $.ajax({
        url:"data.ria?CfgType=get_quickset_cfg", 
        dataType: "json"
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
            ui_config["cp_wizard_info"] = responseData;
            ui_config["cp_wizard_info"]["device"]["DEVICE"]["web_passwd"] =  decode_passwd(ui_config["cp_wizard_info"]["device"]["DEVICE"]["web_passwd"]);
			
   });
    request.fail(function( jqXHR, textStatus, errorThrown) {     
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
}

function htmlEncode (str){
     var s = "";
	 str = str+"";
     if(str.length == 0) return "";
     s = str.replace(/</g,"&#x3c;");
	 s = s.replace(/\\/g,"&#x5c;");		 
     s = s.replace(/>/g,"&#x3e;");
     s = s.replace(/\'/g,"&#x27;");
     s = s.replace(/\"/g,"&#x22;");
     return s; 
}
 function HTMLDecode(text) { 
    var temp = document.createElement("div"); 
    temp.innerHTML = htmlEncode(text); 
    var output = temp.innerText || temp.textContent; 
    temp = null; 
    return output; 
}
 /* controlpanel_setup wizard Template Function */
function cp_wizard_template(){

    var tmpl_wizard_data = ui_config["cp_wizard_info"];
	tmpl_wizard_data.passphrase = ui_config["wi-fi_status"]["wifi"]["AP1"]["wpa_passphrase"];
	tmpl_wizard_data.wepKey = ui_config["wi-fi_status"]["wifi"]["AP1"]["wep_key"];	
	tmpl_wizard_data.wepKeyIndex = ui_config["wi-fi_status"]["wifi"]["AP1"]["wep_key_index"];
	
	
	var security = parseInt(ui_config["wi-fi_status"]["wifi"]["AP1"]["security"],10);	
		
			//console.log(security);
			switch (security) {
																	  
					case 1 :
					
						if (ui_config["wi-fi_status"]["wifi"]["AP1"]["wpa_auth"] == "1") {
							tmpl_wizard_data.protection = "0";
							tmpl_wizard_data.wpaMode = "";
							tmpl_wizard_data.cipherType = "";
						}
					
					break;
					
					case 2 : /* WEP */
						tmpl_wizard_data.protection = "2";
						tmpl_wizard_data.wpaMode = "";
						tmpl_wizard_data.cipherType = "";		
						break;
					case 3 :
					
						tmpl_wizard_data.protection = "3";						
						var wpaAuth = parseInt(ui_config["wi-fi_status"]["wifi"]["AP1"]["wpa_auth"],10);
						
						
						if ( wpaAuth == 1) {							
							tmpl_wizard_data.wpaMode = "WPA";
							tmpl_wizard_data.cipherType = "TKIP";							
							
						} else if ( wpaAuth == 2)  {
							tmpl_wizard_data.wpaMode = "WPA";
							tmpl_wizard_data.cipherType = "AES";
							
						}  else if ( wpaAuth == 3)  {
							
							tmpl_wizard_data.wpaMode = "WPA2";
							tmpl_wizard_data.cipherType = "TKIP";	
							
						}  else if ( wpaAuth == 4)  {
							tmpl_wizard_data.wpaMode = "WPA2";
							tmpl_wizard_data.cipherType = "AES";	
							
						}  else if ( wpaAuth == 5)  {
							tmpl_wizard_data.wpaMode = "Auto";
							tmpl_wizard_data.cipherType = "Auto";	
							
						} 
					
					break;																	  
				
				
			}
		tmpl_wizard_data.apn.apn.APN_0.apn = HTMLDecode(tmpl_wizard_data.apn.apn.APN_0.apn);
		tmpl_wizard_data.apn.apn.APN_0.uname = HTMLDecode(tmpl_wizard_data.apn.apn.APN_0.uname);
		tmpl_wizard_data.apn.apn.APN_0.passwd = HTMLDecode(tmpl_wizard_data.apn.apn.APN_0.passwd);
	//alert(ui_config["cp_wizard_info"]["apn"]["apn"]["APN_0"]["apn"]);
	//console.log(tmpl_wizard_data);
    var pagefn = doT.template(document.getElementById('cp_wizardTemplate').text);
    $("#tf1_tmpl_cpwizard").html(pagefn(tmpl_wizard_data));

}

function parseINIString(idata){
       	var regex = {  
	    section: /^\s*\[\s*(.*)\s*\]\s*$/,  
	    keyval: /^\s*([\w\.\-]+)\s*=\s*\x22(.*?)\x22\s*$/,  
	    comment: /^\s*#.*$/   
	};  
	var rtval = {};  
	var lines = idata.split(/\r\n|\r|\n/);  
	var sec = null;  
	var line,matchstr,str2;
	//var replacestr=/[\\\"\\\\]/;
	for(var i=0;i<lines.length;i++)
	{
		line = lines[i];	
		//parse comment "#"				
		if(regex.comment.test(line))
		{  
			continue;  
		}
		//parse keyval
		else if(regex.keyval.test(line))
		{  
			matchstr = line.match(regex.keyval);  
			str2=matchstr[2].replace(/\\\"/,"\"");
			str2=str2.replace(/\\\\/,"\\");
			if(sec)
			{  
				rtval[sec][matchstr[1]] = str2;  
			}
			else
			{  
				rtval[matchstr[1]] = str2;  
			}  
		}
		//parse section
		else if(regex.section.test(line))
		{  
			matchstr = line.match(regex.section);  
			rtval[matchstr[1]] = {};  
			sec = matchstr[1];  
		}
		else if(line.length == 0 && sec)
		{  
			sec = null;  
		}
	}
	return rtval;  
   }
 
 
 $(document).on('blur', 'input[type=text]',function() { 
	var val = $(this).val();
    if(val.replace(/<[^>]+>/ig, 'true') == 'true'){
		alert(global_lang['common']['input_val']);
		$(this).val('');
        return true;
    }else if(val.search("<img") != -1){
		alert(global_lang['common']['input_val']);
		$(this).val('');
        return true;
    }else{
        return false;
	}	
 });


/*login password template */
function firstLoginGet(){
	cpApi_get_authId();
	var request = $.ajax({
	    url:"/data.ria?CfgType=first_login_status",        
        dataType: "json"       
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
	console.log(responseData.first_login == 1);
    	if(parseInt(responseData.first_login) == 1){
			loginPasswordTemplateShow()
		}
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });

}
function loginPasswordTemplateShow(){
	$("#tf1_overlay").show();	
	$("#tf1_hid_ModifyPasswordTemplate").show();
	showTabs();
	system_accountinfo_get();
	login_passwordinfo_template();
	$("#tf1_hdButtonBlock").show();
}
function login_passwordinfo_template(){
	var tmpl_account_data = {
					"username":ui_config["account"]["DEVICE"]["web_usrname"],
					"password":ui_config["account"]["DEVICE"]["web_passwd"],
					"login_time":ui_config["account"]["DEVICE"]["login_timeout"]
	};   
   
   var pagefn = doT.template(document.getElementById('loginpassTemplate').text);
   $("#tf1_tmpl_cploginpass").html(pagefn(tmpl_account_data));

}

function submitPassword(){
	cpApi_get_authId();
	var post_data = {
		"FileID": 1,
		"DEVICE":{
			"web_usrname": 'admin',
			"web_passwd": encode_passwd($("#tf1_passwd").val()),
			"first_login": 0,
		},
	"authID": auth_id
	};
	var request = $.ajax({
			url:"/webpost.cgi",
			type:"POST",
			data: JSON.stringify(post_data),
			dataType:"json"
	})
		request.done(function(responseData,textStatus,jgXHR){
			
		})
		request.fail(function(jqXHR, textStatus, errorThrown){
		})
		request.always(function(responseData, textStatus, jqXHR){
		});
}

function login_userAccountValidate(frmId) {
	
   pass = $("#tf1_passwd").val();
   confirmPass = $("#tf1_cnfPassword").val();
   if(pass != confirmPass ){
	alert(global_lang['validation_msgs']['cfpwd_not_match']);
	  return
   }
   if(pass.length < 8 || pass.length > 30){
	  alert(global_lang['alerts_set']['Password_rules']);
	  return
   }
   var btn = 0;
   var pwdRegex = new RegExp('(?=.*[0-9])');
   var pwdRegex1 = new RegExp('(?=.*[A-Z])');
   var pwdRegex2 = new RegExp('(?=.*[a-z])');
   var pwdRegex3 = new RegExp('(?=.*[^a-zA-Z0-9])');
   if(pwdRegex.test(pass)){
	   btn = btn + 1;
   }if(pwdRegex1.test(pass)){
	   btn = btn + 1;
   }if(pwdRegex2.test(pass)){
	   btn = btn + 1;
   }if(pwdRegex3.test(pass)){
	   btn = btn + 1;
   } 
   if(btn < 3){
	   alert(global_lang['alerts_set']['Password_rules']);
	  return
   }else{
		submitPassword();
	}
}
