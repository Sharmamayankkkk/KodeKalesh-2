import { Settings, Bell, Shield, Eye } from 'lucide-react';

export default function SystemSettingsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">System Configuration</h3>
        <div className="space-y-4">
          <SettingOption
            icon={Bell}
            title="Alert Notification Settings"
            description="Configure how clinical alerts are delivered and escalated"
          />
          <SettingOption
            icon={Shield}
            title="Security & Compliance"
            description="HIPAA, GDPR, and data protection settings"
          />
          <SettingOption
            icon={Eye}
            title="Audit Log Settings"
            description="Configure audit trail retention and monitoring"
          />
          <SettingOption
            icon={Settings}
            title="API Configuration"
            description="Manage integrations and API keys"
          />
        </div>
      </div>
    </div>
  );
}

interface SettingOptionProps {
  icon: any;
  title: string;
  description: string;
}

function SettingOption({ icon: Icon, title, description }: SettingOptionProps) {
  return (
    <div className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-muted-background transition cursor-pointer">
      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}
