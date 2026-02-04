# SSH туннели к базам данных

## 🔐 DEV База (localhost:15432)

### Создать туннель к dev базе
```bash
ssh -f -N -L 15432:localhost:5432 user@your-dev-server.com
```

### Проверить туннель
```bash
lsof -i :15432
```

### Подключиться к dev базе
```bash
psql -h localhost -p 15432 -U focusima_dev_admin -d focusima_dev
```

---

## 🚀 PROD База (опционально)

### Создать туннель к prod базе
```bash
ssh -f -N -L 25432:localhost:5432 user@your-prod-server.com
```

### Подключиться к prod базе
```bash
psql -h localhost -p 25432 -U focusima_prod_admin -d focusima_prod
```

---

## 🛠️ Управление туннелями

### Посмотреть активные туннели
```bash
ps aux | grep ssh | grep "\-L"
```

### Закрыть туннель
```bash
# Найти PID процесса
ps aux | grep "ssh.*15432"

# Убить процесс
kill <PID>

# Или закрыть все SSH туннели на порт 15432
pkill -f "ssh.*15432"
```

### Автозапуск туннеля (macOS)

Создайте файл `~/Library/LaunchAgents/com.focusima.ssh-tunnel.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.focusima.ssh-tunnel</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/ssh</string>
        <string>-N</string>
        <string>-L</string>
        <string>15432:localhost:5432</string>
        <string>user@your-server.com</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

Затем:
```bash
# Загрузить автозапуск
launchctl load ~/Library/LaunchAgents/com.focusima.ssh-tunnel.plist

# Выгрузить
launchctl unload ~/Library/LaunchAgents/com.focusima.ssh-tunnel.plist
```

---

## 📝 Конфигурация SSH

Добавьте в `~/.ssh/config` для упрощения:

```
Host focusima-dev
    HostName your-dev-server.com
    User your_username
    Port 22
    LocalForward 15432 localhost:5432
    ServerAliveInterval 60
    ServerAliveCountMax 3

Host focusima-prod
    HostName your-prod-server.com
    User your_username
    Port 22
    LocalForward 25432 localhost:5432
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

Теперь можно запускать просто:
```bash
ssh -N focusima-dev
```
