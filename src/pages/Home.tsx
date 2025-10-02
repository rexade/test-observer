import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, GitBranch, Shield, TrendingUp, Zap, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Zap className="h-4 w-4" />
              Observation-First Testing
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Turn <span className="bg-gradient-hero bg-clip-text text-transparent">pytest</span> into
              <br />Living Documentation
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Capture system signals, evaluate temporal oracles, and produce requirement coverage with cryptographic proof. Like Google Maps for your test suite.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="bg-gradient-primary shadow-glow text-lg px-8">
                  View Demo Dashboard
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8">
                Read Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A pytest plugin that observes, not controls. Turn test results into evidence.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="shadow-card border-border/50 hover:shadow-glow transition-all duration-300">
              <CardContent className="pt-8 pb-6">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Capture Events</h3>
                <p className="text-muted-foreground">
                  Pytest plugin emits Event Envelopes (JSONL) with test verdicts, timings, and artifacts.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card border-border/50 hover:shadow-glow transition-all duration-300">
              <CardContent className="pt-8 pb-6">
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Evaluate Oracles</h3>
                <p className="text-muted-foreground">
                  YAML oracles check temporal conditions: cadence, freshness, uniqueness. Safe eval with helpers.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card border-border/50 hover:shadow-glow transition-all duration-300">
              <CardContent className="pt-8 pb-6">
                <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Prove Coverage</h3>
                <p className="text-muted-foreground">
                  Signed Run Manifests with requirement, temporal, and risk-weighted coverage metrics.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">
                  Not a New Runner.<br />
                  <span className="text-primary">A New Perspective.</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Reactive Mirror doesn't replace pytest. It observes your existing tests and transforms the output into structured evidence with temporal guarantees and cryptographic signatures.
                </p>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Activity className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">Event-Driven Architecture</h4>
                      <p className="text-muted-foreground">Every test emits normalized events. Store, replay, analyze.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <GitBranch className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">GitHub Actions Integration</h4>
                      <p className="text-muted-foreground">Automatic PR comments with coverage badges and signed manifests.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">Cryptographic Proof</h4>
                      <p className="text-muted-foreground">Every run produces a signed manifest. Tamper-proof evidence.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-card shadow-card p-8 flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="h-24 w-24 text-primary mx-auto mb-4 opacity-20" />
                    <p className="text-sm text-muted-foreground">Interactive Demo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-background/90" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Tests?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start turning pytest results into living documentation with cryptographic proof.
            </p>
            <Link to="/dashboard">
              <Button size="lg" className="bg-gradient-primary shadow-glow text-lg px-8">
                Explore the Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
