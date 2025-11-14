"use client";

import Link from "next/link";
import { ArrowLeft, Mail, User, MessageSquare } from "lucide-react";
import Logo from "@/components/ui/logo";

export default function ContactPage() {
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
            Get in Touch
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions? We're here to help. Reach out to us and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Details */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-8">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Contact Person</h3>
                    <p className="text-muted-foreground">Mayank Sharma</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email</h3>
                    <a 
                      href="mailto:226mayankkle@gmail.com"
                      className="text-primary hover:underline"
                    >
                      226mayankkle@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Support</h3>
                    <p className="text-muted-foreground mb-2">
                      For general support inquiries, please visit our support page.
                    </p>
                    <Link 
                      href="/support"
                      className="text-primary hover:underline"
                    >
                      Go to Support →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-6 bg-muted-background rounded-lg border border-border">
                <h3 className="font-semibold text-foreground mb-3">Office Hours</h3>
                <p className="text-muted-foreground mb-2">Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                <p className="text-muted-foreground">Saturday - Sunday: Closed</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-background border border-border rounded-lg p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
              
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    placeholder="How can we help?"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                    placeholder="Tell us more about your inquiry..."
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition"
                >
                  Send Message
                </button>
              </form>

              <p className="mt-4 text-sm text-muted-foreground text-center">
                We'll get back to you within 24-48 business hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Looking for Something Specific?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            We have dedicated resources for different types of inquiries
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-background border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-2">Sales Inquiries</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Interested in our Enterprise plan or have questions about pricing?
              </p>
              <a 
                href="mailto:226mayankkle@gmail.com?subject=Sales Inquiry"
                className="text-primary hover:underline text-sm font-medium"
              >
                Contact Sales
              </a>
            </div>

            <div className="bg-background border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-2">Technical Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Need help with the platform or have technical questions?
              </p>
              <Link 
                href="/support"
                className="text-primary hover:underline text-sm font-medium"
              >
                Get Support
              </Link>
            </div>

            <div className="bg-background border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-2">Security</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Questions about security, compliance, or want to report a vulnerability?
              </p>
              <Link 
                href="/security"
                className="text-primary hover:underline text-sm font-medium"
              >
                Security Info
              </Link>
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
