
undefined4 FUN_00018ca4(undefined1 *param_1)

{
  int iVar1;
  FILE *__stream;
  char *pcVar2;
  size_t sVar3;
  undefined4 uVar4;
  uint uVar5;
  char acStack_3020 [4096];
  char acStack_2020 [4096];
  char acStack_1020 [4100];
  
  memset(acStack_3020,0,0x1000);
  memset(acStack_2020,0,0x1000);
  memset(acStack_1020,0,0x1000);
  iVar1 = access("/bmdefsys/etc/bm_config.conf",0);
  if (iVar1 != 0) {
    snprintf(acStack_3020,0xfff,"cp /bmdefsys/etc/firmware/bm_config.conf %s ",
             "/bmdefsys/etc/bm_config.conf");
    system(acStack_3020);
    memset(acStack_3020,0,0x1000);
  }
  __stream = fopen("/bmdefsys/etc/bm_config.conf","r");
  if (__stream == (FILE *)0x0) {
    syslog(3,"%s %d : open %s Fail ","bm_read_config_xml",0x53a,"/bmdefsys/etc/bm_config.conf");
    uVar4 = 0xffffffff;
  }
  else {
    memset(param_1,0,0x1c00);
    while (pcVar2 = fgets(acStack_3020,0x1000,__stream), pcVar2 != (char *)0x0) {
      if ((acStack_3020[0] != '\0' && acStack_3020[0] != '\n') && (acStack_3020[0] != '#')) {
        FUN_00018224(acStack_3020,acStack_1020,acStack_2020);
        iVar1 = strncmp(acStack_1020,"NTPEnable=",10);
        if (iVar1 == 0) {
          iVar1 = atoi(acStack_2020);
          *param_1 = (char)iVar1;
        }
        iVar1 = strncmp(acStack_1020,"NTPServer=",10);
        if (iVar1 == 0) {
          sVar3 = strlen(acStack_2020);
          if (0xfe < sVar3) {
            sVar3 = 0xff;
          }
          strncpy(param_1 + 1,acStack_2020,sVar3);
        }
        iVar1 = strncmp(acStack_1020,"NTPServer2=",0xb);
        if (iVar1 == 0) {
          sVar3 = strlen(acStack_2020);
          if (0xfe < sVar3) {
            sVar3 = 0xff;
          }
          strncpy(param_1 + 0x100,acStack_2020,sVar3);
        }
        iVar1 = strncmp(acStack_1020,"NTPServer3=",0xb);
        if (iVar1 == 0) {
          sVar3 = strlen(acStack_2020);
          if (0xfe < sVar3) {
            sVar3 = 0xff;
          }
          strncpy(param_1 + 0x1ff,acStack_2020,sVar3);
        }
        iVar1 = strncmp(acStack_1020,"NTPServer4=",0xb);
        if (iVar1 == 0) {
          sVar3 = strlen(acStack_2020);
          if (0xfe < sVar3) {
            sVar3 = 0xff;
          }
          strncpy(param_1 + 0x2fe,acStack_2020,sVar3);
        }
        else {
          iVar1 = strncmp(acStack_1020,"NTPTimeout=",0xb);
          if (iVar1 == 0) {
            iVar1 = atoi(acStack_2020);
            *(int *)(param_1 + 0x400) = iVar1;
          }
          else {
            iVar1 = strncmp(acStack_1020,"NTPRetrySleep=",0xe);
            if (iVar1 == 0) {
              iVar1 = atoi(acStack_2020);
              *(int *)(param_1 + 0x404) = iVar1;
            }
            else {
              iVar1 = strncmp(acStack_1020,"NTPSyncInterval=",0x10);
              if (iVar1 == 0) {
                iVar1 = atoi(acStack_2020);
                *(int *)(param_1 + 0x408) = iVar1;
              }
              else {
                iVar1 = strncmp(acStack_1020,"Timezone=",9);
                if (iVar1 == 0) {
                  sVar3 = strlen(acStack_2020);
                  if (0x1f < sVar3) {
                    sVar3 = 0x20;
                  }
                  strncpy(param_1 + 0x40c,acStack_2020,sVar3);
                }
                else {
                  iVar1 = strncmp(acStack_1020,"TZ_DST_ENABLE=",0xe);
                  if (iVar1 == 0) {
                    iVar1 = atoi(acStack_2020);
                    param_1[0x42c] = (char)iVar1;
                  }
                  else {
                    iVar1 = strncmp(acStack_1020,"TZ_DST_START_M=",0xf);
                    if (iVar1 == 0) {
                      iVar1 = atoi(acStack_2020);
                      param_1[0x42d] = (char)iVar1;
                    }
                    else {
                      iVar1 = strncmp(acStack_1020,"TZ_DST_START_W=",0xf);
                      if (iVar1 == 0) {
                        iVar1 = atoi(acStack_2020);
                        param_1[0x42e] = (char)iVar1;
                      }
                      else {
                        iVar1 = strncmp(acStack_1020,"TZ_DST_START_D=",0xf);
                        if (iVar1 == 0) {
                          iVar1 = atoi(acStack_2020);
                          param_1[0x42f] = (char)iVar1;
                        }
                        else {
                          iVar1 = strncmp(acStack_1020,"TZ_DST_START_CLOCK=",0x13);
                          if (iVar1 == 0) {
                            iVar1 = atoi(acStack_2020);
                            param_1[0x430] = (char)iVar1;
                          }
                          else {
                            iVar1 = strncmp(acStack_1020,"TZ_DST_END_M=",0xd);
                            if (iVar1 == 0) {
                              iVar1 = atoi(acStack_2020);
                              param_1[0x431] = (char)iVar1;
                            }
                            else {
                              iVar1 = strncmp(acStack_1020,"TZ_DST_END_W=",0xd);
                              if (iVar1 == 0) {
                                iVar1 = atoi(acStack_2020);
                                param_1[0x432] = (char)iVar1;
                              }
                              else {
                                iVar1 = strncmp(acStack_1020,"TZ_DST_END_D=",0xd);
                                if (iVar1 == 0) {
                                  iVar1 = atoi(acStack_2020);
                                  param_1[0x433] = (char)iVar1;
                                }
                                else {
                                  iVar1 = strncmp(acStack_1020,"TZ_DST_END_CLOCK=",0x11);
                                  if (iVar1 == 0) {
                                    iVar1 = atoi(acStack_2020);
                                    param_1[0x434] = (char)iVar1;
                                  }
                                  else {
                                    iVar1 = strncmp(acStack_1020,"web_language=",0xd);
                                    if (iVar1 == 0) {
                                      iVar1 = atoi(acStack_2020);
                                      param_1[0x435] = (char)iVar1;
                                    }
                                    else {
                                      iVar1 = strncmp(acStack_1020,"LanIp6Mode=",0xb);
                                      if (iVar1 == 0) {
                                        iVar1 = atoi(acStack_2020);
                                        param_1[0x436] = (char)iVar1;
                                      }
                                      else {
                                        iVar1 = strncmp(acStack_1020,"IP6_Priamry_DNS=",0x10);
                                        if (iVar1 == 0) {
                                          sVar3 = strlen(acStack_2020);
                                          if (0x3f < sVar3) {
                                            sVar3 = 0x40;
                                          }
                                          strncpy(param_1 + 0x437,acStack_2020,sVar3);
                                        }
                                        else {
                                          iVar1 = strncmp(acStack_1020,"IP6_Secondary_DNS=",0x12);
                                          if (iVar1 == 0) {
                                            sVar3 = strlen(acStack_2020);
                                            if (0x3f < sVar3) {
                                              sVar3 = 0x40;
                                            }
                                            strncpy(param_1 + 0x477,acStack_2020,sVar3);
                                          }
                                          else {
                                            iVar1 = strncmp(acStack_1020,"system_profile=",0xf);
                                            if (iVar1 == 0) {
                                              sVar3 = strlen(acStack_2020);
                                              if (0x3ff < sVar3) {
                                                sVar3 = 0x400;
                                              }
                                              strncpy(param_1 + 0x4b7,acStack_2020,sVar3);
                                            }
                                            else {
                                              iVar1 = strncmp(acStack_1020,"gsm_default_profile=",
                                                              0x14);
                                              if (iVar1 == 0) {
                                                sVar3 = strlen(acStack_2020);
                                                if (0x7f < sVar3) {
                                                  sVar3 = 0x80;
                                                }
                                                strncpy(param_1 + 0x8b7,acStack_2020,sVar3);
                                              }
                                              else {
                                                iVar1 = strncmp(acStack_1020,"lte_default_profile=",
                                                                0x14);
                                                if (iVar1 == 0) {
                                                  sVar3 = strlen(acStack_2020);
                                                  if (0x7f < sVar3) {
                                                    sVar3 = 0x80;
                                                  }
                                                  strncpy(param_1 + 0x937,acStack_2020,sVar3);
                                                }
                                                else {
                                                  iVar1 = strncmp(acStack_1020,
                                                                  "gpp2_default_profile=",0x15);
                                                  if (iVar1 == 0) {
                                                    sVar3 = strlen(acStack_2020);
                                                    if (0x7f < sVar3) {
                                                      sVar3 = 0x80;
                                                    }
                                                    strncpy(param_1 + 0x9b7,acStack_2020,sVar3);
                                                  }
                                                  else {
                                                    iVar1 = strncmp(acStack_1020,"MacFilterMode=",
                                                                    0xe);
                                                    if (iVar1 == 0) {
                                                      iVar1 = atoi(acStack_2020);
                                                      param_1[0xa37] = (char)iVar1;
                                                    }
                                                    else {
                                                      iVar1 = strncmp(acStack_1020,
                                                                      "WiFi_MacFilter_List=",0x14);
                                                      if (iVar1 == 0) {
                                                        FUN_00018b1c(param_1,acStack_2020);
                                                      }
                                                      else {
                                                        iVar1 = strncmp(acStack_1020,"Country_code="
                                                                        ,0xd);
                                                        if (iVar1 == 0) {
                                                          sVar3 = strlen(acStack_2020);
                                                          strncpy(param_1 + 0x1155,acStack_2020,
                                                                  sVar3);
                                                        }
                                                        else {
                                                          iVar1 = strncmp(acStack_1020,
                                                                          "Default_lan_ip=",0xf);
                                                          if (iVar1 == 0) {
                                                            sVar3 = strlen(acStack_2020);
                                                            if (0xe < sVar3) {
                                                              sVar3 = 0xf;
                                                            }
                                                            strncpy(param_1 + 0x1158,acStack_2020,
                                                                    sVar3);
                                                          }
                                                          else {
                                                            iVar1 = strncmp(acStack_1020,
                                                                            "AUTOREBOOT_default=",
                                                                            0x13);
                                                            if (iVar1 == 0) {
                                                              iVar1 = atoi(acStack_2020);
                                                              param_1[0x1167] = (char)iVar1;
                                                            }
                                                            else {
                                                              iVar1 = strncmp(acStack_1020,
                                                                              "AUTOREBOOT_enable=",
                                                                              0x12);
                                                              if (iVar1 == 0) {
                                                                iVar1 = atoi(acStack_2020);
                                                                param_1[0x1168] = (char)iVar1;
                                                              }
                                                              else {
                                                                iVar1 = strncmp(acStack_1020,
                                                                                                                                                                
                                                  "AUTOREBOOT_Schedule_hour=",0x19);
                                                  if (iVar1 == 0) {
                                                    iVar1 = atoi(acStack_2020);
                                                    param_1[0x1169] = (char)iVar1;
                                                  }
                                                  else {
                                                    iVar1 = strncmp(acStack_1020,
                                                                    "AUTOREBOOT_Schedule_minute=",
                                                                    0x1b);
                                                    if (iVar1 == 0) {
                                                      iVar1 = atoi(acStack_2020);
                                                      param_1[0x116a] = (char)iVar1;
                                                    }
                                                    else {
                                                      iVar1 = strncmp(acStack_1020,
                                                                      "AUTOREBOOT_Schedule_Type=",
                                                                      0x19);
                                                      if (iVar1 == 0) {
                                                        iVar1 = atoi(acStack_2020);
                                                        param_1[0x116b] = (char)iVar1;
                                                      }
                                                      else {
                                                        iVar1 = strncmp(acStack_1020,
                                                                        "AUTOREBOOT_Schedule_WEEK=",
                                                                        0x19);
                                                        if (iVar1 == 0) {
                                                          iVar1 = atoi(acStack_2020);
                                                          param_1[0x116c] = (char)iVar1;
                                                        }
                                                        else {
                                                          iVar1 = strncmp(acStack_1020,
                                                                          "AUTOREBOOT_Schedule_DAY="
                                                                          ,0x18);
                                                          if (iVar1 == 0) {
                                                            iVar1 = atoi(acStack_2020);
                                                            param_1[0x116d] = (char)iVar1;
                                                          }
                                                          else {
                                                            iVar1 = strncmp(acStack_1020,
                                                                            "AUTO_LOGOUT_TIME=",0x11
                                                                           );
                                                            if (iVar1 == 0) {
                                                              iVar1 = atoi(acStack_2020);
                                                              *(int *)(param_1 + 0x1170) = iVar1;
                                                            }
                                                            else {
                                                              iVar1 = strncmp(acStack_1020,
                                                                              "IP_REDIRECT=",0xc);
                                                              if (iVar1 == 0) {
                                                                sVar3 = strlen(acStack_2020);
                                                                strncpy(param_1 + 0x1174,
                                                                        acStack_2020,sVar3);
                                                              }
                                                              else {
                                                                iVar1 = strncmp(acStack_1020,
                                                                                "batteryidletime=",
                                                                                0x10);
                                                                if (iVar1 == 0) {
                                                                  iVar1 = atoi(acStack_2020);
                                                                  param_1[0x1274] = (char)iVar1;
                                                                }
                                                                else {
                                                                  iVar1 = strncmp(acStack_1020,
                                                                                  "deepsleeptime=",
                                                                                  0xe);
                                                                  if (iVar1 == 0) {
                                                                    iVar1 = atoi(acStack_2020);
                                                                    param_1[0x1275] = (char)iVar1;
                                                                  }
                                                                  else {
                                                                    iVar1 = strncmp(acStack_1020,
                                                                                                                                                                        
                                                  "urlFilterEnable=",0x10);
                                                  if (iVar1 == 0) {
                                                    iVar1 = atoi(acStack_2020);
                                                    param_1[0x1276] = (char)iVar1;
                                                  }
                                                  else {
                                                    iVar1 = strncmp(acStack_1020,
                                                                    "urlFilterKeywords=",0x12);
                                                    if (iVar1 == 0) {
                                                      sVar3 = strlen(acStack_2020);
                                                      strncpy(param_1 + 0x1277,acStack_2020,sVar3);
                                                    }
                                                    else {
                                                      iVar1 = strncmp(acStack_1020,"samba=",6);
                                                      if (iVar1 == 0) {
                                                        iVar1 = atoi(acStack_2020);
                                                        param_1[0x1637] = (char)iVar1;
                                                      }
                                                      else {
                                                        iVar1 = strncmp(acStack_1020,
                                                                        "netstat_enable=",0xf);
                                                        if (iVar1 == 0) {
                                                          iVar1 = atoi(acStack_2020);
                                                          param_1[0x1638] = (char)iVar1;
                                                        }
                                                        else {
                                                          iVar1 = strncmp(acStack_1020,
                                                                          "quota_limit=",0xc);
                                                          if (iVar1 == 0) {
                                                            iVar1 = atoi(acStack_2020);
                                                            *(int *)(param_1 + 0x163c) = iVar1;
                                                          }
                                                          else {
                                                            iVar1 = strncmp(acStack_1020,
                                                                            "week_start=",0xb);
                                                            if (iVar1 == 0) {
                                                              iVar1 = atoi(acStack_2020);
                                                              param_1[0x1640] = (char)iVar1;
                                                            }
                                                            else {
                                                              iVar1 = strncmp(acStack_1020,
                                                                              "recount_mday=",0xd);
                                                              if (iVar1 == 0) {
                                                                uVar5 = atoi(acStack_2020);
                                                                param_1[0x1641] = (char)uVar5;
                                                                if (0x1e < ((uVar5 & 0xff) - 1 &
                                                                           0xff)) {
                                                                  param_1[0x1641] = 0x1f;
                                                                }
                                                              }
                                                              else {
                                                                iVar1 = strncmp(acStack_1020,
                                                                                "block_onlimit=",0xe
                                                                               );
                                                                if (iVar1 == 0) {
                                                                  iVar1 = atoi(acStack_2020);
                                                                  param_1[0x1642] = (char)iVar1;
                                                                }
                                                                else {
                                                                  iVar1 = strncmp(acStack_1020,
                                                                                  "DefaultPasswd=",
                                                                                  0xe);
                                                                  if (iVar1 == 0) {
                                                                    iVar1 = atoi(acStack_2020);
                                                                    param_1[0x1643] = (char)iVar1;
                                                                  }
                                                                  else {
                                                                    iVar1 = strncmp(acStack_1020,
                                                                                                                                                                        
                                                  "nodogsplash_enable=",0x13);
                                                  if (iVar1 == 0) {
                                                    iVar1 = atoi(acStack_2020);
                                                    param_1[0x1644] = (char)iVar1;
                                                  }
                                                  else {
                                                    iVar1 = strncmp(acStack_1020,"nodogsplash_url=",
                                                                    0x10);
                                                    if (iVar1 == 0) {
                                                      sVar3 = strlen(acStack_2020);
                                                      strncpy(param_1 + 0x1645,acStack_2020,sVar3);
                                                    }
                                                    else {
                                                      iVar1 = strncmp(acStack_1020,
                                                                      "nodogsplash_trusted_mac=",
                                                                      0x18);
                                                      if (iVar1 == 0) {
                                                        sVar3 = strlen(acStack_2020);
                                                        strncpy(param_1 + 0x1a46,acStack_2020,sVar3)
                                                        ;
                                                      }
                                                      else {
                                                        iVar1 = strncmp(acStack_1020,
                                                                        "wwan_ping_enable=",0x11);
                                                        if (iVar1 == 0) {
                                                          iVar1 = atoi(acStack_2020);
                                                          param_1[0x1baf] = (char)iVar1;
                                                        }
                                                        else {
                                                          iVar1 = strncmp(acStack_1020,
                                                                          "netstat_sim_type=",0x11);
                                                          if (iVar1 == 0) {
                                                            iVar1 = atoi(acStack_2020);
                                                            param_1[0x1bb0] = (char)iVar1;
                                                          }
                                                          else {
                                                            iVar1 = strncmp(acStack_1020,
                                                                            "netstat_data_total=",
                                                                            0x13);
                                                            if (iVar1 == 0) {
                                                              iVar1 = atoi(acStack_2020);
                                                              *(int *)(param_1 + 0x1bc4) = iVar1;
                                                            }
                                                            else {
                                                              iVar1 = strncmp(acStack_1020,
                                                                                                                                                            
                                                  "netstat_validity_period=",0x18);
                                                  if (iVar1 == 0) {
                                                    sVar3 = strlen(acStack_2020);
                                                    strncpy(param_1 + 0x1bb1,acStack_2020,sVar3);
                                                  }
                                                  else {
                                                    iVar1 = strncmp(acStack_1020,
                                                                    "netstat_auto_check=",0x13);
                                                    if (iVar1 == 0) {
                                                      iVar1 = atoi(acStack_2020);
                                                      param_1[0x1bc8] = (char)iVar1;
                                                    }
                                                    else {
                                                      iVar1 = strncmp(acStack_1020,"lcd_off_time=",
                                                                      0xd);
                                                      if (iVar1 == 0) {
                                                        iVar1 = atoi(acStack_2020);
                                                        *(int *)(param_1 + 0x1bcc) = iVar1;
                                                      }
                                                      else {
                                                        iVar1 = strncmp(acStack_1020,
                                                                        "lcd_off_password=",0x11);
                                                        if (iVar1 == 0) {
                                                          iVar1 = atoi(acStack_2020);
                                                          *(int *)(param_1 + 0x1bd0) = iVar1;
                                                        }
                                                        else {
                                                          iVar1 = strncmp(acStack_1020,
                                                                          "wwan_upnp_disable=",0x12)
                                                          ;
                                                          if (iVar1 == 0) {
                                                            iVar1 = atoi(acStack_2020);
                                                            param_1[0x1bd4] = (char)iVar1;
                                                          }
                                                          else {
                                                            iVar1 = strncmp(acStack_1020,
                                                                            "wwan_flood_block=",0x11
                                                                           );
                                                            if (iVar1 == 0) {
                                                              iVar1 = atoi(acStack_2020);
                                                              param_1[0x1bd5] = (char)iVar1;
                                                            }
                                                            else {
                                                              iVar1 = strncmp(acStack_1020,
                                                                              "webLogin_lock_time=",
                                                                              0x13);
                                                              if (iVar1 == 0) {
                                                                iVar1 = atoi(acStack_2020);
                                                                *(int *)(param_1 + 0x1bd8) = iVar1;
                                                              }
                                                              else {
                                                                iVar1 = strncmp(acStack_1020,
                                                                                                                                                                
                                                  "manual_wwanDns_enable=",0x16);
                                                  if (iVar1 == 0) {
                                                    iVar1 = atoi(acStack_2020);
                                                    param_1[0x1bdc] = (char)iVar1;
                                                  }
                                                  else {
                                                    iVar1 = strncmp(acStack_1020,
                                                                    "manual_priWwanDns_addr=",0x17);
                                                    if (iVar1 == 0) {
                                                      pcVar2 = param_1 + 0x1bdd;
                                                      uVar5 = strlen(acStack_2020);
                                                    }
                                                    else {
                                                      iVar1 = strncmp(acStack_1020,
                                                                      "manual_secWwanDns_addr=",0x17
                                                                     );
                                                      if (iVar1 != 0) {
                                                        iVar1 = strncmp(acStack_1020,
                                                                        "apn_profile_mode=",0x11);
                                                        if (iVar1 == 0) {
                                                          iVar1 = atoi(acStack_2020);
                                                          param_1[0x1bfd] = (char)iVar1;
                                                        }
                                                        else {
                                                          iVar1 = strncmp(acStack_1020,
                                                                          "first_login=",0xc);
                                                          if (iVar1 == 0) {
                                                            iVar1 = atoi(acStack_2020);
                                                            param_1[0x1bfe] = (char)iVar1;
                                                          }
                                                        }
                                                        goto LAB_00018d80;
                                                      }
                                                      pcVar2 = param_1 + 0x1bed;
                                                      uVar5 = strlen(acStack_2020);
                                                    }
                                                    if (0xe < uVar5) {
                                                      uVar5 = 0xf;
                                                    }
                                                    strncpy(pcVar2,acStack_2020,uVar5);
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
LAB_00018d80:
      memset(acStack_3020,0,0x1000);
      memset(acStack_1020,0,0x1000);
      memset(acStack_2020,0,0x1000);
    }
    fclose(__stream);
    uVar4 = 0;
  }
  return uVar4;
}

