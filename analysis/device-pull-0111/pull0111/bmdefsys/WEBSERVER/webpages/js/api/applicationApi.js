ui_config["traceout_res"] = new Object();
ui_config["ping_res"]	= new Object();
ui_config["app_getsimcontacts"] = new Object();
ui_config["app_getsimInbox"] = new Object();
//ui_config["app_getsimInbox_count"] = new Object();
ui_config["app_getsimDrafts"] = new Object();
ui_config["app_getsimcapcity"] = new Object();
//ui_config["app_getsimDrafts_count"] = new Object();
ui_config["app_getsmsstore"] = new Object();
var ipfilter_list = "";
var portfwd_list = "";

var gsm_default = new Array(
   /*  0       1       2      3       4       5       6       7       8       9       A       B       C       D       E      F  */
    /* 0 */ "0x0040", "0x00A3", "0x0024", "0x00A5", "0x00E8", "0x00E9", "0x00F9", "0x00EC", "0x00F2", "0x00C7", "0x000A", "0x00D8", "0x00F8", "0x000D", "0x00C5", "0x00E5",
    /* 1 */ "0x0394", "0x005F", "0x03A6", "0x0393", "0x039B", "0x03A9", "0x03A0", "0x03A8", "0x03A3", "0x0398", "0x039E", "0x001B", "0x00C6", "0x00E6", "0x00DF", "0x00C9", 
    /* 2 */ "0x0020", "0x0021", "0x0022", "0x0023", "0x00A4", "0x0025", "0x0026", "0x0027", "0x0028", "0x0029", "0x002A", "0x002B", "0x002C", "0x002D", "0x002E", "0x002F", 
    /* 3 */ "0x0030", "0x0031", "0x0032", "0x0033", "0x0034", "0x0035", "0x0036", "0x0037", "0x0038", "0x0039", "0x003A", "0x003B", "0x003C", "0x003D", "0x003E", "0x003F",
    /* 4 */ "0x00A1", "0x0041", "0x0042", "0x0043", "0x0044", "0x0045", "0x0046", "0x0047", "0x0048", "0x0049", "0x004A", "0x004B", "0x004C", "0x004D", "0x004E", "0x004F", 
    /* 5 */ "0x0050", "0x0051", "0x0052", "0x0053", "0x0054", "0x0055", "0x0056", "0x0057", "0x0058", "0x0059", "0x005A", "0x00C4", "0x00D6", "0x00D1", "0x00DC", "0x00A7", 
    /* 6 */ "0x00BF", "0x0061", "0x0062", "0x0063", "0x0064", "0x0065", "0x0066", "0x0067", "0x0068", "0x0069", "0x006A", "0x006B", "0x006C", "0x006D", "0x006E", "0x006F",
    /* 7 */ "0x0070", "0x0071", "0x0072", "0x0073", "0x0074", "0x0075", "0x0076", "0x0077", "0x0078", "0x0079", "0x007A", "0x00E4", "0x00F6", "0x00F1", "0x00FC", "0x00E0"
);
var span_ext = new Array(
    /* 0       1       2      3       4       5       6       7       8       9       A       B       C       D       E      F  */
   /* 0 */ "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF",/*'?'*/"0x00E7", "0x000A", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF",
   /* 1 */ "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", /*'^'*/"0x005E", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0x0020", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF",
   /* 2 */ "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF",/*'{'*/"0x007B",/*'}'*/"0x007D", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", /*'\\'*/"0x005C",
   /* 3 */ "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF",/*'['*/"0x005B",/*'~'*/"0x007E",/*']'*/"0x005d", "0xFFFF",
   /* 4 */ /*'|'*/"0x007c",  /*'á'*/"0x00c1", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF",/*'í'*/"0x00cd", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF",/*'ó'*/"0x00d3",
   /* 5 */ "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF",/*'ú'*/"0x00da", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF",
   /* 6 */ "0xFFFF",/*'á'*/"0x00e1", "0xFFFF", "0xFFFF", "0xFFFF",/*'€'*/"0x20ac", "0xFFFF", "0xFFFF", "0xFFFF",/*'í'*/"0x00ed", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0x00F3",
   /* 7 */ "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF",/*'ú'*/"0x00fa", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0xFFFF", "0x0040"/* note:  0x7F is used to decode '@' */
);

function application_firewall_info_get(){
	
	var request = $.ajax({
	    url:"data.ria?FileID=3",        
        dataType: "json"
       
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
    		ui_config["firewall_info"] = responseData;
    		 
    		
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	
    	
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });

}


function applicationApi_firewallEnable_policy_Set(firewallst, policyst) {

			/* Get auth Id */
			cpApi_get_authId();
			//alert(auth_id);
    
            var post_data={"FileID": 3, "Firewall_Enable": firewallst, "Policy": policyst, "authID":auth_id};
			//alert(post_data);

			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {    
    			//alert("Success");
   			});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		     	//alert("try");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });
}

function applicationApi_firewalldmzSet(dmzst,ipaddr) {

			/* Get auth Id */
			cpApi_get_authId();
			//alert(auth_id);
            var post_data={"FileID": 3, "DMZ":{"enable": dmzst, "ip": ipaddr},"authID":auth_id};
			//alert(post_data);

			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {    
    			//alert("Success");
   			});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		     	//alert("try");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });
}

function applicationApi_firewallwanaccessSet(wanst,portnum) {

			/* Get auth Id */
			cpApi_get_authId();
			//alert(auth_id);

            var post_data={"FileID": 3, "WAN_ACCESS": {"v4_allow": parseInt(wanst,10), "port": portnum},"authID":auth_id};
			//alert(post_data);

			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {    
    			alert(global_lang['alerts_set']['firewall_setting_success']);
   			});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		     	//alert("try");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });
}

/*API to get portforward Info get */
function application_firewall_PortfwdInfo_get(){
	var list_len = 0;
    
	var request = $.ajax({
	    url:"data.ria?FileID=7",        
        dataType: "json"       
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
    	//	ui_config["firewall_portfwdinfo"] = parseINIString(responseData);
    		ui_config["firewall_portfwdinfo"] = responseData;
        
            list_len = responseData.META.num_entries;
            //console.log("responseData.num_entries = "+ list_len);
            var index = 0;
            var s_index = "";
            portfwd_list = "";
            for(index = 0; index<list_len;index++)
            {
                s_index = "PF_"+index;
                portfwd_list += responseData[s_index].inn_ip1+",";
                portfwd_list += responseData[s_index].dst_port1+",";
                portfwd_list += responseData[s_index].dst_port2+",";
                portfwd_list += responseData[s_index].proto+";";
            }
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	
    	
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });

}

/*API to get IPFilter Info get */

function application_firewall_ipfilterInfo_get(){
    
    var list_len = 0;
	
	var request = $.ajax({
	    url:"data.ria?FileID=17",        
        dataType: "json"
       
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
        
    		ui_config["firewall_ipfilterinfo"] = responseData;
            list_len = responseData.META.handle_list_len;
            //console.log("responseData.handle_list_len = "+ list_len);
            var index = 0;
            var s_index = "";
            ipfilter_list = "";
            for(index = 0; index<list_len;index++)
            {
                s_index = "IPF_"+index;
                ipfilter_list += responseData[s_index].src_ip+",";
                ipfilter_list += responseData[s_index].src_ip_subnet+",";
                ipfilter_list += responseData[s_index].dst_ip+",";
                ipfilter_list += responseData[s_index].dst_ip_subnet+",";
                ipfilter_list += responseData[s_index].src_port1+",";
                ipfilter_list += responseData[s_index].src_port2+",";
                ipfilter_list += responseData[s_index].dst_port1+",";
                ipfilter_list += responseData[s_index].dst_port2+",";
                ipfilter_list += responseData[s_index].proto+";";
            }
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	
    	
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
}

function redirectTimeout(path) {
    if (--window.redirectTimeoutVar <= 0) {
    	parent.location.href=path;
    } else {
      $("#reboot_timeout").html(window.redirectTimeoutVar);
    }
}

function dhcpRedirect(timeout, path) {
	$.ajaxSetup({async:true});
	$("#tf1_Progressbar").show();
    window.redirectTimeoutVar = timeout;
	$("#tf1_frm_statusBar div.usageDisplay").html(global_lang['system_popup']['rebooting_DHCP']);
	$("#reboot_timeout").html(window.redirectTimeoutVar);
    setInterval("redirectTimeout('" + path + "');", 1000);
	var $a = $(".leftMenuFour").find("a");
		$a.attr("href","javascript:;");
		$a.attr("onClick","javascript:;");
		
	$("#btnClose").click(function(){
			return false;
		});
	
	$(".configRow").find("input").attr("onClick","javascript:;");
	$(".configRow").find("input").click(function(){
		return false;
	})
}


 
function applicationApi_dhcpsettingsSet() {

			
			cpApi_get_authId();

			var ip_addr = "192.168." + $("#tf1_ipAddr_1").val() + "." + $("#tf1_ipAddr").val();
			var start_addr = "192.168." + $("#tf1_iprange1_1").val() + "." + $("#tf1_iprange1").val();
			var num =  parseInt($("#tf1_iprange2").val(),10) -  parseInt($("#tf1_iprange1").val(),10);
			/* Same Start and END */
			if (num == 0) {
				num = 1;
			} else {
				num = num + 1;	
			}
			
			var post_data={
				
							"CfgType" :"lan_setup",
							"ip4_addr":ip_addr,
							"ip4_subnet_mask":24,
							"enable": parseInt($("#tf1_hid_enableDhcp").val(),10),
							"start_ip":start_addr,
							"num": num,
							"authID":auth_id
					};
			 

			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {    
    			 clearCookies();
				 alert(global_lang['alerts_set']['dhcp_settings_success']);
				 var path = "http://"+ip_addr+"/";
				 dhcpRedirect(30,path);
				 
   			});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		     	//alert("try");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });
}



function applicationApi_ussd_send(code) {
			
			/* Get auth Id */
			cpApi_get_authId();

			var post_data={"CfgType":"do_ussd","cmd":"send","code":code,"authID":auth_id}; 

			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
			});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {   
				global_ussdsendTimeoutHandler = setInterval(function(){ application_ussd_loop()},3000); 
						
				
				
			});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		    	 //alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });
}


function application_ussd_loop(){
	application_ussd_get();
	if (ui_config["ussd"]["cmd_status"] == "Done") {
			var ussd_resp = ui_config["ussd"]["resp_data"];
			$("#response_result").html(ussd_resp);
			if(parseInt(ui_config["ussd"]["resp_state"]) == 0)
			{
				clearInterval(global_ussdsendTimeoutHandler);
				$("#response_state").html("session close");
			}
			else
			{							
				$("#response_state").html("session start");
			}
			/*
				if(ussd_resp == ""){
					$("#response_result").html("Failed...Invalid Number");
				}else { 
					$("#response_result").html(ussd_resp);
				}
			*/
	}

}

function application_ussd_get() {
 					
	var request = $.ajax({
	    url: "data.ria?DynUpdate=get_ussd_state",       
        dataType: "json",
		async : true
    });
    request.done(function( responseData,textStatus, jqXHR ) { 
    		if (responseData.res == "done") {
				ui_config["ussd"]["cmd_status"] = "Done";
				ui_config["ussd"]["resp_data"] = responseData.resp_data;
				ui_config["ussd"]["resp_state"] = responseData.state;
			}
			else {
				ui_config["ussd"]["cmd_status"] = "Wait";
			}
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	 
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
}

function applicationApi_ussd_cancel() {
			
			/* Get auth Id */
			cpApi_get_authId();

			var post_data={"CfgType":"do_ussd","cmd":"cancel","authID":auth_id}; 

			var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {   
    			  $("#response_result").html("");
    		});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		    	// alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });
}


function application_pingres_get(){
	
	var request = $.ajax({
	    url:"/data.ria?DynUpdate=ping_res",        
        dataType: "json"
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
    		ui_config["ping_res"] =responseData.result;
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	
    	
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
}

function application_traceoutres_get(){
	
	var request = $.ajax({
	    url:"/data.ria?DynUpdate=tracert_res",        
        dataType: "json"
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
    		ui_config["traceout_res"] =responseData.result;
    				
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {	
    	
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
}

function application_api_addurlfilter(enableUrl,keyword) {	
    
   
 if (trim(ui_config["firewall_info"]["URL_Filter"]["keyword"]) == "") {
	 var current_keywords = new Array();
 } else {
  	var current_keywords = trim(ui_config["firewall_info"]["URL_Filter"]["keyword"]).split(",");
 }
  
  
  
  for (var i=0; i< current_keywords.length; i++) {
	  
	  current_keywords[i] = encodeURIComponent(current_keywords[i]);
	  
  }
   
   current_keywords[current_keywords.length] = encodeURIComponent(keyword);
   
   var keywords = current_keywords.join(",");  
   
   
   

   /* Get auth Id */
   cpApi_get_authId();

    var post_data = {"keyword":keywords,"enable":parseInt(enableUrl,10),"CfgType":"set_urlfilter","authID":auth_id};
	
	
    var request = $.ajax({
        url: "/webpost.cgi",
        type: "POST",
        data: JSON.stringify(post_data),
        dataType: "json"
    });
    
    request.done(function(responseData,textStatus, jqXHR ) {
	 	 alert(global_lang['alerts_set']['url_filter_add_success']);
    });
    request.fail(function(jqXHR, textStatus, errorThrown) {
           
    });
    request.always(function(responseData,textStatus, jqXHR ) {
            
    });

}

 
function application_api_deleteurlfilter(deleteFlag) {

	 
	var new_keywords = new Array();
	
	$(".chk_id").each(function(value,index){	 	
	
	   if ($(this).is(":checked") == false) {
		   new_keywords[new_keywords.length] = encodeURIComponent($(this).val());
	   }
	
	});	
	
	var keywords = new_keywords.join(",");	
    cpApi_get_authId();
   
	var enableUrl = $("#tf1_enableurlValue").val();	
    var post_data = {"enable":parseInt(enableUrl,10),"CfgType":"set_urlfilter","authID":auth_id};
	
	if (new_keywords.length > 0 ) {
		post_data.keyword = keywords;	
	} else if(new_keywords.length == 0 && deleteFlag) {
		post_data.keyword = "";	
	}
	 

    var request = $.ajax({
        url: "/webpost.cgi",
        type: "POST",
        data: JSON.stringify(post_data),
        dataType: "json"
    });
    
    request.done(function(responseData,textStatus, jqXHR ) {
		
         
    });
    request.fail(function(jqXHR, textStatus, errorThrown) {
           
    });
    request.always(function(responseData,textStatus, jqXHR ) {
            
    });

}
function twoBytes(charCode)
{
    var i;

    for(i = 0; i < gsm_default.length; ++i)
    {
        if (charCode === parseInt(gsm_default[i], 16))
        {

                return 0;
        }
    }
    for(i = 0; i < span_ext.length; ++i)
    {
        if (charCode === parseInt(span_ext[i], 16))
        {
            return 255; //used for gsm ext table
        }
    }
    
	if(charCode >127)
		return 1;
	switch(charCode)
	{
		case 12:
		case 91:
		case 92:
		case 93:
		case 94:
		case 123:
		case 124:
		case 125:
		case 126:
			return 1;
	}
	if(charCode>127){
		return 2;
	}else{
		return 0;
	}
}
function application_api_sendsms(msg,phonelist) {
	var number_arry = phonelist.split(";");
	var zh_flag =0;
	var _8bit_flag=0;
    var _16bit_flag = 0;
    var gsm_ext_num = 0;
	var msg_length = msg.length;

	if (number_arry.length < 1) {
		alert(global_lang['application_popup']['message_Invalid_Number']);
		return false;
	}
	if(number_arry.length > 10) {
		alert(global_lang['application_popup']['too_many_number']);
		return false;
	}
	
	for (var i=0;i<number_arry.length;i++) {
		var ret = number_arry[i].match(/^[+0-9][0-9]*$/);
		if(!ret || number_arry[i].length > 16) {
			alert(global_lang['application_popup']['invalid_number']);
			return false;
		}
	}

	if (msg_length < 1) {
		alert(global_lang['application_popup']['empty_messager']);
		return false;
	}

	for(var i = 0;i < msg_length; i++) {
		zh_flag=twoBytes( msg.charCodeAt(i));
		if( zh_flag==1 )
		{
			break;
		}else if(zh_flag==2){
			_8bit_flag=1;
		}else if (zh_flag == 255)
        {
            gsm_ext_num++;
        }else if (zh_flag == 254)
        {
            _16bit_flag = 1;
        }
	}

	if(zh_flag==1 || (_8bit_flag==1 && _16bit_flag==1)) {
		if (msg_length > 500) {
			alert(global_lang['application_popup']['too_long_message_ch']);
			return false;
		}
	}
	else {
		if (msg_length > 1000) {
			alert(global_lang['application_popup']['too_long_message_en']);
			return false;
		}
	}
	win.alert_msg("",global_lang['application_popup']['msg_sending']);
	global_smsTimeoutHandler = setInterval(function(){sms_status_loop()},2000);
	if($("#tf1_tag_draft").val() != "")
	{
		//console.log($("#tf1_tag_draft").val());
		application_api_smsdraftDelete($("#tf1_tag_draft").val());		
		applicationSettings_onloadDrafts();				
	} 
	cpApi_get_authId();	
    var post_data ={"CfgType":"sms_action","type":"sms_send","msg":msg,"phone_list":phonelist,"authID":auth_id};

    var request = $.ajax({
        url: "/webpost.cgi",
        type: "POST",
        data: JSON.stringify(post_data),
        dataType: "json"
    });
    
    request.done(function(responseData,textStatus, jqXHR ) {
    	 // alert("SMS sent successfully");
		 //$(".configForm").show();
		 // $(".configTableForm").hide();
          win.close();
		 if ($('#tf1_addInbox').css('display') != 'none') {
		 	$("#tf1_sms_buttons").hide();
		 	$("#tf1_sms_status").show();
		} else {
			$("#tf1_sms_reply_buttons").hide();
		 	$("#tf1_sms_reply_status").show();
		}

    });
    request.fail(function(jqXHR, textStatus, errorThrown) {
         // alert("Invalid");
    });
    request.always(function(responseData,textStatus, jqXHR ) {
            
    });

}


function sms_status_loop () {

	var request = $.ajax({
        url:"data.ria?DynUpdate=send_msg_state",
        dataType: "json",
		async: global_cploaded
    });
    request.done(function( responseData,textStatus, jqXHR ) {
			$(".win").css("display","none");
    		 if ( responseData["cmd_status"] == "Wait") {				 
				 
			 } else {				 
		 	 	clearInterval(global_smsTimeoutHandler);		 	 	
					$("#tf1_sms_buttons").show();
		 			$("#tf1_sms_status").hide();		 		
		 			$("#tf1_sms_reply_buttons").show();
		 			$("#tf1_sms_reply_status").hide();		 	

		 		if ( $('#tf1_addInbox').css('display') != 'none' || $('#tf1_replyInbox').css('display') != 'none' ) {							
					if ( responseData["cmd_status"] == "Fail") {
						alert(global_lang['alerts_set']['sms_sent_fail']);
					} else {
						win.close();
						alert(global_lang['alerts_set']['sms_sent_success']);						
					}					
				   $(".configForm").show();
				   $(".configTableForm").hide();
				   $("#tf1_appInbox").trigger("click");
				}			
				$.ajaxSetup({async:false});
			
			 } 
  	
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {     
    	$.ajaxSetup({async:false});
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });		
}


function application_api_smsinboxDelete(tag) {

     
    cpApi_get_authId();
   
    var post_data ={"CfgType":"sms_action","type":"inbox","cmd":"del","tag":tag,"authID":auth_id};

    var request = $.ajax({
        url: "/webpost.cgi",
        type: "POST",
        data: JSON.stringify(post_data),
        dataType: "json"
    });
    
    request.done(function(responseData,textStatus, jqXHR ) {
    });
    request.fail(function(jqXHR, textStatus, errorThrown) {
           
    });
    request.always(function(responseData,textStatus, jqXHR ) {
            
    });

}

function application_api_smsinbox_setasread(tag) {

     
    cpApi_get_authId();
   
    var post_data ={"CfgType":"sms_action","type":"inbox","cmd":"set_read","tag":tag,"authID":auth_id};

    var request = $.ajax({
        url: "/webpost.cgi",
        type: "POST",
        data: JSON.stringify(post_data),
        dataType: "json"
    });
    
    request.done(function(responseData,textStatus, jqXHR ) {
		cp_up_5s()
    	applicationSettings_onloadInbox();
    });
    request.fail(function(jqXHR, textStatus, errorThrown) {
           
    });
    request.always(function(responseData,textStatus, jqXHR ) {
            
    });

}
function removeInvalidChar(text){
	var NOT_SAFE_IN_XML=/[\x01-\x1F\xEF\xFF]/gm;
	text = text.replace(NOT_SAFE_IN_XML,'');
	var length = text.length;
	for(var i=0 ;i < length ;i++)
	{
		if(text.charCodeAt(i) == 65535)
		{
			text = text.replace(text.substring(i,i+1),' ');
		}
	}
	return text;
}

function application_simInbox_get(){

		var request = $.ajax({
        url:"data.ria?CfgType=sms_action&cont=inbox&index=0",
        dataType: "text",
		async: global_cploaded
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
    		responseData = removeInvalidChar(responseData);
			var responseData = jQuery.parseJSON(responseData)
    		ui_config["app_getsimInbox"] = responseData;
			//console.log(ui_config["app_getsimInbox"]);
  	
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {     
    	//console.log(textStatus);
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
}


function application_simInbox_get2(){

	  var startIndex = 0;
	  var newIndex;
	  for (var loop = 0; loop < global_contact_loop; loop++) {	
        startIndex = loop*10;
		newIndex = startIndex + 1;
		var request = $.ajax({
        url:"data.ria?CfgType=sms_action&cont=inbox&index="+startIndex,
        dataType: "json"
		});
		request.done(function( responseData,textStatus, jqXHR ) {
							
				if ( loop == 0 ) {
					ui_config["app_getsimInbox"] = responseData;
				} else {					
					$.each(responseData,function(key,value) {
							if (key != "total") {								
								ui_config["app_getsimInbox"]["M"+newIndex] = value;
								newIndex = newIndex + 1;
							}
					});					
				}
				if (jsonKeysCount(responseData) < 11 || responseData.total == 10 ) {
					loop = 	global_contact_loop + 1;
				}
		});
		request.fail(function( jqXHR, textStatus, errorThrown) {     
		});
		request.always(function(responseData,textStatus, jqXHR ) {       
		});	
  }
  
}


function application_api_smsdraftAdd(msg,phonelist) {

     var number_arry_save = phonelist.split(";");
    if (number_arry_save.length < 1) {
		alert(global_lang['application_popup']['message_Invalid_Number']);
		return false;
	}
	if(number_arry_save.length > 10) {
		alert(global_lang['application_popup']['too_many_number']);
		return false;
	}
	for (var i=0;i<number_arry_save.length;i++) {
		var ret = number_arry_save[i].match(/^[+0-9][0-9]*$/);
		if(!ret) {
				alert(global_lang['application_popup']['invalid_number']);
			return false;
		}
	}
    cpApi_get_authId();
   
    var post_data = {"CfgType":"sms_action","type":"draft","cmd":"add","msg":msg,"phone_list":phonelist,"authID":auth_id};

    var request = $.ajax({
        url: "/webpost.cgi",
        type: "POST",
        data: JSON.stringify(post_data),
        dataType: "json"
    });
    
    request.done(function(responseData,textStatus, jqXHR ) {
		if(responseData.cmd_status == "Done"){
			alert(global_lang['alerts_set']['draft_save_success']);
		}else{
			alert(global_lang['alerts_set']['draft_save_fail']);
		}
    });
    request.fail(function(jqXHR, textStatus, errorThrown) {
           
    });
    request.always(function(responseData,textStatus, jqXHR ) {
            
    });

}

function application_api_smsdraftDelete(tag) {

     
    cpApi_get_authId();
   
    var post_data = {"CfgType":"sms_action","type":"draft","cmd":"del","tag":tag,"authID":auth_id};

    var request = $.ajax({
        url: "/webpost.cgi",
        type: "POST",
        data: JSON.stringify(post_data),
        dataType: "json"
    });
    
    request.done(function(responseData,textStatus, jqXHR ) {
    });
    request.fail(function(jqXHR, textStatus, errorThrown) {
           
    });
    request.always(function(responseData,textStatus, jqXHR ) {
            
    });

}

function application_api_smsdraftEdit(msg,phonelist,tag) {

     
    cpApi_get_authId();
   
    var post_data = {"CfgType":"sms_action","type":"draft","cmd":"edit","tag":tag,"msg":msg,"phone_list":phonelist,"authID":auth_id};

    var request = $.ajax({
        url: "/webpost.cgi",
        type: "POST",
        data: JSON.stringify(post_data),
        dataType: "json"
    });
    
    request.done(function(responseData,textStatus, jqXHR ) {
    	  alert(global_lang['alerts_set']['draft_edit_success']);
    });
    request.fail(function(jqXHR, textStatus, errorThrown) {
           
    });
    request.always(function(responseData,textStatus, jqXHR ) {
            
    });

}


function application_simDrafts_get2(){

		var startIndex = 0;
		var newIndex;
	  	for (var loop = 0; loop < global_contact_loop; loop++) {	
        startIndex = loop*10;
		newIndex = startIndex + 1;
		var request = $.ajax({
        url:"/data.ria?CfgType=sms_action&cont=draft&index="+startIndex,
        dataType: "json"
    	});
		request.done(function( responseData,textStatus, jqXHR ) {
							
				if ( loop == 0 ) {
						ui_config["app_getsimDrafts"] = responseData;
				} else {					
					$.each(responseData,function(key,value) {
							if (key != "total") {								
								ui_config["app_getsimDrafts"]["D"+newIndex] = value;
								newIndex = newIndex + 1;
							}
					});					
				}
				if (jsonKeysCount(responseData) < 11 || responseData.total == 10 ) {
					loop = 	global_contact_loop + 1;
				}
		});
		request.fail(function( jqXHR, textStatus, errorThrown) {     
		});
		request.always(function(responseData,textStatus, jqXHR ) {       
		});	
  }

}

function application_simDrafts_get(){

		var request = $.ajax({
        url:"/data.ria?CfgType=sms_action&cont=draft&index=0",
        dataType: "json",
		async: global_cploaded
    });
    request.done(function( responseData,textStatus, jqXHR ) {  
    		ui_config["app_getsimDrafts"] = responseData;
			
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {     
    	
    });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
}

/* To get the storage capcaity of sim/Device */
function application_simCapacity_get(){

		var request = $.ajax({
        url:"/data.ria?CfgType=sms_action&simsms_capacity",
        dataType: "json"
		});
		
    request.done(function( responseData,textStatus, jqXHR ) {  
			//console.log(responseData);			  
    		ui_config["app_getsimcapcity"] = responseData;
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {     
   });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
}

/*SMS store in SIM/Device */
function application_smsstorage_get(){

		var request = $.ajax({
        url:"/data.ria?FileID=10&sect_name=SMSC",
        dataType: "json"
		});
		
    request.done(function( responseData,textStatus, jqXHR ) {  
		ui_config["app_getsmsstore"] = responseData;
    });
    request.fail(function( jqXHR, textStatus, errorThrown) {     
   });
    request.always(function(responseData,textStatus, jqXHR ) {       
    });
}


/* application firewall portward delete function */
function application_api_portfwdDelete(tag) {

     
   	cpApi_get_authId();
   
 
    var post_data = {"act":"delete","sect":tag,"CfgType":"PF_action","authID":auth_id};
    var flag_result = false;
    var request = $.ajax({
        url: "/webpost.cgi",
        type: "POST",
        data: JSON.stringify(post_data),
        dataType: "json"
    });
    
    request.done(function(responseData,textStatus, jqXHR ) {
        flag_result = true;
    });
    request.fail(function(jqXHR, textStatus, errorThrown) {
    });
    request.always(function(responseData,textStatus, jqXHR ) {
            
    });
    return flag_result;
    
}


/* application firewall portward Add&Edit function */
function application_api_portfwdfilter(index){
	
		
	cpApi_get_authId();
   
   	ip_add = $("#tf1_pfsourceIp").val();
	
	var selProtocol = comboSelectedValueGet('tf1_pfprotocol');
	
	if ( selProtocol == "6" || selProtocol == "17" ) {		
		protocol = selProtocol;	
	} else {		
		protocol = $("#tf1_pfprotocolnum").val();		
	}
	
		dst_port1= $("#tf1_pfstartPort").val();
		dst_port2 = $("#tf1_pfendPort").val();	

    var post_data = {"FileID":7,"authID":auth_id};
	
	post_data["PF_"+index]={"inn_ip1":ip_add,"proto":protocol,"dst_port1":dst_port1,"dst_port2":dst_port2};

    var request = $.ajax({
        url: "/webpost.cgi",
        type: "POST",
        data: JSON.stringify(post_data),
        dataType: "json"
    });
    
    request.done(function(responseData,textStatus, jqXHR ) {
		if(responseData["cmd_status"] == "Fail"){
            if ($("#tf1_hid_portfwd_action").val() == "add") {
			  alert(global_lang['alerts_set']['add_failed']);
			  
		  }else{
              alert(global_lang['alerts_set']['update_failed']);
		  }
            
        }else{
		  applicationSettings_onloadportfwding();			
		  if ($("#tf1_hid_portfwd_action").val() == "add") {
			  alert(global_lang['alerts_set']['port_fwd_add_success']);
		  }else{
			  alert(global_lang['alerts_set']['port_fwd_update_success']);	
		  }
        }
    });
    request.fail(function(jqXHR, textStatus, errorThrown) {
    });
    request.always(function(responseData,textStatus, jqXHR ) {
            
    });
}

/* application firewall ipfilter delete function */
function application_api_ipfilterDelete(tag) {
    
     
   	cpApi_get_authId();
    var flag_result = false;
    
    var post_data = {"act":"delete","sect":tag,"CfgType":"IPFli_action","authID":auth_id};

    var request = $.ajax({
        url: "/webpost.cgi",
        type: "POST",
        data: JSON.stringify(post_data),
        dataType: "json"
    });
    
    request.done(function(responseData,textStatus, jqXHR ) {
        flag_result = true;
    });
    request.fail(function(jqXHR, textStatus, errorThrown) {
           
    });
    request.always(function(responseData,textStatus, jqXHR ) {
            
    });
    
    return flag_result;
    
}


/* application firewall ipfilter Add&Edit function */
function application_api_ipfilter(index,src_port_flag,dst_port_flag){
	
   
	cpApi_get_authId();
	
	section ="IPF_"+index;
	
    if(src_port_flag == 0)
    {
       $("#tf1_sourcePort1").val(0); 
       $("#tf1_sourcePort2").val(0); 
    }
    
    if(dst_port_flag == 0)
    {
       $("#tf1_destPort1").val(0); 
       $("#tf1_destPort2").val(0); 
    }
   
   	var post_data = {//"policy":$("#tf1_ipfilter_policy").val(),
   	                                  "policy": 1,
					  "proto":$("#tf1_ipfilter_protocol").val(),
					  "src_ip":$("#tf1_sourceIp").val(),
					  "src_ip_subnet":$("#tf1_subnetmask").val(),
					  "dst_ip":$("#tf1_destIp").val(),
					  "dst_ip_subnet":$("#tf1_destSubnetmask").val(),
					  "src_port1":$("#tf1_sourcePort1").val(),
					  "src_port2":$("#tf1_sourcePort2").val(),
					  "dst_port1":$("#tf1_destPort1").val(),
					  "dst_port2":$("#tf1_destPort2").val(),
					  "sec_name":section,"CfgType":"set_ipfilter","authID":auth_id}; 
					  
	
    var request = $.ajax({
        url: "/webpost.cgi",
        type: "POST",
        data: JSON.stringify(post_data),
        dataType: "json"
    });
    
    request.done(function(responseData,textStatus, jqXHR ) {
		
        if(responseData["cmd_status"] == "Fail"){
            if ($("#tf1_hid_ipfilter_action").val() == "add") {
                alert("IP Filter Add Failed.");
            }else{
                alert("IP Filter Update Failed.");	
            }
        }else{
            applicationSettings_onloadIPFilter();	
            if ($("#tf1_hid_ipfilter_action").val() == "add") {
                alert(global_lang['alerts_set']['ip_filter_add_success']);
            }else{
                alert(global_lang['alerts_set']['ip_filter_update_success']);	
            }
        }
		
    });
    request.fail(function(jqXHR, textStatus, errorThrown) {
        
    });
    request.always(function(responseData,textStatus, jqXHR ) {
            
    });
	
	
}

function application_api_sms_set(){

		cpApi_get_authId();
		
		var sel_location = radioCheckedValueGet('tf1_storein_sim');
		
		var post_data= {"CfgType":"sms_action","sms_into_sim":sel_location,"type":"smsc","authID":auth_id};
		
		var request = $.ajax({
	        url: "/webpost.cgi",
	        type: "POST",
	        data: JSON.stringify(post_data),
	        dataType: "json"
	    	});
	    	
    		request.done(function( responseData,textStatus, jqXHR ) {    
    			alert(global_lang['alerts_set']['sms_config_success']);
    		});
		    request.fail(function( jqXHR, textStatus, errorThrown) { 
		    	//alert("Invalid");
		    });
		    request.always(function(responseData,textStatus, jqXHR ) {	
		       
		    });

}


