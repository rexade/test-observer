import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const runId = pathParts[pathParts.length - 1];

    if (!runId) {
      return new Response(
        JSON.stringify({ error: 'Run ID required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get run's internal ID
    const { data: runData, error: runError } = await supabase
      .from('runs')
      .select('id')
      .eq('run_id', runId)
      .maybeSingle();

    if (runError) {
      console.error('Error fetching run:', runError);
      throw runError;
    }

    if (!runData) {
      return new Response(
        JSON.stringify([]),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Get decisions
    const { data, error } = await supabase
      .from('decisions')
      .select('oracle, result, satisfies, evidence, message')
      .eq('run_id', runData.id)
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching decisions:', error);
      throw error;
    }

    return new Response(
      JSON.stringify(data ?? []),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
