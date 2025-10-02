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

    const { data, error } = await supabase
      .from('runs')
      .select(`
        run_id,
        commit,
        branch,
        created_at,
        ci,
        coverage,
        manifest,
        project_id,
        projects!inner(slug)
      `)
      .eq('run_id', runId)
      .single();

    if (error) {
      console.error('Error fetching run:', error);
      throw error;
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Run not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const projectSlug = (data as any).projects?.slug ?? 'unknown';
    
    const response = {
      run: {
        run_id: data.run_id,
        project: projectSlug,
        branch: data.branch,
        commit: data.commit,
        created_at: data.created_at,
        ci: data.ci
      },
      manifest: data.manifest,
      coverage: data.coverage
    };

    return new Response(
      JSON.stringify(response),
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
