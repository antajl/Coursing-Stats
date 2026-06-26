-- Migration: Add track_schemes field to events table
ALTER TABLE events ADD COLUMN track_schemes TEXT;
