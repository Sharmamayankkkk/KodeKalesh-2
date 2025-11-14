import Link from "next/link";
import { Mail, ArrowLeft } from 'lucide-react';
import Logo from "@/components/ui/logo";

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-background rounded-lg border border-border p-8 shadow-sm text-center">
          <div className="flex justify-center mb-6">
            <Logo size="sm" />
          </div>

          <div className="w-16 h-16 bg-info/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-info" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Check Your Email
          </h1>

          <p className="text-muted-foreground mb-6">
            We've sent a confirmation link to your email address. Please click it to activate your account.
          </p>

          <p className="text-sm text-muted-foreground mb-8">
            Didn't receive the email? Check your spam folder or request a new link.
          </p>

          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
