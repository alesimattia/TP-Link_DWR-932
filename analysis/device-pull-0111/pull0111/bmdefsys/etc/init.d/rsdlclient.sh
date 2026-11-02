#! /bin/sh

# Copyright (c) 2014 Qualcomm Technologies, Inc.  All Rights Reserved.
# Qualcomm Technologies Proprietary and Confidential.

set -e

case "$1" in
  start)
        echo -n "Starting rsdlclient: "
        start-stop-daemon -S -b -a /bmdefsys/usr/bin/rsdlclient

        echo "done"
        ;;
  stop)
        echo -n "Stopping rsdlclient: "
        start-stop-daemon -K -n rsdlclient
        echo "done"
        ;;
  restart)
        $0 stop
        $0 start
        ;;
  *)
        echo "Usage rsdlclient { start | stop | restart}" >&2
        exit 1
        ;;
esac

exit 0
