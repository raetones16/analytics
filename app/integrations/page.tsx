"use client";

import { useEffect, useState } from "react";
import { AddIntegrationModal } from "./AddIntegrationModal";

interface Integration {
  id: string;
  type: string;
  name: string;
  config: Record<string, any>;
  secrets: Record<string, any>;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  async function fetchIntegrations() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/integrations");
      const data = await res.json();
      if (res.ok) {
        setIntegrations(data.integrations || []);
      } else {
        setError(data.error || "Failed to fetch integrations");
      }
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchIntegrations();
  }, []);

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this integration?"))
      return;
    setActionMessage(null);
    const res = await fetch(`/api/integrations/${id}`, { method: "DELETE" });
    if (res.ok) {
      setActionMessage("Integration deleted.");
      fetchIntegrations();
    } else {
      const data = await res.json();
      setActionMessage(data.error || "Failed to delete integration.");
    }
  }

  async function handleTest(id: string) {
    setActionMessage(null);
    const res = await fetch(`/api/integrations/${id}/test`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setActionMessage(data.message || "Test succeeded.");
    } else {
      setActionMessage(data.error || "Test failed.");
    }
  }

  async function handleSync(id: string) {
    setActionMessage(null);
    const res = await fetch(`/api/integrations/${id}/sync`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setActionMessage(data.message || "Sync triggered.");
      fetchIntegrations();
    } else {
      setActionMessage(data.error || "Sync failed.");
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Integrations</h1>
        <button
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition"
          onClick={() => setShowAddModal(true)}
        >
          Add Integration
        </button>
      </div>
      {actionMessage && (
        <div className="mb-4 text-sm text-blue-700 bg-blue-100 rounded px-3 py-2">
          {actionMessage}
        </div>
      )}
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : integrations.length === 0 ? (
        <div>No integrations found.</div>
      ) : (
        <table className="w-full border text-sm bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Created</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {integrations.map((integration) => (
              <tr key={integration.id} className="border-t">
                <td className="p-2 font-medium">{integration.name}</td>
                <td className="p-2">{integration.type}</td>
                <td className="p-2">{integration.status}</td>
                <td className="p-2">
                  {new Date(integration.created_at).toLocaleString()}
                </td>
                <td className="p-2 flex gap-2">
                  <button
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    onClick={() => handleTest(integration.id)}
                  >
                    Test
                  </button>
                  <button
                    className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                    onClick={() => handleSync(integration.id)}
                  >
                    Sync
                  </button>
                  <button
                    className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                    onClick={() => handleDelete(integration.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <AddIntegrationModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onIntegrationAdded={fetchIntegrations}
      />
    </div>
  );
}
