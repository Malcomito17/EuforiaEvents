-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_event_guests" (
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
    "isImportante" BOOLEAN NOT NULL DEFAULT false,
    "isDestacado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "addedBy" TEXT,
    CONSTRAINT "event_guests_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "event_guests_personId_fkey" FOREIGN KEY ("personId") REFERENCES "persons" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "event_guests_mesaId_fkey" FOREIGN KEY ("mesaId") REFERENCES "mesas" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_event_guests" ("accesibilidad", "addedBy", "checkedInAt", "checkedInBy", "checkedOutAt", "checkedOutBy", "createdAt", "estadoIngreso", "eventId", "id", "mesaId", "observaciones", "personId", "updatedAt") SELECT "accesibilidad", "addedBy", "checkedInAt", "checkedInBy", "checkedOutAt", "checkedOutBy", "createdAt", "estadoIngreso", "eventId", "id", "mesaId", "observaciones", "personId", "updatedAt" FROM "event_guests";
DROP TABLE "event_guests";
ALTER TABLE "new_event_guests" RENAME TO "event_guests";
CREATE INDEX "event_guests_eventId_idx" ON "event_guests"("eventId");
CREATE INDEX "event_guests_eventId_estadoIngreso_idx" ON "event_guests"("eventId", "estadoIngreso");
CREATE INDEX "event_guests_personId_idx" ON "event_guests"("personId");
CREATE INDEX "event_guests_mesaId_idx" ON "event_guests"("mesaId");
CREATE UNIQUE INDEX "event_guests_eventId_personId_key" ON "event_guests"("eventId", "personId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
