-- Drop old tables and recreate with all required fields
-- Run this as a new migration

PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

DROP TABLE IF EXISTS "Post";
DROP TABLE IF EXISTS "User";

CREATE TABLE "User" (
    "id"        INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username"  TEXT NOT NULL,
    "email"     TEXT NOT NULL,
    "password"  TEXT NOT NULL,
    "name"      TEXT NOT NULL DEFAULT '',
    "bio"       TEXT NOT NULL DEFAULT '',
    "photo"     TEXT NOT NULL DEFAULT '',
    "followers" TEXT NOT NULL DEFAULT '[]',
    "following" TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE "Post" (
    "id"          INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text"        TEXT NOT NULL,
    "author"      TEXT NOT NULL DEFAULT '',
    "authorInput" TEXT NOT NULL DEFAULT '',
    "bookInput"   TEXT NOT NULL DEFAULT '',
    "likedBy"     TEXT NOT NULL DEFAULT '[]',
    "comments"    TEXT NOT NULL DEFAULT '[]',
    "timestamp"   BIGINT NOT NULL DEFAULT 0,
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
