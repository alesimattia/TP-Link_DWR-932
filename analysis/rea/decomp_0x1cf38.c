
undefined4 FUN_0001cc8c(undefined4 param_1,undefined4 param_2)

{
  size_t sVar1;
  char acStack_3a8 [512];
  undefined1 auStack_1a8 [128];
  undefined1 auStack_128 [128];
  undefined1 auStack_a8 [132];
  
  memset(acStack_3a8,0,0x200);
  memset(auStack_1a8,0,0x180);
  DMS_Client::dms_get_hardware_version(DAT_0007f0c0);
  QCMAP_Client::GetSoftwareVersion(DAT_0007f0dc);
  QCMAP_Client::GetModelName(DAT_0007f0dc);
  FUN_0000ea10(param_1,200,param_2);
  FCGX_PutStr(&DAT_0006c574,1,param_1);
  snprintf(acStack_3a8,0x1ff,"\"%s\":\"%s\",","device_name",auStack_a8);
  sVar1 = strlen(acStack_3a8);
  FCGX_PutStr(acStack_3a8,sVar1,param_1);
  snprintf(acStack_3a8,0x1ff,"\"%s\":\"%s\",","hardware_version",auStack_128);
  sVar1 = strlen(acStack_3a8);
  FCGX_PutStr(acStack_3a8,sVar1,param_1);
  snprintf(acStack_3a8,0x1ff,"\"%s\":\"%s\",","sw_version_num",auStack_1a8);
  sVar1 = strlen(acStack_3a8);
  FCGX_PutStr(acStack_3a8,sVar1,param_1);
  snprintf(acStack_3a8,0x1ff,"\"%s\":{","system_support");
  sVar1 = strlen(acStack_3a8);
  FCGX_PutStr(acStack_3a8,sVar1,param_1);
  snprintf(acStack_3a8,0x1ff,"\"%s\":%d,","wifi_guest_ap",0);
  sVar1 = strlen(acStack_3a8);
  FCGX_PutStr(acStack_3a8,sVar1,param_1);
  snprintf(acStack_3a8,0x1ff,"\"%s\":%d,","battery_support",1);
  sVar1 = strlen(acStack_3a8);
  FCGX_PutStr(acStack_3a8,sVar1,param_1);
  snprintf(acStack_3a8,0x1ff,"\"%s\":%d,","no_LTE",0);
  sVar1 = strlen(acStack_3a8);
  FCGX_PutStr(acStack_3a8,sVar1,param_1);
  snprintf(acStack_3a8,0x1ff,"\"%s\":%d,","ethernet",0);
  sVar1 = strlen(acStack_3a8);
  FCGX_PutStr(acStack_3a8,sVar1,param_1);
  snprintf(acStack_3a8,0x1ff,"\"%s\":%d","wifi_support_5G",0);
  sVar1 = strlen(acStack_3a8);
  FCGX_PutStr(acStack_3a8,sVar1,param_1);
  snprintf(acStack_3a8,0x1ff,",\"%s\":%d","samba_support",0);
  sVar1 = strlen(acStack_3a8);
  FCGX_PutStr(acStack_3a8,sVar1,param_1);
  FCGX_PutStr(&DAT_0006c590,1,param_1);
  FCGX_PutStr(&DAT_0006c590,1,param_1);
  syslog(6,"%s get  doGetWhoAmI  infomation","doGetWhoAmI");
  return 200;
}

