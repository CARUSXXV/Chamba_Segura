-- SQL Script to clean up the database for Chamba Segura
-- This removes the rigid 'es_trabajador' role flag from the perfiles table

ALTER TABLE public.perfiles DROP COLUMN IF EXISTS es_trabajador;

-- If you have any triggers that automatically sync metadata from auth.users,
-- make sure they don't expect 'es_trabajador' to exist.
