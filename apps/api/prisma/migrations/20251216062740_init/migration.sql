-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OPERATOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "canView" BOOLEAN NOT NULL DEFAULT true,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "canExport" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "user_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "venues" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'OTHER',
    "address" TEXT,
    "city" TEXT,
    "capacity" INTEGER,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "instagramUrl" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "cuit" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "whatsapp" TEXT,
    "isSystemParticipant" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "persons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "dietaryRestrictions" TEXT DEFAULT '[]',
    "identityHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    "participantId" TEXT,
    CONSTRAINT "persons_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "participants" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event_guests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "mesaId" TEXT,
    "estadoIngreso" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "checkedInAt" DATETIME,
    "checkedInBy" TEXT,
    "checkedOutAt" DATETIME,
    "checkedOutBy" TEXT,
    "observaciones" TEXT,
    "accesibilidad" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "addedBy" TEXT,
    CONSTRAINT "event_guests_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "event_guests_personId_fkey" FOREIGN KEY ("personId") REFERENCES "persons" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "event_guests_mesaId_fkey" FOREIGN KEY ("mesaId") REFERENCES "mesas" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dishes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoria" TEXT NOT NULL DEFAULT 'PRINCIPAL',
    "dietaryInfo" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT
);

-- CreateTable
CREATE TABLE "dish_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "isSystemDefault" BOOLEAN NOT NULL DEFAULT false,
    "allowMultipleDefaults" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dish_categories_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event_dishes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "dishId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_dishes_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "event_dishes_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "dishes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "event_dishes_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "dish_categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "guest_dishes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventGuestId" TEXT NOT NULL,
    "eventDishId" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    CONSTRAINT "guest_dishes_eventGuestId_fkey" FOREIGN KEY ("eventGuestId") REFERENCES "event_guests" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "guest_dishes_eventDishId_fkey" FOREIGN KEY ("eventDishId") REFERENCES "event_dishes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mesas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "forma" TEXT NOT NULL DEFAULT 'REDONDA',
    "sector" TEXT,
    "posX" REAL,
    "posY" REAL,
    "rotation" REAL DEFAULT 0,
    "observaciones" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    CONSTRAINT "mesas_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "venueId" TEXT,
    "clientId" TEXT,
    "clonedFromId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tieneMesasAsignadas" BOOLEAN NOT NULL DEFAULT true,
    "tieneMenuIndividual" BOOLEAN NOT NULL DEFAULT true,
    "requiereCheckout" BOOLEAN NOT NULL DEFAULT false,
    "checkinAccessToken" TEXT,
    "salonAncho" REAL,
    "salonLargo" REAL,
    "salonImageUrl" TEXT,
    CONSTRAINT "events_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "events_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "events_clonedFromId_fkey" FOREIGN KEY ("clonedFromId") REFERENCES "events" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "events_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event_data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventType" TEXT NOT NULL DEFAULT 'OTHER',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "guestCount" INTEGER,
    "instagramUrl" TEXT,
    "instagramUser" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "twitter" TEXT,
    "website" TEXT,
    "eventImage" TEXT,
    "hashtag" TEXT,
    "spotifyPlaylist" TEXT,
    "notes" TEXT,
    "customFields" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#7C3AED',
    "secondaryColor" TEXT NOT NULL DEFAULT '#EC4899',
    "accentColor" TEXT NOT NULL DEFAULT '#F59E0B',
    CONSTRAINT "event_data_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "musicadj_configs" (
    "eventId" TEXT NOT NULL PRIMARY KEY,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "cooldownSeconds" INTEGER NOT NULL DEFAULT 300,
    "allowWithoutSpotify" BOOLEAN NOT NULL DEFAULT true,
    "welcomeMessage" TEXT,
    "showQueueToClient" BOOLEAN NOT NULL DEFAULT false,
    "customMessages" TEXT,
    CONSTRAINT "musicadj_configs_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "song_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "spotifyId" TEXT,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "albumArtUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "playlistId" TEXT,
    "fromClientPlaylist" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "song_requests_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "song_requests_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "participants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "song_requests_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "client_playlists" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "client_playlists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "spotifyPlaylistId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trackCount" INTEGER NOT NULL,
    "tracksData" TEXT,
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "importedBy" TEXT NOT NULL,
    CONSTRAINT "client_playlists_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "karaoke_songs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "youtubeShareUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "duration" INTEGER,
    "source" TEXT NOT NULL DEFAULT 'YOUTUBE',
    "language" TEXT NOT NULL DEFAULT 'ES',
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIO',
    "ranking" INTEGER NOT NULL DEFAULT 3,
    "opinion" TEXT,
    "moods" TEXT NOT NULL DEFAULT '[]',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "timesRequested" INTEGER NOT NULL DEFAULT 1,
    "timesCompleted" INTEGER NOT NULL DEFAULT 0,
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "karaokeya_configs" (
    "eventId" TEXT NOT NULL PRIMARY KEY,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "cooldownSeconds" INTEGER NOT NULL DEFAULT 600,
    "maxPerPerson" INTEGER NOT NULL DEFAULT 0,
    "showQueueToClient" BOOLEAN NOT NULL DEFAULT true,
    "showNextSinger" BOOLEAN NOT NULL DEFAULT true,
    "suggestionsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "suggestionsCount" INTEGER NOT NULL DEFAULT 3,
    "allowedLanguages" TEXT NOT NULL DEFAULT '[]',
    "youtubeSearchKeywords" TEXT NOT NULL DEFAULT '["letra", "lyrics"]',
    "customMessages" TEXT,
    "displayMode" TEXT NOT NULL DEFAULT 'QUEUE',
    "displayLayout" TEXT NOT NULL DEFAULT 'HORIZONTAL',
    "displayBreakMessage" TEXT NOT NULL DEFAULT '¡Ya regresamos! 🎤',
    "displayStartMessage" TEXT NOT NULL DEFAULT '¡Ya comenzamos! 🎉',
    "displayPromoImageUrl" TEXT,
    CONSTRAINT "karaokeya_configs_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "karaoke_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "songId" TEXT,
    "title" TEXT NOT NULL,
    "artist" TEXT,
    "turnNumber" INTEGER NOT NULL,
    "queuePosition" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calledAt" DATETIME,
    CONSTRAINT "karaoke_requests_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "karaoke_requests_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "participants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "karaoke_requests_songId_fkey" FOREIGN KEY ("songId") REFERENCES "karaoke_songs" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "karaoke_song_likes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "songId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "karaoke_song_likes_songId_fkey" FOREIGN KEY ("songId") REFERENCES "karaoke_songs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "karaoke_song_likes_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "participants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "user_permissions_userId_idx" ON "user_permissions"("userId");

-- CreateIndex
CREATE INDEX "user_permissions_module_idx" ON "user_permissions"("module");

-- CreateIndex
CREATE UNIQUE INDEX "user_permissions_userId_module_key" ON "user_permissions"("userId", "module");

-- CreateIndex
CREATE UNIQUE INDEX "participants_email_key" ON "participants"("email");

-- CreateIndex
CREATE UNIQUE INDEX "persons_email_key" ON "persons"("email");

-- CreateIndex
CREATE UNIQUE INDEX "persons_participantId_key" ON "persons"("participantId");

-- CreateIndex
CREATE INDEX "persons_email_idx" ON "persons"("email");

-- CreateIndex
CREATE INDEX "persons_apellido_nombre_idx" ON "persons"("apellido", "nombre");

-- CreateIndex
CREATE INDEX "persons_identityHash_idx" ON "persons"("identityHash");

-- CreateIndex
CREATE INDEX "event_guests_eventId_idx" ON "event_guests"("eventId");

-- CreateIndex
CREATE INDEX "event_guests_eventId_estadoIngreso_idx" ON "event_guests"("eventId", "estadoIngreso");

-- CreateIndex
CREATE INDEX "event_guests_personId_idx" ON "event_guests"("personId");

-- CreateIndex
CREATE INDEX "event_guests_mesaId_idx" ON "event_guests"("mesaId");

-- CreateIndex
CREATE UNIQUE INDEX "event_guests_eventId_personId_key" ON "event_guests"("eventId", "personId");

-- CreateIndex
CREATE INDEX "dishes_nombre_idx" ON "dishes"("nombre");

-- CreateIndex
CREATE INDEX "dishes_isActive_idx" ON "dishes"("isActive");

-- CreateIndex
CREATE INDEX "dishes_categoria_idx" ON "dishes"("categoria");

-- CreateIndex
CREATE INDEX "dish_categories_eventId_idx" ON "dish_categories"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "dish_categories_eventId_nombre_key" ON "dish_categories"("eventId", "nombre");

-- CreateIndex
CREATE INDEX "event_dishes_eventId_idx" ON "event_dishes"("eventId");

-- CreateIndex
CREATE INDEX "event_dishes_eventId_categoryId_idx" ON "event_dishes"("eventId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "event_dishes_eventId_dishId_key" ON "event_dishes"("eventId", "dishId");

-- CreateIndex
CREATE INDEX "guest_dishes_eventGuestId_idx" ON "guest_dishes"("eventGuestId");

-- CreateIndex
CREATE INDEX "guest_dishes_eventDishId_idx" ON "guest_dishes"("eventDishId");

-- CreateIndex
CREATE UNIQUE INDEX "guest_dishes_eventGuestId_eventDishId_key" ON "guest_dishes"("eventGuestId", "eventDishId");

-- CreateIndex
CREATE INDEX "mesas_eventId_idx" ON "mesas"("eventId");

-- CreateIndex
CREATE INDEX "mesas_eventId_sector_idx" ON "mesas"("eventId", "sector");

-- CreateIndex
CREATE UNIQUE INDEX "mesas_eventId_numero_key" ON "mesas"("eventId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "events_checkinAccessToken_key" ON "events"("checkinAccessToken");

-- CreateIndex
CREATE UNIQUE INDEX "event_data_eventId_key" ON "event_data"("eventId");

-- CreateIndex
CREATE INDEX "song_requests_eventId_status_idx" ON "song_requests"("eventId", "status");

-- CreateIndex
CREATE INDEX "song_requests_eventId_createdAt_idx" ON "song_requests"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "song_requests_participantId_idx" ON "song_requests"("participantId");

-- CreateIndex
CREATE INDEX "song_requests_playlistId_idx" ON "song_requests"("playlistId");

-- CreateIndex
CREATE UNIQUE INDEX "client_playlists_spotifyPlaylistId_key" ON "client_playlists"("spotifyPlaylistId");

-- CreateIndex
CREATE INDEX "client_playlists_eventId_idx" ON "client_playlists"("eventId");

-- CreateIndex
CREATE INDEX "client_playlists_spotifyPlaylistId_idx" ON "client_playlists"("spotifyPlaylistId");

-- CreateIndex
CREATE UNIQUE INDEX "karaoke_songs_youtubeId_key" ON "karaoke_songs"("youtubeId");

-- CreateIndex
CREATE INDEX "karaoke_songs_youtubeId_idx" ON "karaoke_songs"("youtubeId");

-- CreateIndex
CREATE INDEX "karaoke_songs_language_idx" ON "karaoke_songs"("language");

-- CreateIndex
CREATE INDEX "karaoke_songs_difficulty_idx" ON "karaoke_songs"("difficulty");

-- CreateIndex
CREATE INDEX "karaoke_songs_ranking_idx" ON "karaoke_songs"("ranking");

-- CreateIndex
CREATE INDEX "karaoke_songs_likesCount_idx" ON "karaoke_songs"("likesCount");

-- CreateIndex
CREATE INDEX "karaoke_songs_timesRequested_idx" ON "karaoke_songs"("timesRequested");

-- CreateIndex
CREATE INDEX "karaoke_requests_eventId_status_idx" ON "karaoke_requests"("eventId", "status");

-- CreateIndex
CREATE INDEX "karaoke_requests_eventId_queuePosition_idx" ON "karaoke_requests"("eventId", "queuePosition");

-- CreateIndex
CREATE INDEX "karaoke_requests_participantId_idx" ON "karaoke_requests"("participantId");

-- CreateIndex
CREATE INDEX "karaoke_requests_songId_idx" ON "karaoke_requests"("songId");

-- CreateIndex
CREATE INDEX "karaoke_song_likes_songId_idx" ON "karaoke_song_likes"("songId");

-- CreateIndex
CREATE INDEX "karaoke_song_likes_participantId_idx" ON "karaoke_song_likes"("participantId");

-- CreateIndex
CREATE UNIQUE INDEX "karaoke_song_likes_songId_participantId_key" ON "karaoke_song_likes"("songId", "participantId");
