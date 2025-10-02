import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateBadgeSvg(label: string, value: string, color: string = '#4ade80'): string {
  const width = 100 + Math.max(value.length * 7, 40);
  const valueWidth = width - 65;
  const valueX = 65 + valueWidth / 2;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" role="img" aria-label="${label}: ${value}">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".7"/>
    <stop offset=".1" stop-opacity=".1"/>
  </linearGradient>
  <mask id="m">
    <rect width="${width}" height="20" rx="3" fill="#fff"/>
  </mask>
  <g mask="url(#m)">
    <rect width="65" height="20" fill="#555"/>
    <rect x="65" width="${valueWidth}" height="20" fill="${color}"/>
    <rect width="${width}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="33" y="15">${label}</text>
    <text x="${valueX}" y="15">${value}</text>
  </g>
</svg>`.trim();
}

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
    const projectSlug = decodeURIComponent(pathParts[pathParts.length - 1]);

    const { data, error } = await supabase
      .from('runs')
      .select(`
        coverage,
        projects!inner(slug)
      `)
      .eq('projects.slug', projectSlug)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching latest run:', error);
      throw error;
    }

    const reqPct = data?.coverage?.requirement 
      ? Math.round(data.coverage.requirement * 100) 
      : 0;
    const tmpPct = data?.coverage?.temporal 
      ? Math.round(data.coverage.temporal * 100) 
      : 0;

    const value = `${reqPct}% / ${tmpPct}%`;
    const svg = generateBadgeSvg('coverage', value);

    // Generate simple ETag for caching
    const etag = `"${projectSlug}-${reqPct}-${tmpPct}"`;

    // Check if client has cached version
    if (req.headers.get('if-none-match') === etag) {
      return new Response(null, { 
        status: 304, 
        headers: corsHeaders 
      });
    }

    return new Response(svg, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        'ETag': etag
      },
      status: 200
    });
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    const errorSvg = generateBadgeSvg('coverage', 'error', '#ef4444');
    return new Response(errorSvg, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-store'
      },
      status: 200
    });
  }
});
