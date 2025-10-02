import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, idempotency-key',
};

type Coverage = { 
  requirement: number; 
  temporal: number; 
  interface: number; 
  risk: number; 
  by_requirement?: {id: string; result: "pass" | "fail" | "unknown"}[] 
};

type Decision = { 
  oracle: string; 
  result: "pass" | "fail"; 
  satisfies?: string[]; 
  evidence?: string[]; 
  message?: string 
};

type RunMeta = { 
  run_id: string; 
  project: string; 
  commit: string; 
  branch: string; 
  created_at: string; 
  ci?: {provider?: string; workflow?: string; run_url?: string} 
};

type Payload = { 
  run: RunMeta; 
  manifest: any; 
  coverage: Coverage; 
  decisions: Decision[] 
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    if (req.method === 'POST') {
      const body = await req.json() as Payload;
      console.log('Received run submission:', body.run.run_id);

      // Upsert project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .upsert({ slug: body.run.project }, { onConflict: 'slug' })
        .select()
        .single();

      if (projectError) {
        console.error('Project error:', projectError);
        throw projectError;
      }

      // Check for existing run (idempotency)
      const { data: existingRun } = await supabase
        .from('runs')
        .select('run_id')
        .eq('run_id', body.run.run_id)
        .maybeSingle();

      if (existingRun) {
        console.log('Run already exists (idempotent):', existingRun.run_id);
        return new Response(
          JSON.stringify({ 
            run_id: existingRun.run_id, 
            dashboard_url: `/runs/${existingRun.run_id}`, 
            idempotent: true 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      // Insert run
      const { data: run, error: runError } = await supabase
        .from('runs')
        .insert({
          run_id: body.run.run_id,
          project_id: project.id,
          commit: body.run.commit,
          branch: body.run.branch,
          created_at: body.run.created_at,
          ci: body.run.ci ?? {},
          manifest: body.manifest,
          coverage: body.coverage,
          decisions_count: body.decisions.length
        })
        .select()
        .single();

      if (runError) {
        console.error('Run insert error:', runError);
        throw runError;
      }

      // Insert decisions
      if (body.decisions.length > 0) {
        const decisionsData = body.decisions.map(d => ({
          run_id: run.id,
          oracle: d.oracle,
          result: d.result,
          satisfies: d.satisfies ?? [],
          evidence: d.evidence ?? [],
          message: d.message ?? null
        }));

        const { error: decisionsError } = await supabase
          .from('decisions')
          .insert(decisionsData);

        if (decisionsError) {
          console.error('Decisions insert error:', decisionsError);
          throw decisionsError;
        }
      }

      console.log('Successfully created run:', run.run_id);
      return new Response(
        JSON.stringify({ 
          run_id: run.run_id, 
          dashboard_url: `/runs/${run.run_id}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
      );
    }

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const project = url.searchParams.get('project');
      const limit = Math.min(Number(url.searchParams.get('limit') ?? 20), 100);

      let query = supabase
        .from('runs')
        .select(`
          run_id,
          commit,
          branch,
          created_at,
          ci,
          coverage,
          projects!inner(slug)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (project) {
        query = query.eq('projects.slug', project);
      }

      const { data, error } = await query;

      if (error) {
        console.error('List runs error:', error);
        throw error;
      }

      const runs = data.map((r: any) => {
        const projectSlug = r.projects?.slug ?? 'unknown';
        return {
          run_id: r.run_id,
          project: projectSlug,
          commit: r.commit,
          branch: r.branch,
          created_at: r.created_at,
          ci: r.ci,
          coverage: r.coverage
        };
      });

      return new Response(
        JSON.stringify(runs),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
