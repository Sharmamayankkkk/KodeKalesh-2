/**
 * Role-Based Access Control (RBAC) Utilities
 * Centralized role and permission management
 */

export type UserRole = 
  | 'admin' 
  | 'doctor' 
  | 'nurse' 
  | 'lab_technician' 
  | 'pharmacist' 
  | 'receptionist';

export type Permission = 
  | 'view_all_patients'
  | 'edit_patients'
  | 'delete_patients'
  | 'view_vitals'
  | 'edit_vitals'
  | 'verify_vitals'
  | 'view_labs'
  | 'edit_labs'
  | 'verify_labs'
  | 'view_prescriptions'
  | 'create_prescriptions'
  | 'edit_prescriptions'
  | 'dispense_prescriptions'
  | 'view_alerts'
  | 'create_alerts'
  | 'manage_alerts'
  | 'view_analytics'
  | 'manage_users'
  | 'change_roles'
  | 'view_audit_logs'
  | 'manage_devices'
  | 'view_lifestyle_data'
  | 'edit_lifestyle_data';

// Define permissions for each role
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'view_all_patients',
    'edit_patients',
    'view_vitals',
    'view_labs',
    'view_prescriptions',
    'view_alerts',
    'view_analytics',
    'manage_users',
    'change_roles',
    'view_audit_logs',
    'view_lifestyle_data',
  ],
  doctor: [
    'view_all_patients',
    'edit_patients',
    'view_vitals',
    'edit_vitals',
    'verify_vitals',
    'view_labs',
    'verify_labs',
    'view_prescriptions',
    'create_prescriptions',
    'edit_prescriptions',
    'view_alerts',
    'create_alerts',
    'manage_alerts',
    'view_analytics',
    'manage_devices',
    'view_lifestyle_data',
    'edit_lifestyle_data',
  ],
  nurse: [
    'view_all_patients',
    'view_vitals',
    'edit_vitals',
    'verify_vitals',
    'view_prescriptions',
    'view_alerts',
    'create_alerts',
    'view_lifestyle_data',
    'edit_lifestyle_data',
  ],
  lab_technician: [
    'view_all_patients',
    'view_labs',
    'edit_labs',
    'verify_labs',
    'create_alerts',
  ],
  pharmacist: [
    'view_all_patients',
    'view_prescriptions',
    'dispense_prescriptions',
    'create_alerts',
  ],
  receptionist: [
    'view_all_patients',
    'edit_patients',
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Get user-friendly role name
 */
export function getRoleName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    admin: 'Administrator',
    doctor: 'Doctor / Clinician',
    nurse: 'Nurse',
    lab_technician: 'Lab Technician',
    pharmacist: 'Pharmacist',
    receptionist: 'Receptionist',
  };
  return roleNames[role] || role;
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    admin: 'Full system access with user and settings management',
    doctor: 'Clinical care with patient management and prescription authority',
    nurse: 'Patient care with vitals tracking and alert monitoring',
    lab_technician: 'Lab results management and quality control',
    pharmacist: 'Prescription management and medication dispensing',
    receptionist: 'Patient registration and demographic information management',
  };
  return descriptions[role] || '';
}

/**
 * Check if a role can access a specific feature
 */
export function canAccessFeature(role: UserRole, feature: string): boolean {
  const featurePermissions: Record<string, Permission[]> = {
    patients: ['view_all_patients'],
    vitals: ['view_vitals'],
    labs: ['view_labs'],
    prescriptions: ['view_prescriptions'],
    alerts: ['view_alerts'],
    analytics: ['view_analytics'],
    admin: ['manage_users'],
    devices: ['manage_devices'],
    lifestyle: ['view_lifestyle_data'],
  };
  
  const requiredPermissions = featurePermissions[feature];
  if (!requiredPermissions) return false;
  
  return hasAnyPermission(role, requiredPermissions);
}

/**
 * Get available navigation items for a role
 */
export interface NavItem {
  name: string;
  href: string;
  icon?: string;
  permission?: Permission;
}

export function getAvailableNavItems(role: UserRole): NavItem[] {
  const allNavItems: NavItem[] = [
    { name: 'Overview', href: '/dashboard/overview', permission: 'view_all_patients' },
    { name: 'Patients', href: '/dashboard/patients', permission: 'view_all_patients' },
    { name: 'Lab Results', href: '/dashboard/lab-results', permission: 'view_labs' },
    { name: 'Prescriptions', href: '/dashboard/prescriptions', permission: 'view_prescriptions' },
    { name: 'Alerts', href: '/dashboard/alerts', permission: 'view_alerts' },
    { name: 'Analytics', href: '/dashboard/analytics', permission: 'view_analytics' },
    { name: 'Devices', href: '/dashboard/devices', permission: 'manage_devices' },
    { name: 'Admin', href: '/dashboard/admin', permission: 'manage_users' },
  ];
  
  return allNavItems.filter(item => 
    !item.permission || hasPermission(role, item.permission)
  );
}

/**
 * Get role badge color for UI display
 */
export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    doctor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    nurse: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    lab_technician: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    pharmacist: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    receptionist: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
}
