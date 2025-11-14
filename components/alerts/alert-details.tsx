
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Tag, User, MessageSquare, Check, Clock, ArrowLeft, Shield } from 'lucide-react';

export function AlertDetails({ alert: initialAlert }: { alert: any }) {
  const supabase = createClient();
  const router = useRouter();
  const [alert, setAlert] = useState(initialAlert);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateAlertStatus = async (status: string) => {
    setIsUpdating(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    let updateData: any = { status };
    if (status === 'acknowledged' && !alert.acknowledged_at) {
      updateData.acknowledged_at = new Date().toISOString();
      updateData.acknowledged_by_id = user?.id;
    }
    
    const { data, error } = await supabase
      .from('alerts')
      .update(updateData)
      .eq('id', alert.id)
      .select(`
        *,
        patients(*),
        assigned_user:users!assigned_to_id(*),
        acknowledged_user:users!acknowledged_by_id(*)
      `)
      .single();

    if (error) {
      console.error('Error updating alert:', error);
    } else if (data) {
      setAlert(data);
    }
    setIsUpdating(false);
  };

  const patientName = useMemo(() => {
    return alert.patients ? `${alert.patients.first_name} ${alert.patients.last_name}` : 'N/A';
  }, [alert.patients]);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Alerts
        </button>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Shield size={28} className={getSeverityClass(alert.severity).icon} />
          {alert.title}
        </h1>
        <p className="text-muted-foreground mt-2">Alert ID: {alert.id}</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-background border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Alert Details</h2>
            <p className="text-foreground leading-relaxed">{alert.description}</p>
          </div>
          <div className="bg-background border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Patient Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{patientName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">MRN</p>
                <p className="font-medium">{alert.patients?.mrn}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{alert.patients?.date_of_birth}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-background border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Status & Actions</h2>
            <div className="space-y-4">
              <div className={`flex items-center p-3 rounded-md ${getSeverityClass(alert.severity).bg}`}>
                <Tag className={`w-5 h-5 mr-3 ${getSeverityClass(alert.severity).icon}`} />
                <div>
                  <p className="text-sm text-muted-foreground">Severity</p>
                  <p className="font-semibold capitalize">{alert.severity}</p>
                </div>
              </div>
              <div className="flex items-center">
                <User className="w-5 h-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Assigned To</p>
                  <p className="font-medium">{alert.assigned_user?.full_name || 'Unassigned'}</p>
                </div>
              </div>
              {alert.acknowledged_user && (
                <div className="flex items-center">
                  <Check className="w-5 h-5 mr-3 text-success" />
                  <div>
                    <p className="text-sm text-muted-foreground">Acknowledged By</p>
                    <p className="font-medium">{alert.acknowledged_user.full_name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(alert.acknowledged_at).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 space-y-2">
              <button 
                onClick={() => updateAlertStatus('acknowledged')}
                disabled={isUpdating || alert.status === 'acknowledged' || alert.status === 'resolved'}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-info text-info-foreground rounded-lg hover:bg-info/90 font-medium transition disabled:opacity-50"
              >
                <Check size={16} /> Acknowledge
              </button>
              <button 
                onClick={() => updateAlertStatus('resolved')}
                disabled={isUpdating || alert.status === 'resolved'}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-lg hover:bg-success/90 font-medium transition disabled:opacity-50"
              >
                <Check size={16} /> Resolve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getSeverityClass(severity: string) {
  switch (severity) {
    case 'critical':
      return { bg: 'bg-destructive/10', icon: 'text-destructive' };
    case 'high':
      return { bg: 'bg-warning/10', icon: 'text-warning' };
    case 'medium':
      return { bg: 'bg-info/10', icon: 'text-info' };
    default:
      return { bg: 'bg-muted/50', icon: 'text-muted-foreground' };
  }
}
