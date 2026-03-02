-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Adds thumbnail_url column to projects table for project image support

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
