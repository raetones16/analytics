"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Switch from "@radix-ui/react-switch";

interface Integration {
  id: string;
  type: string;
  name: string;
  config: Record<string, any>;
  secrets: Record<string, any>;
  status: string;
  sync_frequency?: string;
  sync_enabled?: boolean;
  last_sync_at?: string;
  next_sync_at?: string;
  selected_fields?: Record<string, string[]>;
}

interface Props {
  integration: Integration;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

interface SalesforceObject {
  stream: string;
  tap_stream_id: string;
  schema: {
    properties: Record<string, any>;
  };
}

export function IntegrationSettings({
  integration,
  open,
  onOpenChange,
  onUpdated,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Scheduling state
  const [syncEnabled, setSyncEnabled] = useState(
    integration.sync_enabled || false
  );
  const [syncFrequency, setSyncFrequency] = useState(
    integration.sync_frequency || "manual"
  );

  // Field selection state
  const [availableObjects, setAvailableObjects] = useState<SalesforceObject[]>(
    []
  );
  const [selectedFields, setSelectedFields] = useState<
    Record<string, string[]>
  >(integration.selected_fields || {});
  const [loadingSchema, setLoadingSchema] = useState(false);

  // Load schema when modal opens
  useEffect(() => {
    if (open && integration.type === "salesforce") {
      loadSchema();
    }
  }, [open, integration.id]);

  async function loadSchema() {
    setLoadingSchema(true);
    try {
      const res = await fetch(`/api/integrations/${integration.id}/schema`);
      const data = await res.json();

      if (res.ok && data.catalog && data.catalog.streams) {
        setAvailableObjects(data.catalog.streams);
      } else {
        setError("Failed to load schema: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      setError("Failed to load schema: " + err.message);
    } finally {
      setLoadingSchema(false);
    }
  }

  async function handleScheduleUpdate() {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/integrations/${integration.id}/schedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sync_enabled: syncEnabled,
          sync_frequency: syncFrequency,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        onUpdated();
      } else {
        setError(data.error || "Failed to update schedule");
      }
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function handleFieldsUpdate() {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/integrations/${integration.id}/fields`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selected_fields: selectedFields,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        onUpdated();
      } else {
        setError(data.error || "Failed to update field selections");
      }
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function toggleObjectFields(objectName: string, allFields: string[]) {
    const currentFields = selectedFields[objectName] || [];
    const isFullySelected = currentFields.length === allFields.length;

    setSelectedFields((prev) => ({
      ...prev,
      [objectName]: isFullySelected ? [] : allFields,
    }));
  }

  function toggleField(objectName: string, fieldName: string) {
    setSelectedFields((prev) => {
      const currentFields = prev[objectName] || [];
      const isSelected = currentFields.includes(fieldName);

      return {
        ...prev,
        [objectName]: isSelected
          ? currentFields.filter((f) => f !== fieldName)
          : [...currentFields, fieldName],
      };
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-4xl max-h-[90vh] -translate-x-1/2 -translate-y-1/2 rounded bg-white p-6 shadow-lg overflow-y-auto">
          <Dialog.Title className="text-xl font-bold mb-4">
            Settings: {integration.name}
          </Dialog.Title>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700">
              {message}
            </div>
          )}

          <div className="space-y-8">
            {/* Sync Scheduling Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Sync Schedule</h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Switch.Root
                    checked={syncEnabled}
                    onCheckedChange={setSyncEnabled}
                    className="w-11 h-6 bg-gray-200 rounded-full relative data-[state=checked]:bg-blue-600 outline-none cursor-pointer"
                  >
                    <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
                  </Switch.Root>
                  <label className="text-sm font-medium">
                    Enable automatic syncing
                  </label>
                </div>

                {syncEnabled && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Sync Frequency
                    </label>
                    <select
                      value={syncFrequency}
                      onChange={(e) => setSyncFrequency(e.target.value)}
                      className="border rounded px-3 py-2"
                    >
                      <option value="hourly">Every Hour</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                )}

                {integration.last_sync_at && (
                  <div className="text-sm text-gray-600">
                    Last sync:{" "}
                    {new Date(integration.last_sync_at).toLocaleString()}
                  </div>
                )}

                {integration.next_sync_at && syncEnabled && (
                  <div className="text-sm text-gray-600">
                    Next sync:{" "}
                    {new Date(integration.next_sync_at).toLocaleString()}
                  </div>
                )}

                <button
                  onClick={handleScheduleUpdate}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Schedule"}
                </button>
              </div>
            </div>

            {/* Field Selection Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Data Fields</h3>

              {loadingSchema ? (
                <div className="text-center py-8">
                  <div className="text-gray-600">
                    Loading available fields...
                  </div>
                </div>
              ) : availableObjects.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-600">No schema data available</div>
                  <button
                    onClick={loadSchema}
                    className="mt-2 text-blue-600 hover:text-blue-800"
                  >
                    Retry loading schema
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    Select which fields to sync for each Salesforce object:
                  </div>

                  {availableObjects.slice(0, 10).map((obj) => {
                    const objectName = obj.tap_stream_id;
                    const fields = Object.keys(obj.schema.properties || {});
                    const selectedObjectFields =
                      selectedFields[objectName] || [];
                    const isFullySelected =
                      selectedObjectFields.length === fields.length;
                    const isPartiallySelected =
                      selectedObjectFields.length > 0 &&
                      selectedObjectFields.length < fields.length;

                    return (
                      <div key={objectName} className="border rounded p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{objectName}</h4>
                          <button
                            onClick={() =>
                              toggleObjectFields(objectName, fields)
                            }
                            className={`text-sm px-3 py-1 rounded ${
                              isFullySelected
                                ? "bg-blue-100 text-blue-700"
                                : isPartiallySelected
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {isFullySelected ? "Deselect All" : "Select All"} (
                            {selectedObjectFields.length}/{fields.length})
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                          {fields.slice(0, 20).map((field) => (
                            <label
                              key={field}
                              className="flex items-center space-x-2 text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={selectedObjectFields.includes(field)}
                                onChange={() => toggleField(objectName, field)}
                                className="rounded"
                              />
                              <span className="truncate">{field}</span>
                            </label>
                          ))}
                          {fields.length > 20 && (
                            <div className="text-xs text-gray-500 col-span-3">
                              ... and {fields.length - 20} more fields
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {availableObjects.length > 10 && (
                    <div className="text-sm text-gray-500 text-center">
                      Showing first 10 objects. {availableObjects.length - 10}{" "}
                      more available.
                    </div>
                  )}

                  <button
                    onClick={handleFieldsUpdate}
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Update Field Selections"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <Dialog.Close asChild>
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl">
              ×
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
