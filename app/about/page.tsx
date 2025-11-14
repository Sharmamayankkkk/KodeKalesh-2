"use client";

import Link from "next/link";
import { ArrowLeft, Target, Users, Heart, Award } from "lucide-react";
import Logo from "@/components/ui/logo";

export default function AboutPage() {
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
            About HealthPulse Pro
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Empowering healthcare professionals with AI-driven insights to deliver exceptional patient care
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                At HealthPulse Pro, we believe that technology should empower healthcare professionals, not overwhelm them. Our mission is to create intelligent tools that enhance clinical decision-making, improve patient outcomes, and make healthcare more efficient and accessible.
              </p>
              <p className="text-lg text-muted-foreground">
                We combine cutting-edge artificial intelligence with intuitive design to deliver a platform that healthcare professionals love to use and patients benefit from every day.
              </p>
            </div>
            <div className="bg-muted-background rounded-lg p-8 border border-border">
              <div className="aspect-square bg-background rounded-lg border border-border flex items-center justify-center">
                <Target className="w-24 h-24 text-primary" />
              </div>
            </div>
          </div>

          {/* Values */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background border border-border rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Patient-Centered</h3>
              <p className="text-muted-foreground">
                Every feature we build is designed with patient outcomes in mind. Better tools for healthcare professionals mean better care for patients.
              </p>
            </div>

            <div className="bg-background border border-border rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Excellence</h3>
              <p className="text-muted-foreground">
                We maintain the highest standards in everything we do, from security and compliance to user experience and customer support.
              </p>
            </div>

            <div className="bg-background border border-border rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Collaboration</h3>
              <p className="text-muted-foreground">
                We work closely with healthcare professionals to understand their needs and build solutions that truly make a difference.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-center">
            Our Story
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              HealthPulse Pro was founded with a simple observation: healthcare professionals spend too much time on administrative tasks and not enough time with patients. We set out to change that.
            </p>
            <p>
              Our team brings together expertise in artificial intelligence, healthcare technology, and user experience design. We've worked with doctors, nurses, and hospital administrators to understand their daily challenges and build a platform that addresses real needs.
            </p>
            <p>
              Today, HealthPulse Pro serves healthcare professionals across the country, helping them make faster, more informed decisions and deliver better patient care. But we're just getting started.
            </p>
            <p>
              We continue to innovate, adding new features and capabilities based on feedback from our users. Our commitment is to be the best partner in your journey to provide exceptional healthcare.
            </p>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powered by Advanced Technology
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We leverage the latest in AI and cloud technology to deliver a powerful, reliable platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-background border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">Artificial Intelligence</h3>
              <p className="text-muted-foreground">
                Our platform is powered by Google's Gemini AI, providing state-of-the-art natural language processing and clinical decision support. The AI continuously learns and improves to provide better insights over time.
              </p>
            </div>

            <div className="bg-background border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">Cloud Infrastructure</h3>
              <p className="text-muted-foreground">
                Built on enterprise-grade cloud infrastructure, our platform ensures 99.99% uptime, automatic scaling, and robust disaster recovery capabilities to keep your data safe and accessible.
              </p>
            </div>

            <div className="bg-background border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">Modern Architecture</h3>
              <p className="text-muted-foreground">
                Our modern, microservices-based architecture allows us to quickly deploy new features and updates without disrupting your workflow, keeping you at the forefront of healthcare technology.
              </p>
            </div>

            <div className="bg-background border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">Security First</h3>
              <p className="text-muted-foreground">
                Security is built into every layer of our platform. From HIPAA compliance to end-to-end encryption, we ensure your patients' data is always protected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Join Us in Transforming Healthcare
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Be part of a community of healthcare professionals using AI to deliver better patient care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-6 py-3 bg-background text-primary rounded-lg font-medium hover:bg-background/90 transition"
            >
              Get Started
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary-foreground text-primary-foreground rounded-lg font-medium hover:bg-primary-foreground/10 transition"
            >
              Contact Us
            </Link>
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
