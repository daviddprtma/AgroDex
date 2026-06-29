-- Drop existing policies if they exist
DROP POLICY IF EXISTS "anon read producer_certifications" ON public.producer_certifications;
DROP POLICY IF EXISTS "authenticated insert producer_certifications" ON public.producer_certifications;
DROP POLICY IF EXISTS "authenticated update producer_certifications" ON public.producer_certifications;
DROP POLICY IF EXISTS "authenticated delete producer_certifications" ON public.producer_certifications;
DROP POLICY IF EXISTS "service role full producer_certifications" ON public.producer_certifications;

-- Create the producer_certifications table
CREATE TABLE IF NOT EXISTS public.producer_certifications (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  issue_date  DATE        NOT NULL,
  expiry_date DATE        NOT NULL,
  status      TEXT        NOT NULL CHECK (status IN ('Active', 'Expired')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comments for documentation
COMMENT ON TABLE  public.producer_certifications             IS 'Agricultural and compliance certifications held by producers/farmers.';
COMMENT ON COLUMN public.producer_certifications.farmer_id   IS 'References the auth.users table representing the farmer/producer.';
COMMENT ON COLUMN public.producer_certifications.name        IS 'Name of the certification (e.g. Organic, Fair Trade, IndoGAP).';
COMMENT ON COLUMN public.producer_certifications.issue_date  IS 'Date when the certification was issued.';
COMMENT ON COLUMN public.producer_certifications.expiry_date IS 'Date when the certification expires.';
COMMENT ON COLUMN public.producer_certifications.status      IS 'Status of certification: Active or Expired.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_producer_certifications_farmer_id ON public.producer_certifications(farmer_id);
CREATE INDEX IF NOT EXISTS idx_producer_certifications_status    ON public.producer_certifications(status);

-- Enable Row Level Security
ALTER TABLE public.producer_certifications ENABLE ROW LEVEL SECURITY;

-- Allow public read access (certifications are public proof)
CREATE POLICY "anon read producer_certifications"
  ON public.producer_certifications FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated users to manage their own certifications
CREATE POLICY "authenticated insert producer_certifications"
  ON public.producer_certifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "authenticated update producer_certifications"
  ON public.producer_certifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = farmer_id);

CREATE POLICY "authenticated delete producer_certifications"
  ON public.producer_certifications FOR DELETE
  TO authenticated
  USING (auth.uid() = farmer_id);

-- Service role has full access for backend writes
CREATE POLICY "service role full producer_certifications"
  ON public.producer_certifications FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
