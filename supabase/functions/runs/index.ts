import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, idempotency-key',
};

function assertPayload(p: any): void {
  if (!p?.run?.run_id || !p?.run?.project) {
    throw new Error('Invalid payload: run_id and project are required');
  }
  if (p.coverage) {
    for (const k of ['requirement', 'temporal', 'interface', 'risk']) {
      const v = Number(p.coverage[k]);
      if (p.coverage[k] !== undefined && (Number.isNaN(v) || v < 0 || v > 1)) {
        throw new Error(`coverage.${k} must be between 0 and 1`);
      }
    }
  }
}

type Coverage = { 
  requirement: number; 
  temporal: number; 
  interface: number; 
  risk: number; 
  by_requirement?: {id: string; result: "pass" | "fail" | "unknown" | "skip"}[] 
};

type Decision = { 
  oracle: string; 
  result: "pass" | "fail" | "skip" | "error"; 
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
      
      // Validate payload
      try {
        assertPayload(body);
      } catch (validationError) {
        return new Response(
          JSON.stringify({ error: validationError instanceof Error ? validationError.message : 'Invalid payload' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
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

      // Check for existing run (idempotency) and insert atomically
      const { data: run, error: runError } = await supabase
        .from('runs')
        .upsert({
          run_id: body.run.run_id,
          project_id: project.id,
          commit: body.run.commit,
          branch: body.run.branch,
          created_at: body.run.created_at,
          ci: body.run.ci ?? {},
          manifest: body.manifest,
          coverage: body.coverage,
          decisions_count: body.decisions.length
        }, { onConflict: 'run_id' })
        .select()
        .single();

      if (runError) {
        console.error('Run upsert error:', runError);
        throw runError;
      }

      console.log('Run upserted:', run.run_id);

      // Insert run_requirements from coverage.by_requirement
      if (body.coverage?.by_requirement && body.coverage.by_requirement.length > 0) {
        const requirementsData = body.coverage.by_requirement.map(r => ({
          run_id: run.id,
          requirement_id: r.id,
          status: r.result
        }));

        const { error: reqError } = await supabase
          .from('run_requirements')
          .upsert(requirementsData, { onConflict: 'run_id,requirement_id' });

        if (reqError) {
          console.error('Run requirements upsert error:', reqError);
          // Don't throw - this is optional data
        } else {
          console.log('Upserted', requirementsData.length, 'requirement verdicts');
        }
      }

      // Insert or update decisions (idempotent per run+oracle)
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
          .upsert(decisionsData, { onConflict: 'run_id,oracle' });

        if (decisionsError) {
          console.error('Decisions upsert error:', decisionsError);
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
      const branch = url.searchParams.get('branch');
      const from_date = url.searchParams.get('from');
      const to_date = url.searchParams.get('to');
      const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
      const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize') ?? 20)));
      const offset = (page - 1) * pageSize;
      const limit = offset + pageSize - 1;

      let query = supabase
        .from('public_runs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, limit);

      if (project) {
        query = query.eq('project', project);
      }
      if (branch) {
        query = query.eq('branch', branch);
      }
      if (from_date) {
        query = query.gte('created_at', from_date);
      }
      if (to_date) {
        query = query.lte('created_at', to_date);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('List runs error:', error);
        throw error;
      }

      return new Response(
        JSON.stringify({
          items: data ?? [],
          page,
          pageSize,
          total: count ?? 0
        }),
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
