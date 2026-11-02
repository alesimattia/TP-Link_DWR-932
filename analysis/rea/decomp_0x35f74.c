
undefined4 FUN_00035cc8(undefined4 param_1,undefined4 param_2)

{
  int iVar1;
  size_t sVar2;
  undefined4 uVar3;
  void *__s;
  uint local_d00 [2];
  int local_cf8;
  char *local_cf4;
  char *local_cf0;
  char *local_cec;
  char *local_ce8;
  char *local_ce4;
  undefined1 auStack_cdc [12];
  char acStack_cd0 [257];
  byte local_bcf;
  undefined4 local_bcc;
  undefined4 local_bc4;
  byte local_bbb;
  byte local_bb7;
  undefined4 local_bb4;
  byte local_bb0;
  undefined4 local_bac;
  undefined4 local_ba8;
  undefined4 local_ba4;
  char acStack_ba0 [264];
  undefined4 local_a98;
  char acStack_a94 [264];
  undefined4 local_98c;
  char acStack_988 [264];
  undefined4 local_880;
  char acStack_87c [264];
  undefined4 local_774;
  char acStack_770 [264];
  undefined4 local_668;
  char acStack_664 [266];
  short sStack_55a;
  short sStack_556;
  char acStack_350 [512];
  undefined4 local_150;
  int local_14c;
  undefined1 auStack_148 [20];
  undefined4 local_134;
  undefined4 local_30;
  uint local_2c [2];
  
  memset(acStack_350,0,0x200);
  local_30 = 0;
  local_2c[0] = 0;
  DAT_0007f0bc = 0;
  iVar1 = QCMAP_Client::GetQCMAPBootupCfg
                    (DAT_0007f0dc,(qcmap_msgr_bootup_flag_v01 *)&local_30,
                     (qmi_error_type_v01 *)local_2c);
  if (iVar1 == 0) {
    syslog(3,"%s: GetQCMAPBootupCfg :%d ","fcgi_api_data_bm_get_wifi_wlan1_config",DAT_0007f0bc);
    uVar3 = 500;
  }
  else {
    memset(auStack_cdc,0,0x98c);
    memset(&local_150,0,0x120);
    local_cf8 = FUN_00016294(auStack_cdc,1);
    if (local_cf8 == 0) {
      FUN_000182d8(&local_150,1);
      syslog(6,"%s: get_configure_from_hostapd_config OK ","fcgi_api_data_bm_get_wifi_wlan1_config")
      ;
      FUN_0000ea10(param_1,200,param_2);
      FCGX_PutStr(&DAT_0006fed8,1,param_1);
      local_d00[0] = local_2c[0];
      snprintf(acStack_350,0x1ff,"\"%s\":%d,","bm_wlan_enable");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      sVar2 = strlen(acStack_cd0);
      local_cec = acStack_ba0;
      local_cf0 = acStack_a94;
      local_ce4 = acStack_770;
      local_cf4 = acStack_87c;
      local_ce8 = acStack_664;
      iVar1 = -(sVar2 * 6 + 0xf & 0xfffffff8);
      sVar2 = strlen(acStack_cd0);
      __s = (void *)((int)&local_cf8 + iVar1);
      memset(__s,local_cf8,sVar2 * 6 + 1);
      FUN_00015cd0(acStack_cd0,__s);
      *(void **)((int)local_d00 + iVar1) = __s;
      snprintf(acStack_350,0x1ff,"\"%s\":\"%s\",","bm_wlan_ssid");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      *(uint *)((int)local_d00 + iVar1) = (uint)local_bcf;
      snprintf(acStack_350,0x1ff,"\"%s\":%d,","bm_wlan_hidden");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      *(uint *)((int)local_d00 + iVar1) = (uint)local_bb7;
      snprintf(acStack_350,0x1ff,"\"%s\":%d,","bm_wlan_maxClient");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      *(undefined **)((int)local_d00 + iVar1) = &DAT_0007e5d9;
      snprintf(acStack_350,0x1ff,"\"%s\":\"%s\",","bm_wlan_countrycode");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      *(undefined4 *)((int)local_d00 + iVar1) = local_bcc;
      snprintf(acStack_350,0x1ff,"\"%s\":%d,","bm_wlan_band");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      *(undefined4 *)((int)local_d00 + iVar1) = local_bc4;
      snprintf(acStack_350,0x1ff,"\"%s\":%d,","bm_wlan_mode");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      *(uint *)((int)local_d00 + iVar1) = (uint)local_bbb;
      snprintf(acStack_350,0x1ff,"\"%s\":%d,","bm_wlan_channel");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      *(int *)((int)local_d00 + iVar1) = (int)sStack_55a;
      snprintf(acStack_350,0x1ff,"\"%s\":%d,","bm_wlan_beacon_interval");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      *(int *)((int)local_d00 + iVar1) = (int)sStack_556;
      snprintf(acStack_350,0x1ff,"\"%s\":%d,","bm_wlan_dtim_period");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      *(undefined4 *)((int)local_d00 + iVar1) = local_bb4;
      snprintf(acStack_350,0x1ff,"\"%s\":%d,","bm_wlan_security");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      *(undefined4 *)((int)local_d00 + iVar1) = local_bac;
      snprintf(acStack_350,0x1ff,"\"%s\":%d,","bm_wlan_wep_auth");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      *(undefined4 *)((int)local_d00 + iVar1) = local_ba8;
      snprintf(acStack_350,0x1ff,"\"%s\":%d,","bm_wlan_wep_key_len");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      *(uint *)((int)local_d00 + iVar1) = (uint)local_bb0;
      snprintf(acStack_350,0x1ff,"\"%s\":%d,","bm_wlan_wep_default_index");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      *(undefined4 *)((int)local_d00 + iVar1) = local_ba4;
      snprintf(acStack_350,0x1ff,"\"%s\":%d,","bm_wlan_wep_key_type1");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      sVar2 = strlen(local_cec);
      FUN_000158b8(local_cec,sVar2);
      *(char **)((int)local_d00 + iVar1) = local_cec;
      snprintf(acStack_350,0x1ff,"\"%s\":\"%s\",","bm_wlan_wep_key_str1");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      *(undefined4 *)((int)local_d00 + iVar1) = local_a98;
      snprintf(acStack_350,0x1ff,"\"%s\":%d,","bm_wlan_wep_key_type2");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      sVar2 = strlen(local_cf0);
      FUN_000158b8(local_cf0,sVar2);
      *(char **)((int)local_d00 + iVar1) = local_cf0;
      snprintf(acStack_350,0x1ff,"\"%s\":\"%s\",","bm_wlan_wep_key_str2");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      *(undefined4 *)((int)local_d00 + iVar1) = local_98c;
      snprintf(acStack_350,0x1ff,"\"%s\":%d,","bm_wlan_wep_key_type3");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      sVar2 = strlen(acStack_988);
      FUN_000158b8(acStack_988,sVar2);
      *(char **)((int)local_d00 + iVar1) = acStack_988;
      snprintf(acStack_350,0x1ff,"\"%s\":\"%s\",","bm_wlan_wep_key_str3");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      *(undefined4 *)((int)local_d00 + iVar1) = local_880;
      snprintf(acStack_350,0x1ff,"\"%s\":%d,","bm_wlan_wep_key_type4");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      sVar2 = strlen(local_cf4);
      FUN_000158b8(local_cf4,sVar2);
      *(char **)((int)local_d00 + iVar1) = local_cf4;
      snprintf(acStack_350,0x1ff,"\"%s\":\"%s\",","bm_wlan_wep_key_str4");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      *(undefined4 *)((int)local_d00 + iVar1) = local_774;
      snprintf(acStack_350,0x1ff,"\"%s\":%d,","bm_wlan_wpa_type");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      sVar2 = strlen(local_ce4);
      FUN_000158b8(local_ce4,sVar2);
      *(char **)((int)local_d00 + iVar1) = local_ce4;
      snprintf(acStack_350,0x1ff,"\"%s\":\"%s\",","bm_wlan_wpa_password");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      *(undefined4 *)((int)local_d00 + iVar1) = local_668;
      snprintf(acStack_350,0x1ff,"\"%s\":%d,","bm_wlan_wapi_type");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      sVar2 = strlen(local_ce8);
      FUN_000158b8(local_ce8,sVar2);
      *(char **)((int)local_d00 + iVar1) = local_ce8;
      snprintf(acStack_350,0x1ff,"\"%s\":\"%s\",","bm_wlan_wapi_password");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      *(uint *)((int)local_d00 + iVar1) = (uint)DAT_0007debb;
      snprintf(acStack_350,0x1ff,"\"%s\":\"%d\",","bm_macFilter_mode");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      *(undefined4 *)((int)local_d00 + iVar1) = local_134;
      snprintf(acStack_350,0x1ff,"\"%s\":\"%d\",","bm_wps_enable");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      *(undefined4 *)((int)local_d00 + iVar1) = local_150;
      snprintf(acStack_350,0x1ff,"\"%s\":\"%d\",","bm_wps_type");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      if (local_14c == 1) {
        *(undefined4 *)((int)local_d00 + iVar1) = 2;
        snprintf(acStack_350,0x1ff,"\"%s\":\"%d\",","bm_wps_pin_mode");
      }
      else {
        *(undefined4 *)((int)local_d00 + iVar1) = 1;
        snprintf(acStack_350,0x1ff,"\"%s\":\"%d\",","bm_wps_pin_mode");
      }
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      *(undefined1 **)((int)local_d00 + iVar1) = auStack_148;
      snprintf(acStack_350,0x1ff,"\"%s\":\"%s\"","bm_wps_ap_pin");
      sVar2 = strlen(acStack_350);
      FCGX_PutStr(acStack_350,sVar2,param_1);
      FCGX_PutStr(&DAT_0006ffa8,1,param_1);
      uVar3 = 200;
    }
    else {
      syslog(3,"%s: get_configure_from_hostapd_config ERROR ",
             "fcgi_api_data_bm_get_wifi_wlan1_config");
      uVar3 = 500;
    }
  }
  return uVar3;
}

