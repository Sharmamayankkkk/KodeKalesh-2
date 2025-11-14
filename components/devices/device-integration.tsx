"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Watch,
  Smartphone,
  Activity,
  Heart,
  Moon,
  Footprints,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface ConnectedDevice {
  id: string;
  name: string;
  type: string;
  brand: string;
  icon: any;
  status: "connected" | "syncing" | "error";
  lastSync: string;
  batteryLevel?: number;
  features: string[];
}

export default function DeviceIntegration() {
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState<string | null>(null);

  // Mock available devices
  const availableDevices = [
    {
      id: "fitbit",
      name: "Fitbit",
      type: "fitness_tracker",
      description: "Track steps, heart rate, sleep, and more",
      icon: Watch,
      features: ["Steps", "Heart Rate", "Sleep", "Calories"],
    },
    {
      id: "apple-watch",
      name: "Apple Watch",
      type: "smartwatch",
      description: "Comprehensive health and fitness tracking",
      icon: Watch,
      features: ["Steps", "Heart Rate", "Sleep", "ECG", "Blood Oxygen"],
    },
    {
      id: "garmin",
      name: "Garmin",
      type: "fitness_tracker",
      description: "Advanced fitness and performance metrics",
      icon: Watch,
      features: ["Steps", "Heart Rate", "Sleep", "VO2 Max", "Training Load"],
    },
    {
      id: "oura",
      name: "Oura Ring",
      type: "sleep_tracker",
      description: "Sleep and readiness tracking",
      icon: Activity,
      features: ["Sleep", "HRV", "Body Temperature", "Readiness Score"],
    },
    {
      id: "withings",
      name: "Withings",
      type: "scale",
      description: "Smart scale and health monitoring",
      icon: Activity,
      features: ["Weight", "BMI", "Body Fat", "Heart Rate"],
    },
  ];

  const handleConnectDevice = (device: any) => {
    setIsSyncing(true);
    
    // Simulate connection process
    setTimeout(() => {
      const newDevice: ConnectedDevice = {
        id: `${device.id}-${Date.now()}`,
        name: device.name,
        type: device.type,
        brand: device.id,
        icon: device.icon,
        status: "connected",
        lastSync: new Date().toISOString(),
        batteryLevel: Math.floor(Math.random() * 40) + 60, // 60-100%
        features: device.features,
      };
      
      setConnectedDevices([...connectedDevices, newDevice]);
      setIsSyncing(false);
      setIsConnectDialogOpen(false);
      setSelectedDeviceType(null);
      
      toast.success(`${device.name} connected successfully!`);
      
      // Simulate initial data sync
      setTimeout(() => {
        handleSyncDevice(newDevice.id);
      }, 1000);
    }, 2000);
  };

  const handleSyncDevice = (deviceId: string) => {
    setConnectedDevices(devices =>
      devices.map(device =>
        device.id === deviceId
          ? { ...device, status: "syncing" as const }
          : device
      )
    );

    // Simulate sync process
    setTimeout(() => {
      setConnectedDevices(devices =>
        devices.map(device =>
          device.id === deviceId
            ? { 
                ...device, 
                status: "connected" as const,
                lastSync: new Date().toISOString(),
              }
            : device
        )
      );
      
      toast.success("Data synced successfully!");
    }, 2000);
  };

  const handleDisconnectDevice = (deviceId: string) => {
    const device = connectedDevices.find(d => d.id === deviceId);
    setConnectedDevices(connectedDevices.filter(d => d.id !== deviceId));
    toast.success(`${device?.name} disconnected`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "syncing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatLastSync = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Device Integration</h1>
          <p className="text-muted-foreground">
            Connect wearable devices to automatically sync health data
          </p>
        </div>
        <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Connect Device
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Connect a Device</DialogTitle>
              <DialogDescription>
                Choose a device to connect and start syncing your health data
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {availableDevices.map((device) => (
                <Card
                  key={device.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setSelectedDeviceType(device.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <device.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{device.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {device.type.replace("_", " ")}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {device.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {device.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConnectDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const device = availableDevices.find(d => d.id === selectedDeviceType);
                  if (device) handleConnectDevice(device);
                }}
                disabled={!selectedDeviceType || isSyncing}
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Banner */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Mock Device Integration (Phase 1)
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                This is a demonstration of device connectivity. The connections shown here are
                simulated. Full API integration with real devices will be available in Phase 2
                with the mobile app launch.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Devices */}
      {connectedDevices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connectedDevices.map((device) => {
            const Icon = device.icon;
            return (
              <Card key={device.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{device.name}</CardTitle>
                        <CardDescription>
                          {device.type.replace("_", " ")}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(device.status)}>
                      {device.status === "connected" && <CheckCircle className="mr-1 h-3 w-3" />}
                      {device.status === "syncing" && <RefreshCw className="mr-1 h-3 w-3 animate-spin" />}
                      {device.status === "error" && <XCircle className="mr-1 h-3 w-3" />}
                      {device.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Battery Level</span>
                      <span className="font-medium">{device.batteryLevel}%</span>
                    </div>
                    <Progress value={device.batteryLevel} className="h-2" />
                  </div>

                  <div className="text-sm">
                    <span className="text-muted-foreground">Last sync: </span>
                    <span className="font-medium">{formatLastSync(device.lastSync)}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {device.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleSyncDevice(device.id)}
                      disabled={device.status === "syncing"}
                    >
                      <RefreshCw className={`mr-2 h-4 w-4 ${device.status === "syncing" ? "animate-spin" : ""}`} />
                      Sync Now
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnectDevice(device.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Watch className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Devices Connected</h3>
            <p className="text-muted-foreground text-center mb-4">
              Connect a wearable device to start automatically syncing your health data
            </p>
            <Button onClick={() => setIsConnectDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Connect Your First Device
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Data Sync Stats */}
      {connectedDevices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Synced Data Overview
            </CardTitle>
            <CardDescription>Health metrics collected from your devices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                <Footprints className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">8,247</p>
                  <p className="text-sm text-muted-foreground">Steps Today</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                <Heart className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">72</p>
                  <p className="text-sm text-muted-foreground">Avg Heart Rate</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                <Moon className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">7.2h</p>
                  <p className="text-sm text-muted-foreground">Sleep Last Night</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                <Activity className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">45</p>
                  <p className="text-sm text-muted-foreground">Active Minutes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
