"use client";

import Link from "next/link";
import { ArrowLeft, HelpCircle, BookOpen, MessageCircle, FileText, Mail, Search } from "lucide-react";
import Logo from "@/components/ui/logo";

export default function SupportPage() {
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
            How Can We Help?
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get the support you need to make the most of HealthPulse Pro
          </p>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-background border border-border rounded-lg p-6 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Documentation</h3>
              <p className="text-muted-foreground mb-4">
                Browse our comprehensive guides and tutorials to learn how to use HealthPulse Pro effectively.
              </p>
              <Link 
                href="/auth/login"
                className="text-primary hover:underline text-sm font-medium"
              >
                View Documentation →
              </Link>
            </div>

            <div className="bg-background border border-border rounded-lg p-6 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Live Chat</h3>
              <p className="text-muted-foreground mb-4">
                Chat with our support team in real-time during business hours for immediate assistance.
              </p>
              <Link 
                href="/auth/login"
                className="text-primary hover:underline text-sm font-medium"
              >
                Start Chat →
              </Link>
            </div>

            <div className="bg-background border border-border rounded-lg p-6 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Email Support</h3>
              <p className="text-muted-foreground mb-4">
                Send us an email and we'll respond within 24 hours during business days.
              </p>
              <a 
                href="mailto:226mayankkle@gmail.com"
                className="text-primary hover:underline text-sm font-medium"
              >
                Send Email →
              </a>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Frequently Asked Questions
            </h2>
            
            <div className="max-w-3xl mx-auto space-y-4">
              <details className="bg-background border border-border rounded-lg p-6 group">
                <summary className="font-semibold text-foreground cursor-pointer flex items-center justify-between">
                  How do I get started with HealthPulse Pro?
                  <HelpCircle className="w-5 h-5 text-muted-foreground group-open:text-primary transition" />
                </summary>
                <p className="text-muted-foreground mt-4">
                  Simply sign up for a free trial, complete the onboarding process, and you'll be ready to start managing patient data. Our intuitive interface makes it easy to get started, and our documentation provides step-by-step guidance.
                </p>
              </details>

              <details className="bg-background border border-border rounded-lg p-6 group">
                <summary className="font-semibold text-foreground cursor-pointer flex items-center justify-between">
                  Is my patient data secure?
                  <HelpCircle className="w-5 h-5 text-muted-foreground group-open:text-primary transition" />
                </summary>
                <p className="text-muted-foreground mt-4">
                  Yes! We are fully HIPAA compliant with end-to-end encryption, role-based access control, and regular security audits. Your patient data is protected with enterprise-grade security measures.
                </p>
              </details>

              <details className="bg-background border border-border rounded-lg p-6 group">
                <summary className="font-semibold text-foreground cursor-pointer flex items-center justify-between">
                  Can I import existing patient data?
                  <HelpCircle className="w-5 h-5 text-muted-foreground group-open:text-primary transition" />
                </summary>
                <p className="text-muted-foreground mt-4">
                  Yes, we support data import from various formats including CSV and common EHR systems. Our support team can help you with the migration process to ensure a smooth transition.
                </p>
              </details>

              <details className="bg-background border border-border rounded-lg p-6 group">
                <summary className="font-semibold text-foreground cursor-pointer flex items-center justify-between">
                  What kind of AI analysis does the platform provide?
                  <HelpCircle className="w-5 h-5 text-muted-foreground group-open:text-primary transition" />
                </summary>
                <p className="text-muted-foreground mt-4">
                  Our AI-powered analysis includes risk assessment, treatment recommendations, pattern recognition in patient data, and automated alert generation for critical conditions. The AI is powered by Google's Gemini for accurate and reliable insights.
                </p>
              </details>

              <details className="bg-background border border-border rounded-lg p-6 group">
                <summary className="font-semibold text-foreground cursor-pointer flex items-center justify-between">
                  Do you offer training for new users?
                  <HelpCircle className="w-5 h-5 text-muted-foreground group-open:text-primary transition" />
                </summary>
                <p className="text-muted-foreground mt-4">
                  Yes! We provide comprehensive onboarding, video tutorials, documentation, and live training sessions for Enterprise customers. Our support team is always available to help you get the most out of the platform.
                </p>
              </details>

              <details className="bg-background border border-border rounded-lg p-6 group">
                <summary className="font-semibold text-foreground cursor-pointer flex items-center justify-between">
                  Can I cancel my subscription at any time?
                  <HelpCircle className="w-5 h-5 text-muted-foreground group-open:text-primary transition" />
                </summary>
                <p className="text-muted-foreground mt-4">
                  Yes, you can cancel your subscription at any time with no cancellation fees. You'll continue to have access until the end of your current billing period, and you can export all your data before leaving.
                </p>
              </details>
            </div>
          </div>

          {/* Support Ticket Form */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-background border border-border rounded-lg p-8">
              <div className="text-center mb-8">
                <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-foreground mb-2">Submit a Support Ticket</h2>
                <p className="text-muted-foreground">
                  Can't find what you're looking for? Submit a support ticket and our team will help you out.
                </p>
              </div>

              {/* Google Form Embed */}
              <div className="bg-muted-background rounded-lg p-4">
                <iframe 
                  src="https://docs.google.com/forms/d/e/1FAIpQLScXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/viewform?embedded=true" 
                  width="100%" 
                  height="800"
                  frameBorder="0" 
                  marginHeight={0} 
                  marginWidth={0}
                  className="rounded"
                >
                  Loading…
                </iframe>
              </div>

              <p className="mt-6 text-sm text-muted-foreground text-center">
                Note: The embedded form is a placeholder. Please replace the iframe src with your actual Google Form URL.
              </p>
              
              <div className="mt-6 p-4 bg-muted-background rounded-lg border border-border">
                <p className="text-sm text-muted-foreground text-center">
                  Alternatively, you can email us directly at{" "}
                  <a 
                    href="mailto:226mayankkle@gmail.com"
                    className="text-primary hover:underline font-medium"
                  >
                    226mayankkle@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Response Time */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Our Response Times
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-background border border-border rounded-lg p-6 text-center">
              <h3 className="font-semibold text-foreground mb-2">Starter Plan</h3>
              <p className="text-3xl font-bold text-primary mb-2">24-48h</p>
              <p className="text-sm text-muted-foreground">Email support response time</p>
            </div>

            <div className="bg-background border border-border rounded-lg p-6 text-center">
              <h3 className="font-semibold text-foreground mb-2">Professional Plan</h3>
              <p className="text-3xl font-bold text-primary mb-2">12-24h</p>
              <p className="text-sm text-muted-foreground">Priority email & chat support</p>
            </div>

            <div className="bg-background border border-border rounded-lg p-6 text-center">
              <h3 className="font-semibold text-foreground mb-2">Enterprise Plan</h3>
              <p className="text-3xl font-bold text-primary mb-2">24/7</p>
              <p className="text-sm text-muted-foreground">Dedicated support team</p>
            </div>
          </div>
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
