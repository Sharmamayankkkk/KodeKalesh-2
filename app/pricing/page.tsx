"use client";

import Link from "next/link";
import { ArrowLeft, Check, X } from "lucide-react";
import Logo from "@/components/ui/logo";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <Logo size="md" />
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition"
              >
                <ArrowLeft className="inline w-4 h-4 mr-1" />
                Back to Home
              </Link>
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted-background to-background">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that fits your practice. All plans include our core features with 30-day money-back guarantee.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-background border border-border rounded-lg p-8 hover:shadow-lg transition">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Starter</h3>
                <p className="text-muted-foreground">Perfect for small practices</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-foreground">$99</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Billed monthly</p>
              </div>
              <Link
                href="/auth/signup"
                className="block w-full text-center px-6 py-3 border border-border rounded-lg font-medium text-foreground hover:bg-muted-background transition mb-6"
              >
                Start Free Trial
              </Link>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Up to 50 active patients</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Patient management system</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Basic AI analysis</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Smart alerts</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Lab results integration</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Email support</span>
                </div>
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Advanced analytics</span>
                </div>
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Priority support</span>
                </div>
              </div>
            </div>

            {/* Professional Plan */}
            <div className="bg-background border-2 border-primary rounded-lg p-8 hover:shadow-xl transition relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Professional</h3>
                <p className="text-muted-foreground">For growing practices</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-foreground">$299</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Billed monthly</p>
              </div>
              <Link
                href="/auth/signup"
                className="block w-full text-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition mb-6"
              >
                Start Free Trial
              </Link>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Up to 200 active patients</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Advanced patient management</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Full AI analysis suite</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Priority smart alerts</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Advanced analytics dashboard</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Prescription management</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Priority email & chat support</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Custom reports</span>
                </div>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-background border border-border rounded-lg p-8 hover:shadow-lg transition">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Enterprise</h3>
                <p className="text-muted-foreground">For hospitals & large practices</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-foreground">Custom</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Contact us for pricing</p>
              </div>
              <Link
                href="/contact"
                className="block w-full text-center px-6 py-3 border border-border rounded-lg font-medium text-foreground hover:bg-muted-background transition mb-6"
              >
                Contact Sales
              </Link>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Unlimited active patients</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Full platform access</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Custom AI models</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Multi-location support</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Dedicated account manager</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">24/7 priority support</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">Custom integrations</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">SLA guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted-background">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-background border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-2">Is there a free trial?</h3>
              <p className="text-muted-foreground">Yes! All plans come with a 30-day free trial. No credit card required to start.</p>
            </div>
            <div className="bg-background border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-2">Can I change plans later?</h3>
              <p className="text-muted-foreground">Absolutely. You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
            </div>
            <div className="bg-background border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">We accept all major credit cards (Visa, MasterCard, American Express) and ACH transfers for Enterprise plans.</p>
            </div>
            <div className="bg-background border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-2">Is my data secure?</h3>
              <p className="text-muted-foreground">Yes. We are HIPAA compliant with end-to-end encryption and regular security audits. Your data is always protected.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Start your 30-day free trial today. No credit card required.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center px-6 py-3 bg-background text-primary rounded-lg font-medium hover:bg-background/90 transition"
          >
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} HealthPulse Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
