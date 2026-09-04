-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'NIRVANA PostGIS extensions initialized successfully.';
END $$;
