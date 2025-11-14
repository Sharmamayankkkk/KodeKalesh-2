"use client";

import Link from "next/link";
import { ArrowLeft, Shield, Lock, Key, FileCheck, Server, UserCheck, Eye, AlertTriangle } from "lucide-react";
import Logo from "@/components/ui/logo";

export default function SecurityPage() {
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Enterprise-Grade Security
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your patients' data is our top priority. We maintain the highest standards of security and compliance to protect sensitive healthcare information.
          </p>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {/* HIPAA Compliance */}
            <div className="bg-background border border-border rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FileCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">HIPAA Compliant</h3>
              <p className="text-muted-foreground">
                Fully compliant with HIPAA regulations, including administrative, physical, and technical safeguards to protect patient health information (PHI).
              </p>
            </div>

            {/* End-to-End Encryption */}
            <div className="bg-background border border-border rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">End-to-End Encryption</h3>
              <p className="text-muted-foreground">
                All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. Your data is protected at every step.
              </p>
            </div>

            {/* Role-Based Access */}
            <div className="bg-background border border-border rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <UserCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Role-Based Access Control</h3>
              <p className="text-muted-foreground">
                Granular permission system ensures users only access data necessary for their role. Supports multiple user types and custom roles.
              </p>
            </div>

            {/* Authentication */}
            <div className="bg-background border border-border rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Key className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Multi-Factor Authentication</h3>
              <p className="text-muted-foreground">
                Support for MFA including SMS, authenticator apps, and hardware tokens to add an extra layer of security to user accounts.
              </p>
            </div>

            {/* Infrastructure Security */}
            <div className="bg-background border border-border rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Server className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Secure Infrastructure</h3>
              <p className="text-muted-foreground">
                Hosted on enterprise-grade cloud infrastructure with 99.99% uptime SLA, automated backups, and disaster recovery protocols.
              </p>
            </div>

            {/* Audit Logs */}
            <div className="bg-background border border-border rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Comprehensive Audit Logs</h3>
              <p className="text-muted-foreground">
                Detailed audit trails track all user activities, data access, and system changes for complete transparency and compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Compliance & Certifications
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We adhere to the highest industry standards and regulations
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-background border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">HIPAA</h3>
              <p className="text-muted-foreground">
                Full compliance with Health Insurance Portability and Accountability Act standards for protecting sensitive patient data.
              </p>
            </div>

            <div className="bg-background border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">SOC 2 Type II</h3>
              <p className="text-muted-foreground">
                Independently audited and certified for security, availability, processing integrity, confidentiality, and privacy.
              </p>
            </div>

            <div className="bg-background border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">GDPR</h3>
              <p className="text-muted-foreground">
                Compliant with General Data Protection Regulation for handling and protecting EU citizens' personal data.
              </p>
            </div>

            <div className="bg-background border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">ISO 27001</h3>
              <p className="text-muted-foreground">
                Information security management system certified to international standards for data protection and risk management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Practices */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Our Security Practices
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Regular Security Audits</h3>
                  <p className="text-muted-foreground">
                    Third-party security assessments and penetration testing conducted quarterly to identify and address vulnerabilities.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Employee Training</h3>
                  <p className="text-muted-foreground">
                    All team members undergo regular security awareness training and background checks to maintain the highest security standards.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Incident Response</h3>
                  <p className="text-muted-foreground">
                    24/7 security monitoring with a dedicated incident response team ready to address any security concerns immediately.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Data Retention</h3>
                  <p className="text-muted-foreground">
                    Clear data retention policies with secure deletion procedures and the ability to export your data at any time.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-muted-background rounded-lg p-8 border border-border">
              <div className="aspect-square bg-background rounded-lg border border-border flex items-center justify-center">
                <div className="text-center">
                  <Shield className="w-24 h-24 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Trust Center</h3>
                  <p className="text-muted-foreground">
                    Visit our Trust Center for detailed security documentation, compliance certificates, and current status.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reporting Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted-background">
        <div className="max-w-4xl mx-auto">
          <div className="bg-background border border-border rounded-lg p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Report a Security Vulnerability</h3>
                <p className="text-muted-foreground mb-4">
                  If you discover a security vulnerability, please report it to us immediately. We take all reports seriously and will respond promptly.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition"
                >
                  Report Vulnerability
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Questions About Security?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Our security team is here to answer any questions you may have.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-background text-primary rounded-lg font-medium hover:bg-background/90 transition"
          >
            Contact Security Team
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
