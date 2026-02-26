/**
 * GHL Service
 * Handles data synchronization between the PTE Mock Test App and GoHighLevel via n8n webhooks.
 */

class GHLService {
    constructor() {
        // Default webhook URL from environment variables
        this.webhookUrl = import.meta.env.VITE_WEBHOOK_URL || 'https://n8n.srv826531.hstgr.cloud/webhook-test/b225b16c-c602-450e-b858-f9bbe4ba5dd6';
    }

    /**
     * Syncs new user registration to GoHighLevel
     * @param {Object} userData - User details (name, email)
     */
    async syncUserRegistration(userData) {
        const payload = {
            action: 'user_registration',
            timestamp: new Date().toISOString(),
            student: {
                name: userData.name,
                email: userData.email,
                source: 'PTE Mock Test App',
                tags: ['PTE Student', 'Newly Registered']
            }
        };

        return this._sendToWebhook(payload);
    }

    /**
     * Syncs exam results to GoHighLevel
     * @param {Object} userData - User details
     * @param {Object} scores - Calculated scores (overall, listening, reading, speaking, writing)
     */
    async syncTestResults(userData, scores) {
        const payload = {
            action: 'test_result_submission',
            timestamp: new Date().toISOString(),
            student: {
                name: userData.name,
                email: userData.email
            },
            results: {
                overall: scores.overall,
                listening: scores.listening,
                reading: scores.reading,
                speaking: scores.speaking,
                writing: scores.writing,
                cefr: scores.cefr,
                completedAt: new Date().toLocaleString()
            },
            tags: ['Exam Completed', `Score: ${scores.overall}`]
        };

        return this._sendToWebhook(payload);
    }

    /**
     * Internal helper to send data to the n8n webhook
     * @param {Object} payload 
     */
    async _sendToWebhook(payload) {
        try {
            console.log(`[GHL Integration] Sending ${payload.action} to n8n...`);

            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`n8n webhook responded with status ${response.status}`);
            }

            const result = await response.json();
            console.log(`[GHL Integration] Successfully synced ${payload.action}`);
            return { success: true, data: result };
        } catch (error) {
            console.error(`[GHL Integration] Sync failed for ${payload.action}:`, error);
            return { success: false, error: error.message };
        }
    }
}

export const ghlService = new GHLService();
