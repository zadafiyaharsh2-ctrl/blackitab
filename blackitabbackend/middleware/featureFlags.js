// ──────────────────────────────────────────────────────────────────────────────
// Feature Flags Kill-Switch
//
// Allows administrators to disable specific features without stopping the app.
// Set in .env:
//   BETA_MODE=true
//   DISABLED_FEATURES=uploads,messages,ai,registrations
//
// Features list (use these names in DISABLED_FEATURES):
//   uploads        — POST routes that accept file uploads (posts/create, materials, etc.)
//   messages       — Message send endpoint
//   ai             — AI chat and question generation
//   registrations  — New account creation (register + register-institute)
//   social         — Follow/unfollow/subscribe actions
//   exams          — Exam creation and submission
//
// Usage:
//   router.post('/send', protect, requireFeature('messages'), controller.sendMessage)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Returns the set of currently disabled features (reads from env on each call
 * so no restart is needed if you update .env at runtime via process.env).
 */
const getDisabledFeatures = () => {
    const raw = process.env.DISABLED_FEATURES || '';
    return new Set(raw.split(',').map(f => f.trim().toLowerCase()).filter(Boolean));
};

/**
 * requireFeature(featureName) — blocks the request with 503 if the feature
 * is listed in DISABLED_FEATURES.
 */
const requireFeature = (featureName) => {
    return (req, res, next) => {
        const disabled = getDisabledFeatures();
        if (disabled.has(featureName.toLowerCase())) {
            return res.status(503).json({
                success: false,
                message: `The "${featureName}" feature is temporarily disabled by administrators. Please try again later.`,
                feature: featureName,
                disabled: true
            });
        }
        next();
    };
};

/**
 * isBetaMode() — returns true if the app is running in beta mode.
 * Can be used in controllers for conditional logic.
 */
const isBetaMode = () => process.env.BETA_MODE === 'true';

/**
 * isFeatureEnabled(featureName) — check if a feature is currently enabled.
 * Useful inside controllers for conditional logic.
 */
const isFeatureEnabled = (featureName) => {
    return !getDisabledFeatures().has(featureName.toLowerCase());
};

module.exports = { requireFeature, isBetaMode, isFeatureEnabled, getDisabledFeatures };
