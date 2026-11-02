var global_urlkeywordlen;
var global_ipf_index;
var global_pfw_index;

function applicationSettings_onloadSmsSetup() {	
	application_smsstorage_get();
	application_messageInfo_template();
	application_smssetup_template();
	showTabs();
	$("#tf1_btnBlock").html($("#tf1_hdButtonBlock").html());
	$().maxlength();
}

function applicationSettings_onloadInbox() {
	application_smsstorage_get();
	application_messageInfo_template();
	application_simInbox_get2();
	applications_Inboxinfo_template();
	showTabs();
	$("#tf1_btnBlock").html($("#tf1_hdButtonBlock").html());
	$().maxlength();
}

/* Application Settings */
function applicationSettings_onloadOutbox() {
	datatable('tf1_outboxTbl');
	showTabs();
	$("#tf1_btnBlock").html($("#tf1_hdButtonBlock").html());
}

/* Application Settings */
function applicationSettings_onloadDrafts() {
	
	application_simDrafts_get2();
	applications_Draftsinfo_template();
	showTabs();
	$("#tf1_btnBlock").html($("#tf1_hdButtonBlock").html());
	tblval = $("#tf1_simdraftTblbody").val();	
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
function application_addFirewallIPfilterAddForm(event,ipfindex) {

	

	//$("#tf1_heading_ipfilter").html("Add IP Filter");
	
	IE_Chrome(event);
	
	$(".configForm").hide();
	
	application_ipfilterAdd_template();
	
	
	
	
	$("#tf1_hid_ipfilter_tag").val(ipfindex);
	
	$("#tf1_hid_ipfilter_action").val("add");
	
		
	/*Close Block */

	/*Open Block */
	$("#tf1_firewallIpFilter").show();
	
	
	enableTextFieldByAnchorClick('tf1_enabledisable_srcports', 'tf1_sourcePort1 tf1_sourcePort2', 'break_srcport', 'tf1_ipfilter_srcport');

	enableTextFieldByAnchorClick('tf1_enabledisable_dstports', 'tf1_destPort1 tf1_destPort2', 'break_dstport', 'tf1_ipfilter_dstport');
	
}


function application_editIpfilter(event,ipfindex){


	//$("#tf1_heading_ipfilter").html("Edit IP Filter");
	global_ipf_index = ipfindex;
	IE_Chrome(event);
	
	application_ipfilteredit_template(ipfindex);
	
	$(".configForm").hide();
	
	$("#tf1_hid_ipfilter_tag").val(ipfindex);
	
	$("#tf1_hid_ipfilter_action").val("edit");
    
    if($("#tf1_sourcePort1").val() == 0 || $("#tf1_sourcePort2").val() == 0)
    {
        $("#tf1_enabledisable_srcports").attr("class","enable-disable-off");
    }
    
    if($("#tf1_destPort1").val() == 0 || $("#tf1_destPort2").val() == 0)
    {
        $("#tf1_enabledisable_dstports").attr("class","enable-disable-off");
    }
	
	/*Close Block */
	
	/*Open Block */
	$("#tf1_firewallIpFilter").show();
	
	enableTextFieldByAnchorClick('tf1_enabledisable_srcports', 'tf1_sourcePort1 tf1_sourcePort2', 'break_srcport', 'tf1_ipfilter_srcport');

	enableTextFieldByAnchorClick('tf1_enabledisable_dstports', 'tf1_destPort1 tf1_destPort2', 'break_dstport', 'tf1_ipfilter_dstport');
	
}


function application_IpPortFilterReset(event){	

	if($("#tf1_hid_ipfilter_action").val() == "add") {
		
		application_addFirewallIPfilterAddForm(event,$("#tf1_hid_ipfilter_tag").val());
		//enableTextFieldByAnchorClick('tf1_enabledisable_srcports', 'tf1_sourcePort1 tf1_sourcePort2', 'break_srcport', 'tf1_ipfilter_srcport');

	  //enableTextFieldByAnchorClick('tf1_enabledisable_dstports', 'tf1_destPort1 tf1_destPort2', 'break_dstport', 'tf1_ipfilter_dstport');
	} else {
		application_editIpfilter(event,$("#tf1_hid_ipfilter_tag").val());
	}
}
	

function application_addPortForwarding(event,pfIndex) {
	
	$("#tf1_heading_portfwd").html(global_lang['application_popup']['add_port_fwd'] || "Add Port Forwarding");
	IE_Chrome(event);
	
	$("#tf1_hid_portfwd_tag").val(pfIndex);
	/*Close Block */
	$(".configForm").hide();

	/*Open Block */
	$("#tf1_firewallPortForwarding").show();
    
    
	
	$("#tf1_pfsourceIp").val("");
	$("#tf1_pfprotocolnum").val("");
	$("#tf1_pfstartPort").val("");
	$("#tf1_pfendPort").val("");
	
	
	$("#tf1_pfprotocol").val(6);
	application_portfwdprotocolselect();
	$("#tf1_hid_portfwd_action").val("add");
	
}

function application_port_forwardReset(event) {

  if ($("#tf1_hid_portfwd_action").val() == "add") {
	  
	  $("#tf1_pfprotocol").val(6);
	  application_portfwdprotocolselect();
	  application_addPortForwarding(event,$("#tf1_hid_portfwd_tag").val());
	  
  } else {	
	application_editPortForwarding(event,$("#tf1_hid_portfwd_tag").val());
	  
  }
	
}


function application_editPortForwarding(event,pfIndex) {
	global_pfw_index = pfIndex;
    
	/* to get theelements for editing */
	
	IE_Chrome(event);
	
	$("#tf1_heading_portfwd").html(global_lang['application_popup']['edit_port_fwd'] || "Edit Port Forwarding");
	
	$("#tf1_hid_portfwd_tag").val(pfIndex);
	$("#tf1_hid_portfwd_action").val("edit");
	 
	$("#tf1_pfsourceIp").val($('#tf1_portfwd_ip_'+pfIndex).val());
	
	if ( $('#tf1_portfwd_proto_'+pfIndex).val() == "6" || $('#tf1_portfwd_proto_'+pfIndex).val() == "17" ) {
	$("#tf1_pfprotocol").val($('#tf1_portfwd_proto_'+pfIndex).val());
	$("#tf1_pfprotocolnum").val('');
	} else {
		$("#tf1_pfprotocol").val(3);
		$("#tf1_pfprotocolnum").val($('#tf1_portfwd_proto_'+pfIndex).val());
	}
	$("#tf1_pfstartPort").val($('#tf1_portfwd_dstp1_'+pfIndex).val());
	$("#tf1_pfendPort").val($('#tf1_portfwd_dstp2_'+pfIndex).val());

	IE_Chrome(event);
	/*Close Block */
	$(".configForm").hide();

	
	application_portfwdprotocolselect();

	/*Open Block */
	$("#tf1_firewallPortForwarding").show();
}


function application_addFirewallUrlImportForm(event) {
	
	
	IE_Chrome(event);
	/*Close Block */
	$(".configForm").hide();
	/*Open Block */
	$("#tf1_firewallUrlFilter").show();
	
	$("#tf1_urlDomain").val(""); 
	
}

function application_addInboxForm(event) {	

	IE_Chrome(event);
/*	
	if(ui_config.Dyn_Status["up_5s"]["ipv4"]["status"] == "Disconnected") { 
	  alert(global_lang["internet_popup"]["no_internet"]);
	  return false;
	}
*/	
	$("#tf1_heading_inbox").html(global_lang['application_popup']['send_sms']);
    $("#tf1_btn_send").val(global_lang['application_popup']['send']);
	$("#tf1_btn_savedraft").val(global_lang['application_popup']['save_as_draft']);

	/*Close Block */
	$(".configForm").hide();

	/*Open Block */
	$("#tf1_addInbox").show();
	
	/* To clear the textbox values when click on add new */
	$("#tf1_sendToNew").val("");
	$("#tf1_messageNew").val("");

	$(".maxLength").html("0");

	/*if (ui_config.Dyn_Status["up_5s"]["lang"] == "2") {

		$("#tf1_messageNew").attr("maxLength",500);

	} else {

		$("#tf1_messageNew").attr("maxLength",1000);
	}*/
	
	/* Rebuild the Phone Data as per Autocomplete format */	
	var phoneData = new Array();
	var phoneArryCnt = 0;
	var jsonPhoneData = ui_config["app_getsimcontacts"];
	for (var item in jsonPhoneData) {	
		if (item != "total") {			
			phoneData[phoneArryCnt]	= new Object();
			phoneData[phoneArryCnt].value = jsonPhoneData[item].name + "," + jsonPhoneData[item].phone;
			phoneData[phoneArryCnt].data = jsonPhoneData[item].phone;
			phoneArryCnt = phoneArryCnt + 1;
		}		
	}
	 
	 $('#tf1_sendToNew').autocomplete({
    	lookup: phoneData,
		onSelect: function (suggestion) {
		   $('#tf1_sendToNew').val($.trim(suggestion.data));
		}
  	});

   
	var request = $.ajax({
        url:"data.ria?DynUpdate=send_msg_state",
        dataType: "json"
		
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
    		 if ( responseData["cmd_status"] == "Wait") {				 
				 $("#tf1_sms_buttons").hide();
		 		 $("#tf1_sms_status").show();		 		  
			 } 
	});
	

}
function check_wifi_str(obj)
{   
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

function tf1_messageReply_Inbox(){
	var messages = $("#tf1_messageReply").val();
	var messages1 = $("#tf1_messageNew").val();
	if(!check_wifi_str(messages) || messages =="")
	{
		$("#tf1_messageReply").attr("maxLength",500);
	}else{
		$("#tf1_messageReply").attr("maxLength",1000);
	}
	if(!check_wifi_str(messages1) || messages1 =="")
	{
		$("#tf1_messageNew").attr("maxLength",500);
	}else{
		$("#tf1_messageNew").attr("maxLength",1000);
	}
}


function application_replyForm(event,index) {
	
	IE_Chrome(event);
/*	
	if(ui_config.Dyn_Status["up_5s"]["ipv4"]["status"] == "Disconnected") { 
	  alert(global_lang["internet_popup"]["no_internet"]);
	  return false;
	}
*/	
	$("#tf1_btn_reply").val(global_lang['application_popup']['send']);
	$("#tf1_btn_savedraft2").val(global_lang['application_popup']['save_as_draft']);
		
	$("#tf1_tag_inbox").val($('#tf1_inbox_tag_'+index).val());
	$("#tf1_messageReply").val("");
	$("#tf1_replyTo").val($('#tf1_inbox_phone_'+index).val());
	$("#tf1_replyTo").attr("disabled",true);
	
	tag = $('#tf1_inbox_tag_'+index).val();

	application_api_smsinbox_setasread(tag);

	
	/*Close Block */
	$(".configForm").hide();

	/*Open Block */
	$("#tf1_replyInbox").show();
	$("#tf1_messageReply").focus();
	$().maxlength();
	/*if (ui_config.Dyn_Status["up_5s"]["lang"] == "2") {

		$("#tf1_messageReply").attr("maxLength",1000);

	} else {

		$("#tf1_messageReply").attr("maxLength",500);
	}*/

	$(".maxLength").html($("#tf1_messageReply").val().length);
	
	/* Rebuild the Phone Data as per Autocomplete format */	
	var phoneData = new Array();
	var phoneArryCnt = 0;
	var jsonPhoneData = ui_config["app_getsimcontacts"];
	for (var item in jsonPhoneData) {	
		if (item != "total") {			
			phoneData[phoneArryCnt]	= new Object();
			phoneData[phoneArryCnt].value = jsonPhoneData[item].name + "," + jsonPhoneData[item].phone;
			phoneData[phoneArryCnt].data = jsonPhoneData[item].phone;
			phoneArryCnt = phoneArryCnt + 1;
		}		
	}
	 
	 $('#tf1_replyTo').autocomplete({
    	lookup: phoneData,
		onSelect: function (suggestion) {
		   $('#tf1_replyTo').val($.trim(suggestion.data));
		}
  	});

  
	var request = $.ajax({
        url:"data.ria?DynUpdate=send_msg_state",
        dataType: "json"
		
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
    		 if ( responseData["cmd_status"] == "Wait") {				 
				 $("#tf1_sms_reply_buttons").hide();
		 		 $("#tf1_sms_reply_status").show();		 		  
			 } 
	});
	
	


}



function application_draftForm(event,index) {
	
	
	IE_Chrome(event);
/*	
	if(ui_config.Dyn_Status["up_5s"]["ipv4"]["status"] == "Disconnected") { 
	  alert(global_lang["internet_popup"]["no_internet"]);
	  return false;
	}
*/	
	/*added line */
	$("#tf1_btn_send").val(global_lang['application_popup']['send']);
	/*added line */
	$("#tf1_btn_savedraft").val(global_lang['application_popup']['save_as_draft']);	
	$("#tf1_heading_inbox").html(global_lang['application_popup']['edit_draft']);
	$("#tf1_lbl_inbox").html(global_lang['application_popup']['send_to']);
	
	
	$("#tf1_tag_draft").val($('#tf1_draft_tag_'+index).val());
	$("#tf1_messageNew").val($('#tf1_draft_msg_'+index).val());
	$("#tf1_sendToNew").val($('#tf1_draft_phone_'+index).val());
	

	
	/*Close Block */
	$(".configForm").hide();

	/*Open Block */
	$("#tf1_addInbox").show();

	/*if (ui_config.Dyn_Status["up_5s"]["lang"] == "2") {

		$("#tf1_messageNew").attr("maxLength",1000);

	} else {

		$("#tf1_messageNew").attr("maxLength",500);
	}*/

	/* Rebuild the Phone Data as per Autocomplete format */	
	var phoneData = new Array();
	var phoneArryCnt = 0;
	var jsonPhoneData = ui_config["app_getsimcontacts"];
	for (var item in jsonPhoneData) {	
		if (item != "total") {			
			phoneData[phoneArryCnt]	= new Object();
			phoneData[phoneArryCnt].value = jsonPhoneData[item].name + "," + jsonPhoneData[item].phone;
			phoneData[phoneArryCnt].data = jsonPhoneData[item].phone;
			phoneArryCnt = phoneArryCnt + 1;
		}		
	}
	 
	 $('#tf1_sendToNew').autocomplete({
    	lookup: phoneData,
		onSelect: function (suggestion) {
		   $('#tf1_sendToNew').val($.trim(suggestion.data));
		}
  	});
	
	$(".maxLength").html($("#tf1_messageNew").val().length);

}


function application_formClose(event) {

	IE_Chrome(event);
	$(".configForm").show();
	$(".configTableForm").hide();
}

/* Application Settings */
function applicationSettings_onloadIPFilter() {
	
	onloadCall(application_enableDisabledIP_ports, {
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
	
	enableTextFieldByAnchorClick('tf1_enabledisable_srcports', 'tf1_sourcePort1 tf1_sourcePort2', 'break_srcport', 'tf1_ipfilter_srcport');

	enableTextFieldByAnchorClick('tf1_enabledisable_dstports', 'tf1_destPort1 tf1_destPort2', 'break_dstport', 'tf1_ipfilter_dstport');
	
	
	
	showTabs();
	application_firewall_ipfilterInfo_get();
	application_ipfilterInfo_template();
	
	
	$("#tf1_btnBlock").html($("#tf1_hdButtonBlock").html());
	
	if ('IPF_0' in ui_config["firewall_ipfilterinfo"] ) {	
		datatable('tf1_ipFilterTbl');		
	}
	
}

function applicationSettings_onloadportfwding(){
	
	onloadCall(application_enableDisabledstports, {
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
	
	//$("#tf1_btn_pfwd").val("Apply");
	//$("#tf1_btn_pfwAddEdit").val("Apply");

	showTabs();
	
	application_firewall_PortfwdInfo_get();
	application_portfwdInfo_template();	
	$("#tf1_btnBlock").html($("#tf1_hdButtonBlock").html());
	
	if ('PF_0' in ui_config["firewall_portfwdinfo"] ) {	
		datatable('tf1_portforwardTbl');		
	}
	
}

function applicationSettings_onloadUrlFilter() {
	showTabs();
	
	application_firewall_info_get();
	application_urlfilterInfo_template();

	$("#tf1_btnBlock").html($("#tf1_hdButtonBlock").html());
	if (ui_config["firewall_info"]["URL_Filter"]["keyword"] !="") {
		datatable('tf1_urlFilterTbl');
	}

}

/* Firewall Settings */
function applicationSettings_onloadFirewallSettingsBlock() {
	
	onloadCall(application_enableDisablefirewall, {
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

	onloadCall(application_enableDisablewanaccess, {
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

	onloadCall(application_enableDisabledmz, {
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
	application_firewall_info_get();
	application_firewallInfo_template();
	showTabs();
	enableTextFieldByAnchorClick('tf1_enabledisablefirewall', 'tf1_ipfilter_policy', 'break_ipfilter_policy', '');
	enableTextFieldByAnchorClick('tf1_enabledisabledmz', 'tf1_dmzIpAddress', 'break_dmzIpAddress', '');
	//enableTextFieldByAnchorClick('tf1_accessWan', 'tf1_portNumber', '', '');
	$("#tf1_btnBlock").html($("#tf1_hdButtonBlock").html());

}

function application_enableDisablefirewall(toggleObj, thisObj) {
	
	onAnchorToggle(toggleObj);
	var imgId = thisObj.id;
	switch(imgId) {
		case 'tf1_enabledisablefirewall':
		    enableTextFieldByAnchorClick('tf1_enabledisablefirewall', 'tf1_ipfilter_policy', 'break_ipfilter_policy', '');
			break;

	}
}

function application_enableDisabledmz(toggleObj, thisObj) {
	
	onAnchorToggle(toggleObj);
	var imgId = thisObj.id;
	switch(imgId) {
		case 'tf1_enabledisabledmz':
			enableTextFieldByAnchorClick('tf1_enabledisabledmz', 'tf1_dmzIpAddress', 'break_dmzIpAddress', '');
			break;

	}
}


function application_enableDisablewanaccess(toggleObj, thisObj) {
	
	onAnchorToggle(toggleObj);
	var imgId = thisObj.id;
	switch(imgId) {
		case 'tf1_accessWan':
			enableTextFieldByAnchorClick('tf1_accessWan', 'tf1_portNumber', '', '');
			break;

	}
}

/* Enable/Disable  portnumber block */
function application_enableDisabledstports(toggleObj, thisObj) {
	
	onAnchorToggle(toggleObj);
	var imgId = thisObj.id;
	switch(imgId) {

	}
}


/* Enable/Disable  IP_filter source_portnumber blocks */
function application_enableDisabledIP_ports(toggleObj, thisObj) {
	
	onAnchorToggle(toggleObj);
	var imgId = thisObj.id;
	/*if($("#tf1_ipfilter_protocol").val()==0 || $("#tf1_ipfilter_protocol").val()==1){
		alert(global_lang['alerts_set']['url_filter_Protocol']);
		$("#tf1_enabledisable_srcports").attr("class","enable-disable-off");
		$("#tf1_enabledisable_dstports").attr("class","enable-disable-off");
	}*/
	switch(imgId) {
		
		case 'tf1_enabledisable_srcports':
			enableTextFieldByAnchorClick('tf1_enabledisable_srcports', 'tf1_sourcePort1 tf1_sourcePort2', 'break_srcport', 'tf1_ipfilter_srcport');
			break;
		case 'tf1_enabledisable_dstports':
			enableTextFieldByAnchorClick('tf1_enabledisable_dstports', 'tf1_destPort1 tf1_destPort2', 'break_srcport', 'tf1_ipfilter_dstport');
			break;	
	
	}
}

function applicationSettings_firewallSettingsBlockReset(frmId) {
	
	$("#" + frmId).reset();
	resetImgOnOff(frmId);
	enableTextFieldByAnchorClick('tf1_enabledisablefirewall', 'tf1_ipfilter_policy', 'break_ipfilter_policy', '');
	enableTextFieldByAnchorClick('tf1_enabledisabledmz', 'tf1_dmzIpAddress', 'break_dmzIpAddress', '');
	enableTextFieldByAnchorClick('tf1_accessWan', 'tf1_portNumber', '', '');
	
}

function applicationSettings_firewallSettingsvalidateBlock(frmId) {
	var txtFieldIdArr = new Array();
	txtFieldIdArr[0] = "tf1_dmzIpAddress,"+global_lang['validation_msgs']['pls_enter_ipaddr'];
	txtFieldIdArr[1] = "tf1_portNumber,"+global_lang['validation_msgs']['pls_enter_port_number'];
	
	if (txtFieldArrayCheck(txtFieldIdArr) == false)
		return false;
	
	
	if (ipv4Validate('tf1_dmzIpAddress', 'IP', false, true, global_lang['validation_msgs']['invalid_ip_addr'], global_lang['validation_msgs']['for_octet'], true) == false)
		return false;

	var leaseTimeObj = document.getElementById('tf1_portNumber');
	if (leaseTimeObj && !leaseTimeObj.disabled) {
		if (numericValueRangeCheck(leaseTimeObj, '', '', 1, 65535, true, global_lang['validation_msgs']['invalid_port'], '') == false)
			return false;
	}
	
	setHiddenChks(frmId);
	applicationApi_firewallEnable_policy_Set($("#tf1_hid_enabledisablefirewall").val(), $("#tf1_ipfilter_policy").val());
	applicationApi_firewalldmzSet($("#tf1_hid_enabledisabledmz").val(),$("#tf1_dmzIpAddress").val());
	applicationApi_firewallwanaccessSet($("#tf1_hid_accessWan").val(),$("#tf1_portNumber").val());
}



function applicationSettings_firewallurlSettingsvalidate(event){
	
	//$(event.target).val("Please wait...");
	
	var deleteFlag = false;
	
	$(".chk_id").each(function(value,index){		
		if ($(this).is(":checked")) {
			deleteFlag = true;		
		 }		
	});	
	
	application_api_deleteurlfilter(deleteFlag);
	
	 if ( deleteFlag == true ) 
	 {
		$(".chk_id").each(function(value,index){		
			if ($(this).is(":checked"))  
				$(this).parent().parent().remove();				 
		});
		//alert(global_lang['alerts_set']['url_filter_delete_success']);
	 } 
	 else {		 
	  //alert("Please select atleast one URL filter to delete"); 
	 }
	 
	 alert(global_lang['alerts_set']['url_filter_delete_success']); 
	 applicationSettings_onloadUrlFilter();
	

}

/* System Management Settings */
function networkStatus_onloadMyOperator() {
	datatable('tf1_myOperatorTbl');
}

function applicationSettings_onloadFirewallIpPortFilter() {
	showTabs();
	datatable('tf1_portFilterTbl');
	$("#tf1_btnBlock").html($("#tf1_hdButtonBlock").html());
}

function applicationSettings_dlnaServerSettingReset(frmId) {
	$("#" + frmId).reset();
	resetImgOnOff(frmId);
}

function applicationSettings_dlnaServerSettingvalidate(frmId) {
	
	
	
	var txtFieldIdArr = new Array();
	txtFieldIdArr[0] = "tf1_mediaServerName,Please enter Media Server Name";

	if (txtFieldArrayCheck(txtFieldIdArr) == false)
		return false;
	//dialogAlert("This mock-up version does not support form actions", "Information", "info");
}

function applicationSettings_onloadDhcpSetup(){

	internet_api_lanInfo_get();
	system_webinfo_get();
	application_dhcpInfo_template();
	
}

function applicationSettings_dhcpSettingsReset(frmId) {
	$("#" + frmId).reset();
	resetImgOnOff(frmId);
}

function application_addNewSimContact() {
	var txtFieldIdArr = new Array();
	txtFieldIdArr[0] = "tf1_contactName,"+global_lang['validation_msgs']['pls_enter_cntact_name'];
	txtFieldIdArr[1] = "tf1_phoneNumber,"+global_lang['validation_msgs']['pls_enter_ph_num'];
	if (txtFieldArrayCheck(txtFieldIdArr) == false)
		return false;

	name =  $("#tf1_contactName").val();
	phone = $("#tf1_phoneNumber").val();
	
	if ( $("#tf1_tag_contact").val() == "" ) {
		application_api_contactAdd(name,phone);
	} else {
		application_api_contactEdit(name,phone,$("#tf1_tag_contact").val());
	}

}

function app_dhcp_lanIpChange_1(){	
	$("#tf1_iprange1_1").val(parseInt($("#tf1_ipAddr_1").val(),10));
	$("#tf1_iprange2_1").val(parseInt($("#tf1_ipAddr_1").val(),10));
}

function app_dhcp_lanIpChange(){	
	$("#tf1_hid_iprange1").html(parseInt($("#tf1_ipAddr").val(),10));
	$("#tf1_startIpNum").val(parseInt($("#tf1_ipAddr").val(),10));
	//$("#tf1_iprange1").val(parseInt($("#tf1_ipAddr").val(),10));

}

function applicationSettings_sendReplySms(event) {
	 
	//$(event.target).val("Please wait...");
	
	 var txtFieldIdArr = new Array();
	 txtFieldIdArr[0] = "tf1_messageReply,"+global_lang['validation_msgs']['pls_enter_msg'];

	 if (txtFieldArrayCheck(txtFieldIdArr) == false)
	 return false;
	$.ajaxSetup({async:true});
	//$(event.target).val("Sending...");
	 win.alert_msg("",global_lang['application_popup']['msg_sending']);
	msg = $("#tf1_messageReply").val();
	phonelist = $("#tf1_replyTo").val(); 
	application_api_sendsms(msg,phonelist);
		
}


function applicationSettings_dhcpSettingsvalidate(frmId) {
	app_dhcp_lanIpChange();
	
	var txtFieldIdArr = new Array();
	//txtFieldIdArr[0] = "tf1_webDomainName,Please enter Web Domain Name";
	txtFieldIdArr[0] = "tf1_ipAddr,"+global_lang['validation_msgs']['pls_enter_ipaddr'];
	txtFieldIdArr[1] = "tf1_iprange1,"+global_lang['validation_msgs']['pls_enter_ipaddr'];
	txtFieldIdArr[2] = "tf1_iprange2,"+global_lang['validation_msgs']['pls_enter_ipaddr'];

	if (txtFieldArrayCheck(txtFieldIdArr) == false)
		return false;

	if (isNumericValue("tf1_ipAddr") == false || isNumericValue("tf1_iprange2") == false) {
		return false;
	}
	
	var num =  parseInt($("#tf1_iprange2").val(),10) -  parseInt($("#tf1_iprange1").val(),10);
	
		
	var dhcpEndOct = parseInt($("#tf1_ipAddr").val(),10);
	var dhcpEndOct_1 = parseInt($("#tf1_ipAddr_1").val(),10);
	var toRangeEndOct = parseInt($("#tf1_iprange2").val(),10);
	var toRangeEndOct_1 = parseInt($("#tf1_iprange2_1").val(),10);
	var StartingRangeEndOct_1 = parseInt($("#tf1_iprange1_1").val(),10);
	var fromRangeEndOct = parseInt($("#tf1_startIpNum").val(),10);
	
	if(dhcpEndOct_1 < 0 || dhcpEndOct_1 > 255){
		alert(global_lang["wifi_popup"]["number_lanIp"]);
		return false;
	}
	
	if(StartingRangeEndOct_1 !== dhcpEndOct_1 || toRangeEndOct_1 !== dhcpEndOct_1 || StartingRangeEndOct_1 !== toRangeEndOct_1){
		alert(global_lang['alerts_set']['invalid_ip_addr']);
		return false;
	}
	
	if(dhcpEndOct == 0){
		alert(global_lang["wifi_popup"]["number_lanIp"]);
		return false;
	}
	if (dhcpEndOct > 253) {
		alert(global_lang['alerts_set']['invalid_ip_addr']);
		$("#tf1_ipAddr").focus();
		return false;
	}
	if (toRangeEndOct > 254) {
		alert(global_lang['alerts_set']['invalid_ip_addr']);
		$("#tf1_iprange2").focus();
		return false;
	}
	if (fromRangeEndOct > toRangeEndOct) {
	  	alert(global_lang['alerts_set']['ip_range']);
		$("#tf1_iprange2").focus();
		return false;
	}
	//console.log(num);
	
	if (num < 0) {
		alert(global_lang['alerts_set']['invalid_ip_addr']);
		return false;
	}
	
	
	setHiddenChks(frmId);
	applicationApi_dhcpsettingsSet();
	
}

function applicationSettings_fileSharingvalidate(frmId) {
	var txtFieldIdArr = new Array();
	txtFieldIdArr[0] = "tf1_sharingAddr,Please enter Sharing Address";

	if (txtFieldArrayCheck(txtFieldIdArr) == false)
		return false;
	//dialogAlert("This mock-up version does not support form actions", "Information", "info");

}

function applicationSettings_fileSharingReset(frmId) {
	$("#" + frmId).reset();
	resetImgOnOff(frmId);
}

function applicationSettings_firewallSettingsReset(frmId) {
	$("#" + frmId).reset();
	resetImgOnOff(frmId);
}

function applicationSettings_firewallSettingsvalidate(frmId) {
	
}


function applicationSettings_firewallSettingsportfwdApply(event) {
	
	//$(event.target).val("Please wait...");
	
	var deleteFlag = false;
	var count = 0 ;
	$(".chk_id").each(function(value,index){		
		if ($(this).is(":checked")) {
			deleteFlag = true;
			tag =$(this).val();
            var i = parseInt(tag.split("_")[1]);
            i = i - count;
            var tag_end = tag.split("_")[0]+"_"+i;
        
			if (application_api_portfwdDelete(tag_end)){
                count++;
            }
		 }		
	});	
		 
	
	 if ( deleteFlag == true ) 
	 {
		$(".chk_id").each(function(value,index){		
			if ($(this).is(":checked"))  
				$(this).parent().parent().remove();				 
		});
		alert(global_lang['alerts_set']['port_fwdd_delete_success']);
		applicationSettings_onloadportfwding();
	 } else {		 
		 alert(global_lang['alerts_set']['pls_select_port_fwd']); 
	 
	 }
	 //$("#tf1_btn_pfwd").val("Apply");
		
}

function applicationSettings_shortMsg_SetupReset(frmId) {
	$("#" + frmId).reset();
	resetImgOnOff(frmId);
}

function applicationSettings_shortMsg_Setupvalidate(frmId) {
	
	application_api_sms_set();
	
}

function applicationSettings_shortMsg_Inboxvalidate(event,frmId) {

	
	//$(event.target).val("Please wait...");
	
	var deleteFlag = false;
	
	$(".chk_id").each(function(value,index){		
		if ($(this).is(":checked")) {
			deleteFlag = true;
			tag =$(this).val();
			application_api_smsinboxDelete(tag);
		 }		
	});	
	
	 if ( deleteFlag == true ) 
	 {
		$(".chk_id").each(function(value,index){		
			if ($(this).is(":checked"))  
				$(this).parent().parent().remove();				 
		});
		alert(global_lang['alerts_set']['inbox_msg_delete_success']);
		applicationSettings_onloadInbox();	
	 } else {
		 //$(event.target).val("Apply");
		 alert(global_lang['alerts_set']['pls_select_inbox_msg_delete']); 
	 }
		
}

function applicationSettings_shortMsg_InboxReset(frmId) {
	$("#" + frmId).reset();
	resetImgOnOff(frmId);
}

function applicationSettings_shortMsg_Outboxvalidate() {
	//dialogAlert("This mock-up version does not support form actions", "Information", "info");
}

function applicationSettings_shortMsg_outboxReset(frmId) {
	$("#" + frmId).reset();
	resetImgOnOff(frmId);
}

function applicationSettings_shortMsg_Draftsvalidate(event,frmId) {
	
	//$(event.target).val("Please wait...");
	
	var deleteFlag = false;
	
	$(".chk_id").each(function(value,index){		
		if ($(this).is(":checked")) {
			deleteFlag = true;
			tag =$(this).val();
			application_api_smsdraftDelete(tag);
		 }		
	});	

	
	 if ( deleteFlag == true ) 
	 {
		$(".chk_id").each(function(value,index){		
			if ($(this).is(":checked"))  
				$(this).parent().parent().remove();				 
		});
		alert(global_lang['alerts_set']['draft_delete_success']);
		applicationSettings_onloadDrafts();	
	 } else {
		 //$(event.target).val("Apply");	 
		 alert(global_lang['alerts_set']['pls_select_draft']); 
	 }
	application_messageInfo_template();
}

		
		
	

function applicationSettings_shortMsg_DraftsReset(frmId) {
	$("#" + frmId).reset();
	resetImgOnOff(frmId);
}

function judge_protocol(val1,val2,val3){
	if((val1 == 0 || val1 == 1) && (val2 == "enable-disable-on" || val3 == "enable-disable-on")){
		dialogAlert(global_lang['alerts_set']['url_filter_Protocol']);
		return false;
	}else{
		return true;
	}
}

/*IP PortFilter */
function application_addNewIpPortFilter() {
	
	//$("#tf1_btn_ipfilterAddEdit").val("Please Wait...");
	var enabledisable_srcports = $("#tf1_enabledisable_srcports").attr("class");
	var enabledisable_dstports = $("#tf1_enabledisable_dstports").attr("class");
	var ipfilter_protocol = $("#tf1_ipfilter_protocol").val();
	
	var src_port_flag = 0,dst_port_flag = 0;
	
	var txtFieldIdArr = new Array();  
	
	txtFieldIdArr[0] = "tf1_sourceIp,"+global_lang['validation_msgs']['pls_enter_valid_src_ip'];
	txtFieldIdArr[1] = "tf1_subnetmask,"+global_lang['validation_msgs']['pls_enter_subnetmask'];
	txtFieldIdArr[2] = "tf1_sourcePort1,"+global_lang['validation_msgs']['pls_enter_src_start_port'];
	txtFieldIdArr[3] = "tf1_sourcePort2,"+global_lang['validation_msgs']['pls_enter_src_end_port'];
	txtFieldIdArr[4] = "tf1_destIp,"+global_lang['validation_msgs']['pls_enter_valid_dest_ipaddr'];
	txtFieldIdArr[5] = "tf1_destSubnetmask,"+global_lang['validation_msgs']['pls_enter_subnetmask'];
	txtFieldIdArr[6] = "tf1_destPort1,"+global_lang['validation_msgs']['pls_enter_dst_start_port'];
	txtFieldIdArr[7] = "tf1_destPort2,"+global_lang['validation_msgs']['pls_enter_dst_end_port'];
	

	if (txtFieldArrayCheck(txtFieldIdArr) == false)
		return false;

	if (ipv4Validate('tf1_sourceIp', 'IP', false, true, global_lang['alerts_set']['invalid_ip_addr'], "for octet ", true) == false)
		return false;
		
	var src_subnetObj =	document.getElementById('tf1_subnetmask');
	
	if (numericValueRangeCheck(src_subnetObj, '', '', 1, 32, true, global_lang['alerts_set']['invalid_subnet'], '') == false)
				return false;
				
	var dst_subnetObj =	document.getElementById('tf1_destSubnetmask');
	
	if (numericValueRangeCheck(dst_subnetObj, '', '', 1, 32, true, global_lang['alerts_set']['invalid_subnet'], '') == false)
				return false;			
	
	if (judge_protocol(ipfilter_protocol,enabledisable_srcports,enabledisable_dstports) == false)
		return false;
	
	if ( $("#tf1_enabledisable_srcports").attr("class") == "enable-disable-on" ) {
        src_port_flag = 1;
		var leaseTimeObj = document.getElementById('tf1_sourcePort1');
		 
		if (numericValueRangeCheck(leaseTimeObj, '', '', 1, 65535, true, global_lang['alerts_set']['invalid_port'], '') == false)
				return false;
		 
		var leaseTimeObj1 = document.getElementById('tf1_sourcePort2');
		 
		if (numericValueRangeCheck(leaseTimeObj1, '', '', 1, 65535, true, global_lang['alerts_set']['invalid_port'], '') == false)
				return false;
				
		if ( parseInt(leaseTimeObj.value,10) > parseInt(leaseTimeObj1.value,10) ) {
			dialogAlert(global_lang['alerts_set']['port_not_match']);
			return false;
		}
	 
	
	}
    else if($("#tf1_enabledisable_srcports").attr("class") == "enable-disable-off"){
        src_port_flag = 0;
    }
		

	if (ipv4Validate('tf1_destIp', 'IP', false, true, global_lang['alerts_set']['invalid_ip_addr'], "for octet ", true) == false)
		return false;

	if ( $("#tf1_enabledisable_dstports").attr("class") == "enable-disable-on" ) {
        dst_port_flag = 1;
		var dst_leaseTimeObj = document.getElementById('tf1_destPort1');
		 
		if (numericValueRangeCheck(leaseTimeObj, '', '', 1, 65535, true, global_lang['alerts_set']['invalid_port'], '') == false)
				return false;
		 
		var dst_leaseTimeObj1 = document.getElementById('tf1_destPort2');
		 
		if (numericValueRangeCheck(leaseTimeObj1, '', '', 1, 65535, true, global_lang['alerts_set']['invalid_port'], '') == false)
				return false;
				
		if ( parseInt(dst_leaseTimeObj.value,10) > parseInt(dst_leaseTimeObj1.value,10) ) {
			dialogAlert(global_lang['alerts_set']['port_not_match']);
			return false;
		}
	 
	
	}
    else if($("#tf1_enabledisable_dstports").attr("class") == "enable-disable-off"){
        dst_port_flag = 0;
    }
		application_api_ipfilter($("#tf1_hid_ipfilter_tag").val(),src_port_flag,dst_port_flag);
		$(".configForm").show();
		$("#tf1_firewallIpFilter").hide();
}

/*PortForwarding Filter */
function application_addNewportforwardingFilter() {
	
	//$("#tf1_btn_pfwAddEdit").val("Please Wait...");
	
	var txtFieldIdArr = new Array();
	txtFieldIdArr[0] = "tf1_pfsourceIp,"+ global_lang['validation_msgs']['pls_enter_valid_dest_ipaddr'];
	txtFieldIdArr[1] = "tf1_pfprotocolnum,"+ global_lang['validation_msgs']['pls_enter_protocol'];
	txtFieldIdArr[2] = "tf1_pfstartPort,"+ global_lang['validation_msgs']['pls_enter_port_number'];
	txtFieldIdArr[3] = "tf1_pfendPort,"+ global_lang['validation_msgs']['pls_enter_port_number'];
	
	
	if (txtFieldArrayCheck(txtFieldIdArr) == false)
		return false;

	if (ipv4Validate('tf1_pfsourceIp', 'IP', false, true, global_lang['alerts_set']['invalid_ip_addr'], "for octet ", true) == false)
		return false;

		var leaseTimeObj = document.getElementById('tf1_pfstartPort');
		 
		if (numericValueRangeCheck(leaseTimeObj, '', '', 1, 65535, true, global_lang['alerts_set']['invalid_port'], '') == false)
				return false;
		 
		var leaseTimeObj1 = document.getElementById('tf1_pfendPort');
		 
		if (numericValueRangeCheck(leaseTimeObj1, '', '', 1, 65535, true, global_lang['alerts_set']['invalid_port'], '') == false)
				return false;
		
        /*		
		if ( parseInt(leaseTimeObj.value,10) > parseInt(leaseTimeObj1.value,10) ) {
			dialogAlert(global_lang['alerts_set']['port_not_match']);
			return false;
		}
		*/
	
		application_api_portfwdfilter($("#tf1_hid_portfwd_tag").val());
		
		$(".configForm").show();
		$("#tf1_firewallPortForwarding").hide();

}

/* --URl Filter */
function application_addNewURLFilter(event) {
	var txtFieldIdArr = new Array();
	txtFieldIdArr[0] = "tf1_urlDomain,"+ global_lang['validation_msgs']['pls_enter_valid_url_domain'];
	txtFieldIdArr[1] = "tf1_comment,"+ global_lang['validation_msgs']['pls_enter_comments'];

	if (txtFieldArrayCheck(txtFieldIdArr) == false)
		return false;

	//$(event.target).val("please wait...");
	
	var enableUrl = $("#tf1_enableurlValue").val();
	keyword = jQuery.trim($("#tf1_urlDomain").val());
	
 	
	
	application_api_addurlfilter(enableUrl,keyword);
	//$(event.target).val("Apply");
	applicationSettings_onloadUrlFilter();
	$(".configForm").show();
	$("#tf1_firewallUrlFilter").hide();
	



}

function applicationSettings_sendNewSms(event) {
	
	var txtFieldIdArr = new Array();
	txtFieldIdArr[0] = "tf1_sendToNew,"+ global_lang['validation_msgs']['pls_enter_cntact_name'];
	txtFieldIdArr[1] = "tf1_messageNew,"+ global_lang['validation_msgs']['pls_enter_msg'];

	if (txtFieldArrayCheck(txtFieldIdArr) == false)
		return false;
	
	$.ajaxSetup({async:true});
	//win.alert_msg("",global_lang['application_popup']['msg_sending']);

	//$(event.target).val("Sending...");

	msg = $("#tf1_messageNew").val();
	phonelist = $("#tf1_sendToNew").val();
	if(ui_config.Dyn_Status["up_5s"]["ipv4"]["op_name"]== "PIN LOCK" || ui_config.Dyn_Status["up_5s"]["ipv4"]["op_name"] == "PUK LOCK")	
	{
		dialogAlert(global_lang["cpsection"]["link_pin_sim_lock"],"Information","info");
	}else{
		application_api_sendsms(msg,phonelist);
	}
}

function applicationSettings_saveasDraft(event) {
	

	var txtFieldIdArr = new Array();
	txtFieldIdArr[0] = "tf1_sendToNew,"+ global_lang['validation_msgs']['pls_enter_cntact_name'];
	txtFieldIdArr[1] = "tf1_messageNew,"+ global_lang['validation_msgs']['pls_enter_msg'];

	if (txtFieldArrayCheck(txtFieldIdArr) == false)
		return false;
		
	$(event.target).val("Saving...");

	msg = $("#tf1_messageNew").val();
	phonelist = $("#tf1_sendToNew").val();	
	
	if ( $("#tf1_tag_draft").val() == "" ) {
		if(ui_config.Dyn_Status["up_5s"]["ipv4"]["op_name"]== "PIN LOCK" || ui_config.Dyn_Status["up_5s"]["ipv4"]["op_name"] == "PUK LOCK")	
		{
			dialogAlert(global_lang["cpsection"]["link_pin_sim_lock"],"Information","info");
			$(event.target).val("Save as Draft");
			return;
		}else if(ui_config.Dyn_Status["up_5s"]["sms_store"] != 0){
			if(ui_config.Dyn_Status["up_5s"]["sms_store"] == 1)
			{
				alert(global_lang['alerts_set']['sms_sim_full']);
			}
			else if(ui_config.Dyn_Status["up_5s"]["sms_store"] == 2)
			{
				alert(global_lang['alerts_set']['sms_local_full']);
			}
			else if(ui_config.Dyn_Status["up_5s"]["sms_store"] == 3)
			{
				alert(global_lang['alerts_set']['sms_sim_local_full']);
			}
		}else{
			application_api_smsdraftAdd(msg,phonelist);
		}
		
	} else {
		application_api_smsdraftEdit(msg,phonelist,$("#tf1_tag_draft").val());
	}
	
  	$(".configForm").show();
  	$(".configTableForm").hide();
  	$("#tf1_appDraft").trigger("click");
 	application_messageInfo_template();
}

/* Reply message as save to draft */
function applicationSettings_saveasDraft2(event) {
	
	var txtFieldIdArr = new Array();
	txtFieldIdArr[0] = "tf1_replyTo,"+ global_lang['validation_msgs']['pls_enter_cntact_name'];
	txtFieldIdArr[1] = "tf1_messageReply,"+ global_lang['validation_msgs']['pls_enter_msg'];

	if (txtFieldArrayCheck(txtFieldIdArr) == false)
		return false;
		
	$(event.target).val("Saving...");

	msg = $("#tf1_messageReply").val();
	phonelist = $("#tf1_replyTo").val();	
	
	application_api_smsdraftAdd(msg,phonelist);

  	$(".configForm").show();
  	$(".configTableForm").hide();
  	$("#tf1_appDraft").trigger("click");
 	
}



function applicationSettings_sendEditSms() {
	var txtFieldIdArr = new Array();
	txtFieldIdArr[0] = "tf1_sendToEdit,"+ global_lang['validation_msgs']['pls_enter_cntact_name'];
	txtFieldIdArr[1] = "tf1_messageEdit,"+ global_lang['validation_msgs']['pls_enter_msg'];

	if (txtFieldArrayCheck(txtFieldIdArr) == false)
		return false;
	//dialogAlert("This mock-up version does not support form actions", "Information", "info");

}

function USSD_Onload(){
	
	showTabs();
	//application_ussd_get();
	//application_ussd_template();
}

/* USSD tab Validation */
function ussd_click(){
	$("#response_state").html("");
	var request = $.ajax(
			{
				type: "GET",
				url: "/data.ria?CfgType=get_apn_cfg",
			dataType: "json"
		});
	request.done(function( responseData,textStatus, jqXHR ) {
		if(responseData.apn.COMMON.netpref_value == 6){
			alert(global_lang['application_popup']['4gOnly_disable']);
		}else{
			ussdValidation();
		}
	});
}

function ussdValidation() {
	$("#response_result").html(global_lang['application_popup']['sending']);
	
	var txtFieldIdArr = new Array();
	txtFieldIdArr[0] = "tf1_ussedCode,"+ global_lang['validation_msgs']['pls_enter_ussdcode'];

	if (txtFieldArrayCheck(txtFieldIdArr) == false)
		return false;
	/*	
	if (alphaNumericValueCheck("tf1_ussedCode", '_', "Invalid User Name. ") == false) 
        return false;
    */
	
    code =$("#tf1_ussedCode").val();
    applicationApi_ussd_send(code);		
		
}

/* USSD tab onreset */

function ussdreset(frmId) {
     $("#" + frmId).reset();
     applicationApi_ussd_cancel();
}


function application_fileSharingOnload() {

	showTabs();
	$('#tree').checktree();
}

/****
 * This function calls to check the param data is valid domain or Ip or not
 * @method ipaddrValidate
 * @param ipAddr - ipaddress/domain name
 */
function ipaddrValidateCommon(ipAddr){
    var lastOctateVal = 0;
    var ipAddrObj = document.getElementById(ipAddr);
    if (!ipAddrObj || ipAddrObj.disabled) 
        return true;
    var ipAddrObjArr = (ipAddrObj.value).split(".");
    if (ipAddrObjArr.length == 1) {
        alert(global_lang['validation_msgs']['invalid_domain']);
        ipAddrObj.focus();
        return false;
    }
    if (ipAddrObjArr.length) 
        lastOctateVal = ipAddrObjArr[ipAddrObjArr.length - 1];
    if (!isNaN(lastOctateVal)) {
        if (ipv4AddrValidate(ipAddrObj, 'IP', false, true, global_lang["alerts_set"]["invalid_ip_addr"], 'for octet ', true) == false) {
            ipAddrObj.focus();
            return false;
        }
    }
    else {
        if (checkDomainExtension(lastOctateVal) == false) {
            alert(global_lang['validation_msgs']['valid_domain_ext']);
            return false;
        }
        if (ipAddrObj.value.length > 253 || ipAddrObj.value.length < 1) {
            alert(global_lang['validation_msgs']['valid_domain_chars']);
            return false;
        }
        if (checkEachNodeLength(ipAddrObjArr) == false) 
            return false;
        
        if (checkHostName(ipAddr, true, global_lang['validation_msgs']['invalid_domain'], false) == false) 
            return false;
        return true;
    }
}


/*
 function: checkEachNodeLength
 parameters: Array of nodes in a domain name.
 purpose : Checks is number of characters in a node of a domain exceeds 63 characters.
 return : true or false;
 @param nodeArray - ipaddress/domain name
 */
function checkEachNodeLength(nodeArray){
    for (var i = 0; i <= nodeArray.length - 1; i++) {
        var node = nodeArray[i];
        if (node.length > 63) {
            alert("Each node in the domain can only be 63 characters long.")
            return false;
        }
    }
    return true;
}

/*
 function: checkDomainExtension
 parameters: last octate value of domain name.
 purpose : checks if the extension falls in the specified domains.
 return : true or false;
 @param lastOctateVal - extention
 */
function checkDomainExtension(lastOctateVal){
    var ext = "." + lastOctateVal;
    for (var i = 0; i <= domainNameExt.length - 1; i++) {
        if (ext == domainNameExt[i]) 
            return true;
    }
    return false;
}

/* application ussd Template Function*/
function application_ussd_template(){

	var tmpl_ussd_data = {
							"response_data":ui_config["ussd"]["resp_data"]
   						 };
  	
  
    var pagefn = doT.template(document.getElementById('app_ussdTemplate').text);
    $("#tf1_tmpl_ussd").html(pagefn(tmpl_ussd_data));

}



/* application Firewall Settings Template Function */
function application_firewallInfo_template(){


	var tmpl_firewall_data = {
                              "policy":ui_config["firewall_info"]["Firewall"]["policy"],
                              "enablefirewall":ui_config["firewall_info"]["Firewall"]["enable"],  
							  "enabledmz":ui_config["firewall_info"]["DMZ"]["enable"],  
							  "ipAddr":ui_config["firewall_info"]["DMZ"]["ip"],	
							  "enablewan":ui_config["firewall_info"]["WAN_ACCESS"]["v4_allow"],	
							  "wanport":ui_config["firewall_info"]["WAN_ACCESS"]["port"],
							  "pptp_flag":ui_config["firewall_info"]["Firewall"]["vpn_pt"]%2,
							  "ipsec_flag":Math.floor((ui_config["firewall_info"]["Firewall"]["vpn_pt"]-(ui_config["firewall_info"]["Firewall"]["vpn_pt"]%2)*1-(Math.floor(ui_config["firewall_info"]["Firewall"]["vpn_pt"]/4))*4)/2),
							  "l2tp_flag":Math.floor(ui_config["firewall_info"]["Firewall"]["vpn_pt"]/4),
							  "wan_ping_flag":1
   							  };
  // 	alert(JSON.stringify(tmpl_firewall_data));
    var pagefn = doT.template(document.getElementById('app_firewallTemplate').text);
    $("#tf1_tmpl_firewall").html(pagefn(tmpl_firewall_data));

}


/* application Firewall url filter Template Function */
function application_urlfilterInfo_template(){
 
	var tmpl_urlfilter_data = {
							  "enableurlfilter":ui_config["firewall_info"]["URL_Filter"]["enable"]							   
							  }; 

	//tmpl_urlfilter_data.keyword = ui_config["firewall_info"]["URL_Filter"]["keyword"].split("\n");
	tmpl_urlfilter_data.keyword = new Array();
	ui_config["firewall_info"]["URL_Filter"]["keyword"] = $.trim(ui_config["firewall_info"]["URL_Filter"]["keyword"]);
	
	if (ui_config["firewall_info"]["URL_Filter"]["keyword"] == "") {
		
		tmpl_urlfilter_data.keyword = new Array();
		
	} else {
	
		tmpl_urlfilter_data.keyword = ui_config["firewall_info"]["URL_Filter"]["keyword"].split(",");

}
  	
    var pagefn = doT.template(document.getElementById('app_urlfilterTemplate').text);
    $("#tf1_tmpl_firewall_urlfilter").html(pagefn(tmpl_urlfilter_data));

}


/* application Firewall port forwarding info Template Function */
function application_portfwdInfo_template(){
 
	var tmpl_portfwd_data = ui_config["firewall_portfwdinfo"];
	
	var pagefn = doT.template(document.getElementById('app_portfwdTemplate').text);
    $("#tf1_tmpl_firewall_portfwd").html(pagefn(tmpl_portfwd_data));
}



/* application Firewall IP filter info Template Function */
function application_ipfilterInfo_template(){
 
	var tmpl_ipfilter_data = ui_config["firewall_ipfilterinfo"];
	
	var pagefn = doT.template(document.getElementById('app_ipfilterTemplate').text);
    $("#tf1_tmpl_firewall_ipfilter").html(pagefn(tmpl_ipfilter_data));
}

/* application Firewall IP filter Add Template Function */
function application_ipfilterAdd_template(){
 
	var tmpl_ipfilter_temdata = {"policy":"1","proto":"0","src_ip":"","src_ip_subnet":"","dst_ip":"","dst_ip_subnet":"","src_port1":"","src_port2":"","dst_port1":"","dst_port2":"","heading":global_lang['application_popup']['add_ip_filter']};
		
	var pagefn = doT.template(document.getElementById('app_ipfilterAddTemplate').text);
    $("#tf1_tmpl_firewall_ipfilterAdd").html(pagefn(tmpl_ipfilter_temdata));
}

/* application Firewall IP filter Add Template Function */
function application_ipfilteredit_template(index){

 
	var tmpl_ipfilter_temdata = {
								// "policy":$("#tf1_ipfilter_policy_"+index).val(),
								 "proto":$("#tf1_ipfilter_proto_"+index).val(),
								 "src_ip":$("#tf1_ipfilter_srcip_"+index).val(),
								 "src_ip_subnet":$("#tf1_ipfilter_srcsubnet_"+index).val(),
								 "dst_ip":$("#tf1_ipfilter_dstip_"+index).val(),
								 "dst_ip_subnet":$("#tf1_ipfilter_dstsubnet_"+index).val(),
								 "src_port1":$("#tf1_ipfilter_srcport1_"+index).val(),
								 "src_port2":$("#tf1_ipfilter_srcport2_"+index).val(),
								 "dst_port1":$("#tf1_ipfilter_dstport1_"+index).val(),
								 "dst_port2":$("#tf1_ipfilter_dstport2_"+index).val(),
								 "hidenVal":$("#tf1_ipfilter_tag__"+index).val(),
								 "heading":global_lang['application_popup']['edit_ip_filter']
								 };
	
		
	var pagefn = doT.template(document.getElementById('app_ipfilterAddTemplate').text);
    $("#tf1_tmpl_firewall_ipfilterAdd").html(pagefn(tmpl_ipfilter_temdata));
}

/* application Dhcp Settings Template Function */
function application_dhcpInfo_template(){
	var start_ip = ui_config["lan"]["DHCP4S"]["start_ip"];
	
	var startIpArr = start_ip.split(".");
	
	var end_num = parseInt(startIpArr[3],10) + parseInt(ui_config["lan"]["DHCP4S"]["num"],10) - 1;
	
	var end_ip = startIpArr[0]+"."+startIpArr[1]+"."+startIpArr[2]+"."+end_num.toString();
	
	
	var tmpl_dhcp_data = {		
								//"webDomainname":ui_config["web_info"]["WEBSVC"]["hostname"],
							  	"enable_lan":ui_config["lan"]["DHCP4S"]["enable"],
								"dhcp_service":ui_config["lan"]["DHCP4S"]["enable"],
								"ip_addr":ui_config["lan"]["LAN"]["ip4_addr"],
								"subnet":ui_config["lan"]["LAN"]["ip4_subnet_mask"],
								"num": ui_config["lan"]["DHCP4S"]["num"],
								"start_ip": ui_config["lan"]["DHCP4S"]["start_ip"],
								"end_ip":end_ip
   							};
   
  // 	alert(JSON.stringify(tmpl_firewall_data));
    var pagefn = doT.template(document.getElementById('app_dhcpTemplate').text);
    $("#tf1_tmpl_dhcp").html(pagefn(tmpl_dhcp_data));

}
function navigatorUserAgent(){
	var explorer =navigator.userAgent;
	if(explorer.indexOf("Safari") > -1 && explorer.indexOf("Chrome") == -1){
		$("#tf1_inboxTbl a").css("height","100%");
		$("#tf1_outboxTbl a").css("height","100%");
		$("#tf1_draftsTbl a").css("height","100%");
	}else{
		$("#tf1_inboxTbl a").css({"height":"20px","line-height":"20px"});
		$("#tf1_outboxTbl a").css({"height":"20px","line-height":"20px"});
		$("#tf1_draftsTbl a").css({"height":"20px","line-height":"20px"});
	}
}
/* application Inbox get Template Function */
function applications_Inboxinfo_template() {
    var tmpl_siminbox_data = ui_config["app_getsimInbox"];
	/* Sort objects' time */
		var dics = {};
		var sdic=Object.keys(tmpl_siminbox_data).sort(function(a,b){
			var abd = "20" + tmpl_siminbox_data[a].date;
			var def = "20" + tmpl_siminbox_data[b].date;
			var timestamp1 = Date.parse(new Date(abd));
			timestamp1 = timestamp1/1000;
			var timestamp2 = Date.parse(new Date(def));
			timestamp2 = timestamp2/1000;
			return timestamp1 - timestamp2;
		});
		for(ki in sdic){                     
			//console.log(sdic[ki]+":"+tmpl_siminbox_data[sdic[ki]]+",");
			if(tmpl_siminbox_data[sdic[ki]])
				dics[sdic[ki]] = tmpl_siminbox_data[sdic[ki]];
		}
	/* Sort objects' time end */
    var dataTemplate = $("#app_inboxTemplate").html();
    var populatedDataTemplate = doT.template(dataTemplate)(dics);
    $("#tf1_siminboxTblbody").html(populatedDataTemplate);
	judgment_browser();
	navigatorUserAgent();
	if (dics.total > 0 ) {		
		datatable('tf1_inboxTbl');		
	}
}

/* application Drafts get Template Function */
function applications_Draftsinfo_template() {
    var tmpl_simdrafts_data = ui_config["app_getsimDrafts"];
    var dataTemplate = $("#app_draftTemplate").html();
    var populatedDataTemplate = doT.template(dataTemplate)(tmpl_simdrafts_data);
    $("#tf1_simdraftTblbody").html(populatedDataTemplate);
	judgment_browser();
	navigatorUserAgent();
	if (tmpl_simdrafts_data.total > 0 ) {		
		datatable('tf1_draftsTbl');		
	}
}

/* application sms setup Template Function */
function application_smssetuporg_template(){

	var tmpl_smssetup_data = ui_config["app_getsimcapcity"];
   
 
    var pagefn = doT.template(document.getElementById('app_smssetupTemplate').text);
    $("#tf1_tmpl_smssetup").html(pagefn(tmpl_firewall_data));

}

/* application messages info Template Function */
function application_messageInfo_template(){
	
 	var tmpl_msg_data = {
							"inbox_tot":ui_config["app_getsimInbox"]["total"],
                            "drafts_tot":ui_config["app_getsimDrafts"]["total"]
						};
	//console.log(JSON.stringify(tmpl_connection_data));
    var pagefn = doT.template(document.getElementById('app_msgTemplate').text);
	$("#tf1_tmpl_msginfo").html(pagefn(tmpl_msg_data));
	

}

/* application messages info Template Function */
function application_smssetup_template(){
	
 	var tmpl_shortmsg_data = {
							"short_msgs":ui_config["app_getsimInbox"]["total"]+ui_config["app_getsimDrafts"]["total"],
							"sms_storage_location":ui_config["app_getsmsstore"]["SMSC"]["sms_into_sim"],
							"sms_center_num":ui_config["app_getsmsstore"]["SMSC"]["addr_digits"]
						};
	//console.log(JSON.stringify(tmpl_connection_data));
    var pagefn = doT.template(document.getElementById('app_smssetupTemplate').text);
	$("#tf1_tmpl_setupinfo").html(pagefn(tmpl_shortmsg_data));
	judgment_browser();
	

}

/**
 * This function calls when user selects drop down item from "protocol" select box
 * Select box onchange event
 * @method application_portfwdprotocolselect
 */
function application_portfwdprotocolselect() {
	/* This function is Global from globalMgmt.js */
	var Selprotocol = comboSelectedValueGet('tf1_pfprotocol');
	seleprotocol =parseInt(Selprotocol,10);
	
	switch(seleprotocol) {
		case 6:    //TCP
		case 17 : // UDP
			fieldStateChangeWr('tf1_pfprotocolnum', '', '', '');
			vidualDisplay('tf1_pfprotocolnum', 'hide');
			vidualDisplay('break_pfprotocolnum', 'hide');
			break;
		case 3:
			// OTHER
			fieldStateChangeWr('', '', 'tf1_pfprotocolnum', '');
			vidualDisplay('tf1_pfprotocolnum', 'configRow');
			vidualDisplay('break_pfprotocolnum', 'break');
			break;
	}
}	

function applicationSettings_ipFilterApply(event){
	
	
	
	
	var deleteFlag = false;
	var count = 0;
	$(".chk_id").each(function(value,index){		
		if ($(this).is(":checked")) {
			//$(event.target).val("Please wait...");
			deleteFlag = true;
			tag =$(this).val();
            var i = parseInt(tag.split("_")[1]);
            i = i - count;
            var tag_end = tag.split("_")[0]+"_"+i;
			if(application_api_ipfilterDelete(tag_end)){
                count++;
            }
		 }		
	});	
		 
	 IE_Chrome(event);
	 
	 if ( deleteFlag == true ) 
	 {
		$(".chk_id").each(function(value,index){		
			if ($(this).is(":checked"))  
				$(this).parent().parent().remove();				 
		});
		alert(global_lang['alerts_set']['ip_filter_delete_success']);
		applicationSettings_onloadIPFilter();
	 } else {	
	 	
		 alert(global_lang['alerts_set']['pls_select_ip_filter']); 
	 
	 }
	  //$("#tf1_btn_ipfilter").val("Apply");		

}

/* Help Onload function added */

function help_Onload() {
	var localeLng = langString(ui_config.Dyn_Status["up_5s"]["lang"]);
	$("._helpSystemName").html(systemName);	
	if( localeLng == "en" || localeLng == "fr" || localeLng == "ge" || localeLng == "sp" || localeLng == "it") {
		$("#tf1_help_en").show();	
	} else {
		$("#tf1_help_ch").show();	
	}
}


;(function ($) {
 
    $.fn.maxlength = function(){
          
        $("textarea[maxlength], input[maxlength]").keypress(function(event){
            var key = event.which;              
            //all keys including return.
            if(key >= 33 || key == 13 || key == 32) {
                var maxLength = $(this).attr("maxlength");
                var length = this.value.length;                
                if(length >= maxLength) {                    
                    event.preventDefault();
                }
            }
        });

        $("textarea[maxlength], input[maxlength]").keyup(function(event){
             $(".maxLength").html($(this).val().length);
        });
    }
 
})(jQuery);
