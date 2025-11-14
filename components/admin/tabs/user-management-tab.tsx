"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Shield, Trash2 } from 'lucide-react';

export default function UserManagementTab() {
  const supabase = createClient();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    [user.full_name, user.email].join(" ").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await supabase.from("users").update({ status: newStatus }).eq("id", userId);

      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-3 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin">
              <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full" />
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted-background">
                <tr>
                  <th className="text-left p-4 font-semibold text-foreground">Name</th>
                  <th className="text-left p-4 font-semibold text-foreground hidden md:table-cell">Email</th>
                  <th className="text-left p-4 font-semibold text-foreground">Role</th>
                  <th className="text-left p-4 font-semibold text-foreground">Status</th>
                  <th className="text-left p-4 font-semibold text-foreground w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => (
                  <tr
                    key={user.id}
                    className={`border-b border-border hover:bg-muted-background transition ${
                      idx % 2 === 1 ? "bg-muted-background/50" : ""
                    }`}
                  >
                    <td className="p-4 font-medium text-foreground">{user.full_name}</td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell text-xs">
                      {user.email}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary capitalize">
                        <Shield className="w-3 h-3" />
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={user.status}
                        onChange={(e) => handleStatusChange(user.id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded capitalize ${
                          user.status === "active"
                            ? "bg-success/10 text-success"
                            : "bg-muted-background text-muted-foreground"
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <button
                        className="p-1.5 hover:bg-destructive/10 rounded text-destructive transition"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
