#!/bin/bash
set -e

if [ "$(id -u)" -ne 0 ]; then
  echo "Please run as root: sudo bash install-service.sh"
  exit 1
fi

INSTALL_DIR="/opt/kitchenklock"
SERVICE_FILE="/etc/systemd/system/kitchenklock.service"
JAR_SRC="backend/target/scala-3.6.3/kitchenklock-assembly.jar"
SCRIPT_DIR="$(dirname "$0")"

if [ ! -f "$SCRIPT_DIR/$JAR_SRC" ]; then
  echo "ERROR: JAR not found at $SCRIPT_DIR/$JAR_SRC"
  echo "Build it first with: cd frontend && npm run build && cd ../backend && sbt assembly"
  exit 1
fi

echo "==> Creating install directory $INSTALL_DIR"
mkdir -p "$INSTALL_DIR"

echo "==> Copying JAR"
cp "$SCRIPT_DIR/$JAR_SRC" "$INSTALL_DIR/kitchenklock-assembly.jar"

echo "==> Creating systemd service"
cat > "$SERVICE_FILE" << 'EOF'
[Unit]
Description=KitchenKlock – Digital/Analog clock display
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/opt/kitchenklock
ExecStart=/usr/bin/java -Xmx512m -Xms128m -XX:+UseSerialGC -jar /opt/kitchenklock/kitchenklock-assembly.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=kitchenklock
Environment=PORT=8080

[Install]
WantedBy=multi-user.target
EOF

echo "==> Reloading systemd and enabling service"
systemctl daemon-reload
systemctl enable kitchenklock
systemctl restart kitchenklock

echo "==> Adding kpi to i2c group (DDC/CI brightness control)"
usermod -a -G i2c pi

echo "==> Installing ddcutil"
apt-get install -y ddcutil

LABWC_DIR="/home/pi/.config/labwc"
if [ -d "$LABWC_DIR" ] || command -v labwc &> /dev/null; then
  echo "==> Configuring labwc autostart (kiosk mode)"
  mkdir -p "$LABWC_DIR"
  cat > "$LABWC_DIR/autostart" << 'EOF2'
xset s off &
xset s noblank &
xset -dpms &

unclutter -idle 1 -root &

( sleep 8; chromium-browser --kiosk     --ozone-platform=wayland     --noerrdialogs     --disable-infobars     --no-first-run     --disable-session-crashed-bubble     --disable-restore-session-state     --check-for-update-interval=31536000     http://localhost:8080 ) &
EOF2
  chown pi:pi "$LABWC_DIR/autostart"

  echo "==> Configuring invisible cursor theme"
  LABWC_ENV="$LABWC_DIR/environment"
  if [ -f "$LABWC_ENV" ]; then
    sed -i '/^XCURSOR_/d' "$LABWC_ENV"
  fi
  echo "XCURSOR_THEME=blank" >> "$LABWC_ENV"
  echo "XCURSOR_SIZE=1"      >> "$LABWC_ENV"
  chown pi:pi "$LABWC_ENV"

  echo "==> Creating blank cursor theme"
  ICON_DIR="/home/pi/.local/share/icons/blank"
  mkdir -p "$ICON_DIR/cursors"
  python3 << 'PYEOF'
import struct, os

def make_xcursor():
    MAGIC = b'Xcur'
    VERSION = 65536
    CHUNK_IMAGE = 0xFFFD0002
    img_header = struct.pack('<IIIIIIIII',
        40, CHUNK_IMAGE, 1, VERSION, 1, 1, 0, 0, 50)
    img_data = img_header + struct.pack('<I', 0x00000000)
    toc = struct.pack('<III', CHUNK_IMAGE, 1, 28)
    header = MAGIC + struct.pack('<III', 16, VERSION, 1)
    return header + toc + img_data

blank = make_xcursor()
theme_dir = '/home/pi/.local/share/icons/blank/cursors'
cursors = [
    'default','pointer','left_ptr','right_ptr','move','crosshair',
    'text','wait','progress','help','not-allowed','no-drop',
    'grab','grabbing','col-resize','row-resize','all-scroll',
    'n-resize','s-resize','e-resize','w-resize',
    'ne-resize','nw-resize','se-resize','sw-resize',
    'ew-resize','ns-resize','nesw-resize','nwse-resize',
]
for name in cursors:
    with open(os.path.join(theme_dir, name), 'wb') as f:
        f.write(blank)
print(f'  Created {len(cursors)} invisible cursor files')
PYEOF
  cat > "$ICON_DIR/index.theme" << 'EOF3'
[Icon Theme]
Name=blank
Comment=Invisible cursor
EOF3
  chown -R pi:pi "/home/pi/.local"
  echo "==> Labwc kiosk configured (invisible cursor + autostart)"
fi

echo ""
read -r -p "Install WiFi watchdog? Monitors connection and reboots if WiFi is lost. [y/N] " INSTALL_WATCHDOG
if [[ "$INSTALL_WATCHDOG" =~ ^[Yy]$ ]]; then
  echo "==> Installing WiFi watchdog"
  WATCHDOG_SRC="$SCRIPT_DIR/wifi_watchdog.sh"
  WATCHDOG_DST="/home/pi/wifi_watchdog.sh"
  WATCHDOG_SERVICE="/etc/systemd/system/wifi-watchdog.service"

  if [ ! -f "$WATCHDOG_SRC" ]; then
    echo "WARNING: wifi_watchdog.sh not found, skipping watchdog installation"
  else
    cp "$WATCHDOG_SRC" "$WATCHDOG_DST"
    chmod +x "$WATCHDOG_DST"
    chown pi:pi "$WATCHDOG_DST"

    cat > "$WATCHDOG_SERVICE" << 'EOF4'
[Unit]
Description=WiFi Watchdog Service
After=network.target

[Service]
ExecStart=/home/pi/wifi_watchdog.sh
User=root
Restart=always

[Install]
WantedBy=multi-user.target
EOF4

    systemctl daemon-reload
    systemctl enable wifi-watchdog
    systemctl restart wifi-watchdog
    echo "==> WiFi watchdog installed and started"
  fi
else
  echo "==> Skipping WiFi watchdog installation"
fi

echo ""
echo "==> KitchenKlock installed and started!"
echo "    Check status: systemctl status kitchenklock"
echo "    View logs:    journalctl -u kitchenklock -f"
echo "    Open browser: http://localhost:8080"
echo "    WiFi watchdog: systemctl status wifi-watchdog"
echo "    Watchdog log:  tail -f /home/pi/wifi_history.log"
echo ""
