// Test script for the new automatic syncing and field selection endpoints
// Run this after updating the database schema

const BASE_URL = "http://localhost:3000";

async function testEndpoints() {
  console.log("🧪 Testing new API endpoints...\n");

  try {
    // 1. Test getting integrations (should now include new fields)
    console.log("1. Testing GET /api/integrations");
    const integrationsRes = await fetch(`${BASE_URL}/api/integrations`);
    const integrationsData = await integrationsRes.json();

    if (integrationsRes.ok && integrationsData.integrations) {
      console.log("✅ Integrations endpoint working");
      console.log(
        `   Found ${integrationsData.integrations.length} integrations`
      );

      if (integrationsData.integrations.length > 0) {
        const integration = integrationsData.integrations[0];
        const integrationId = integration.id;
        console.log(
          `   Testing with integration: ${integration.name} (${integrationId})`
        );

        // 2. Test schema endpoint
        console.log("\n2. Testing GET /api/integrations/[id]/schema");
        const schemaRes = await fetch(
          `${BASE_URL}/api/integrations/${integrationId}/schema`
        );
        const schemaData = await schemaRes.json();

        if (schemaRes.ok) {
          console.log("✅ Schema endpoint working");
          console.log(
            `   Found ${
              schemaData.catalog?.streams?.length || 0
            } Salesforce objects`
          );
        } else {
          console.log("❌ Schema endpoint failed:", schemaData.error);
        }

        // 3. Test schedule endpoint
        console.log("\n3. Testing PUT /api/integrations/[id]/schedule");
        const scheduleRes = await fetch(
          `${BASE_URL}/api/integrations/${integrationId}/schedule`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sync_enabled: true,
              sync_frequency: "daily",
            }),
          }
        );
        const scheduleData = await scheduleRes.json();

        if (scheduleRes.ok) {
          console.log("✅ Schedule endpoint working");
          console.log(`   Message: ${scheduleData.message}`);
        } else {
          console.log("❌ Schedule endpoint failed:", scheduleData.error);
        }

        // 4. Test fields endpoint
        console.log("\n4. Testing PUT /api/integrations/[id]/fields");
        const fieldsRes = await fetch(
          `${BASE_URL}/api/integrations/${integrationId}/fields`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              selected_fields: {
                Account: ["Id", "Name", "Email"],
                Contact: ["Id", "FirstName", "LastName"],
              },
            }),
          }
        );
        const fieldsData = await fieldsRes.json();

        if (fieldsRes.ok) {
          console.log("✅ Fields endpoint working");
          console.log(`   Message: ${fieldsData.message}`);
        } else {
          console.log("❌ Fields endpoint failed:", fieldsData.error);
        }

        // 5. Test cron endpoint (without auth for now)
        console.log("\n5. Testing POST /api/cron/sync");
        const cronRes = await fetch(`${BASE_URL}/api/cron/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer your-secure-cron-secret-here",
          },
        });
        const cronData = await cronRes.json();

        if (cronRes.ok) {
          console.log("✅ Cron endpoint working");
          console.log(`   Message: ${cronData.message}`);
        } else {
          console.log("❌ Cron endpoint failed:", cronData.error);
        }
      } else {
        console.log("⚠️  No integrations found to test with");
      }
    } else {
      console.log("❌ Integrations endpoint failed:", integrationsData.error);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }

  console.log("\n🏁 Testing complete!");
}

// Run the tests
testEndpoints();
