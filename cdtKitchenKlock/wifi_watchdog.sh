#!/bin/bash

ROUTER_IP="192.168.1.1"
INTERFACE="wlan0"
FAIL_COUNT=0
MAX_FAILS=6
LOG_FILE="/home/kitchenklockadmin/wifi_history.log"

log_event() {
    CPU_LOAD=$(uptime | awk -F'load average:' '{ print $2 }' | cut -d, -f1 | xargs)
    MEM_FREE=$(free -m | awk '/^Mem:/{print $4}')

    echo "$(date '+%Y-%m-%d %H:%M:%S') - CPU Load: $CPU_LOAD - Mem Free: ${MEM_FREE}MB - $1" >> "$LOG_FILE"
}

log_event "System started / Watchdog activated."

sleep 90

while true; do
    if ping -c 1 -W 2 $ROUTER_IP > /dev/null 2>&1; then
        if [ $FAIL_COUNT -gt 0 ]; then
            log_event "Network restored after $FAIL_COUNT failed attempts."
            FAIL_COUNT=0
        fi
    else
        ((FAIL_COUNT++))

        if [ $FAIL_COUNT -ge $MAX_FAILS ]; then
            log_event "CRITICAL: $MAX_FAILS failed attempts. Rebooting device NOW!"
            sync
            sudo reboot
            exit 0
        else
            log_event "WARNING: Ping failed ($FAIL_COUNT/$MAX_FAILS). Attempting to restart $INTERFACE..."
            sudo nmcli device disconnect $INTERFACE
            sleep 2
            sudo nmcli device connect $INTERFACE
        fi
    fi

    sleep 20
done
