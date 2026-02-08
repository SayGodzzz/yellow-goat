# 🚀 Yellow Goat - Verwaltungssystem

Ein modernes, vollautomatisches Verwaltungssystem für Yellow Coat (Software).

## ✨ Features

- ✅ Benutzerauthentifizierung mit 2FA
- ✅ Admin-basiertes User-Management
- ✅ News-Feed mit Likes & Kommentaren
- ✅ Chat-System (in Entwicklung)
- ✅ Mitarbeiterverwaltung (in Entwicklung)
- ✅ Projektmanagement (in Entwicklung)
- ✅ Responsive Design
- ✅ Docker-Ready

## 🛠️ Installation

### Voraussetzungen
- Docker & Docker Compose installiert
- Git (optional)

### Schnellstart

1. **Repository clonen:**
```bash
git clone https://github.com/SayGodzzz/yellow-goat.git
cd yellow-goat
```

2. **Docker Container starten:**
```bash
docker-compose up -d
```

3. **Im Browser öffnen:**
```
http://localhost:3000
```

4. **Login-Daten (Admin-Account):**
- Username: `admin`
- Password: `admin123`

## 🔐 Standard Admin-Account

```
Username: admin
Email: chillkroete13@gmail.com
Password: admin123
2FA: Muss nach dem ersten Login aktiviert werden
```

## 📁 Projektstruktur

```
yellow-goat/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── server.js    # Main Server
│   │   └── routes/      # API Endpoints
│   ├── package.json
│   └── Dockerfile
├── frontend/            # React + Vite UI
│   ├── src/
│   ├── index.html
│   └── package.json
├── docker-compose.yml   # Docker Orchestration
└── README.md
```

## 🌐 API Endpoints

### Authentifizierung
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-2fa` - 2FA Verification
- `POST /api/auth/setup-2fa` - Setup 2FA
- `POST /api/auth/enable-2fa` - Enable 2FA

### Benutzer
- `GET /api/users` - Alle Benutzer
- `GET /api/users/:id` - Benutzer Details
- `POST /api/users` - Benutzer erstellen (nur Admin)
- `PUT /api/users/:id` - Benutzer aktualisieren

### News
- `GET /api/news` - Alle News
- `POST /api/news` - News erstellen (nur Admin)
- `POST /api/news/:id/like` - News liken
- `POST /api/news/:id/unlike` - Like entfernen
- `POST /api/news/:id/comments` - Kommentar hinzufügen
- `GET /api/news/:id/comments` - Kommentare abrufen

## 🔧 Umgebungsvariablen (.env)

Backend:
```
DB_HOST=postgres
DB_PORT=5432
DB_USER=yellowgoat
DB_PASSWORD=secure_password_123
DB_NAME=yellow_goat_db
JWT_SECRET=your_super_secret_jwt_key_change_this
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

## 📦 Datenbank

Die Datenbank wird automatisch beim ersten Start erstellt:
- `users` - Benutzer & Authentifizierung
- `news` - News & Artikel
- `news_likes` - News Likes
- `news_comments` - News Kommentare
- `chat_messages` - Chat Nachrichten
- `projects` - Projekte
- `project_members` - Projektmitglieder

## 🚀 Nächste Schritte

1. ✅ Admin-Account erstellen
2. 📝 Chat-System implementieren
3. 👥 Mitarbeiterverwaltung erweitern
4. 📁 Projektmanagement erweitern
5. 🔐 2FA Setup Guide für Benutzer
6. 📱 Mobile-Optimierung
7. 🎨 Design & Branding verfeinern

## 🆘 Hilfe

### Container-Logs ansehen:
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

### Container stoppen:
```bash
docker-compose down
```

### Datenbank zurücksetzen:
```bash
docker-compose down -v
docker-compose up -d
```

## 📄 Lizenz

Proprietary - Yellow Coat (Software)

---

**Made with ❤️ für Yellow Coat (Software)**