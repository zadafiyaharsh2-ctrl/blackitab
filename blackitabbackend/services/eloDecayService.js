const DEFAULT_BASE_ELO = 1000;
const DEFAULT_RETENTION_RATE = 0.9;
const DEFAULT_RETENTION_DAYS = 30;
const DEFAULT_WARNING_DAYS = 14;
const DEFAULT_CRITICAL_DAYS = 45;
const DEFAULT_VISIBLE_LOSS = 8;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function readEnvNumber(name, fallback) {
    const value = Number(process.env[name]);
    return Number.isFinite(value) ? value : fallback;
}

const BASE_ELO = readEnvNumber('ELO_BASELINE', DEFAULT_BASE_ELO);
const DECAY_RETENTION_RATE = clamp(
    readEnvNumber('ELO_DECAY_RETENTION_RATE', DEFAULT_RETENTION_RATE),
    0.01,
    0.999
);
const DECAY_RETENTION_DAYS = Math.max(1, readEnvNumber('ELO_DECAY_RETENTION_DAYS', DEFAULT_RETENTION_DAYS));
const DECAY_WARNING_DAYS = Math.max(1, readEnvNumber('ELO_DECAY_WARNING_DAYS', DEFAULT_WARNING_DAYS));
const DECAY_CRITICAL_DAYS = Math.max(DECAY_WARNING_DAYS, readEnvNumber('ELO_DECAY_CRITICAL_DAYS', DEFAULT_CRITICAL_DAYS));
const MIN_VISIBLE_ELO_LOSS = Math.max(1, readEnvNumber('ELO_DECAY_MIN_VISIBLE_LOSS', DEFAULT_VISIBLE_LOSS));
const DECAY_LAMBDA = -Math.log(DECAY_RETENTION_RATE) / DECAY_RETENTION_DAYS;

function toMap(mapLike) {
    if (mapLike && typeof mapLike.get === 'function' && typeof mapLike.set === 'function') {
        return mapLike;
    }

    if (mapLike && typeof mapLike === 'object') {
        return new Map(Object.entries(mapLike));
    }

    return new Map();
}

function normalizeDomainKey(domainName) {
    if (typeof domainName !== 'string') return '';
    return domainName.trim().toLowerCase();
}

function prettifyDomainName(domainKey) {
    if (!domainKey) return 'General';

    return domainKey
        .split(/[\s_-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function parseDate(value) {
    if (!value) return null;
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getInactivityDays(lastAttemptedAt, now = new Date()) {
    const parsedLastAttempt = parseDate(lastAttemptedAt);
    if (!parsedLastAttempt) return 0;

    const nowDate = parseDate(now) || new Date();
    const diffMs = nowDate.getTime() - parsedLastAttempt.getTime();
    const rawDays = Math.floor(diffMs / 86400000);
    return Math.max(0, rawDays);
}

function computeEffectiveElo(storedElo, inactivityDays) {
    const safeStoredElo = Number.isFinite(Number(storedElo)) ? Number(storedElo) : BASE_ELO;
    const safeDays = Math.max(0, Number.isFinite(Number(inactivityDays)) ? Number(inactivityDays) : 0);

    const decayFactor = Math.exp(-DECAY_LAMBDA * safeDays);
    const effectiveEloRaw = BASE_ELO + (safeStoredElo - BASE_ELO) * decayFactor;
    const eloLossRaw = Math.max(0, safeStoredElo - effectiveEloRaw);

    return {
        storedEloRaw: safeStoredElo,
        storedElo: Math.round(safeStoredElo),
        effectiveEloRaw,
        effectiveElo: Math.round(effectiveEloRaw),
        eloLossRaw,
        eloLoss: Math.round(eloLossRaw),
        decayFactor: Number(decayFactor.toFixed(4)),
    };
}

function getRecoveryProblemsTarget(eloLossRaw) {
    if (!Number.isFinite(eloLossRaw) || eloLossRaw <= 0) return 1;

    // Approximate recovery guidance based on typical Elo gain per correct answer.
    return clamp(Math.ceil(eloLossRaw / 70), 1, 8);
}

function getDecayStatus(inactivityDays, eloLossRaw) {
    const safeDays = Math.max(0, inactivityDays || 0);
    const safeLoss = Math.max(0, eloLossRaw || 0);

    if (safeLoss < MIN_VISIBLE_ELO_LOSS) return 'healthy';
    if (safeDays >= DECAY_CRITICAL_DAYS) return 'critical';
    if (safeDays >= DECAY_WARNING_DAYS) return 'warning';
    return 'healthy';
}

function getDomainDecaySnapshot({
    domainName,
    domainRatings,
    domainLastAttemptedAt,
    fallbackLastAttemptedAt,
    now = new Date(),
}) {
    const normalized = normalizeDomainKey(domainName);
    const domainKey = normalized || 'general';

    const domainRatingsMap = toMap(domainRatings);
    const domainLastAttemptedAtMap = toMap(domainLastAttemptedAt);

    const storedElo = Number(domainRatingsMap.get(domainKey));
    const lastAttemptedAt = parseDate(domainLastAttemptedAtMap.get(domainKey)) || parseDate(fallbackLastAttemptedAt);

    const inactivityDays = getInactivityDays(lastAttemptedAt, now);
    const decay = computeEffectiveElo(storedElo, inactivityDays);
    const status = getDecayStatus(inactivityDays, decay.eloLossRaw);
    const recoveryProblemsTarget = getRecoveryProblemsTarget(decay.eloLossRaw);

    const resolvedDomainName =
        typeof domainName === 'string' && domainName.trim()
            ? domainName.trim()
            : prettifyDomainName(domainKey);

    let message = '';
    if (status !== 'healthy') {
        message = `Your ${resolvedDomainName} mastery is decaying. Solve ${recoveryProblemsTarget} problems today to recover toward Elo ${decay.storedElo}.`;
    }

    return {
        domainKey,
        domainName: resolvedDomainName,
        storedElo: decay.storedElo,
        storedEloRaw: decay.storedEloRaw,
        effectiveElo: decay.effectiveElo,
        effectiveEloRaw: decay.effectiveEloRaw,
        eloLoss: decay.eloLoss,
        eloLossRaw: decay.eloLossRaw,
        inactivityDays,
        decayFactor: decay.decayFactor,
        lastAttemptedAt: lastAttemptedAt ? lastAttemptedAt.toISOString() : null,
        status,
        recoveryProblemsTarget,
        message,
    };
}

function getDecayConfig() {
    return {
        baseElo: BASE_ELO,
        retentionRate: DECAY_RETENTION_RATE,
        retentionDays: DECAY_RETENTION_DAYS,
        lambda: Number(DECAY_LAMBDA.toFixed(6)),
        warningDays: DECAY_WARNING_DAYS,
        criticalDays: DECAY_CRITICAL_DAYS,
        minVisibleLoss: MIN_VISIBLE_ELO_LOSS,
    };
}

module.exports = {
    BASE_ELO,
    DECAY_LAMBDA,
    toMap,
    normalizeDomainKey,
    prettifyDomainName,
    getInactivityDays,
    computeEffectiveElo,
    getDomainDecaySnapshot,
    getDecayConfig,
};
