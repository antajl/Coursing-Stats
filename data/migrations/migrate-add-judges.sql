-- Migration: Add judges field to events table
ALTER TABLE events ADD COLUMN judges TEXT;
