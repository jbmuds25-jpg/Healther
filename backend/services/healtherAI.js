/**
 * HealtherAI Service Module
 * 
 * Core AI service that powers Healther across all platforms
 * Handles:
 * - Intent recognition
 * - Smart routing
 * - OpenAI integration
 * - Conversation management
 * - Emergency detection
 * - Analytics & logging
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class HealtherAIService {
    constructor(options = {}) {
        this.openaiClient = options.openaiClient || null;
        this.conversationStorage = options.conversationStorage || null;
        this.emergencyHandler = options.emergencyHandler || this.defaultEmergencyHandler;
        this.debug = options.debug || false;
        this.maxTokens = options.maxTokens || 500;
        
        // Intent keywords
        this.intents = {
            emergency: {
                keywords: ['emergency', 'help', 'accident', 'severe', 'critical', 'heart attack', 'chest pain', 'difficulty breathing', 'bleeding', 'unconscious', 'broken', 'fracture', 'poison', 'overdose', 'suicide', 'harm'],
                handler: 'handleEmergency'
            },
            health_advice: {
                keywords: ['sleep', 'exercise', 'nutrition', 'diet', 'water', 'hydration', 'stress', 'anxiety', 'mental', 'depression', 'mood'],
                handler: 'handleHealthAdvice'
            },
            symptom_check: {
                keywords: ['headache', 'fever', 'cold', 'cough', 'fatigue', 'nausea', 'dizziness', 'pain', 'sick', 'ill'],
                handler: 'handleSymptomCheck'
            },
            navigation: {
                keywords: ['profile', 'posts', 'badges', 'dashboard', 'settings', 'help', 'logout', 'home', 'go to', 'show', 'open'],
                handler: 'handleNavigation'
            },
            wellness_tracking: {
                keywords: ['wellness', 'score', 'track', 'sleep hours', 'water intake', 'steps'],
                handler: 'handleWellnessTracking'
            },
            general_info: {
                keywords: ['what', 'how', 'why', 'tell', 'explain', 'info'],
                handler: 'handleGeneralInfo'
            }
        };

        // Health advice database
        this.healthAdvice = {
            sleep: '💤 Sleep is crucial for health! Most adults need 7-9 hours per night. Try: maintaining a consistent schedule, avoiding screens 1 hour before bed, keeping your room cool and dark, and avoiding caffeine late in the day.',
            exercise: '🏃 The WHO recommends 150 minutes of moderate activity or 75 minutes of intense activity weekly. Start small, be consistent, and find activities you enjoy.',
            nutrition: '🥗 Focus on whole foods: vegetables, fruits, lean proteins, whole grains, and healthy fats. Eat a balanced diet, control portions, and stay hydrated.',
            water: '💧 Aim for about 8 glasses (2 liters) of water daily. More water helps with energy, skin health, and digestion. Keep a water bottle with you!',
            stress: '😌 Try: deep breathing exercises, meditation, physical activity, talking with friends/family, or seeking professional help.',
            mental: '💭 Your mental health matters equally as physical health. Please reach out to a mental health professional if struggling.'
        };

        // Symptoms advice database
        this.symptomAdvice = {
            headache: '🤕 Headaches can be caused by dehydration, stress, or other factors. Try drinking water, resting in a dark room, or using over-the-counter pain relief.',
            fever: '🌡️ A fever usually means your body is fighting an infection. Stay hydrated, rest, and monitor your temperature.',
            cold: '🤧 Common colds are viral. Get plenty of rest, stay hydrated, use saline nasal drops, and take vitamin C.',
            cough: '🫁 Stay hydrated, use honey or lozenges, rest, and avoid irritants.',
            fatigue: '😴 Ensure you get 7-9 hours of sleep and manage stress levels.',
            nausea: '🤢 Sip water slowly, eat light foods, rest, and avoid strong smells.',
            dizziness: '🌪️ Sit or lie down, sip water, and avoid sudden movements.'
        };

        // Navigation targets
        this.navTargets = {
            'profile': { url: '/profile', label: 'View your health profile' },
            'posts': { url: '/posts', label: 'See community posts' },
            'badges': { url: '/badges', label: 'View your badges' },
            'dashboard': { url: '/dashboard', label: 'Return to dashboard' },
            'settings': { url: '/settings', label: 'Open settings' },
            'help': { url: '/help', label: 'Get help' },
            'logout': { url: '/logout', label: 'Log out of the app' },
            'home': { url: '/', label: 'Return home' }
        };

        this.logger = options.logger || console;
    }

    /**
     * Main process message method - entry point for all platforms
     * @param {object} params - Message parameters
     * @param {string} params.message - User message
     * @param {object} params.user - User context { id, username, role, page }
     * @param {array} params.conversationHistory - Previous messages in conversation
     * @returns {Promise<object>} AI response
     */
    async processMessage(params) {
        const { message, user = {}, conversationHistory = [] } = params;

        if (!message || message.trim().length === 0) {
            return this.formatResponse(
                "I didn't catch that. Could you please repeat?",
                'clarification',
                { error: 'Empty message' }
            );
        }

        try {
            const cleanMessage = message.trim().toLowerCase();

            // Log the interaction
            this.log('info', `Processing message: "${cleanMessage}" for user: ${user.id}`);

            // Detect intent
            const intent = this.detectIntent(cleanMessage);
            
            // Route to appropriate handler
            const handler = this[intent.handler];
            if (handler && typeof handler === 'function') {
                const response = await handler.call(this, {
                    message: cleanMessage,
                    originalMessage: message,
                    user,
                    conversationHistory,
                    intent
                });

                return response;
            }

            // Fallback to general info or OpenAI
            return await this.handleGeneral({
                message: cleanMessage,
                originalMessage: message,
                user,
                conversationHistory,
                intent
            });

        } catch (error) {
            this.log('error', `Error processing message: ${error.message}`);
            return this.formatResponse(
                'I encountered an error processing your message. Please try again.',
                'error',
                { error: error.message }
            );
        }
    }

    /**
     * Detect intent from user message
     * @param {string} message - User message (lowercase)
     * @returns {object} Detected intent
     */
    detectIntent(message) {
        for (const [intentName, intentData] of Object.entries(this.intents)) {
            if (intentData.keywords.some(keyword => message.includes(keyword))) {
                return {
                    name: intentName,
                    handler: intentData.handler,
                    confidence: 0.8
                };
            }
        }

        // Default to general
        return {
            name: 'general_info',
            handler: 'handleGeneralInfo',
            confidence: 0.5
        };
    }

    /**
     * Handle emergency situations
     */
    async handleEmergency(params) {
        const { message, user } = params;

        this.log('alert', `EMERGENCY DETECTED: ${message} - User: ${user.id}`);

        // Call emergency handler
        if (this.emergencyHandler) {
            await this.emergencyHandler({
                message,
                user,
                timestamp: new Date()
            });
        }

        return this.formatResponse(
            '🚨 EMERGENCY DETECTED! Please call 911 immediately or visit your nearest hospital. Emergency services have been alerted if available.',
            'emergency',
            { severity: 'critical', actionRequired: true }
        );
    }

    /**
     * Handle health advice questions
     */
    async handleHealthAdvice(params) {
        const { message } = params;

        for (const [topic, advice] of Object.entries(this.healthAdvice)) {
            if (message.includes(topic)) {
                return this.formatResponse(
                    `${advice} Always consult a healthcare professional for personalized advice.`,
                    'health_advice',
                    { topic }
                );
            }
        }

        return null; // Let it fall through to general handler
    }

    /**
     * Handle symptom checking
     */
    async handleSymptomCheck(params) {
        const { message } = params;

        for (const [symptom, advice] of Object.entries(this.symptomAdvice)) {
            if (message.includes(symptom)) {
                return this.formatResponse(
                    `${advice} Remember, I'm an AI assistant—for proper diagnosis, always consult a healthcare professional.`,
                    'symptom_advice',
                    { symptom }
                );
            }
        }

        return null;
    }

    /**
     * Handle navigation requests
     */
    async handleNavigation(params) {
        const { message } = params;

        for (const [target, data] of Object.entries(this.navTargets)) {
            if (message.includes(target)) {
                return this.formatResponse(
                    `Sure! I can help you navigate to: ${data.label}. You can click the navigation menu or I can guide you there.`,
                    'navigation',
                    { action: 'navigate', target: data.url }
                );
            }
        }

        return null;
    }

    /**
     * Handle wellness tracking
     */
    async handleWellnessTracking(params) {
        const { user } = params;

        return this.formatResponse(
            '📊 Your wellness score tracks sleep, water intake, and activity levels. Keep tracking to improve your score! Would you like tips on any specific area?',
            'wellness',
            { action: 'show_wellness_dashboard' }
        );
    }

    /**
     * Handle general information requests
     */
    async handleGeneralInfo(params) {
        const { message, originalMessage, user, conversationHistory } = params;

        // Try OpenAI if available
        if (this.openaiClient) {
            return await this.queryOpenAI({
                message: originalMessage,
                user,
                conversationHistory
            });
        }

        // Fallback response
        return this.formatResponse(
            'I can help you with health questions, app features, wellness tracking, or navigation. What would you like to know?',
            'info',
            { suggestion: 'Try asking about sleep, exercise, nutrition, or app features' }
        );
    }

    /**
     * Handle general messages with OpenAI
     */
    async handleGeneral(params) {
        return await this.handleGeneralInfo(params);
    }

    /**
     * Query OpenAI for response
     */
    async queryOpenAI(params) {
        const { message, user, conversationHistory } = params;

        if (!this.openaiClient) {
            return this.formatResponse(
                'OpenAI integration not configured.',
                'error',
                { error: 'openai_not_configured' }
            );
        }

        try {
            // Prepare conversation history for OpenAI
            const messages = conversationHistory.slice(-5).map(msg => ({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.message
            }));

            messages.push({
                role: 'user',
                content: message
            });

            // System prompt for Healther AI personality
            const systemPrompt = this.getSystemPrompt(user);

            const response = await this.openaiClient.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages
                ],
                max_tokens: this.maxTokens,
                temperature: 0.7
            });

            const aiMessage = response.choices[0].message.content;

            return this.formatResponse(
                aiMessage,
                'openai_response',
                { 
                    model: 'gpt-3.5-turbo',
                    tokens_used: response.usage.total_tokens,
                    finish_reason: response.choices[0].finish_reason
                }
            );

        } catch (error) {
            this.log('error', `OpenAI query failed: ${error.message}`);
            return this.formatResponse(
                'I encountered an issue generating a response. Please try again.',
                'error',
                { error: 'openai_error', details: error.message }
            );
        }
    }

    /**
     * Get system prompt for OpenAI based on user role
     */
    getSystemPrompt(user = {}) {
        const role = user.role || 'citizen';
        const username = user.username || 'there';

        return `You are Healther AI, a compassionate and knowledgeable health assistant. You are helping ${username}, who has the role of "${role}" in the Healther platform.

Your responsibilities:
1. Provide helpful, accurate health information
2. Never diagnose or replace professional medical advice
3. Always recommend consulting healthcare professionals for serious concerns
4. Be aware of the user's role and provide role-specific guidance
5. Support the Healther app features: posts, badges, profiles, wellness tracking
6. Maintain a friendly, professional tone
7. Respect user privacy and security

For the user with role "${role}", remember:
${role === 'doctor' ? '- Help with patient management and research resources' : ''}
${role === 'scientist' ? '- Provide research insights and health data analytics' : ''}
${role === 'hospital_admin' ? '- Assist with hospital management and partner coordination' : ''}
${role === 'citizen' ? '- Focus on wellness, health tracking, and community health' : ''}

Always be empathetic and supportive. If unsure, ask clarifying questions or recommend professional consultation.`;
    }

    /**
     * Format response for all platforms
     */
    formatResponse(text, type = 'info', metadata = {}) {
        return {
            id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
            text,
            type,
            timestamp: new Date().toISOString(),
            metadata,
            platform: 'healther-ai-service/1.0'
        };
    }

    /**
     * Calculate wellness score
     */
    calculateWellnessScore(data = {}) {
        let score = 0;

        // Sleep scoring (0-33 points)
        const sleep = data.sleep || 0;
        if (sleep >= 7 && sleep <= 9) {
            score += 33;
        } else if (sleep >= 6 && sleep < 10) {
            score += 25;
        } else if (sleep > 0) {
            score += 15;
        }

        // Water scoring (0-33 points)
        const water = data.water || 0;
        if (water >= 8) {
            score += 33;
        } else if (water >= 6) {
            score += 25;
        } else if (water > 0) {
            score += 15;
        }

        // Steps scoring (0-34 points)
        const steps = data.steps || 0;
        if (steps >= 10000) {
            score += 34;
        } else if (steps >= 7000) {
            score += 25;
        } else if (steps >= 5000) {
            score += 15;
        } else if (steps > 0) {
            score += 8;
        }

        return Math.min(Math.max(Math.round(score), 0), 100);
    }

    /**
     * Default emergency handler
     */
    defaultEmergencyHandler(params) {
        // To be overridden by application
        console.warn('Emergency detected but no handler configured', params);
    }

    /**
     * Logging utility
     */
    log(level, message, data = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            ...data
        };

        if (this.debug || level === 'error' || level === 'alert') {
            this.logger[level] ? this.logger[level](logEntry) : console.log(logEntry);
        }
    }

    /**
     * Get service capabilities
     */
    getCapabilities() {
        return {
            health_advice: 'Provides general health advice and wellness tips',
            emergency_detection: 'Identifies emergency keywords and alerts',
            symptom_checking: 'Offers guidance for common symptoms',
            wellness_tracking: 'Calculates and tracks wellness scores',
            navigation_help: 'Helps navigate app features',
            openai_integration: 'Uses OpenAI for intelligent responses',
            multi_platform: 'Works across web, desktop, and mobile',
            context_aware: 'Understands user role, page, and history'
        };
    }

    /**
     * Get service version and info
     */
    getInfo() {
        return {
            name: 'Healther AI Service',
            version: '1.0.0',
            capabilities: this.getCapabilities(),
            supportedIntents: Object.keys(this.intents),
            isOpenAIEnabled: !!this.openaiClient
        };
    }
}

module.exports = HealtherAIService;
