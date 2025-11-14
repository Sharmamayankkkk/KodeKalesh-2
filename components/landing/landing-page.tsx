"use client";

import Link from "next/link";
import { ArrowRight, Activity, Shield, Brain, Users, TrendingUp, Clock, CheckCircle2, Sparkles } from "lucide-react";
import Logo from "@/components/ui/logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo size="md" />
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition text-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-secondary-foreground">AI-Powered Clinical Intelligence</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Transform Healthcare with{" "}
              <span className="text-primary">Intelligent Insights</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              HealthPulse Pro is an AI-powered clinical decision support and patient management system that helps healthcare professionals make faster, more accurate decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg font-medium text-foreground hover:bg-muted-background transition"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Comprehensive Clinical Platform
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to deliver exceptional patient care in one integrated platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 - Patient Management */}
            <div className="bg-background border border-border rounded-lg p-6 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Patient Management</h3>
              <p className="text-muted-foreground">
                Comprehensive patient records with vitals, lab results, medical history, and real-time monitoring.
                {/* Image: Dashboard showing patient list with vitals and status indicators */}
              </p>
            </div>

            {/* Feature 2 - AI Analysis */}
            <div className="bg-background border border-border rounded-lg p-6 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">AI-Powered Analysis</h3>
              <p className="text-muted-foreground">
                Clinical insights powered by Google's Gemini AI to support faster, more accurate decision-making.
                {/* Image: AI analysis panel showing patient risk assessment and recommendations */}
              </p>
            </div>

            {/* Feature 3 - Smart Alerts */}
            <div className="bg-background border border-border rounded-lg p-6 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Smart Alerts</h3>
              <p className="text-muted-foreground">
                Real-time clinical alerts with AI-generated notifications for critical patient conditions.
                {/* Image: Alert notification panel with priority levels */}
              </p>
            </div>

            {/* Feature 4 - Analytics */}
            <div className="bg-background border border-border rounded-lg p-6 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Analytics Dashboard</h3>
              <p className="text-muted-foreground">
                Visual insights into patient data, trends, and operational metrics for data-driven decisions.
                {/* Image: Analytics dashboard with charts and graphs */}
              </p>
            </div>

            {/* Feature 5 - Security */}
            <div className="bg-background border border-border rounded-lg p-6 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Secure & Compliant</h3>
              <p className="text-muted-foreground">
                HIPAA-compliant security with role-based access control and encrypted data storage.
                {/* Image: Security dashboard showing compliance metrics */}
              </p>
            </div>

            {/* Feature 6 - Real-time */}
            <div className="bg-background border border-border rounded-lg p-6 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Real-time Updates</h3>
              <p className="text-muted-foreground">
                Instant synchronization across devices for seamless collaboration among care teams.
                {/* Image: Multi-device view showing synchronized data */}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Why Choose HealthPulse Pro?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Improve Patient Outcomes</h3>
                    <p className="text-muted-foreground">AI-driven insights help identify risks early and recommend optimal treatment paths.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Save Time</h3>
                    <p className="text-muted-foreground">Streamlined workflows and automated tasks let you focus on patient care.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Reduce Errors</h3>
                    <p className="text-muted-foreground">Smart alerts and decision support minimize the risk of medical errors.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Scale Efficiently</h3>
                    <p className="text-muted-foreground">Cloud-based infrastructure grows with your practice or hospital.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-muted-background rounded-lg p-8 border border-border">
              <div className="aspect-video bg-background rounded-lg border border-border flex items-center justify-center">
                {/* Placeholder for demo screenshot or video */}
                <div className="text-center">
                  <Activity className="w-16 h-16 text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Platform Demo</p>
                  {/* Image: Screenshot of the main dashboard in action */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Join healthcare professionals who are already using HealthPulse Pro to deliver better patient care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-6 py-3 bg-background text-primary rounded-lg font-medium hover:bg-background/90 transition"
            >
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary-foreground text-primary-foreground rounded-lg font-medium hover:bg-primary-foreground/10 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Logo size="sm" className="mb-4" />
              <p className="text-muted-foreground text-sm">
                AI-powered clinical decision support and patient management system for modern healthcare.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/features" className="hover:text-foreground transition">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground transition">Pricing</Link></li>
                <li><Link href="/security" className="hover:text-foreground transition">Security</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition">About</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition">Contact</Link></li>
                <li><Link href="/support" className="hover:text-foreground transition">Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} HealthPulse Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
