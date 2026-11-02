var MAC_VAL_INVALID = 'Mac values 00:00:00:00:00:00 or FF:FF:FF:FF:FF:FF are invalid.';
var MAC_FORMAT = " Please enter a value in the form XX:XX:XX:XX:XX:XX ";
var MAC_MULTICAST = "Multicast Mac Address is not allowed.";

/**
 * mac address check function
 * @method macAddrCheck
 * @param eventObj - event object
 * @param srcObj - source object
 */
function macAddrCheck(eventObj, srcObj) {
	if (!eventObj || !srcObj)
		return false;
	var charUniCode = eventObj.charCode ? eventObj.charCode : eventObj.keyCode;
	var macAddr = srcObj.value;
	var maxBytes = (macAddr.split(":")).length;
	if (maxBytes > 6)
		return false;

	macAddr = macAddr.lastIndexOf(":") == -1 ? macAddr : macAddr.substring(macAddr.lastIndexOf(":") + 1);
	if (macAddr.indexOf("0x") == 0 || macAddr.indexOf("0X") == 0)
		checkLen = 4;
	else
		checkLen = 2;
	switch (charUniCode) {
		case 58:
			/* : */
			if (macAddr.length == 0 || macAddr.length < (checkLen - 1))
				return false;
			if (maxBytes != 6)
				return true;
			return false;
		case 88:
		/* x */
		case 120:
			/* X */
			if (macAddr.length > 1 || macAddr.indexOf("0") != 0)
				return false;
			return true;
		case 9:
			/* tab key */
			if (maxBytes != 6)
				return false;
		case 8:
		/* back space */
		case 37:
		/* left arrow */
		case 39:
		/* right arrow */
		case 46:
			/* delete */
			return true;
	}
	if (macAddr.length == checkLen && charUniCode != 58) {
		if (maxBytes != 6)
			srcObj.value = srcObj.value + ":";
		return false;
	}

	/* allow a - f */
	if (charUniCode >= 97 && charUniCode <= 102)
		return true;
	/* allow A - F */
	if (charUniCode >= 65 && charUniCode <= 70)
		return true;
	if (charUniCode < 48 || charUniCode > 57)
		return false;
	return true;
}

/**
 * Checks for each valid character
 * @method macAddrValueCheck
 * @param macVal - mac address value
 */
function macAddrValueCheck(macVal) {
	if (!isNaN(macVal))
		return true;
	if (!macVal || macVal.length == 0)
		return true;
	for (var i = 0; i < macVal.length; i++) {
		if ((isNaN(macVal.charAt(i)) && ((macVal.charCodeAt(i) >= 97 && macVal.charCodeAt(i) <= 102) || (macVal.charCodeAt(i) >= 65 && macVal.charCodeAt(i) <= 70))) || (!isNaN(macVal.charAt(i))))
			continue;
		else
			return false;
	}
	return true;
}

/**
 * Checks if mac address is given in correct format
 * @method macFormatCheck
 * @param macAddr - mac address
 * @param errMsg - error message
 * @param srcObj - source object
 */
function macFormatCheck(macAddr, errMsg, srcObj) {
	if (!macAddr)
		return false;
	var macBytes = macAddr.split(":");
	if (macBytes.length != 6 || (macBytes[5].length == 0)) {
		if (errMsg) {
			dialogAlert(errMsg);
		}
		return false;
	} else {
		for (var i = 0; i < macBytes.length; i++) {
			if (macBytes[i].length != 2) {
				if (errMsg) {
					dialogAlert(errMsg);
				}
				return false;
			}
			if (macAddrValueCheck(macBytes[i]) == false) {
				if (errMsg) {
					dialogAlert(errMsg);
				}
				return false;
			}
		}
		var isZero = true;
		for (var i = 0; i < 6; i++) {
			var val = parseInt(macBytes[i], 16);
			if (val != 0) {
				isZero = false;
			}
		}
		var isF = true;
		for (var i = 0; i < 6; i++) {
			var val = parseInt(macBytes[i], 16);
			if (val != 255) {
				isF = false;
			}
		}
		if (isZero || isF) {
			if (errMsg) {
				dialogAlert(global_lang['validation_msgs']['mac_invalid_value']);
			}
			return false;
		}
	}
	return true;
}

/**
 * Wrapper function for mac address validation
 * @method macAddrVerify
 * @param eventObj - event object
 * @param srcObj - source object
 * @param alertFlag - alert message
 * @param prefixStr - prefix message
 * @param suffixStr - suffix message
 */
function macAddrVerify(eventObj, srcObj, alertFlag, prefixStr, suffixStr) {
	if (!eventObj || !srcObj)
		return false;
	var charUniCode = eventObj.charCode ? eventObj.charCode : eventObj.keyCode;
	/* process only 'tab' */
	if (eventObj.keyCode != 9)
		return true;
	if (!(macAddrValidate(srcObj.value, alertFlag, prefixStr, suffixStr, srcObj))) {
		srcObj.focus();
		return false;
	}
	return true;
}

/**
 * Checks for mac format and multicast address
 * @method macAddrValidate
 * @param macAddr - mac address
 * @param alertFlag - alert flag- if message is shown or not
 * @param prefixStr - prefix string
 * @param suffixStr - suffix string
 * @param srcObj - source object
 */
function macAddrValidate(macAddr, alertFlag, prefixStr, suffixStr, srcObj) {
	var errStr = '';
	if (alertFlag) {
		if (prefixStr)
			errStr = prefixStr;
		errStr += global_lang['validation_msgs']['mac_format'];
		if (suffixStr)
			errStr += suffixStr;
	}
	if (macFormatCheck(macAddr, errStr, srcObj)) {
		if (isMulticastMacAddr(srcObj)) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}

/**
 * checks if mac address is multicast or not.
 * This function should be called only after verifying that the mac address
 * @param macObj - Mac address object
 */
function isMulticastMacAddr(macObj) {
	var macAddr = macObj.value;
	var macBytes = macAddr.split(":");
	var num = parseInt(macBytes[0].charAt(1), 16);
	if (num % 2 == 0)
		return true;
	else {
		var alertMsg = global_lang['validation_msgs']['multicast_mac'];
		dialogAlert(alertMsg);
		macObj.focus();
		return false;
	}
}
