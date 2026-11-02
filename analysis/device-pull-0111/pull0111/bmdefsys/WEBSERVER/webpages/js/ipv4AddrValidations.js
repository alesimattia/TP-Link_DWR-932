/**
 * Octet validation
 * @method ipAddrOctetCheck
 * @param ipObjArr - ip address array
 */
function ipAddrOctetCheck(ipObjArr) {
	for (var i = 0; i < ipObjArr.length; i++) {
		var octet = ipObjArr[i];
		if (octet == "" || isNaN(octet))
			return false;
		if (i == 0) {
			if (parseInt(octet, 10) < 1 || parseInt(octet, 10) > 223)
				return false;
		} else if (i == 3) {
			if (parseInt(octet, 10) < 0 || parseInt(octet, 10) > 254)
				return false;
		} else {
			if (parseInt(octet, 10) < 0 || parseInt(octet, 10) > 255)
				return false;
		}
	}
	return true;
}

/**
 * Octet validation for subnet
 * @method ipSnetMaskOctetCheck
 * @param snetMaskObjArr - subnet mask array
 */
function ipSnetMaskOctetCheck(snetMaskObjArr) {
	for (var i = 0; i < snetMaskObjArr.length; i++) {
		var octet = snetMaskObjArr[i];
		if (octet == "" || isNaN(octet)) {
			dialogAlert("Please enter valid value for octet " + (i + 1));
			return false;
		}
		if ((parseInt(octet, 10) < 0) || (parseInt(octet, 10) > 255)) {
			dialogAlert("Please enter valid value for octet " + (i + 1));
			return false;
		}
	}
	return true;
}

/**
 * checks for correct ipaddress format
 * @method ipAddrFormatCheck
 * @param ipAddrId - field Id
 */
function ipAddrFormatCheck(ipAddrId) {
	if (!ipAddrId)
		return false;
	var ipObj = document.getElementById(ipAddrId);
	if (!ipObj || ipObj.disabled)
		return false;
	var ipObjArr = ipObj.value.split(".")
	if (ipObjArr.length != 4)
		return false;
	/* Check IP Address Octet Range */
	if (ipAddrOctetCheck(ipObjArr) == false)
		return false;
	return true;
}

/**
 * ip address value format check
 * @method ipAddrValueFormatCheck
 * @param ipAddrId - ip address
 */
function ipAddrValueFormatCheck(ipAddr) {
	if (!ipAddr)
		return false;
	var ipObjArr = ipAddr.split(".")
	if (ipObjArr.length != 4)
		return false;
	/* Check IP Address Octet Range */
	if (ipAddrOctetCheck(ipObjArr) == false)
		return false;
	return true;
}

/**
 * ipSnetMaskFormatCheck format check
 * @method ipSnetMaskFormatCheck
 * @param ipSnetMaskId - subnet mask field id
 */
function ipSnetMaskFormatCheck(ipSnetMaskId) {
	if (!ipSnetMaskId)
		return false;
	var snetMaskObj = document.getElementById(ipSnetMaskId);
	if (!snetMaskObj || snetMaskObj.disabled)
		return false;
	var snetMaskObjArr = snetMaskObj.value.split(".")
	if (snetMaskObjArr.length != 4) {
		dialogAlert("Please enter valid number of octets.");
		return false;
	}
	/* Check IP Address Octet Range */
	if (ipSnetMaskOctetCheck(snetMaskObjArr) == false)
		return false;
	return true;
}

/**
 * IP Address Range Validate
 * @method ipRangeValidate
 * @param ipAddrStartId - start IP address id
 * @param ipAddrEndId - end IP address id
 */
function ipRangeValidate(ipAddrStartId, ipAddrEndId) {
	var errorFlag = false;
	if (!ipAddrStartId || !ipAddrEndId)
		return true;
	var startIpObj = document.getElementById(ipAddrStartId);
	var endIpObj = document.getElementById(ipAddrEndId);
	if (!startIpObj || !endIpObj)
		return true;
	if (startIpObj.disabled || endIpObj.disabled)
		return true;
	var startObjArr = startIpObj.value.split(".")
	var endObjArr = endIpObj.value.split(".");
	if (startObjArr.length != 4 || endObjArr.length != 4)
		return true;

	/* Check IP Address Octet Range */
	if (ipAddrOctetCheck(startObjArr) == false)
		return true;
	if (ipAddrOctetCheck(endObjArr) == false)
		return true;

	/* Checking First Octet */
	var startIpOctet = parseInt(startObjArr[0], 10);
	var endIpOctet = parseInt(endObjArr[0], 10);
	if (startIpOctet > endIpOctet)
		errorFlag = true;
	else if (startIpOctet == endIpOctet) {
		startIpOctet = parseInt(startObjArr[1], 10);
		endIpOctet = parseInt(endObjArr[1], 10);
		/* Checking Second Octet */
		if (startIpOctet > endIpOctet)
			errorFlag = true;
		else if (startIpOctet == endIpOctet) {
			startIpOctet = parseInt(startObjArr[2], 10);
			endIpOctet = parseInt(endObjArr[2], 10);
			/* Checking Third Octet */
			if (startIpOctet > endIpOctet)
				errorFlag = true;
			else if (startIpOctet == endIpOctet) {
				startIpOctet = parseInt(startObjArr[3], 10);
				endIpOctet = parseInt(endObjArr[3], 10);
				/* Checking Fourth Octet */
				if (startIpOctet > endIpOctet)
					errorFlag = true;
			}
		}
	}
	if (errorFlag) {
		var errorStr = "End IP address must greater than or equal to the start IP address";
		dialogAlert(errorStr)
		endIpObj.focus();
		return false;
	}
	return true;
}

/**
 * Converts IP string to an int
 * @method convert_addr
 * @param ipchars - IP Address value
 */
function convert_addr(ipchars) {
	var bytes = ipchars.split('.');
	var result = ((bytes[0] & 0xff) << 24) | ((bytes[1] & 0xff) << 16) | ((bytes[2] & 0xff) << 8) | (bytes[3] & 0xff);
	return result;
}

/**
 * Converts IP string to an int
 * @method getIPInt
 * @param tblName - Id containing input IP fields
 */
function getIPInt(tblName) {
	var obj = document.getElementById(tblName);
	var objArr = obj.getElementsByTagName("INPUT");
	if (!objArr.length)
		return false;
	octet0 = objArr[0].value;
	octet1 = objArr[1].value;
	octet2 = objArr[2].value;
	octet3 = objArr[3].value;

	var result = ((octet0 & 0xff) << 24) | ((octet1 & 0xff) << 16) | ((octet2 & 0xff) << 8) | (octet3 & 0xff);
	return result;
}

/**
 * Converts IP string to an int
 * @method getIPInt1
 * @param tblName - Id of IP Address field
 */
function getIPInt1(srcObjId) {
	if (!srcObjId)
		return false;
	var obj = document.getElementById(srcObjId);
	if (!obj)
		return false;
	var ipaddr = obj.value;
	var objArr = ipaddr.split(".");
	if (!objArr.length)
		return false;
	octet0 = objArr[0];
	octet1 = objArr[1];
	octet2 = objArr[2];
	octet3 = objArr[3];
	var result = ((octet0 & 0xff) << 24) | ((octet1 & 0xff) << 16) | ((octet2 & 0xff) << 8) | (octet3 & 0xff);
	return result;
}

/**
 * Compares two IPs and returns +ve number if Ip1 > IP2,
 * 0 if they are equal
 * -ve number if IP1 < IP2.
 * @method compareIP
 * @param ip1Int - first IP
 * @param ip2Int - second IP
 */
function compareIP(ip1Int, ip2Int) {
	if (ip1Int > ip2Int)
		return 1;
	if (ip1Int < ip2Int)
		return -1;
	return 0;
}

/**
 * Compares Ip range
 * @method compareIPRange
 * @param ip1Int - first IP
 * @param ip2Int - second IP
 */
function compareIPRange(ip1Int, ip2Int) {
	if ((ip2Int - ip1Int) <= 254)
		return 1;
	return 0;
}

/**
 * Check an IP (host) falls in a subnet
 * @method isInSubnet
 * @param host - host IP
 * @param pattern - pattern IP
 * @param mask - mask
 */
function isInSubnet(host, pattern, mask) {
	return (((host & mask) == (pattern & mask)) && !isBroadcastIP(host, pattern, mask));
}

/**
 * Check if an IP (host) is a broadcast IP
 * @method isBroadcastIP
 * @param host - host IP
 * @param pattern - pattern IP
 * @param mask - mask
 */
function isBroadcastIP(host, pattern, mask) {
	return ((pattern | ~mask) == host)
}

/**
 * checks if an IP address is in a network.
 * @method isBroadcastIP
 * @param ipaddr - IP to be checked (string)
 * @param pattern - IP address pattern
 * @param maskstr - mask
 */
function isInSubnetStr(ipaddr, pattern, maskstr) {
	var addr = null;
	if (/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(ipaddr)) {
		addr = ipaddr.split('.');
	}
	if (!addr) {
		return false;
	} else if (addr[0] > 255 || addr[1] > 255 || addr[2] > 255 || addr[3] > 255) {
		return false;
		// not an IP address
	}
	var host = convert_addr(ipaddr);
	var pat = convert_addr(pattern);
	var mask = convert_addr(maskstr);
	return ((host & mask) == (pat & mask));
}

/**
 * Gets IP address string by cat'ing the 4 octets
 * @method getIPStr
 * @param tblName - table field containing 4 input fields
 */
function getIPStr(tblName) {
	var obj = document.getElementById(tblName);
	var objArr = obj.getElementsByTagName("INPUT");
	if (!objArr.length)
		return false;
	return '' + objArr[0].value + '.' + objArr[1].value + '.' + objArr[2].value + '.' + objArr[3].value;
}

/**
 * Returns value of a field
 * @method getIPStr1
 * @param srcObjId - field Id
 */
function getIPStr1(srcObjId) {
	if (!srcObjId)
		return false;
	var obj = document.getElementById(srcObjId);
	if (!obj)
		return false;
	return obj.value;
}

/**
 * Array containing subnet octets
 */
var subnetOctets = [0, 128, 192, 224, 240, 248, 252, 254, 255];

/**
 * checks subnet mask octet value
 * @method checkSnetMask
 * @param snetMaskOctet - subnet mask octet
 * @param stIdx - start index
 * @param endIdx - end index
 */
function checkSnetMask(snetMaskOctet, stIdx, endIdx) {
	if (isNaN(snetMaskOctet))
		return true;
	var errorFlag = false;
	for (var i = stIdx; i <= endIdx; i++) {
		if (parseInt(snetMaskOctet, 10) == subnetOctets[i]) {
			errorFlag = true;
			break;
		}
	}
	return errorFlag;
}

/**
 * Validating IP Address
 */
function ipv4AddrValuesCheck(obj, objArr, ipv4AddrTypeStr, optFlag, alertFlag, prefixStr, suffixStr, octetShowFlag) {
	var ipOctetMinVal = 0;
	var ipOctetMaxVal = 255;
	var isFirstByteZero = false;
	var isError = false;
	var ipOctetSpecified = false;
	var errMsg = '';
	var tblIPAddrId = obj.id;

	for (var i = 0; i < objArr.length; i++) {
		ipOctetMinVal = 0;
		ipOctetMaxVal = 255;
		isError = false;
		var value = objArr[i];
		var errMsg = '';

		if (value.length != (parseInt(value) + "").length) {
			if (prefixStr)
				errMsg = prefixStr;
			errMsg += " remove leading 0's for octet " + (i + 1);
			dialogAlert(errMsg);
			return false;
		}
		if (alertFlag) {
			if (prefixStr)
				errMsg = prefixStr;
			if ((ipv4AddrTypeStr == 'SM' || ipv4AddrTypeStr == 'SNM') && ((i + 1) == 1))
				errMsg += " Please enter 255 ";
			else if ((ipv4AddrTypeStr == 'SM') && ((i + 1) == 4)) {
				if (objArr[i - 1] != "255")
					errMsg += " Please enter 0 ";
				else
					errMsg += " Please enter 0/128/192/224/240/248/252 ";
			} else if ((ipv4AddrTypeStr == 'SM' || ipv4AddrTypeStr == 'SNM') && ((i + 1) > 1)) {
				if (objArr[i - 1] != "255")
					errMsg += " Please enter 0 ";
				else
					errMsg += " Please enter 0/128/192/224/240/248/252/254/255 ";
			} else {
				errMsg += global_lang['validation_msgs']['enter_value'] + ipOctetMinVal + " - " + ipOctetMaxVal + " ";
			}
			if (suffixStr)
				errMsg += suffixStr;
		}
		if (value.length == 0 || value.length > 3) {
			if (optFlag && !ipOctetSpecified) {
				continue;
			}
			var j = 0;
			if (i == 0) {
				/* check for full empty IP address */
				for ( j = i; j < objArr.length; ++j) {
					if (objArr[j].length)
						break;
				}
			}
			if (errMsg) {
				if ((i == 0) && (j == objArr.length) && errMsg) {
					if (ipv4AddrTypeStr == 'SM' || ipv4AddrTypeStr == 'SNM')
						if (alertFlag) {
							errMsg = prefixStr + "Please enter a value 0/128/192/224/240/248/252/254/255 for each octet.";
							dialogAlert(errMsg);
						} else if (alertFlag) {
							errMsg = prefixStr + global_lang['validation_msgs']['enter_value'] + ipOctetMinVal + " - " + ipOctetMaxVal + " for each octet.";
							dialogAlert(errMsg);
						}
				} else {
					if (octetShowFlag) {
						if (value.length > 3)
							errMsg = "Invalid octet length for octet " + (i + 1);
						else
							errMsg += (i + 1);
					}
					if (alertFlag) {
						dialogAlert(errMsg);
					}

				}
			}
			obj.focus();
			return false;
		}
		if (optFlag) {
			if (i > 0 && !ipOctetSpecified) {
				if (errMsg) {
					if (octetShowFlag)
						errMsg += (i + 1);
					//alert (errMsg);
					if (alertFlag) {
						dialogAlert(errMsg);
					}
				}
				obj.focus();
				return false;
			}
			ipOctetSpecified = true;
		}

		if (((i + 1) == 4) && (ipv4AddrTypeStr == 'IP')) {
			/* last octet should not set to zero as this is ip address */
			ipOctetMinVal = 1;
			ipOctetMaxVal = 254;
		}
		if (((i + 1) == 4) && (ipv4AddrTypeStr == 'SN')) {
			/* last octet can set to zero as this is network ip */
			ipOctetMinVal = 0;
			ipOctetMaxVal = 254;
		}
		if (((i + 1) == 1) && (ipv4AddrTypeStr == 'IP' || ipv4AddrTypeStr == 'SN')) {
			/* first octet should not exced 223 */
			ipOctetMinVal = 1;
			ipOctetMaxVal = 223;
		}

		if (ipv4AddrTypeStr == 'SM' || ipv4AddrTypeStr == 'SNM') {
			if ((i + 1) == 1)
				isError = !checkSnetMask(value, 8, 8);
			else if (((i + 1) == 4) && ipv4AddrTypeStr == 'SM') {
				if (objArr[i - 1] != "255")
					isError = !checkSnetMask(value, 0, 0);
				else
					isError = !checkSnetMask(value, 0, 6);
			} else {
				if (objArr[i - 1] != "255")
					isError = !checkSnetMask(value, 0, 0);
				else
					isError = !checkSnetMask(value, 0, 8);
			}
		} else {
			if (((parseInt(value) > 0) && isFirstByteZero) || (parseInt(value) < ipOctetMinVal || parseInt(value) > ipOctetMaxVal)) {
				isError = true;
			}
		}
		if (isError) {
			if (isFirstByteZero)
				--i;
			if (alertFlag) {
				if (prefixStr)
					errMsg = prefixStr;
				if ((ipv4AddrTypeStr == 'SM' || ipv4AddrTypeStr == 'SNM') && ((i + 1) == 1))
					errMsg += " Please enter 255 ";
				else if ((ipv4AddrTypeStr == 'SM') && ((i + 1) == 4)) {
					if (objArr[i - 1] != "255")
						errMsg += " Please enter 0 ";
					else
						errMsg += " Please enter 0/128/192/224/240/248/252 ";
				} else if ((ipv4AddrTypeStr == 'SM' || ipv4AddrTypeStr == 'SNM') && ((i + 1) > 1)) {
					if (objArr[i - 1] != "255")
						errMsg += " Please enter 0 ";
					else
						errMsg += " Please enter 0/128/192/224/240/248/252/254/255 ";
				} else {
					errMsg += global_lang['validation_msgs']['enter_value'] + ipOctetMinVal + " - " + ipOctetMaxVal + " ";
				}
				if (suffixStr)
					errMsg += suffixStr;
				if (octetShowFlag)
					errMsg += (i + 1);
				dialogAlert(errMsg);
			}
			obj.focus();
			return false;
		}
	}
	return true;
}

/**
 * Wrapper for validating IPv4 address
 */
function ipv4Validate(tblIPAddrId, ipv4AddrTypeStr, optFlag, alertFlag, prefixStr, suffixStr, octetShowFlag) {
	var errStr = ""
	var genErrStr = ""
	if (prefixStr)
		errStr += "";
	if (ipv4AddrTypeStr == "SM")
		genErrStr = "Invalid Subnet Mask";
	else
		genErrStr = global_lang["alerts_set"]["invalid_ip_addr"];

	if (!tblIPAddrId)
		return false;
	var obj = document.getElementById(tblIPAddrId);
	/* Checking loop back address as invalid */
	if (obj.value == "127.0.0.1") {
		dialogAlert("IP Address cannot have loop back address 127.0.0.1");
		obj.focus();
		return false;
	}
	if (!obj || obj.disabled)
		return true;

	if (obj.value == "" && !optFlag) {
		if (alertFlag) {
			dialogAlert(errStr + genErrStr);
		}
		obj.focus();
		return false;
	} else if (obj.value == "" && optFlag) {
		return true;
	}
	if (obj.value.length > 15) {
		if (alertFlag) {
			dialogAlert(errStr + genErrStr);
		}
		obj.focus();
		return false;
	}

	var objArr = obj.value.split(".");
	if (!objArr.length || objArr.length != 4) {
		if (alertFlag) {
			dialogAlert(errStr + genErrStr);
		}
		obj.focus();
		return false;
	}

	/* Checking for invalid characters in IP address */
	for (var i = 0; i < objArr.length; i++) {
		var octet = objArr[i];
		if (octet == "" || isNaN(octet)) {
			if (alertFlag) {
				dialogAlert(errStr + genErrStr);
			}
			obj.focus();
			return false;
		}
	}

	return ipv4AddrValuesCheck(obj, objArr, ipv4AddrTypeStr, optFlag, alertFlag, prefixStr, suffixStr, octetShowFlag);
}

function ipv4AddrValidate(Obj, ipv4AddrTypeStr, optFlag, alertFlag, prefixStr, suffixStr, octetShowFlag) {
	if (!Obj)
		return;
	return ipv4Validate(Obj.id, ipv4AddrTypeStr, optFlag, alertFlag, prefixStr, suffixStr, octetShowFlag)
}

/**
 * Determine if a string is a valid netmask
 * @method validNetMask
 * @param objId - field Id
 */
function validNetMask(objId) {
	var msg = "Please enter valid CIDR Subnet Mask.";
	var obj = document.getElementById(objId);
	// get the subnet mask object
	if (!obj || obj.disabled)
		return true;
	if (obj) {
		if (ipSnetMaskFormatCheck(objId) == false) {
			obj.focus();
			return false;
		} else if (obj.value == "0.0.0.0") {
			dialogAlert(msg);
			obj.focus();
			return false;
		} else {
			netmask = getIPInt1(objId)// get decimal value of ip address
			neg = ((~netmask) & 0xFFFFFFFF);
			if (!(((neg + 1) & neg) === 0)) {
				dialogAlert(msg);
				obj.focus();
				return false;
			} else
				return true;
		}
	}
}

/**
 * Determine if a string is a valid netmask
 * @method subnetValidation
 * @param objId - id of ip address to find it falls in a subnet.
 * @param objId - subnet mask id of subnet to tb checked
 * @param objId - ip address id of subnet in which it should be checked
 * @param objId - subnet mask id of subnet in which it should be checked
 */
function subnetValidation(ipAddrId_check, ipAddrId_mask, ipAddrId, snetMaskId) {
	/* variable declaration*/
	var objIpAddrId = null, objArr = null, ipAddrBits = null, objSnetMaskId = null;
	var subnetBits = null, lowAddressArr = null, highAddressArr = null, firstIP = null, lastIP = null;
	var ipAddrId_checkLow = null, ipAddrId_checkHigh = null, lowIpVal = null, highIpVal = null, ipAddrId_maskObj = null, objArrChk = null;
	var ipAddrBitsChk = null, lowAddressArrChk = null, highAddressArrChk = null, firstIPChk = null, lastIPChk = null;
	/*getting object of the ip and subnet mask of subnet to be checked*/
	objIpAddrId = document.getElementById(ipAddrId);
	// get IP object
	if (!objIpAddrId)
		return;
	objArr = objIpAddrId.value.split(".");
	if (!objArr.length)
		return false;
	ipAddrBits = getNetworkAddress(objArr);
	// get IP Address bits
	objSnetMaskId = document.getElementById(snetMaskId);
	// get subnet mask object
	if (!objSnetMaskId)
		return;
	/**/
	 /*getting object of the ip and subnet mask of subnet which is being checked*/
	objIpAddr_chk = document.getElementById(ipAddrId_check);
	// get IP object
	objArrChk = objIpAddr_chk.value.split(".");
	if (!objArrChk.length)
		return false;
	ipAddrBitsChk = getNetworkAddress(objArrChk);
	// get IP Address bits
	ipAddrId_maskObj = document.getElementById(ipAddrId_mask);
	// get subnet mask object
	if (!ipAddrId_maskObj)
		return;

	/* First and Last address array of the subnet which is being checked*/
	lowAddressArr = getLowAddress(ipAddrBits, objSnetMaskId);
	highAddressArr = getHighAddress(ipAddrBits, objSnetMaskId);

	/* First and Last address array of the subnet which is to be checked*/
	lowAddressArrChk = getLowAddress(ipAddrBitsChk, ipAddrId_maskObj);
	highAddressArrChk = getHighAddress(ipAddrBitsChk, ipAddrId_maskObj);

	/* First and last IP address of the subnet which is being checked*/
	firstIP = getIPAddress(lowAddressArr);
	lastIP = getIPAddress(highAddressArr);

	/*First and last IP address of the subnet which is to be checked*/
	firstIPChk = getIPAddress(lowAddressArrChk);
	lastIPChk = getIPAddress(highAddressArrChk);

	/*Get Low and high IP from both subnets*/
	ipAddrId_checkLow = convert_addr(firstIPChk);
	// get decimal value of ip
	ipAddrId_checkHigh = convert_addr(lastIPChk);
	// get decimal value of ip
	lowIpVal = convert_addr(firstIP);
	// get decimal value of ip
	highIpVal = convert_addr(lastIP);
	// get decimal value of ip
	if (isInSubnetCheck(ipAddrId_checkLow, lowIpVal, highIpVal) || isInSubnetCheck(ipAddrId_checkHigh, lowIpVal, highIpVal))
		return true;
	else
		return false;
}

/**
 * Returns array containing IP octates converted from decimal value of IP address
 * @method toArray_
 * @param val - integer value of IP Address
 */
function toArray_(val) {
	var ret = new Array();
	for (var j = 3; j >= 0; --j)
		ret[j] |= ((val >>> 8 * (3 - j)) & (0xff));
	return ret;
}

/**
 * Returns number of set bits in the subnet mask
 * @method countSetbits
 * @param num_ - decimal value of subnet mask
 */
function countSetbits(num_) {
	num_ = num_ - ((num_ >> 1) & 0x55555555);
	num_ = (num_ & 0x33333333) + ((num_ >> 2) & 0x33333333);
	return ((num_ + (num_ >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
}

/**
 * Returns net mask based on set bits
 * @method getNetworkMask
 * @param netMaskAddr - net mask address
 */
function getNetworkMask(netMaskAddr) {
	var netmask = 0;
	for (var j = 0; j < countSetbits(convert_addr(netMaskAddr)); ++j) {
		netmask |= (1 << 31 - j);
	}
	return netmask;
}

/**
 * Returns binary address of the IP address.
 * @method getNetworkAddress
 * @param addrArray - IP address array
 */
function getNetworkAddress(addrArray) {
	var addr = 0;
	var j = 1;
	for (var i = 0; i <= 3; ++i) {
		addr |= ((addrArray[i] & 0xff) << 8 * (4 - j));
		j++;
	}
	return addr;
}

/**
 * Return lower network address
 * @method getNetworkAddress
 * @param ipAddrBits - IP address bits
 * @param idObj - field Id
 */
function getLowAddress(ipAddrBits, idObj) {
	var countBits = countSetbits(convert_addr(idObj.value));
	var subnetBits = getNetworkMask(idObj.value);
	return toArray_((ipAddrBits & subnetBits));
}

/**
 * Returns array of octets of high address.
 * @method getHighAddress
 * @param ipAddrBits - IP address bits
 * @param idObj - field Id
 */
function getHighAddress(ipAddrBits, idObj) {
	var countBits = countSetbits(convert_addr(idObj.value));
	var subnetBits = getNetworkMask(idObj.value);
	return toArray_((ipAddrBits | ~subnetBits));
}

/**
 * Returns IP address.
 * @method getIPAddress
 * @param octateArr - octet array
 */
function getIPAddress(octateArr) {
	return octateArr[0] + "." + octateArr[1] + "." + octateArr[2] + "." + octateArr[3];
}

/**
 * Checks whether an subnet ip falls within a subnet range
 * @method isInSubnetCheck
 * @param ipAddrId_checkVal - decimal value of subnet ip
 * @param lowIpVal - decimal value of first ip of subnet
 * @param highIpVal - decimal value of last ip of subnet
 */
function isInSubnetCheck(ipAddrId_checkVal, lowIpVal, highIpVal) {
	return ((ipAddrId_checkVal >= lowIpVal) && (ipAddrId_checkVal <= highIpVal));
}

/**
 * Checks whether DHCP IP falls in the subnet.
 * @method isDhcpInSubnet
 * @param ipAddrId - IP address ID
 * @param snetAddrId - Subnet Mask ID
 * @param dhcpAddrId - DHCP IP ID
 */
function isDhcpInSubnet(ipAddrId, snetAddrId, dhcpAddrId) {
	ipAddrIdObj = document.getElementById(ipAddrId);
	if (!ipAddrIdObj || ipAddrIdObj.disbaled)
		return true;
	snetAddrIdObj = document.getElementById(snetAddrId);
	if (!snetAddrIdObj || snetAddrIdObj.disbaled)
		return true;
	dhcpAddrIdObj = document.getElementById(dhcpAddrId);
	if (!dhcpAddrIdObj || dhcpAddrIdObj.disbaled)
		return true;
	var ipAddrIdObjArr = ipAddrIdObj.value.split(".");
	var ipAddrIdBits = getNetworkAddress(ipAddrIdObjArr);
	// get IP Address bits
	var lowAddressArr = getLowAddress(ipAddrIdBits, snetAddrIdObj);
	var highAddressArr = getHighAddress(ipAddrIdBits, snetAddrIdObj);
	var lowIpAddr = getIPAddress(lowAddressArr);
	var highIpAddr = getIPAddress(highAddressArr);
	var lowIpVal = convert_addr(lowIpAddr);
	// get decimal value of ip
	var highIpVal = convert_addr(highIpAddr);
	// get decimal value of ip
	var dhcpAddrVal = getIPInt1(dhcpAddrId);
	if (isInSubnetCheck(dhcpAddrVal, lowIpVal, highIpVal))
		return true;
	else
		return false;
}

/**
 * Checks if PPP IP falls in DHCP Range .
 * @method dhcpRangeForPPP
 * @param startDhcpIpId - Starting DHCP IP.
 * @param endDhcpIpId - Subnet Mask ID
 * @param pppIpId - DHCP IP ID
 */
function dhcpRangeForPPP(startDhcpIpId, endDhcpIpId, pppIpId) {
	var startDhcpIpIdVal = getIPInt1(startDhcpIpId);
	var endDhcpIpIdVal = getIPInt1(endDhcpIpId);
	var pppIpIdVal = getIPInt1(pppIpId);
	return ((pppIpIdVal >= startDhcpIpIdVal) && (pppIpIdVal <= endDhcpIpIdVal))
}

/**
 * sets the network IP in the field having ipAddrId Id
 * @method setNetworkIpAddress
 * @param ipAddrId - Network address field
 * @param snetMaskId - Subnet mask
 */
function setNetworkIpAddress(ipAddrId, snetMaskId) {
	var nwAddrOct1, nwAddrOct2, nwAddrOct3, nwAddrOct4;
	var networkAddrObj = document.getElementById(ipAddrId);
	if (!networkAddrObj) {
		//alert("Network Ip object does not exist.");
		return;
	}
	var objArr = networkAddrObj.value.split(".");
	if (!objArr.length) {
		dialogAlert("Please enter valid network address.");
		return false;
	}
	var ipOct1 = parseInt(objArr[0], 10);
	var ipOct2 = parseInt(objArr[1], 10);
	var ipOct3 = parseInt(objArr[2], 10);
	var ipOct4 = parseInt(objArr[3], 10);
	var networkSubnetMaskObj = document.getElementById(snetMaskId);
	if (!networkSubnetMaskObj) {
		//alert("Subnet mask object does not exist");
		return;
	}
	var objArr = networkSubnetMaskObj.value.split(".");
	if (!objArr.length) {
		dialogAlert("Please enter valid subnet mask.");
		return false;
	}
	var snetOct1 = parseInt(objArr[0], 10);
	var snetOct2 = parseInt(objArr[1], 10);
	var snetOct3 = parseInt(objArr[2], 10);
	var snetOct4 = parseInt(objArr[3], 10);

	/* Anding each octate of Ip address and Subnet mask */
	nwAddrOct1 = ipOct1 & snetOct1;
	nwAddrOct2 = ipOct2 & snetOct2;
	nwAddrOct3 = ipOct3 & snetOct3;
	nwAddrOct4 = ipOct4 & snetOct4;

	var nwAddr = nwAddrOct1 + "." + nwAddrOct2 + "." + nwAddrOct3 + "." + nwAddrOct4;

	/* Assigning the network address to he network address field */

	networkAddrObj.value = nwAddr;
	return true;
}

/**
 * validated IPv4 string
 */
function ipv4ValidateStr(obj, str, ipv4AddrTypeStr, optFlag, alertFlag, prefixStr, suffixStr, octetShowFlag) {
	var errStr = ""
	var genErrStr = ""
	if (prefixStr)
		errStr += ": "
	if (ipv4AddrTypeStr == "SM")
		genErrStr = "Invalid Subnet Mask";
	else
		genErrStr = "Invalid IP Address";

	if (!obj || obj.disabled)
		return true;

	if (str == "" && !optFlag) {
		if (alertFlag) {
			dialogAlert(errStr + genErrStr);
		}
		obj.focus();
		return false;
	} else if (str == "" && optFlag) {
		return true;
	}
	if (str.length > 15) {
		if (alertFlag) {
			dialogAlert(errStr + genErrStr);
		}
		obj.focus();
		return false;
	}
	var objArr = str.split(".");
	if (!objArr.length || objArr.length != 4) {
		if (alertFlag) {
			dialogAlert(errStr + genErrStr);
		}
		obj.focus();
		return false;
	}

	/* Checking for invalid characters in IP address */
	for (var i = 0; i < objArr.length; i++) {
		var octet = objArr[i];
		if (octet == "" || isNaN(octet)) {
			if (alertFlag) {
				dialogAlert(errStr + genErrStr);
			}
			obj.focus();
			return false;
		}
	}

	return ipv4AddrValuesCheck(obj, objArr, ipv4AddrTypeStr, optFlag, alertFlag, prefixStr, suffixStr, octetShowFlag);
}

/**
 * sets the network IP in the field having ipAddrId Id
 * @method checkCorrectNetworkAddress
 * @param snmObj - ip object
 * @param ipObj - subnet object
 */
function checkCorrectNetworkAddress(ipObj, snmObj) {
	if (!ipObj && !snmObj)
		return;
	var ipAddr = getIPInt1(ipObj.id);
	var snmAddr = getIPInt1(snmObj.id)
	var networkAddr = ipAddr & snmAddr;

	if (networkAddr == ipAddr) {
		return true;
	} else {
		return false;
	}
}

/**
 * returns the ipAddrId as octet
 * @method getIPInt2
 * @param ipAddr - ip object
 */

function getIPInt2(ipAddr) {
	var objArr = ipAddr.split(".");
	if (!objArr.length)
		return false;
	octet0 = objArr[0];
	octet1 = objArr[1];
	octet2 = objArr[2];
	octet3 = objArr[3];
	var result = ((octet0 & 0xff) << 24) | ((octet1 & 0xff) << 16) | ((octet2 & 0xff) << 8) | (octet3 & 0xff);
	return result;
}

/**
 * This is a wrapper function for subnet validation
 This checks for all cases when validation should not happen
 and then validates
 * @method subnetValidationWr
 * @param firstIPId - IP ID
 * @param firstSnetId - Snet Id
 * @param secondIpId - IP Id
 * @param secondSnetId - Snet Id
 */
function subnetValidationWr(firstIPId, firstSnetId, secondIpId, secondSnetId) {
	//Get all objects
	var firstIPIdObj = document.getElementById(firstIPId);
	var firstSnetIdObj = document.getElementById(firstSnetId);
	var secondIpIdObj = document.getElementById(secondIpId);
	var secondSnetIdObj = document.getElementById(secondSnetId);
	if (firstIPIdObj && firstSnetIdObj && secondIpIdObj && secondSnetIdObj && !firstIPIdObj.disabled && firstIPIdObj.value != '' && firstIPIdObj.value != '0.0.0.0' && !firstSnetIdObj.disabled && firstSnetIdObj.value != '' && firstSnetIdObj.value != '0.0.0.0' && !secondIpIdObj.disabled && secondIpIdObj.value != '' && secondIpIdObj.value != '0.0.0.0' && !secondSnetIdObj.disabled && secondSnetIdObj.value != '' && secondSnetIdObj.value != '0.0.0.0') {
		return subnetValidation(firstIPId, firstSnetId, secondIpId, secondSnetId);
	} else {
		return true;
	}
}

/**
 * checks if an Ip falls in any IP range
 * @method subnetValidationWr
 * @param dhcpStrtIpId - Starting IP.
 * @param dhcpEndIpId - Ending IP
 * @param numberOfIpsId - IP to be checked
 * @param prefixId - prefix Id
 * @param showMsg - message
 */
function isIpInRange(dhcpStrtIpId, dhcpEndIpId, numberOfIpsId, prefixId, showMsg) {
	var hdNumFixedIpAddrObj = document.getElementById(numberOfIpsId);
	if (hdNumFixedIpAddrObj)
		hdNumFixedIpAddrObjVal = parseInt(hdNumFixedIpAddrObj.value, 10);
	for (var i = 1; i <= hdNumFixedIpAddrObjVal; i++) {
		if (dhcpRangeForPPP(dhcpStrtIpId, dhcpEndIpId, prefixId + i)) {
			dialogAlert(showMsg)
			return false;
		}
	}
	return true;
}

/**
 * Checks if two IP Addresses are same
 * @method isIpSame
 * @param ipId1 - Starting IP.
 * @param ipId2 - Ending IP
 * @param showMsg - message
 */
function isIpSame(ipId1, ipId2, showMsg) {
	var ipId1Obj = document.getElementById(ipId1);
	var ipId2Obj = document.getElementById(ipId2);
	if (ipId1Obj && ipId2Obj) {
		if (ipId1Obj.value == ipId2Obj.value) {
			dialogAlert(showMsg);
			return true;
		}
	}
	return false;
}
