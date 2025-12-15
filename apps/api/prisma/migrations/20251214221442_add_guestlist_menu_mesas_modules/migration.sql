-- Migration: Add Guestlist, Menu, and Mesas modules
-- Renames: guests → participants
-- New tables: persons, event_guests, dishes, dish_categories, event_dishes, guest_dishes, mesas

PRAGMA foreign_keys=OFF;

-- ========================================
-- STEP 1: Rename guests → participants
-- ========================================

-- Rename table
ALTER TABLE "guests" RENAME TO "participants";

-- Rename column isSystemGuest → isSystemParticipant
-- SQLite doesn't support ALTER COLUMN directly, so we recreate the table
CREATE TABLE "participants_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "whatsapp" TEXT,
    "isSystemParticipant" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL
);

-- Copy data
INSERT INTO "participants_new"
SELECT id, email, displayName, whatsapp, isSystemGuest, createdAt, lastSeenAt
FROM "participants";

-- Drop old table
DROP TABLE "participants";

-- Rename new table
ALTER TABLE "participants_new" RENAME TO "participants";

-- Recreate indexes
CREATE UNIQUE INDEX "participants_email_key" ON "participants"("email");

-- ========================================
-- STEP 2: Update song_requests (guestId → participantId)
-- ========================================

CREATE TABLE "song_requests_new" (
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

INSERT INTO "song_requests_new"
SELECT id, eventId, guestId, spotifyId, title, artist, albumArtUrl, status, priority, playlistId, fromClientPlaylist, createdAt, updatedAt
FROM "song_requests";

DROP TABLE "song_requests";
ALTER TABLE "song_requests_new" RENAME TO "song_requests";

CREATE INDEX "song_requests_eventId_status_idx" ON "song_requests"("eventId", "status");
CREATE INDEX "song_requests_eventId_createdAt_idx" ON "song_requests"("eventId", "createdAt");
CREATE INDEX "song_requests_participantId_idx" ON "song_requests"("participantId");
CREATE INDEX "song_requests_playlistId_idx" ON "song_requests"("playlistId");

-- ========================================
-- STEP 3: Update karaoke_requests (guestId → participantId)
-- ========================================

CREATE TABLE "karaoke_requests_new" (
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

INSERT INTO "karaoke_requests_new"
SELECT id, eventId, guestId, songId, title, artist, turnNumber, queuePosition, status, createdAt, calledAt
FROM "karaoke_requests";

DROP TABLE "karaoke_requests";
ALTER TABLE "karaoke_requests_new" RENAME TO "karaoke_requests";

CREATE INDEX "karaoke_requests_eventId_status_idx" ON "karaoke_requests"("eventId", "status");
CREATE INDEX "karaoke_requests_eventId_queuePosition_idx" ON "karaoke_requests"("eventId", "queuePosition");
CREATE INDEX "karaoke_requests_participantId_idx" ON "karaoke_requests"("participantId");
CREATE INDEX "karaoke_requests_songId_idx" ON "karaoke_requests"("songId");

-- ========================================
-- STEP 4: Update karaoke_song_likes (guestId → participantId)
-- ========================================

CREATE TABLE "karaoke_song_likes_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "songId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "karaoke_song_likes_songId_fkey" FOREIGN KEY ("songId") REFERENCES "karaoke_songs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "karaoke_song_likes_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "participants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "karaoke_song_likes_new"
SELECT id, songId, guestId, createdAt
FROM "karaoke_song_likes";

DROP TABLE "karaoke_song_likes";
ALTER TABLE "karaoke_song_likes_new" RENAME TO "karaoke_song_likes";

CREATE INDEX "karaoke_song_likes_songId_idx" ON "karaoke_song_likes"("songId");
CREATE INDEX "karaoke_song_likes_participantId_idx" ON "karaoke_song_likes"("participantId");
CREATE UNIQUE INDEX "karaoke_song_likes_songId_participantId_key" ON "karaoke_song_likes"("songId", "participantId");

-- ========================================
-- STEP 5: Add new columns to events table
-- ========================================

ALTER TABLE "events" ADD COLUMN "tieneMesasAsignadas" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "events" ADD COLUMN "tieneMenuIndividual" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "events" ADD COLUMN "requiereCheckout" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "events" ADD COLUMN "salonAncho" REAL;
ALTER TABLE "events" ADD COLUMN "salonLargo" REAL;
ALTER TABLE "events" ADD COLUMN "salonImageUrl" TEXT;

-- ========================================
-- STEP 6: Create new table - persons
-- ========================================

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

CREATE UNIQUE INDEX "persons_email_key" ON "persons"("email");
CREATE UNIQUE INDEX "persons_participantId_key" ON "persons"("participantId");
CREATE INDEX "persons_apellido_nombre_idx" ON "persons"("apellido", "nombre");
CREATE INDEX "persons_identityHash_idx" ON "persons"("identityHash");

-- ========================================
-- STEP 7: Create new table - event_guests
-- ========================================

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

CREATE UNIQUE INDEX "event_guests_eventId_personId_key" ON "event_guests"("eventId", "personId");
CREATE INDEX "event_guests_eventId_idx" ON "event_guests"("eventId");
CREATE INDEX "event_guests_eventId_estadoIngreso_idx" ON "event_guests"("eventId", "estadoIngreso");
CREATE INDEX "event_guests_personId_idx" ON "event_guests"("personId");
CREATE INDEX "event_guests_mesaId_idx" ON "event_guests"("mesaId");

-- ========================================
-- STEP 8: Create new table - dishes
-- ========================================

CREATE TABLE "dishes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "dietaryInfo" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT
);

CREATE INDEX "dishes_nombre_idx" ON "dishes"("nombre");
CREATE INDEX "dishes_isActive_idx" ON "dishes"("isActive");

-- ========================================
-- STEP 9: Create new table - dish_categories
-- ========================================

CREATE TABLE "dish_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "isSystemDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dish_categories_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "dish_categories_eventId_nombre_key" ON "dish_categories"("eventId", "nombre");
CREATE INDEX "dish_categories_eventId_idx" ON "dish_categories"("eventId");

-- ========================================
-- STEP 10: Create new table - event_dishes
-- ========================================

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

CREATE UNIQUE INDEX "event_dishes_eventId_dishId_key" ON "event_dishes"("eventId", "dishId");
CREATE INDEX "event_dishes_eventId_idx" ON "event_dishes"("eventId");
CREATE INDEX "event_dishes_eventId_categoryId_idx" ON "event_dishes"("eventId", "categoryId");

-- ========================================
-- STEP 11: Create new table - guest_dishes
-- ========================================

CREATE TABLE "guest_dishes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventGuestId" TEXT NOT NULL,
    "eventDishId" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    CONSTRAINT "guest_dishes_eventGuestId_fkey" FOREIGN KEY ("eventGuestId") REFERENCES "event_guests" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "guest_dishes_eventDishId_fkey" FOREIGN KEY ("eventDishId") REFERENCES "event_dishes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "guest_dishes_eventGuestId_eventDishId_key" ON "guest_dishes"("eventGuestId", "eventDishId");
CREATE INDEX "guest_dishes_eventGuestId_idx" ON "guest_dishes"("eventGuestId");
CREATE INDEX "guest_dishes_eventDishId_idx" ON "guest_dishes"("eventDishId");

-- ========================================
-- STEP 12: Create new table - mesas
-- ========================================

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

CREATE UNIQUE INDEX "mesas_eventId_numero_key" ON "mesas"("eventId", "numero");
CREATE INDEX "mesas_eventId_idx" ON "mesas"("eventId");
CREATE INDEX "mesas_eventId_sector_idx" ON "mesas"("eventId", "sector");

PRAGMA foreign_keys=ON;
