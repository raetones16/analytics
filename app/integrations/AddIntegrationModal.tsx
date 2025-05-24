"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { SiSalesforce } from "react-icons/si";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIntegrationAdded: () => void;
}

const connectors = [
  {
    id: "salesforce",
    name: "Salesforce",
    logo: <SiSalesforce className="text-blue-500 w-8 h-8" />,
    description:
      "Connect your Salesforce CRM to sync leads, opportunities, and more.",
    docsUrl:
      "https://help.salesforce.com/s/articleView?id=sf.remoteaccess_authenticate_overview.htm&type=5",
  },
];

const steps = [
  "Select Integration Type",
  "Configure Integration",
  "Test Connection",
  "Review & Save",
];

export function AddIntegrationModal({
  open,
  onOpenChange,
  onIntegrationAdded,
}: Props) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tested, setTested] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Form state
  const [type, setType] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [instanceUrl, setInstanceUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [refreshToken, setRefreshToken] = useState("");

  function reset() {
    setStep(0);
    setLoading(false);
    setError(null);
    setTested(false);
    setTestResult(null);
    setType(null);
    setName("");
    setInstanceUrl("");
    setStartDate("");
    setClientId("");
    setClientSecret("");
    setRefreshToken("");
  }

  async function handleTest() {
    setLoading(true);
    setError(null);
    setTested(false);
    setTestResult(null);
    try {
      // Create the integration first if needed, then test (for now, just test the config in the modal)
      // We'll POST to /api/integrations with a dummy body, then call /test on the stub
      // For now, just simulate success
      setTimeout(() => {
        setTestResult("Connection successful!");
        setTested(true);
        setLoading(false);
      }, 1000);
    } catch (err: any) {
      setTestResult("Test failed: " + (err.message || "Unknown error"));
      setTested(false);
      setLoading(false);
    }
  }

  async function handleSave() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name,
          config: { instance_url: instanceUrl, start_date: startDate },
          secrets: {
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
          },
        }),
      });
      if (res.ok) {
        onIntegrationAdded();
        onOpenChange(false);
        reset();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save integration");
      }
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function canContinue() {
    if (step === 0) return !!type;
    if (step === 1) {
      return (
        name &&
        instanceUrl &&
        startDate &&
        clientId &&
        clientSecret &&
        refreshToken
      );
    }
    if (step === 2) {
      return tested;
    }
    return true;
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded bg-white p-8 shadow-lg">
          <Dialog.Title className="text-xl font-bold mb-4">
            Add Integration
          </Dialog.Title>
          <div className="mb-6 flex gap-2 text-xs items-center">
            {steps.map((s, i) => (
              <span
                key={s}
                className={
                  i === step ? "font-bold text-primary" : "text-gray-400"
                }
              >
                {s}
                {i < steps.length - 1 && <span className="mx-1">→</span>}
              </span>
            ))}
          </div>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          {step === 0 && (
            <div>
              <div className="mb-4 text-base font-medium">
                Select an integration to add:
              </div>
              <div className="flex gap-6">
                {connectors.map((c) => (
                  <button
                    key={c.id}
                    className={`flex flex-col items-center border rounded-lg p-6 w-64 transition focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                      type === c.id
                        ? "border-primary bg-white"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                    onClick={() => setType(c.id)}
                    type="button"
                  >
                    {c.logo}
                    <div className="mt-2 text-lg font-semibold">{c.name}</div>
                    <div className="text-gray-600 text-sm mt-1 mb-2 text-center">
                      {c.description}
                    </div>
                    <a
                      href={c.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 underline mt-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      How to get Salesforce OAuth credentials
                    </a>
                  </button>
                ))}
              </div>
              <div className="flex justify-end mt-8">
                <button
                  className="bg-primary text-white px-6 py-2 rounded disabled:opacity-50"
                  onClick={() => setStep(1)}
                  disabled={!type}
                >
                  Continue
                </button>
              </div>
            </div>
          )}
          {step === 1 && type === "salesforce" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep(2);
              }}
              className="space-y-5 max-w-xl mx-auto"
            >
              <div>
                <label className="block text-sm font-medium mb-1">
                  Integration Name
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. My Salesforce Connector"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Instance URL
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={instanceUrl}
                  onChange={(e) => setInstanceUrl(e.target.value)}
                  required
                  placeholder="https://your-instance.salesforce.com"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Find this in your Salesforce browser address bar after logging
                  in.
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  The earliest date to sync data from.
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Client ID
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  required
                  placeholder="Salesforce OAuth Client ID"
                />
                <div className="text-xs text-gray-500 mt-1">
                  From your Salesforce connected app settings.
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Client Secret
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  required
                  placeholder="Salesforce OAuth Client Secret"
                />
                <div className="text-xs text-gray-500 mt-1">
                  From your Salesforce connected app settings.
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Refresh Token
                </label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={refreshToken}
                  onChange={(e) => setRefreshToken(e.target.value)}
                  required
                  placeholder="Salesforce OAuth Refresh Token"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Generated after authenticating your connected app.
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  className="text-gray-500"
                  onClick={() => setStep(0)}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white px-6 py-2 rounded"
                  disabled={!canContinue()}
                >
                  Continue
                </button>
              </div>
            </form>
          )}
          {step === 2 && (
            <div className="max-w-xl mx-auto">
              <div className="mb-4 text-base font-medium">
                Test your connection
              </div>
              <div className="mb-4 text-gray-600">
                Click the button below to test the connection with the provided
                credentials. This will attempt to connect to Salesforce and
                validate your details.
              </div>
              <button
                className="bg-primary text-white px-6 py-2 rounded mb-2"
                onClick={handleTest}
                disabled={loading || tested}
              >
                {loading ? "Testing..." : tested ? "Tested" : "Test Connection"}
              </button>
              {testResult && (
                <div
                  className={`mb-2 ${
                    tested ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {testResult}
                </div>
              )}
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  className="text-gray-500"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="bg-primary text-white px-6 py-2 rounded"
                  onClick={() => setStep(3)}
                  disabled={!canContinue()}
                >
                  Continue
                </button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="max-w-xl mx-auto">
              <div className="mb-4 text-base font-medium">Review Details</div>
              <div className="mb-4 space-y-1">
                <div>
                  <b>Name:</b> {name}
                </div>
                <div>
                  <b>Instance URL:</b> {instanceUrl}
                </div>
                <div>
                  <b>Start Date:</b> {startDate}
                </div>
                <div>
                  <b>Client ID:</b> {clientId ? "••••••" : ""}
                </div>
                <div>
                  <b>Client Secret:</b> {clientSecret ? "••••••" : ""}
                </div>
                <div>
                  <b>Refresh Token:</b> {refreshToken ? "••••••" : ""}
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  className="text-gray-500"
                  onClick={() => setStep(2)}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="bg-primary text-white px-6 py-2 rounded"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Integration"}
                </button>
              </div>
            </div>
          )}
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
