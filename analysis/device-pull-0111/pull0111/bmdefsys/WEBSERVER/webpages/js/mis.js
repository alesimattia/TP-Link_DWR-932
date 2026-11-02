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
var mockUp = true;
if (mockUp == false) {
	var platformUrl = "platform.cgi?page=";
} else {
	var platformUrl = "";
}
var idSuffix = "Menu";

var DIALOG_FIELD_ID = "";

/**
 Define Global variables
 */
var ON_IMAGE = "button_on.png";
var OFF_IMAGE = "button_off.png";
var ON_ANCHOR = "enable-disable-on";
var OFF_ANCHOR = "enable-disable-off";
var ON_ANCHOR1 = "enable-disable1-on";
var OFF_ANCHOR1 = "enable-disable1-off";
var ON_ANCHOR2 = "enable-disable2-on";
var OFF_ANCHOR2 = "enable-disable2-off";
/*****
 Image Swaping for enable / disape buttons. Replacing checkbox with this for nice look.
 ******/
var onloadCall = function(func, data) {

	/* old image onload code start	*/
	$(document).on('click', '.enable-disable', function() {
		var imgSrc = this.src;
		if (imgSrc.indexOf("_off") != -1)/*off is found else on is found */
		{
			this.src = this.src.replace("_off", "_on");
		} else {
			this.src = this.src.replace("_on", "_off");
		}

		if (func) {
			func(data, this);
		}
	});
	$(document).on('click', '.enable-disable1', function() {
		var imgSrc = this.src;
		if (imgSrc.indexOf("_off") != -1)/*off is found else on is found */
		{
			this.src = this.src.replace("_off", "_on");
		} else {
			this.src = this.src.replace("_on", "_off");
		}

		if (func) {
			func(data, this);
		}
	});
	/* old image onload code End	*/

	/* New Live onload code start	*/
	$(document).on('click', '.enable-disable-off', function() {
		$(this).removeClass(OFF_ANCHOR);
		$(this).addClass(ON_ANCHOR);
		if (func) {
			func(data, this);
		}
	});
	$(document).on('click', '.enable-disable-on', function() {
		$(this).removeClass(ON_ANCHOR);
		$(this).addClass(OFF_ANCHOR);
		if (func) {
			func(data, this);
		}
	});
	$(document).on('click', '.enable-disable1-off', function() {
		$(this).removeClass(OFF_ANCHOR1);
		$(this).addClass(ON_ANCHOR1);
		if (func) {
			func(data, this);
		}
	});
	$(document).on('click', '.enable-disable1-on', function() {
		$(this).removeClass(ON_ANCHOR1);
		$(this).addClass(OFF_ANCHOR1);
		if (func) {
			func(data, this);
		}
	});
	/* New Live onload code End	*/

};

var onloadCall2 = function(func, data) {
	/* New Live onload code start	*/
	$(document).on('click', '.enable-disable2-off', function() {
		$(this).removeClass(OFF_ANCHOR2);
		$(this).addClass(ON_ANCHOR2);
		if (func) {
			func(data, this);
		}
	});
	$(document).on('click', '.enable-disable2-on', function() {
		$(this).removeClass(ON_ANCHOR2);
		$(this).addClass(OFF_ANCHOR2);
		if (func) {
			func(data, this);
		}
	});
	/* New Live onload code End	*/

};

/**
 * This function for enable or disable fields while clicking on on off image
 * Onclick event
 * @method enableTextFieldByAnchorClick
 * @param imgId - image Id
 * @param fieldIds - space separated field names
 * @param brk - space separated break names
 */
function enableTextFieldByAnchorClick(imgId, fieldIds, brk, blocks) {
	var imgObj = document.getElementById(imgId);
	if (imgObj) {
		var currentClass = $(imgObj).attr("class");

		if (currentClass == ON_ANCHOR) {
			fieldStateChangeWr('', '', fieldIds, '');
			vidualDisplay(fieldIds, 'configRow');
			vidualDisplay(brk, 'break');
			vidualDisplay(blocks, '');
		} else {
			fieldStateChangeWr(fieldIds, '', '', '');
			vidualDisplay(fieldIds, 'hide');
			vidualDisplay(brk, 'hide');
			vidualDisplay(blocks, 'hide');

		}
	}
}

/**
 * This function for enable or disable fields while clicking on on off image
 * Onclick event
 * @method disableTextFieldByAnchorClick
 * @param imgId - image Id
 * @param fieldIds - space separated field names
 * @param brk - space separated break names
 */
function disableTextFieldByAnchorClick(imgId, fieldIds, brk, blocks) {
	var imgObj = document.getElementById(imgId);
	if (imgObj) {
		var currentClass = $(imgObj).attr("class");
		if (currentClass == OFF_ANCHOR) {
			fieldStateChangeWr('', '', fieldIds, '');
			vidualDisplay(fieldIds, 'configRow');
			vidualDisplay(brk, 'break');
			vidualDisplay(blocks, '');
		} else {
			fieldStateChangeWr(fieldIds, '', '', '');
			vidualDisplay(fieldIds, 'hide');
			vidualDisplay(brk, 'hide');
			vidualDisplay(blocks, 'hide');
		}
	}
}

/*****
 For Main Menu Highlight.
 *****/
function mmSel(mmSelId) {
	var identity = document.getElementById(mmSelId);
	identity.id = "Selected";
}

/*****
 Modal dialog show
 *****/
function ShowDialog(modal, dialogId, overlayId) {
	$("#" + overlayId).show();
	$("#" + dialogId).fadeIn(300);
	if (modal) {
		$("#" + overlayId).unbind("click");
	} else {
		$("#" + overlayId).click(function(e) {
			HideDialog();
		});
	}
}

/*****
 Modal dialog hide
 *****/
function HideDialog(dialogId, overlayId) {
	$("#" + overlayId).hide();
	$("#" + dialogId).fadeOut(300);
}

/**
 * This function in called on document ready and sets events on the respective fields to pop and hide divs
 * @method setOnclickDialogs
 * @param onclkBtn - id of add button
 * @param closeBtn - id of close button
 * @param dialogDivId - id of dialog div
 * @param overlayDivId - id of overlay div
 */
function setOnclickDialogs(onclkBtn, closeBtn, dialogDivId, overlayDivId) {
	$("#" + onclkBtn).click(function(e) {
		ShowDialog(true, dialogDivId, overlayDivId);
		e.preventDefault();
	});

	$("#" + closeBtn).click(function(e) {
		HideDialog(dialogDivId, overlayDivId);
		e.preventDefault();
	});
}

/**
 * This function should be called on when doing rowwise operations
 * @method performSelectedOperation
 * @param  OpInfoObj this object contains following information
 operation - operation to be performed for ex - delete/enable/disable
 tableId - id of table to which row belongs
 checkId - its a hidden field id. Based on its value number of rows to be
 deleted is defined. If its value is "0" then operation on one row
 takes place. If its value is 1 then operation on all row takes place.
 Value for this id is set when select all check box is checked on unchecked
 contextRowId - This is the id of row on which user right clicks
 url - file path which will handle ajax request and perform operations
 skipHeadIdRow - This should be the id of head section row. This row is out of consideration
 when rows on which action needs to take place is found
 */
function performDeleteOperation(OpInfoObj) {
	var selectedData = null;
	var jsondata = null;
	var postData = null;
	// Check if the select all check box is selected
	var checkIdObj = document.getElementById(OpInfoObj.checkId);
	if (checkIdObj && checkIdObj.checked) {
		// Multiple delete operation
		//skipHeadIdRow id will be heading row that is part of thead
		//true is for multiple selection
		selectedData = getDataForAction(OpInfoObj.tableId, true, OpInfoObj.skipHeadIdRow);
	} else {
		// Single delete operation
		//false is for single selection
		//contextRowId is the id of row on which contextmenu event is generated
		selectedData = getDataForAction(OpInfoObj.contextRowId, false);
	}
	//Convert selected data to string
	jsondata = JSON.stringify(selectedData);
	postData = ( {
		rows : jsondata,
		operationName : OpInfoObj.operation
	});
	$.post(OpInfoObj.url, postData, function(data) {
		//Write a call backback function
	});
}

/**
 * This function should be called on when doing rowwise operations
 * @method performSelectedOperation
 * @param  OpInfoObj this object contains following information
 operation - operation to be performed for ex - delete/enable/disable
 tableId - id of table to which row belongs
 checkId - its a hidden field id. Based on its value number of rows to be
 deleted is defined. If its value is "0" then operation on one row
 takes place. If its value is 1 then operation on all row takes place.
 Value for this id is set when select all check box is checked on unchecked
 contextRowId - This is the id of row on which user right clicks
 url - file path which will handle ajax request and perform operations
 skipHeadIdRow - This should be the id of head section row. This row is out of consideration
 when rows on which action needs to take place is found
 */
function performEditOperation(OpInfoObj) {
	var selectedData = null;
	var jsondata = null;
	var postData = null;
	cleanFields(OpInfoObj.editFldObj)
	//contextRowId is the id of row on which contextmenu event is generated
	selectedData = getDataForAction(OpInfoObj.contextRowId, false);

	//Convert selected data to string
	jsondata = JSON.stringify(selectedData);
	postData = ( {
		rows : jsondata,
		operationName : OpInfoObj.operation
	});
	$.post(OpInfoObj.url, postData, function(data) {
		//Write a call backback function
		fillEditFlds(data, OpInfoObj.editFldObj)
	}, 'json');
}

/**
 * This function is called from performSelectedOperation to get the data
 * @method getDataForAction
 * @param actionIds - table id or contextid
 * @param state - true is multiple row operation and false is single row operation
 * @param skipHeadIdRow - skip row id in head tag
 */
function getDataForAction(actionIds, state, skipHeadRowId) {
	var dataArr = [];
	var dataObj = null;
	if (!state) {
		dataObj = {};
		dataObj["1"] = actionIds;
		dataArr.push(dataObj);
	} else {
		var tableObj = document.getElementById(actionIds);
		var trArr = tableObj.getElementsByTagName('tr');
		if (trArr) {
			for (var i = 0; i < trArr.length; i++) {
				dataObj = {};
				if (trArr[i].id != skipHeadRowId) {
					dataObj[i] = trArr[i].id;
					dataArr.push(dataObj);
				}
			}
		}
	}
	return dataArr;
}

/**
 * This function sets the value of the hidden field id
 * @method setSelectAll
 * @param thisObjId - selected checkbox id
 * @param editId - prefixId of the edit field
 function setSelectAll (thisObjId, editId) {
 var thisObj = document.getElementById (thisObjId);
 var editIdObj = document.getElementById (editId + idSuffix);
 if (thisObj && thisObj.checked) {
 editIdObj.style.display = "none";
 }
 else {
 editIdObj.style.display = "block";
 }
 }*/
/**
 * This function sets the value of the hidden field id
 * @method setSelectAll
 * @param thisObjId - selected checkbox id
 * @param editId - prefixId of the edit field
 */
function setSelectAll(thisObjId, editId) {
	var thisObj = document.getElementById(thisObjId);
	if (!thisObj)
		return;
	if (!editId)
		return;
	var objIdArr = editId.split(" ");
	for (idx in objIdArr) {
		var editIdObj = document.getElementById(objIdArr[idx] + idSuffix);
        /* Only if editIdObj is defined , as we are removing some menu items in showMenu option in context Rightmenu */
        if (editIdObj) {
		    if (thisObj && thisObj.checked) {
			    editIdObj.style.display = "none";
		    } else {
			    editIdObj.style.display = "block";
		    }
        }
	}
}

/**
 * This function fills the edit fields with json data
 * @method fillEditFlds
 * @param data - json data returned from server
 * @param idNameMap - name-id map object
 */
function fillEditFlds(data, idNameMap) {
	for (var prop in data) {
		if (data[prop]) {
			var obj = document.getElementById(idNameMap[prop]);
			if (obj) {
				obj.value = data[prop];
			}
		}
	}
}

/**
 * This function cleans the edit fields
 * @method cleanFields
 * @param idNameMap - name-id map object
 */
function cleanFields(idNameMap) {
	for (var prop in idNameMap) {
		if (idNameMap[prop]) {
			var obj = document.getElementById(idNameMap[prop]);
			if (obj) {
				obj.value = '';
			}
		}
	}
}

/**
 * This function suffixes 'Menu' on fields of cloned object
 * @method setMenuIds
 */
function setMenuIds() {
	var conetxtMenuObj = document.getElementById('jqContextMenu');
	var liObjs = conetxtMenuObj.getElementsByTagName('li');
	for (var i = 0; i < liObjs.length; i++) {
		liObjs[i].id = liObjs[i].id + idSuffix;
	}
	var inputObjs = conetxtMenuObj.getElementsByTagName('input');
	for (var i = 0; i < inputObjs.length; i++) {
		inputObjs[i].id = inputObjs[i].id + idSuffix;
	}
}

/* New trim function in javascript */

function trim(s) {
	var l = 0;
	var r = s.length - 1;
	while (l < s.length && s[l] == ' ') {
		l++;
	}
	while (r > l && s[r] == ' ') {
		r -= 1;
	}
	return s.substring(l, r + 1);
}

/* New function to show tool bar text for clear instructions */

function dataRightClick(rBool, tabName) {

	var rightClickOn = 'Right click on record to get more options';

	var rightClickOff = 'No right click options';

	if (tabName)
		var tableName = tabName;
	else
		var tableName = "recordsData";

	if (rBool == true) {

		$("#" + tableName + "_length label").append('<span class="ctoolbar">[' + rightClickOn + ']</span>');

	} else {

		$("#" + tableName + "_length label").append('<span class="ctoolbar">[' + rightClickOff + ']</span>');

	}

}

// Returns the version of Internet Explorer or a -1
// (indicating the use of another browser).

function getInternetExplorerVersion() {
	var rv = -1;
	// Return value assumes failure.
	if (navigator.appName == 'Microsoft Internet Explorer') {
		var ua = navigator.userAgent;
		var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
		if (re.exec(ua) != null)
			rv = parseFloat(RegExp.$1);
	}
	return rv;
}

/* set the version */
var getIEVersion = getInternetExplorerVersion();

/* If IE less then 9 add HTML 5 elements */
if (getIEVersion > 0 && getIEVersion < 9) {
	var e = ("abbr,article,aside,audio,canvas,close,datalist,details,figure,footer,header,hgroup,mark,menu,meter,nav,output,progress,section,time,video,figcaption,summary").split(',');

	for (var i = 0; i < e.length; i++) {
		document.createElement(e[i]);
	}
}

/* Determine browser and version number */
var browser_number = 0;
function judgment_browser(){
	var browser = getBrowserInfo();
	var verinfo = (browser+"").replace(/[^0-9.]/ig,"");
	verinfo = verinfo.substring(0,4);
	if(verinfo < 40 && browser_number == 1){
		$("#tf1_siminboxTblbody h4").css("margin-top","40px");
		$("#tf1_simdraftTblbody h4").css("margin-top","40px");
		$("#tf1_tmpl_setupinfo h4").css("margin-top","40px");
	}else{
		$("#tf1_siminboxTblbody h4").css("margin-top","12px");
		$("#tf1_simdraftTblbody h4").css("margin-top","12px");
		$("#tf1_tmpl_setupinfo h4").css("margin-top","12px");
	}

}
function getBrowserInfo(){
	  var agent = navigator.userAgent.toLowerCase();
	  var regStr_ie = /msie [\d.]+;/gi ;
	  var regStr_ff = /firefox\/[\d.]+/gi
	  var regStr_chrome = /chrome\/[\d.]+/gi ;
	  var regStr_saf = /safari\/[\d.]+/gi ;
	  //IE11以下
	  if(agent.indexOf("msie") > 0)
	  {
		  return agent.match(regStr_ie) ;
	  }
	  //IE11版本中不包括MSIE字段
	  if(agent.indexOf("trident") > 0&&agent.indexOf("rv") > 0){
		  return "IE " + agent.match(/rv:(\d+\.\d+)/) [1];
	  }
	  //firefox
	  if(agent.indexOf("firefox") > 0)
	  {
		  browser_number = 1;
		  return agent.match(regStr_ff) ;
	  }
	  //Chrome
	  if(agent.indexOf("chrome") > 0)
	  {
		  return agent.match(regStr_chrome) ;
	  }
	  //Safari
	  if(agent.indexOf("safari") > 0 && agent.indexOf("chrome") < 0)
	  {
		  return agent.match(regStr_saf) ;
	  }
}

/**
 * Function for Add or Edit Form fields
 * @method openForm
 * buttonPrefix: submit button we need to send ex: button.edit.users.users
 * rowId: Record id
 * dialogId: popup id
 * rowPrefix: Row Prefix ex: users
 * pageName: Page Name ex: users.html
 */

function openPopup(event, frameId, buttonPrefix, rowId, dialogId, contentId, rowPrefix, pageName, popupContent, onloadfun, popupTabContentId) {

	IE_Chrome(event);
	loginApi_check_auth();
	var leftLink;
	$(".leftMenu li a").each(function(i, obj) {

		if ($(this).attr("content-id") == popupContent) {
			$(this).attr("class", "active");
		} else {
			$(this).attr("class", "");
		}
	});

	$("#" + dialogId).html($("#" + frameId).html());
	ShowDialog(true, dialogId, 'tf1_overlay');

	var leftPx = $(window).innerWidth() / 2 - $(".configDialog").width() / 2;
	leftPx = Math.round(leftPx);
	var topPx = $(window).innerHeight() / 2 - $(".configDialog").height() / 2;
	topPx = Math.round(topPx);
	$(".configDialog").css('left', leftPx + 'px');
	$(".configDialog").css('top', topPx + 'px');
	$("#" + dialogId).show();

	var rightContentDivId = "#tf1_dialog #" + contentId + " div.dialogMidArea div.popupContainer div.rightContent div.contentArea";
	rowId = rowId.toString();

	if (rowId != '-1') {
		rowId = rowId.replace(rowPrefix, "");
		dataString = buttonPrefix + "." + rowId + "=edit&thispage=" + pageName + "&configRowId=" + rowId;
	} else {
		dataString = buttonPrefix + "." + rowId + "=add&thispage=" + pageName + "&configRowId=" + rowId;
	}
	dataStringArry = dataString.split("&");
	dataObj = new Object();
	var callTemplate = false;
	
	if (pageName == "wifiPopup.html" && global_wifi_popup_content == "" ) {
		callTemplate = true;
	} else if (pageName == "internetPopup.html" && global_internet_popup_content == "" ) {
		callTemplate = true;
	} else if (pageName == "applicationPopup.html" && global_application_popup_content == "" ) {
		callTemplate = true;
	} else if (pageName == "systemManagementPopup.html" && global_system_popup_content == "" ) {
		callTemplate = true;
	} else if (pageName == "helpPopup.html" && global_help_popup_content == "" ) {
		callTemplate = true;
	} else if (pageName == "setupWizard.html" && global_setupWizard_popup_content == "" ) {
		callTemplate = true;
	} 
	
	if (callTemplate == true)  {
		
		var request = $.ajax({
        url: platformUrl + pageName,        
        dataType: "html",
		type: "GET"
		});
		request.done(function( response, textStatus, jqXHR ) {
			if (pageName == "wifiPopup.html") {
				global_wifi_popup_content = response;
			} else if (pageName == "internetPopup.html") {
				global_internet_popup_content = response;
			} else if (pageName == "applicationPopup.html") {
				global_application_popup_content = response;
			} else if (pageName == "systemManagementPopup.html") {
				global_system_popup_content = response;
			} else if (pageName == "helpPopup.html") {
				global_help_popup_content = response;
			} else if (pageName == "setupWizard.html") {
				global_setupWizard_popup_content = response;
			}
		});
		request.fail(function( jqXHR, textStatus, errorThrown) {	 
		});
		request.always(function(responseData,textStatus, jqXHR ) {       
		});
		
		 	
	} 
	
	  $("#tf1_hid_popup").html('');
	  if (pageName == "wifiPopup.html") {
		  $("#tf1_hid_popup").html(global_wifi_popup_content);
	  } else if (pageName == "internetPopup.html") {
		  $("#tf1_hid_popup").html(global_internet_popup_content);
	  } else if (pageName == "applicationPopup.html") {
		  $("#tf1_hid_popup").html(global_application_popup_content);
	  } else if (pageName == "systemManagementPopup.html") {
		  $("#tf1_hid_popup").html(global_system_popup_content);
	  } else if (pageName == "helpPopup.html") {
		  $("#tf1_hid_popup").html(global_help_popup_content);
	  } else if (pageName == "setupWizard.html") {
		  $("#tf1_hid_popup").html(global_setupWizard_popup_content);
	  }
	   
	  /*Language Settings :Start */
	  	  if (callTemplate == true) {		  	  
		  	$("#tf1_hid_popup").find('[data-localize]').each(function(index){         
          		var str = $(this).attr('data-localize');
          		str = str.replace(/\./g, "\'][\'");
          		str = "global_lang['"+str+"']";
          		//console.log(eval(str));
    			if ($(this).attr("placeholder")) {
          			$(this).attr("placeholder",eval(str));
          		} else if ($(this).attr("type")) {
          			$(this).val(eval(str));
          		} else {
    				$(this).html(eval(str));
    			}
			});

		  	if (pageName == "wifiPopup.html") {
		  		global_wifi_popup_content = $("#tf1_hid_popup").html();
			  } else if (pageName == "internetPopup.html") {
				 global_internet_popup_content= $("#tf1_hid_popup").html();		  
			  } else if (pageName == "applicationPopup.html") {
				  global_application_popup_content= $("#tf1_hid_popup").html();
			  } else if (pageName == "systemManagementPopup.html") {
				  global_system_popup_content = $("#tf1_hid_popup").html();
			  } else if (pageName == "helpPopup.html") {
				  global_help_popup_content = $("#tf1_hid_popup").html();
			  } else if (pageName == "setupWizard.html") {
				  global_setupWizard_popup_content = $("#tf1_hid_popup").html();
			  }
			}
	  /*Language Settings :End */
	   
	  $(rightContentDivId).show();		 
	  $(rightContentDivId).html($("#"+popupContent).html());
	  $("#tf1_hid_popup").html('');
	

	  if (onloadfun != '')
		  eval(onloadfun + "()");

	  if (popupTabContentId != "undefined" && popupTabContentId != "") {
		  $("#" + popupTabContentId).trigger("click");
	  }
	

}

function openLeftMenu(event, buttonPrefix, dialogId, contentId, menuContent, pageName, onloadfun) {
	
	IE_Chrome(event);
	
	loginApi_check_auth();
	$(".leftMenu li a").each(function(i, obj) {
		$(this).attr("class", "");
	});

	$(event.target).attr('class', 'active');

	dataString = buttonPrefix + "=show&thispage=" + pageName;
		dataObj = new Object();
	var rightContentDivId = dialogId + " #" + contentId + " div.dialogMidArea div.popupContainer div.rightContent div.contentArea";
	
	var callTemplate = false;
	
	if (pageName == "wifiPopup.html" && global_wifi_popup_content == "" ) {
		callTemplate = true;
	} else if (pageName == "internetPopup.html" && global_internet_popup_content == "" ) {
		callTemplate = true;
	} else if (pageName == "applicationPopup.html" && global_application_popup_content == "" ) {
		callTemplate = true;
	} else if (pageName == "systemManagementPopup.html" && global_system_popup_content == "" ) {
		callTemplate = true;
	} else if (pageName == "helpPopup.html" && global_help_popup_content == "" ) {
		callTemplate = true;
	} else if (pageName == "setupWizard.html" && global_setupWizard_popup_content == "" ) {
		callTemplate = true;
	} 
	
	if (callTemplate == true)  {
		
		var request = $.ajax({
        url: platformUrl + pageName,        
        dataType: "html",
		type: "GET"
		});
		request.done(function( response, textStatus, jqXHR ) {
			if (pageName == "wifiPopup.html") {
				global_wifi_popup_content = response;
			} else if (pageName == "internetPopup.html") {
				global_internet_popup_content = response;
			} else if (pageName == "applicationPopup.html") {
				global_application_popup_content = response;
			} else if (pageName == "systemManagementPopup.html") {
				global_system_popup_content = response;
			} else if (pageName == "helpPopup.html") {
				global_help_popup_content = response;
			} else if (pageName == "setupWizard.html") {
				global_setupWizard_popup_content = response;
			}
		});
		request.fail(function( jqXHR, textStatus, errorThrown) {	 
		});
		request.always(function(responseData,textStatus, jqXHR ) {       
		});
		
		 	
	} 
	
	  $("#tf1_hid_popup").html('');
	  if (pageName == "wifiPopup.html") {
		  $("#tf1_hid_popup").html(global_wifi_popup_content);
	  } else if (pageName == "internetPopup.html") {
		  $("#tf1_hid_popup").html(global_internet_popup_content);
	  } else if (pageName == "applicationPopup.html") {
		  $("#tf1_hid_popup").html(global_application_popup_content);
	  } else if (pageName == "systemManagementPopup.html") {
		  $("#tf1_hid_popup").html(global_system_popup_content);
	  } else if (pageName == "helpPopup.html") {
		  $("#tf1_hid_popup").html(global_help_popup_content);
	  } else if (pageName == "setupWizard.html") {
		  $("#tf1_hid_popup").html(global_setupWizard_popup_content);
	  }
	  
	   /*Language Settings :Start */

	    


	  	  if (callTemplate == true) {

		  	$("#tf1_hid_popup").find('[data-localize]').each(function(index){         
          		var str = $(this).attr('data-localize');
          		str = str.replace(/\./g, "\'][\'");
          		//alert(str);
          		str = "global_lang['"+str+"']";
          		//console.log(eval(str));
    			if ($(this).attr("placeholder")) {
          			$(this).attr("placeholder",eval(str));
          		} else if ($(this).attr("type")) {
          			$(this).val(eval(str));
          		} else {
    				$(this).html(eval(str));
    			}
		});

		  	if (pageName == "wifiPopup.html") {
		  		global_wifi_popup_content = $("#tf1_hid_popup").html();
			  } else if (pageName == "internetPopup.html") {
				 global_internet_popup_content= $("#tf1_hid_popup").html();		  
			  } else if (pageName == "applicationPopup.html") {
				  global_application_popup_content= $("#tf1_hid_popup").html();
			  } else if (pageName == "systemManagementPopup.html") {
				  global_system_popup_content = $("#tf1_hid_popup").html();
			  } else if (pageName == "helpPopup.html") {
				  global_help_popup_content = $("#tf1_hid_popup").html();
			  } else if (pageName == "setupWizard.html") {
				  global_setupWizard_popup_content = $("#tf1_hid_popup").html();
			  }
			}
	  /*Language Settings :End */
	   

	  $("#" + rightContentDivId).show();		 
	  $("#" + rightContentDivId).html($("#"+menuContent).html());
	  $("#tf1_hid_popup").html('');
	  
	  if (onloadfun != '') {
			eval(onloadfun + "()");
	  }
	
	
     /*
	$("#" + rightContentDivId).load(platformUrl + pageName  + " #" + menuContent, function(response, status, hr) {
		 
		if (response.search("button.login.Users") != -1) {
			$("#" + rightContentDivId).hide();
			$("#" + rightContentDivId).html(response);
			if ($(".midWidth2 div.msgError p").length > 0 && $(".midWidth2 div.msgError p").html() != '') {
				window.location = "platform.cgi?page=index.html&redirectStatusMessage=" + $(".midWidth2 div.msgError p").html();
			} else {
				window.location = "platform.cgi?page=index.html";
			}
		}

		if (onloadfun != '')
			eval(onloadfun + "()");
	}); 
	
	*/

}

function gotoLink(event, buttonPrefix, dialogId, contentId, menuContent, pageName, onloadfun) {
	IE_Chrome(event);
	loginApi_check_auth

	dataString = buttonPrefix + "=show&thispage=" + pageName;
	var rightContentDivId = contentId + " div.dialogMidArea div.popupContainer div.rightContent div.contentArea";

	 var callTemplate = false;
	
	if (pageName == "wifiPopup.html" && global_wifi_popup_content == "" ) {
		callTemplate = true;
	} else if (pageName == "internetPopup.html" && global_internet_popup_content == "" ) {
		callTemplate = true;
	} else if (pageName == "applicationPopup.html" && global_application_popup_content == "" ) {
		callTemplate = true;
	} else if (pageName == "systemManagementPopup.html" && global_system_popup_content == "" ) {
		callTemplate = true;
	} else if (pageName == "helpPopup.html" && global_help_popup_content == "" ) {
		callTemplate = true;
	} else if (pageName == "setupWizard.html" && global_setupWizard_popup_content == "" ) {
		callTemplate = true;
	} 
	
	if (callTemplate == true)  {
		
		var request = $.ajax({
        url: platformUrl + pageName,        
        dataType: "html",
		type: "GET"
		});
		request.done(function( response, textStatus, jqXHR ) {
			if (pageName == "wifiPopup.html") {
				global_wifi_popup_content = response;
			} else if (pageName == "internetPopup.html") {
				global_internet_popup_content = response;
			} else if (pageName == "applicationPopup.html") {
				global_application_popup_content = response;
			} else if (pageName == "systemManagementPopup.html") {
				global_system_popup_content = response;
			} else if (pageName == "helpPopup.html") {
				global_help_popup_content = response;
			} else if (pageName == "setupWizard.html") {
				global_setupWizard_popup_content = response;
			}
		});
		request.fail(function( jqXHR, textStatus, errorThrown) {	 
		});
		request.always(function(responseData,textStatus, jqXHR ) {       
		});
		
		 	
	} 
	
	  $("#tf1_hid_popup").html('');
	  if (pageName == "wifiPopup.html") {
		  $("#tf1_hid_popup").html(global_wifi_popup_content);
	  } else if (pageName == "internetPopup.html") {
		  $("#tf1_hid_popup").html(global_internet_popup_content);
	  } else if (pageName == "applicationPopup.html") {
		  $("#tf1_hid_popup").html(global_application_popup_content);
	  } else if (pageName == "systemManagementPopup.html") {
		  $("#tf1_hid_popup").html(global_system_popup_content);
	  } else if (pageName == "helpPopup.html") {
		  $("#tf1_hid_popup").html(global_help_popup_content);
	  } else if (pageName == "setupWizard.html") {
		  $("#tf1_hid_popup").html(global_setupWizard_popup_content);
	  }

	    
	  	 if (callTemplate == true) {

	  	  	/*Language Settings :Start */  	  
		  	$("#tf1_hid_popup").find('[data-localize]').each(function(index){         
          		var str = $(this).attr('data-localize');
          		str = str.replace(/\./g, "\'][\'");
          		//alert(str);
          		str = "global_lang['"+str+"']";
          		//console.log(eval(str));
    			if ($(this).attr("placeholder")) {
          			$(this).attr("placeholder",eval(str));
          		} else if ($(this).attr("type")) {
          			$(this).val(eval(str));
          		} else {
    				$(this).html(eval(str));
    			}
			});
			/*Language Settings :End */

		  	if (pageName == "wifiPopup.html") {
		  		global_wifi_popup_content = $("#tf1_hid_popup").html();
			  } else if (pageName == "internetPopup.html") {
				 global_internet_popup_content= $("#tf1_hid_popup").html();		  
			  } else if (pageName == "applicationPopup.html") {
				  global_application_popup_content= $("#tf1_hid_popup").html();
			  } else if (pageName == "systemManagementPopup.html") {
				  global_system_popup_content = $("#tf1_hid_popup").html();
			  } else if (pageName == "helpPopup.html") {
				  global_help_popup_content = $("#tf1_hid_popup").html();
			  } else if (pageName == "setupWizard.html") {
				  global_setupWizard_popup_content = $("#tf1_hid_popup").html();
			  }
		}
	  
	   
	  
	  $("#" + rightContentDivId).show();		 
	  $("#" + rightContentDivId).html($("#"+menuContent).html());
	  $("#tf1_hid_popup").html('');
	  
	  if (onloadfun != '') {
			eval(onloadfun + "()");
	  }

}


/**
 * Function for delete one or more records
 * @method deleteRows
 * buttonPrefix: submit button we need to send ex: button.edit.users.users
 * frmId: Form Name
 * rowId: Record id
 * selBoxId: Select Box Id
 * dialogId: popup id
 * rowPrefix: Row Prefix ex: users
 * checkBoxPrefix: Check box Prefix ex: users
 */
function deleteRows(buttonPrefix, frmId, rowId, selBoxId, dialogId, rowPrefix, checkBoxPrefix) {
	$("#" + dialogId).html('');

	if ($("#" + selBoxId + "Menu").is(':checked')) {
		var childrenRows = $("#" + rowId).parent().children('tr');
		for (var i = 0; i < childrenRows.length; i++) {
			var thisElement = $(childrenRows[i]);
			thisRowId = thisElement.attr('id');

			thisRowId = thisRowId.replace(rowPrefix, "");
			$("#" + dialogId).append('<input type="hidden" name="' + checkBoxPrefix + '.checkbox" value="' + thisRowId + '">');
		}
	} else {
		rowId = rowId.replace(rowPrefix, "");
		$("#" + dialogId).append('<input type="hidden" name="' + checkBoxPrefix + '.checkbox" value="' + rowId + '">');
	}

	$("#" + dialogId).append('<input type="hidden" name="' + buttonPrefix + '" value="delete">');

	$("#" + frmId).submit();
}

/**
 * Function for calling enable/disable form submit
 * @method changeRowStauts
 * status: Status to change
 * frmId: Form Name
 * rowId:  Record id
 * dialogId: popup id
 * rowPrefix: Row Prefix ex: users
 * checkBoxPrefix: CheckBox Prefix ex: users
 * buttonSuffix: Button Suffix
 */
function changeRowStauts(status, frmId, rowId, dialogId, rowPrefix, checkBoxPrefix, buttonSuffix, selBoxId) {
	$("#" + dialogId).html('');
	if (selBoxId) {
		if ($("#" + selBoxId + "Menu").is(':checked')) {
			var childrenRows = $("#" + rowId).parent().children('tr');
			for (var i = 0; i < childrenRows.length; i++) {
				var thisElement = $(childrenRows[i]);
				thisRowId = thisElement.attr('id');
				thisRowId = thisRowId.replace(rowPrefix, "");
				$("#" + dialogId).append('<input type="hidden" name="' + checkBoxPrefix + '.checkbox" value="' + thisRowId + '">');
			}
		} else {
			rowId = rowId.replace(rowPrefix, "");
			$("#" + dialogId).append('<input type="hidden" name="' + checkBoxPrefix + '.checkbox" value="' + rowId + '">');
		}
	} else {
		rowId = rowId.replace(rowPrefix, "");
		$("#" + dialogId).append('<input type="hidden" name="' + checkBoxPrefix + '.checkbox" value="' + rowId + '">');
	}
	$("#" + dialogId).append('<input type="hidden" name="button.' + status + '.' + buttonSuffix + '" value="' + status + '">');
	$("#" + frmId).submit();
}

/**
 * Function for resetting Image based on hidden form field of Image
 * @method resetImgOnOff
 */
function resetImgOnOff(frmId) {

	/* old */
	$("#" + frmId + " img.enable-disable").each(function() {
		var imgSrc = this.src;
		if ($(this).next().val() == 0) {
			this.src = this.src.replace("_on", "_off");
		} else {
			this.src = this.src.replace("_off", "_on");
		}
	});
    $("#" + frmId + " img.enable-disable1").each(function() {
		var imgSrc = this.src;
		if ($(this).next().val() == 0) {
			this.src = this.src.replace("_on", "_off");
		} else {
			this.src = this.src.replace("_off", "_on");
		}
	});
	/* new */
	$("#" + frmId + " a.enable-disable-off").each(function() {
		if ($(this).next().val() == 1) {
			$(this).removeClass(OFF_ANCHOR);
			$(this).addClass(ON_ANCHOR);
		}
	});
	$("#" + frmId + " a.enable-disable-on").each(function() {
		if ($(this).next().val() == 0) {
			$(this).removeClass(ON_ANCHOR);
			$(this).addClass(OFF_ANCHOR);
		}
	});
	$("#" + frmId + " a.enable-disable1-off").each(function() {
		if ($(this).next().val() == 1) {
			$(this).removeClass(OFF_ANCHOR1);
			$(this).addClass(ON_ANCHOR1);
		}
	});
	$("#" + frmId + " a.enable-disable1-on").each(function() {
		if ($(this).next().val() == 0) {
			$(this).removeClass(ON_ANCHOR1);
			$(this).addClass(OFF_ANCHOR1);
		}
	});
}

/**
 * Function for Set all hidden fields ON/OFF as per image src
 * @method setHiddenChks
 */

function setHiddenChks(frmId) {

	/* old */
	$("#" + frmId + " img.enable-disable").each(function() {
		var imgSrc = this.src;
		if (imgSrc.indexOf("_off") != -1)/*off is found else on is found */
		{
			$(this).next().val(0);
		} else {
			$(this).next().val(1);
		}
	});
    $("#" + frmId + " img.enable-disable1").each(function() {
		var imgSrc = this.src;
		if (imgSrc.indexOf("_off") != -1)/*off is found else on is found */
		{
			$(this).next().val(0);
		} else {
			$(this).next().val(1);
		}
	});
	/* new */
	$("#" + frmId + " a.enable-disable-off").each(function() {
		$(this).next().val(0);
	});
	$("#" + frmId + " a.enable-disable-on").each(function() {
		$(this).next().val(1);
	});
	$("#" + frmId + " a.enable-disable1-off").each(function() {
		$(this).next().val(0);
	});
	$("#" + frmId + " a.enable-disable1-on").each(function() {
		$(this).next().val(1);
	});
}

function print_r(theObj) {
	if (theObj.constructor == Array || theObj.constructor == Object) {
		document.write("<ul>")
		for (var p in theObj) {
			if (theObj[p].constructor == Array || theObj[p].constructor == Object) {
				document.write("<li>[" + p + "] => " + typeof (theObj) + "</li>");
				document.write("<ul>")
				print_r(theObj[p]);
				document.write("</ul>")
			} else {
				document.write("<li>[" + p + "] => " + theObj[p] + "</li>");
			}
		}
		document.write("</ul>")
	}
}

function redirectToPage(pageName) {
	if (pageName)
		window.location = pagName;
	else
		window.location = "cgi-action.html";
}

/**
 * On image toggle disables,hides, enables and shows the fields depending on the image selected
 * @method onImageToggle
 * @param obj - this is an json object which contains properties along with respective values.
 This object is a customized object in which various ids will change depending on
 respective pages but the keys should remain same.
 obj.imageId gives the id of the image object
 obj.disableIndividual gives space separated list of fields which should be disabled
 obj.disableGrp gives space separated list of block field which should be disabled
 obj.enableIndividual gives space separated list of fields which should be enabled
 obj.enableGrp gives space separated list of block field which should be enabled
 obj.hideClass gives class used to hide fields
 obj.showClass gives class used to show fields
 obj.breakDivs gives space separated list of ids break divs
 obj.breakClass gives class to be used for break divs
 obj.imagesInfo gives another object that contains information about images to be enabled and disabled
 obj.imagesInfo.disableImages gives space separated list of image ids
 obj.imagesInfo.enableImages gives space separated list of image ids to be enabled
 obj.imagesInfo.enableImages gives space separated list of image ids to be enabled
 obj.imagesInfo.disableClass gives class used for disabling images
 obj.imagesInfo.enableClass gives class used for enabling images
 */
function onImageToggle(obj) {
	var imgObj = document.getElementById(obj.imageId);
	if (imgObj) {
		var imgObjVal = imgObj.src;
		var imageName = imgObjVal.substring(imgObjVal.lastIndexOf('/') + 1);
		if (imageName == OFF_IMAGE) {
			//Enable and show fields
			fieldStateChangeWr(obj.disableIndividual, obj.disableGrp, obj.enableIndividual, obj.enableGrp);
			vidualDisplay(obj.disableIndividual + ' ' + obj.disableGrp, obj.hideClass);
			vidualDisplay(obj.enableIndividual + ' ' + obj.enableGrp, obj.showClass);
			vidualDisplay(obj.breakDivs, obj.hideClass);
			changeImageToggleClass(obj.imagesInfo);
		} else if (imageName == ON_IMAGE) {
			//Disable and hide fields
			fieldStateChangeWr(obj.enableIndividual, obj.enableGrp, obj.disableIndividual, obj.disableGrp);
			vidualDisplay(obj.disableIndividual + ' ' + obj.disableGrp, obj.showClass);
			vidualDisplay(obj.enableIndividual + ' ' + obj.enableGrp, obj.hideClass);
			vidualDisplay(obj.breakDivs, obj.breakClass);
			changeImageToggleClass(obj.imagesInfo);
		}
	}

}

function onAnchorToggle(obj) {
	var imgObj = document.getElementById(obj.imageId);
	if (imgObj) {
		var currentClass = $(imgObj).attr("class");

		if (currentClass == OFF_ANCHOR) {
			$(this).removeClass(OFF_ANCHOR);
			$(this).addClass(ON_ANCHOR);
			fieldStateChangeWr(obj.disableIndividual, obj.disableGrp, obj.enableIndividual, obj.enableGrp);
			vidualDisplay(obj.disableIndividual + ' ' + obj.disableGrp, obj.hideClass);
			vidualDisplay(obj.enableIndividual + ' ' + obj.enableGrp, obj.showClass);
			vidualDisplay(obj.breakDivs, obj.hideClass);
			changeImageToggleClass(obj.imagesInfo);
		} else {
			$(this).removeClass(ON_ANCHOR);
			$(this).addClass(OFF_ANCHOR);
			fieldStateChangeWr(obj.enableIndividual, obj.enableGrp, obj.disableIndividual, obj.disableGrp);
			vidualDisplay(obj.disableIndividual + ' ' + obj.disableGrp, obj.showClass);
			vidualDisplay(obj.enableIndividual + ' ' + obj.enableGrp, obj.hideClass);
			vidualDisplay(obj.breakDivs, obj.breakClass);
			changeImageToggleClass(obj.imagesInfo);
		}
	}
}

function helpPop(helpSection, helpConfigFile) {
	/* For all browsers */
	var url = "platform.cgi?page=showHelp.html&help=" + helpSection + "&helpfile=" + helpConfigFile;
	/*Overwrite if it is Opera browser */
	if (navigator.appName.indexOf('Opera') != -1) {
		url = "platform.cgi?page=showHelp.html&help=" + helpSection + "&helpfile=" + helpConfigFile;
	}
	helpwindow = window.open(url, 'name', 'height=398,width=560,left=200,top=150,resizable=no,scrollbars=yes,toolbar=no,status=no');

	if (window.focus) {
		helpwindow.focus()
	}

}

function showTabs() {

	var onloadFunction;

	$("#nav li a").unbind("click");

	$("#nav li a").click(function(event) {
		event.preventDefault();
		$("#ajax-content").empty().append("<div id='loading'>Loading...</div>");
		$("#nav li a").removeClass('current');
		$(this).addClass('current');

		var rightContentDivId = "ajax-content";
		var pageName = $(this).attr("href");
		var tanContent = $(this).attr("page_id");

		if ($(this).attr("onload-function") != '') {
			onloadFunction = $(this).attr("onload-function");
		} else {
			onloadFunction = "";
		}

		dataObj = new Object();
		
		 
	var callTemplate = false;
	
	if (pageName == "wifiPopup.html" && global_wifi_popup_content == "" ) {
		callTemplate = true;
	} else if (pageName == "internetPopup.html" && global_internet_popup_content == "" ) {
		callTemplate = true;
	} else if (pageName == "applicationPopup.html" && global_application_popup_content == "" ) {
		callTemplate = true;
	} else if (pageName == "systemManagementPopup.html" && global_system_popup_content == "" ) {
		callTemplate = true;
	} else if (pageName == "helpPopup.html" && global_help_popup_content == "" ) {
		callTemplate = true;
	} else if (pageName == "setupWizard.html" && global_setupWizard_popup_content == "" ) {
		callTemplate = true;
	} 
	
	if (callTemplate == true)  {
		
		var request = $.ajax({
        url: platformUrl + pageName,        
        dataType: "html",
		type: "GET"
		});
		request.done(function( response, textStatus, jqXHR ) {
			if (pageName == "wifiPopup.html") {
				global_wifi_popup_content = response;
			} else if (pageName == "internetPopup.html") {
				global_internet_popup_content = response;
			} else if (pageName == "applicationPopup.html") {
				global_application_popup_content = response;
			} else if (pageName == "systemManagementPopup.html") {
				global_system_popup_content = response;
			} else if (pageName == "helpPopup.html") {
				global_help_popup_content = response;
			} else if (pageName == "setupWizard.html") {
				global_setupWizard_popup_content = response;
			}
		});
		request.fail(function( jqXHR, textStatus, errorThrown) {	 
		});
		request.always(function(responseData,textStatus, jqXHR ) {       
		});	
		 	
	} 

	 $("#tf1_hid_popup").html('');
	  if (pageName == "wifiPopup.html") {
		  $("#tf1_hid_popup").html(global_wifi_popup_content);
	  } else if (pageName == "internetPopup.html") {
		  $("#tf1_hid_popup").html(global_internet_popup_content);
	  } else if (pageName == "applicationPopup.html") {
		  $("#tf1_hid_popup").html(global_application_popup_content);
	  } else if (pageName == "systemManagementPopup.html") {
		  $("#tf1_hid_popup").html(global_system_popup_content);
	  } else if (pageName == "helpPopup.html") {
		  $("#tf1_hid_popup").html(global_help_popup_content);
	  } else if (pageName == "setupWizard.html") {
		  $("#tf1_hid_popup").html(global_setupWizard_popup_content);
	  }
	
	   if (callTemplate == true) {

	  	  	/*Language Settings :Start */  	  
		  	$("#tf1_hid_popup").find('[data-localize]').each(function(index){         
          		var str = $(this).attr('data-localize');
          		str = str.replace(/\./g, "\'][\'");
          		//alert(str);
          		str = "global_lang['"+str+"']";
          		//console.log(eval(str));
    			if ($(this).attr("placeholder")) {
          			$(this).attr("placeholder",eval(str));
          		} else if ($(this).attr("type")) {
          			$(this).val(eval(str));
          		} else {
    				$(this).html(eval(str));
    			}
			});
			/*Language Settings :End */

		  	if (pageName == "wifiPopup.html") {
		  		global_wifi_popup_content = $("#tf1_hid_popup").html();
			  } else if (pageName == "internetPopup.html") {
				 global_internet_popup_content= $("#tf1_hid_popup").html();		  
			  } else if (pageName == "applicationPopup.html") {
				  global_application_popup_content= $("#tf1_hid_popup").html();
			  } else if (pageName == "systemManagementPopup.html") {
				  global_system_popup_content = $("#tf1_hid_popup").html();
			  } else if (pageName == "helpPopup.html") {
				  global_help_popup_content = $("#tf1_hid_popup").html();
			  } else if (pageName == "setupWizard.html") {
				  global_setupWizard_popup_content = $("#tf1_hid_popup").html();
			  }
		}
	  

	  
	 

	  $("#" + rightContentDivId).show();		 
	  $("#" + rightContentDivId).html($("#"+tanContent).html());
	  $("#tf1_hid_popup").html('');
	  
	  if (onloadFunction != '') {
			eval(onloadFunction + "()");
	  }
		 
		return false;
	});
}

function openSetupWizardPopup(event, frameId, buttonPrefix, rowId, dialogId, contentId, rowPrefix, pageName, popupContent, onloadfun) {

	IE_Chrome(event);
	var leftLink;
	$(".leftMenu li a").each(function(i, obj) {

		if ($(this).attr("content-id") == popupContent) {
			$(this).attr("class", "active");
		} else {
			$(this).attr("class", "");
		}
	});

	$("#" + dialogId).html($("#" + frameId).html());
	ShowDialog(true, dialogId, 'tf1_overlay');

	var leftPx = $(window).innerWidth() / 2 - $(".configDialog").width() / 2;
	leftPx = Math.round(leftPx);
	$(".configDialog").css('left', leftPx + 'px');
	$("#" + dialogId).show();

	var rightContentDivId = "tf1_dialog #" + contentId + " div.dialogMidArea div.popupContainer div.setupWizard";
	rowId = rowId.toString();

	if (rowId != '-1') {
		rowId = rowId.replace(rowPrefix, "");
		dataString = buttonPrefix + "." + rowId + "=edit&thispage=" + pageName + "&configRowId=" + rowId;
	} else {
		dataString = buttonPrefix + "." + rowId + "=add&thispage=" + pageName + "&configRowId=" + rowId;
	}
	dataStringArry = dataString.split("&");
	dataObj = new Object();

	var callTemplate = false;
	
	if (pageName == "wifiPopup.html" && global_wifi_popup_content == "" ) {
		callTemplate = true;
	} else if (pageName == "internetPopup.html" && global_internet_popup_content == "" ) {
		callTemplate = true;
	} else if (pageName == "applicationPopup.html" && global_application_popup_content == "" ) {
		callTemplate = true;
	} else if (pageName == "systemManagementPopup.html" && global_system_popup_content == "" ) {
		callTemplate = true;
	} else if (pageName == "helpPopup.html" && global_help_popup_content == "" ) {
		callTemplate = true;
	} else if (pageName == "setupWizard.html" && global_setupWizard_popup_content == "" ) {
		callTemplate = true;
	} 
	
	if (callTemplate == true)  {
		
		var request = $.ajax({
        url: platformUrl + pageName,        
        dataType: "html",
		type: "GET"
		});
		request.done(function( response, textStatus, jqXHR ) {
			if (pageName == "wifiPopup.html") {
				global_wifi_popup_content = response;
			} else if (pageName == "internetPopup.html") {
				global_internet_popup_content = response;
			} else if (pageName == "applicationPopup.html") {
				global_application_popup_content = response;
			} else if (pageName == "systemManagementPopup.html") {
				global_system_popup_content = response;
			} else if (pageName == "helpPopup.html") {
				global_help_popup_content = response;
			} else if (pageName == "setupWizard.html") {
				global_setupWizard_popup_content = response;
			}
		});
		request.fail(function( jqXHR, textStatus, errorThrown) {	 
		});
		request.always(function(responseData,textStatus, jqXHR ) {       
		});
		
		 	
	} 
	
	  $("#tf1_hid_popup").html('');
	  if (pageName == "wifiPopup.html") {
		  $("#tf1_hid_popup").html(global_wifi_popup_content);
	  } else if (pageName == "internetPopup.html") {
		  $("#tf1_hid_popup").html(global_internet_popup_content);
	  } else if (pageName == "applicationPopup.html") {
		  $("#tf1_hid_popup").html(global_application_popup_content);
	  } else if (pageName == "systemManagementPopup.html") {
		  $("#tf1_hid_popup").html(global_system_popup_content);
	  } else if (pageName == "helpPopup.html") {
		  $("#tf1_hid_popup").html(global_help_popup_content);
	  } else if (pageName == "setupWizard.html") {
		  $("#tf1_hid_popup").html(global_setupWizard_popup_content);
	  }
		systemApi_wizard_languageGet();
	  /*Language Settings :Start */
	  	  if (callTemplate == true) {	  	  
		  	$("#tf1_hid_popup").find('[data-localize]').each(function(index){         
          		var str = $(this).attr('data-localize');
          		str = str.replace(/\./g, "\'][\'");
          		//alert(str);
          		str = "global_lang['"+str+"']";
          		//console.log(eval(str));
    			if ($(this).attr("placeholder")) {
          			$(this).attr("placeholder",eval(str));
          		} else if ($(this).attr("type")) {
          			$(this).val(eval(str));
          		} else {
    				$(this).html(eval(str));
    			}
			});
		}
	  
	  $("#" + rightContentDivId).show();		 
	  $("#" + rightContentDivId).html($("#"+popupContent).html());
	  $("#tf1_hid_popup").html('');

	  if (onloadfun != '') {
			eval(onloadfun + "()");
	  }
	 

	//$("#" + rightContentDivId).load(platformUrl + pageName + " #" + popupContent, function(response) {

		/* See if the page is a login page , then redirect to login from popup*/

	/*	if (response.search("button.login.Users") != -1) {
			$("#" + rightContentDivId).hide();
			$("#" + rightContentDivId).html(response);
			if ($(".midWidth2 div.msgError p").length > 0 && $(".midWidth2 div.msgError p").html() != '') {
				window.location = "platform.cgi?page=index.html&redirectStatusMessage=" + $(".midWidth2 div.msgError p").html();
			} else {
				window.location = "platform.cgi?page=index.html";
			}
		}
		if (onloadfun != '')
			eval(onloadfun + "()");
	}); */

}

/* Add the jquery Form reset function Usage : $("#FormID").reset(); */
jQuery.fn.reset = function() {
	$(this).each(function() {
		this.reset();
	});
}
function closeDialogAlert(event, divId) {
	IE_Chrome(event);
	$("#" + divId).hide();
	HideDialog('tf1_overlay2');   
      if (DIALOG_FIELD_ID != "") {      
        $("#"+ DIALOG_FIELD_ID).focus();
      }

}

function dialogAlert(msg, title, msgType) {

	if ( typeof title == "undefined" || typeof msgType == "undefined") {
		title = global_lang["application_popup"]["filter_error"];
		msgType = "error";
	}

	
	var divId;
	var modal = true;
	var overlayId = 'tf1_overlay2';
	var template;
    var btnOk  = "tf1_btOkError";
	if (msgType == "error") {
		divId = "tf1_error";
		template = $("#tf1_errorDialogTemplate").html();
	} else if (msgType == "info") {
		divId = "tf1_information";
		template = $("#tf1_infoDialogTemplate").html();
        btnOk  = "tf1_btOkInfo";
	}
	template = template.replace('@@title@@', title);
	template = template.replace('@@msg@@', msg);

	var leftPx = $(window).innerWidth() / 2 - $(".errorPopup").width() / 2;
	leftPx = Math.round(leftPx);
	var topPx = $(window).innerHeight() / 2 - $(".errorPopup").height() / 2;
	topPx = Math.round(topPx);
	$(".errorPopup").css('left', leftPx + 'px');
	$(".errorPopup").css('top', topPx + 'px');

	$("#" + divId).html(template);
	$("#" + divId).fadeIn(300);
	$("#" + overlayId).show();

	if (modal) {
		$("#" + overlayId).unbind("click");
	} else {
		$("#" + overlayId).click(function(e) {
			HideDialog('tf1_overlay2');
		});
	}

    $("#"+btnOk).focus();

  
}


$(document).ready(function() {
     /* make all ajax calls aysnc as false 
        'false will ensure during ajax process is under progress user cannot click on any other links or client JS statments are halted'

        cache is false
    */

    jQuery.cachedScript = function( url, options ) {
		// Allow user to set any option except for dataType, cache, and url
		options = $.extend( options || {}, {
		dataType: "script",
		cache: true,
		url: url
		});
		// Use $.ajax() since it is more flexible than $.getScript
		// Return the jqXHR object so we can chain callbacks
		return jQuery.ajax( options );
};

/*  Usage

	$.cachedScript( "ajax/test.js" ).done(function( script, textStatus ) {
		console.log( textStatus );
	});

*/

$.ajaxSetup({async:false,cache:false,timeout:300000});

    if ($("#tf1_cpLogout").length > 0 )
    {
        $('#tf1_cpLogout').click(function(event){

            event.preventDefault();
            loginApi_logout();
           
        });
    }

});

function getCookie(c_name)
{
	var c_value = document.cookie;
	var c_start = c_value.indexOf(" " + c_name + "=");
	if (c_start == -1)
	  {
	  c_start = c_value.indexOf(c_name + "=");
	  }
	if (c_start == -1)
	  {
	  c_value = null;
	  }
	else
	  {
	  c_start = c_value.indexOf("=", c_start) + 1;
	  var c_end = c_value.indexOf(";", c_start);
	  if (c_end == -1)
	  {
	c_end = c_value.length;
	}
	c_value = unescape(c_value.substring(c_start,c_end));
	}
	return c_value;
}


function jsonKeysCount(obj) {
   var count=0;
   for(var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
         ++count;
      }
   }
   return count;
}


function langString(lngId) {
  switch (parseInt(lngId,10)) {
		case 0:
  			return "en";
		break;
		case 1:
  			return "ge";
		break;
		case 2:
  			return "fr";
		break;
  		case 3:
  			return "sp";
		break;
        case 4:
        	return "it";
  		break;
		case 5:
        	return "pl";
  		break;
		/*case 6:
        	return "it";
		case 7:
        	return "hu";
  		break;*/

  }

}
