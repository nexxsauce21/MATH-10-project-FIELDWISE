/* =========================================================
   AI ACADEMY
   MAIN JAVASCRIPT
   ========================================================= */


/* =========================================================
   PLAYER DATA
   ========================================================= */

let playerXP = 0;
let playerScore = 0;
let playerLevel = 1;


/* =========================================================
   PATTERN HUNTER DATA
   ========================================================= */

const TOTAL_ROUNDS = 5;

let currentRound = 1;
let currentAnomaly = 0;

let correctAnswers = 0;
let roundScore = 0;

const fieldScenarios = [
    {
        title: "RICE FIELD // SOIL MOISTURE",
        subtitle: "Most readings are between 60% and 70%.",
        observations: () => `${60 + Math.floor(Math.random() * 11)}%`,
        anomaly: () => `${88 + Math.floor(Math.random() * 8)}%`
    },
    {
        title: "RICE FIELD // TEMPERATURE",
        subtitle: "A healthy field stays close to 29°C–34°C.",
        observations: () => `${29 + Math.floor(Math.random() * 6)}°C`,
        anomaly: () => `${42 + Math.floor(Math.random() * 5)}°C`
    },
    {
        title: "CROP SENSOR // MULTIPLE MEASUREMENTS",
        subtitle: "Compare the complete sensor profile for each crop.",
        observations: () => `Soil ${62 + Math.floor(Math.random() * 7)}%<br>Temp ${29 + Math.floor(Math.random() * 5)}°C<br>Humidity ${74 + Math.floor(Math.random() * 9)}%`,
        anomaly: () => `Soil 64%<br>Temp 31°C<br>Humidity 98%`
    },
    {
        title: "CASSAVA PLOT // VISUAL HEALTH",
        subtitle: "Healthy plants show a consistent visual signal.",
        observations: () => "🌾 HEALTHY",
        anomaly: () => "🌿 YELLOWING"
    },
    {
        title: "SMART FARM // CROSS-CHECK",
        subtitle: "The final anomaly is subtle. Inspect every value.",
        observations: () => `Soil ${61 + Math.floor(Math.random() * 9)}%<br>Temp ${30 + Math.floor(Math.random() * 4)}°C<br>Humidity ${75 + Math.floor(Math.random() * 8)}%`,
        anomaly: () => "Soil 58%<br>Temp 32°C<br>Humidity 79%"
    }
];


/* =========================================================
   SCREEN SYSTEM
   ========================================================= */

function showScreen(screenId) {

    const screens = document.querySelectorAll(".screen");

    screens.forEach(screen => {
        screen.classList.remove("active");
    });

    const target = document.getElementById(screenId);

    if (target) {
        target.classList.add("active");
    }
}


/* =========================================================
   MAIN MENU
   ========================================================= */

function showMainMenu() {

    updatePlayerDisplay();
    showScreen("main-menu");
}


/* =========================================================
   LEVEL SELECT
   ========================================================= */

function showLevels() {

    updatePlayerDisplay();
    showScreen("level-select");
}


/* =========================================================
   ACHIEVEMENTS
   ========================================================= */

function showAchievements() {

    showScreen("achievements");
}


/* =========================================================
   PLAYER DISPLAY
   ========================================================= */

function updatePlayerDisplay() {

    const levelEl = document.getElementById("player-level");
    const xpEl = document.getElementById("player-xp");
    const scoreEl = document.getElementById("player-score");

    if (levelEl) levelEl.textContent = playerLevel;
    if (xpEl) xpEl.textContent = playerXP;
    if (scoreEl) scoreEl.textContent = playerScore;

    const XP_PER_LEVEL = 500;
    const currentLevelXP = playerXP % XP_PER_LEVEL;
    const percentage = (currentLevelXP / XP_PER_LEVEL) * 100;

    const xpProgressText = document.getElementById("xp-progress-text");
    const xpBarFill = document.getElementById("xp-bar-fill");

    if (xpProgressText) {
        xpProgressText.textContent = `${currentLevelXP} / ${XP_PER_LEVEL} XP`;
    }

    if (xpBarFill) {
        xpBarFill.style.width = `${percentage}%`;
    }
}


/* =========================================================
   XP SYSTEM
   ========================================================= */

function addXP(amount) {

    playerXP += amount;

    const XP_PER_LEVEL = 500;
    const newLevel = Math.floor(playerXP / XP_PER_LEVEL) + 1;

    if (newLevel > playerLevel) {
        playerLevel = newLevel;
        console.log("LEVEL UP!");
    }

    updatePlayerDisplay();
}


/* =========================================================
   PATTERN HUNTER
   ========================================================= */

function startPatternHunter() {

    currentRound = 1;
    correctAnswers = 0;
    roundScore = 0;

    showScreen("pattern-hunter");
    startPatternRound();
}


/* =========================================================
   START ROUND
   ========================================================= */

function startPatternRound() {

    const grid = document.getElementById("pattern-grid");
    const message = document.getElementById("game-message");
    const nextButton = document.getElementById("next-pattern-button");

    if (!grid || !message || !nextButton) return;

    const scenario = fieldScenarios[currentRound - 1];
    const scenarioLabel = document.getElementById("field-scenario");
    const conceptPanel = document.getElementById("field-concept");

    scenarioLabel.innerHTML = `<strong>${scenario.title}</strong><span>${scenario.subtitle}</span>`;
    conceptPanel.classList.add("hidden");

    grid.innerHTML = "";
    message.textContent = "FIND THE OBSERVATION THAT DOES NOT FIT";
    message.className = "game-message";
    nextButton.classList.add("hidden");
    nextButton.textContent = "NEXT ROUND →";

    document.getElementById("round-number").textContent = `${currentRound} / ${TOTAL_ROUNDS}`;

    const progress = (currentRound / TOTAL_ROUNDS) * 100;
    document.getElementById("round-progress-text").textContent = `${progress}%`;
    document.getElementById("round-bar-fill").style.width = `${progress}%`;
    document.getElementById("game-score").textContent = roundScore;

    currentAnomaly = Math.floor(Math.random() * 25);

    for (let i = 0; i < 25; i++) {
        const tile = document.createElement("button");
        tile.classList.add("pattern-tile");
        tile.classList.add(i === currentAnomaly ? "crop-anomaly" : "crop-healthy");
        tile.dataset.index = i;
        tile.style.animationDelay = `${(i % 5) * 35}ms`;

        const cropIcon = i === currentAnomaly
            ? (currentRound === 4 ? "🍂" : "🌿")
            : (currentRound === 4 ? "🌾" : "🌱");
        const cropState = "FIELD SAMPLE";
        tile.innerHTML = `<span class="crop-icon">${cropIcon}</span><span class="crop-state">${cropState}</span><span class="observation-value">${i === currentAnomaly ? scenario.anomaly() : scenario.observations()}</span><span class="observation-id">CROP ${String(i + 1).padStart(2, "0")}</span>`;

        tile.addEventListener("click", () => checkPattern(i, tile));
        grid.appendChild(tile);
    }
}


/* =========================================================
   CHECK ANSWER
   ========================================================= */

function checkPattern(index, tile) {

    const message = document.getElementById("game-message");
    const nextButton = document.getElementById("next-pattern-button");

    if (!message || !nextButton) return;

    const allTiles = document.querySelectorAll(".pattern-tile");

    allTiles.forEach(t => {
        t.disabled = true;
    });

    if (index === currentAnomaly) {
        tile.classList.add("correct");
        correctAnswers++;
        roundScore += 100;
        playerScore += 100;
        addXP(100);

        message.textContent = "✓ ABNORMAL CROP DETECTED";
        message.className = "game-message success";
        document.getElementById("field-concept").classList.remove("hidden");

        document.getElementById("game-score").textContent = roundScore;

        nextButton.classList.remove("hidden");

        if (currentRound === TOTAL_ROUNDS) {
            nextButton.textContent = "VIEW RESULTS →";
        }

        return;
    }

    tile.classList.add("wrong");
    message.textContent = "✕ NOT THIS ONE. THE MACHINE FOUND THE ABNORMAL CROP.";
    message.className = "game-message error";

    allTiles[currentAnomaly].classList.add("correct");
    document.getElementById("field-concept").classList.remove("hidden");

    document.getElementById("game-score").textContent = roundScore;
    nextButton.classList.remove("hidden");

    if (currentRound === TOTAL_ROUNDS) {
        nextButton.textContent = "VIEW RESULTS →";
    }
}


/* =========================================================
   NEXT ROUND
   ========================================================= */

function nextPattern() {

    if (currentRound >= TOTAL_ROUNDS) {
        completePatternHunter();
        return;
    }

    currentRound++;
    startPatternRound();
}


/* =========================================================
   COMPLETE PATTERN HUNTER
   ========================================================= */

function completePatternHunter() {

    const accuracy = Math.round((correctAnswers / TOTAL_ROUNDS) * 100);

    let bonusXP = 0;

    if (accuracy === 100) {
        bonusXP = 250;
    } else if (accuracy >= 80) {
        bonusXP = 150;
    } else if (accuracy >= 60) {
        bonusXP = 75;
    }

    addXP(bonusXP);

    let stars = "★";

    if (accuracy >= 80) {
        stars = "★ ★";
    }

    if (accuracy === 100) {
        stars = "★ ★ ★";
    }

    document.getElementById("completion-stars").textContent = stars;
    document.getElementById("completion-accuracy").textContent = `${accuracy}%`;
    document.getElementById("completion-score").textContent = roundScore;
    document.getElementById("completion-xp").textContent = `+${bonusXP} XP`;

    let completionMessage = "Training data successfully processed.";

    if (accuracy === 100) {
        completionMessage = "Perfect detection. The machine has learned from you.";
    } else if (accuracy >= 80) {
        completionMessage = "Strong performance. Your pattern recognition is improving.";
    } else {
        completionMessage = "Training complete. Every mistake is another data point.";
    }

    document.getElementById("completion-message").textContent = completionMessage;
    showScreen("level-complete");
}


/* =========================================================
   DATA BUILDER LEVEL
   ========================================================= */

const DATA_BUILDER_TOTAL_SAMPLES = 8;
const dataBuilderSamples = [
    { id: "01", crop: "RICE", soilMoisture: "65%", temperature: "31°C", humidity: "79%", leafSpots: "NONE", growthRate: "2.4 cm/day", label: "HEALTHY", issue: null, correctAction: "keep", reason: "All readings are complete, inside the healthy ranges, and the label matches." },
    { id: "04", crop: "RICE", soilMoisture: "63%", temperature: "30°C", humidity: "81%", leafSpots: "YES", growthRate: "2.1 cm/day", label: "HEALTHY", actualLabel: "DISEASED", issue: "WRONG LABEL", correctAction: "relabel", reason: "The readings are useful, but leaf spots indicate disease. Fix the label instead of discarding the observation." },
    { id: "06", crop: "RICE", soilMoisture: "???", temperature: "31°C", humidity: "???", leafSpots: "???", growthRate: "???", label: "HEALTHY", issue: "MISSING VALUES", correctAction: "remove", reason: "Too many missing measurements make this observation unreliable for training." },
    { id: "09", crop: "CORN", soilMoisture: "64%", temperature: "31°C", humidity: "78%", leafSpots: "NONE", growthRate: "240 cm/day", label: "HEALTHY", issue: "OUTLIER READING", correctAction: "remove", reason: "The 240 cm/day growth reading is an impossible outlier, so this sample could teach the model noise." },
    { id: "11", crop: "RICE", soilMoisture: "65%", temperature: "31°C", humidity: "79%", leafSpots: "NONE", growthRate: "2.4 cm/day", label: "HEALTHY", issue: "DUPLICATE OBSERVATION", correctAction: "remove", reason: "This repeats Observation #01. Keeping duplicates would make one example count more than it should." },
    { id: "14", crop: "RICE", soilMoisture: "66%", temperature: "30°C", humidity: "80%", leafSpots: "NONE", growthRate: "2.3 cm/day", label: "HEALTHY", issue: "CLASS BALANCE CHECK", correctAction: "keep", reason: "This is a complete, valid healthy crop observation and adds useful variety to the dataset." },
    { id: "17", crop: "RICE", soilMoisture: "67%", temperature: "30°C", humidity: "81%", leafSpots: "YES", growthRate: "2.0 cm/day", label: "HEALTHY", actualLabel: "DISEASED", issue: "WRONG LABEL", correctAction: "relabel", reason: "The measurements are useful and leaf spots signal disease. Relabel this sample as DISEASED." },
    { id: "21", crop: "RICE", soilMoisture: "???", temperature: "45°C", humidity: "96%", leafSpots: "YES", growthRate: "2.0 cm/day", label: "HEALTHY", issue: "MIXED QUALITY SIGNALS", correctAction: "remove", reason: "Missing soil data and several extreme signals make the observation too unreliable to keep." }
];

let dataBuilderRound = 1;
let dataBuilderScore = 0;
let dataBuilderLocked = false;
let dataBuilderState = null;

function resetDataBuilderState() {
    dataBuilderState = {
        processed: 0,
        kept: 0,
        removed: 0,
        relabeled: 0,
        good: 0,
        defective: 0,
        labelErrors: 0,
        correctDecisions: 0,
        health: 0
    };
}

function startDataBuilder() {
    dataBuilderRound = 1;
    dataBuilderScore = 0;
    dataBuilderLocked = false;
    resetDataBuilderState();
    showScreen("data-builder");
    startDataBuilderSample();
}

function startDataBuilderSample() {
    const sample = dataBuilderSamples[dataBuilderRound - 1];
    const sampleEl = document.getElementById("data-builder-sample");
    const feedback = document.getElementById("data-builder-feedback");
    const nextButton = document.getElementById("next-data-builder-button");
    const buttons = document.querySelectorAll(".data-action-choice");

    dataBuilderLocked = false;
    sampleEl.innerHTML = `
        <div class="sample-header"><strong>CROP OBSERVATION #${sample.id}</strong><span>INSPECT SAMPLE ${dataBuilderRound}/${DATA_BUILDER_TOTAL_SAMPLES}</span></div>
        <div class="crop-identity"><span class="crop-card-icon">🌱</span><strong>${sample.crop} PLANT</strong></div>
        <div class="crop-readings">
            <span>SOIL MOISTURE <b>${sample.soilMoisture}</b></span>
            <span>TEMPERATURE <b>${sample.temperature}</b></span>
            <span>HUMIDITY <b>${sample.humidity}</b></span>
            <span>LEAF SPOTS <b>${sample.leafSpots}</b></span>
            <span>GROWTH RATE <b>${sample.growthRate}</b></span>
        </div>
        <div class="crop-reference">
            <div><strong>HEALTHY CROP REFERENCE</strong><span>Soil 60–70% · Temp 29–34°C · Humidity 70–85% · Leaf spots NONE · Growth 1.8–3.0 cm/day</span></div>
            <div><strong>COUNTERCHECK</strong><span>Complete but unhealthy → RELABEL · Missing, duplicate, or unreliable → REMOVE</span></div>
        </div>
        <div class="sample-label"><span>AI LABEL</span><strong>${sample.label}</strong></div>
        ${sample.issue ? `<div class="sample-flag">FLAG: ${sample.issue}</div>` : ""}
    `;
    feedback.textContent = "CHOOSE WHAT TO DO WITH THIS EXAMPLE";
    feedback.className = "game-message";
    nextButton.classList.add("hidden");
    buttons.forEach(button => {
        button.disabled = false;
        button.classList.remove("selected");
    });

    document.getElementById("data-builder-round").textContent = `${dataBuilderRound} / ${DATA_BUILDER_TOTAL_SAMPLES}`;
    document.getElementById("data-builder-score").textContent = dataBuilderScore;
    updateDataBuilderDashboard();
}

function calculateDataBuilderHealth() {
    const state = dataBuilderState;
    const decisionAccuracy = state.processed ? state.correctDecisions / state.processed : 0;
    const keptEnough = Math.min(1, state.kept / 6);
    const classBalance = state.good && state.defective ? 1 : state.processed ? 0.65 : 0;
    return Math.round((decisionAccuracy * 45 + keptEnough * 35 + classBalance * 20));
}

function updateDataBuilderDashboard() {
    dataBuilderState.health = calculateDataBuilderHealth();
    document.getElementById("data-builder-health").textContent = `${dataBuilderState.health}%`;
    document.getElementById("data-builder-progress-text").textContent = `${dataBuilderState.health}%`;
    document.getElementById("data-builder-progress-fill").style.width = `${dataBuilderState.health}%`;
    document.getElementById("data-builder-processed").textContent = `${dataBuilderState.processed} / ${DATA_BUILDER_TOTAL_SAMPLES}`;
    document.getElementById("data-builder-good").textContent = dataBuilderState.good;
    document.getElementById("data-builder-defective").textContent = dataBuilderState.defective;
    document.getElementById("data-builder-relabeled").textContent = dataBuilderState.relabeled;
    document.getElementById("data-builder-removed").textContent = dataBuilderState.removed;
    document.getElementById("data-builder-health-message").textContent = dataBuilderState.labelErrors
        ? "POSSIBLE LABEL ERRORS DETECTED"
        : dataBuilderState.processed >= DATA_BUILDER_TOTAL_SAMPLES
            ? dataBuilderState.health >= 80 ? "TRAINING READY" : "REVIEW DATA QUALITY"
            : "INSPECT EACH SAMPLE BEFORE TRAINING";
}

function processDataSample(action) {
    if (dataBuilderLocked) return;

    dataBuilderLocked = true;
    const sample = dataBuilderSamples[dataBuilderRound - 1];
    const correct = action === sample.correctAction;
    const feedback = document.getElementById("data-builder-feedback");
    const nextButton = document.getElementById("next-data-builder-button");
    const actionLabels = { keep: "KEEP", remove: "REMOVE", relabel: "RELABEL" };
    const buttons = document.querySelectorAll(".data-action-choice");

    buttons.forEach(button => {
        button.disabled = true;
        button.classList.toggle("selected", button.textContent.trim() === actionLabels[action]);
    });
    const sampleEl = document.getElementById("data-builder-sample");
    sampleEl.classList.remove("data-action-keep", "data-action-remove", "data-action-relabel");
    void sampleEl.offsetWidth;
    sampleEl.classList.add(`data-action-${action}`);

    dataBuilderState.processed++;
    if (correct) {
        dataBuilderState.correctDecisions++;
        dataBuilderScore += 100;
        playerScore += 100;
        addXP(50);
    } else {
        dataBuilderScore += 25;
        playerScore += 25;
        addXP(15);
    }

    if (action === "remove") {
        dataBuilderState.removed++;
    } else {
        dataBuilderState.kept++;
        if (action === "relabel" && sample.actualLabel) dataBuilderState.relabeled++;
        const finalLabel = action === "relabel" && sample.actualLabel ? sample.actualLabel : sample.label;
        if (finalLabel === "HEALTHY") dataBuilderState.good++;
        if (finalLabel === "DISEASED") dataBuilderState.defective++;
        if (!correct) dataBuilderState.labelErrors++;
    }

    updateDataBuilderDashboard();
    feedback.textContent = correct
        ? `✓ CORRECT: ${sample.reason}`
        : `✕ NOT QUITE: ${sample.reason} RECOMMENDED ACTION: ${actionLabels[sample.correctAction]}.`;
    feedback.className = correct ? "game-message success data-decision-feedback" : "game-message error data-decision-feedback";
    nextButton.textContent = dataBuilderRound >= DATA_BUILDER_TOTAL_SAMPLES ? "CHECK DATASET →" : "NEXT SAMPLE →";
    nextButton.classList.remove("hidden");
}

function nextDataSample() {
    if (dataBuilderRound >= DATA_BUILDER_TOTAL_SAMPLES) {
        completeDataBuilder();
        return;
    }

    dataBuilderRound++;
    startDataBuilderSample();
}

function completeDataBuilder() {
    updateDataBuilderDashboard();
    const health = dataBuilderState.health;
    const bonusXP = health >= 90 ? 250 : health >= 80 ? 150 : health >= 60 ? 75 : 0;
    addXP(bonusXP);

    document.getElementById("data-builder-completion-stars").textContent = health >= 90 ? "★ ★ ★" : health >= 80 ? "★ ★" : "★";
    document.getElementById("data-builder-completion-kept").textContent = dataBuilderState.kept;
    document.getElementById("data-builder-completion-relabeled").textContent = dataBuilderState.relabeled;
    document.getElementById("data-builder-completion-errors").textContent = dataBuilderState.labelErrors;
    document.getElementById("data-builder-completion-health").textContent = `${health}%`;
    document.getElementById("data-builder-completion-score").textContent = dataBuilderScore;
    document.getElementById("data-builder-completion-xp").textContent = `+${bonusXP} XP`;
    document.getElementById("data-builder-completion-message").textContent = health >= 80
        ? "Dataset locked in. The examples you kept are ready to teach the classifier."
        : "Dataset review complete. The model can learn, but noisy examples may weaken its predictions.";
    document.getElementById("train-data-model-button").disabled = false;
    document.getElementById("data-builder-training-panel").classList.add("hidden");
    showScreen("data-builder-complete");
}

function trainDataModel() {
    const panel = document.getElementById("data-builder-training-panel");
    const button = document.getElementById("train-data-model-button");
    const status = document.getElementById("data-builder-training-status");
    const fill = document.getElementById("data-builder-training-fill");
    const detail = document.getElementById("data-builder-training-detail");

    button.disabled = true;
    panel.classList.remove("hidden");
    status.textContent = "TRAINING MODEL...";
    detail.textContent = "Finding patterns in your examples...";
    fill.style.width = "0%";

    requestAnimationFrame(() => {
        fill.style.width = "100%";
    });

    setTimeout(() => {
        status.textContent = "MODEL TRAINED ✓";
        detail.textContent = "Your classifier learned from the dataset you built.";
        setTimeout(() => startClassifier(), 1100);
    }, 1800);
}


/* =========================================================
   CLASSIFIER LEVEL
   ========================================================= */

const CLASSIFIER_ROUNDS = 5;
let classifierRound = 1;
let classifierScore = 0;
let classifierCorrectAnswers = 0;
let classifierState = null;
let classifierRoundCases = [];

const cropClassifierCases = [
    { profile: "disease", prediction: "DISEASED", healthy: 18, diseased: 82, actual: "DISEASED", reason: "Leaf spots are a strong disease signal." },
    { profile: "healthy", prediction: "HEALTHY", healthy: 94, diseased: 6, actual: "HEALTHY", reason: "The readings are in the healthy range and there are no leaf spots." },
    { profile: "stress", prediction: "DISEASED", healthy: 9, diseased: 91, actual: "DISEASED", reason: "Dry soil, high temperature, and leaf spots point to crop stress." },
    { profile: "warmHealthy", prediction: "DISEASED", healthy: 43, diseased: 57, actual: "HEALTHY", reason: "The features remain inside the healthy pattern. FIELDWISE over-weighted the warm temperature." },
    { profile: "subtleDisease", prediction: "HEALTHY", healthy: 58, diseased: 42, actual: "DISEASED", reason: "Leaf spots are the stronger signal. FIELDWISE missed this diseased crop." }
];

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildClassifierRoundCases() {
    return [...cropClassifierCases]
        .sort(() => Math.random() - 0.5)
        .map(template => {
            const profiles = {
                disease: [randomInteger(64, 72), randomInteger(29, 33), "YES"],
                healthy: [randomInteger(63, 69), randomInteger(29, 32), "NO"],
                stress: [randomInteger(35, 46), randomInteger(34, 37), "YES"],
                warmHealthy: [randomInteger(61, 66), randomInteger(32, 34), "NO"],
                subtleDisease: [randomInteger(54, 60), randomInteger(32, 35), "YES"]
            };
            const [moisture, temperature, leafSpots] = profiles[template.profile];
            return {
                ...template,
                id: String(randomInteger(10, 99)),
                moisture: `${moisture}%`,
                temperature: `${temperature}°C`,
                leafSpots,
                healthy: Math.max(1, Math.min(99, template.healthy + randomInteger(-5, 5))),
                diseased: 0
            };
        })
        .map(sample => ({ ...sample, diseased: 100 - sample.healthy }));
}

function startClassifier() {
    classifierRound = 1;
    classifierScore = 0;
    classifierCorrectAnswers = 0;
    classifierRoundCases = buildClassifierRoundCases();
    showScreen("classifier");
    startClassifierRound();
}

function startClassifierRound() {
    const observation = document.getElementById("classifier-observation");
    const feedback = document.getElementById("classifier-feedback");
    const nearestPanel = document.getElementById("classifier-nearest");
    const nextButton = document.getElementById("next-classifier-button");
    const buttons = document.querySelectorAll(".classifier-choice");
    const currentCase = classifierRoundCases[classifierRound - 1];

    if (!observation || !feedback || !nearestPanel || !nextButton) return;

    classifierState = currentCase;
    observation.innerHTML = `
        <div class="observation-title"><span>🌱 RICE SAMPLE #${currentCase.id}</span><strong>CROP OBSERVATION</strong></div>
        <div class="diagnosis-readings">
            <span>SOIL MOISTURE <b>${currentCase.moisture}</b></span>
            <span>TEMPERATURE <b>${currentCase.temperature}</b></span>
            <span>LEAF SPOTS <b>${currentCase.leafSpots}</b></span>
        </div>
    `;
    document.getElementById("classifier-sample-name").textContent = `RICE SAMPLE #${currentCase.id}`;
    document.getElementById("classifier-healthy-bar").style.width = `${currentCase.healthy}%`;
    document.getElementById("classifier-diseased-bar").style.width = `${currentCase.diseased}%`;
    document.getElementById("classifier-healthy-value").textContent = `${currentCase.healthy}%`;
    document.getElementById("classifier-diseased-value").textContent = `${currentCase.diseased}%`;
    document.getElementById("classifier-prediction").textContent = currentCase.prediction;
    document.getElementById("classifier-confidence").textContent = `${Math.max(currentCase.healthy, currentCase.diseased)}%`;

    nearestPanel.classList.add("hidden");
    nearestPanel.innerHTML = "";
    nextButton.classList.add("hidden");
    feedback.textContent = "CHOOSE HEALTHY OR DISEASED";
    feedback.className = "game-message";
    buttons.forEach(button => {
        button.disabled = false;
        button.classList.remove("selected");
    });

    document.getElementById("classifier-round-number").textContent = `${classifierRound} / ${CLASSIFIER_ROUNDS}`;
    const progress = (classifierRound / CLASSIFIER_ROUNDS) * 100;
    document.getElementById("classifier-progress-text").textContent = `${Math.round(progress)}%`;
    document.getElementById("classifier-progress-fill").style.width = `${progress}%`;
    document.getElementById("classifier-score").textContent = classifierScore;
}

function submitClassifier(classification) {
    const feedback = document.getElementById("classifier-feedback");
    const nearestPanel = document.getElementById("classifier-nearest");
    const nextButton = document.getElementById("next-classifier-button");
    const buttons = document.querySelectorAll(".classifier-choice");
    const currentCase = classifierState;

    if (!currentCase || !feedback || !nearestPanel || !nextButton) return;

    buttons.forEach(button => {
        button.disabled = true;
        button.classList.toggle("selected", button.dataset.classification === classification);
    });

    const correct = classification === currentCase.actual;
    const modelCorrect = currentCase.prediction === currentCase.actual;
    if (correct) {
        classifierCorrectAnswers++;
        classifierScore += 100;
        playerScore += 100;
        addXP(100);
        feedback.textContent = `✓ CORRECT: ${currentCase.reason} ${modelCorrect ? "FIELDWISE also matched." : "You caught a FIELDWISE mistake."}`;
        feedback.className = "game-message success classifier-feedback";
    } else {
        classifierScore += 25;
        playerScore += 25;
        feedback.textContent = `✕ WRONG: This sample is ${currentCase.actual}. ${currentCase.reason} ${modelCorrect ? "FIELDWISE had the right classification." : "The AI prediction was also wrong."}`;
        feedback.className = "game-message error classifier-feedback";
    }

    document.getElementById("classifier-score").textContent = classifierScore;
    nearestPanel.innerHTML = `<div class="nearest-title">CLASSIFICATION CHECK:</div><div class="nearest-row"><span>AI PREDICTION:</span><strong>${currentCase.prediction}</strong></div><div class="nearest-row prediction-row"><span>YOUR CLASSIFICATION:</span><strong>${classification}</strong></div>`;
    nearestPanel.classList.remove("hidden");
    nextButton.textContent = classifierRound >= CLASSIFIER_ROUNDS ? "VIEW RESULTS →" : "NEXT SAMPLE →";
    nextButton.classList.remove("hidden");
}

function nextClassifierRound() {
    if (classifierRound >= CLASSIFIER_ROUNDS) {
        completeClassifier();
        return;
    }

    classifierRound++;
    startClassifierRound();
}

function completeClassifier() {
    const accuracy = Math.round((classifierCorrectAnswers / CLASSIFIER_ROUNDS) * 100);
    const bonusXP = accuracy === 100 ? 250 : accuracy >= 80 ? 150 : accuracy >= 60 ? 75 : 0;

    addXP(bonusXP);

    let stars = "★";
    if (accuracy >= 80) stars = "★ ★";
    if (accuracy === 100) stars = "★ ★ ★";

    document.getElementById("classifier-completion-stars").textContent = stars;
    document.getElementById("classifier-completion-accuracy").textContent = `${accuracy}%`;
    document.getElementById("classifier-completion-score").textContent = classifierScore;
    document.getElementById("classifier-completion-xp").textContent = `+${bonusXP} XP`;

    let completionMessage = "Classification model training complete.";
    if (accuracy === 100) {
        completionMessage = "Classification complete. You placed every crop into the correct category.";
    } else if (accuracy >= 80) {
        completionMessage = "Strong classification. The crop features are becoming meaningful patterns.";
    } else {
        completionMessage = "Training complete. Classification means putting observations into categories based on features.";
    }

    document.getElementById("classifier-completion-message").textContent = completionMessage;
    showScreen("classifier-complete");
}


/* =========================================================
   MODEL BREAKER LEVEL
   ========================================================= */

const MODEL_BREAKER_TOTAL_CASES = 5;
const modelBreakerCases = [
    {
        title: "FARM A / FARM B",
        modelA: { training: 95, testing: 55 },
        modelB: { training: 89, testing: 87 },
        answer: "modelB",
        explanation: "Model B has a small accuracy gap, so it learned a pattern that works on new crops."
    },
    {
        title: "RICE SECTOR 02 / RICE SECTOR 05",
        modelA: { training: 91, testing: 88 },
        modelB: { training: 99, testing: 63 },
        answer: "modelA",
        explanation: "Model A keeps its performance on new field data. Model B may have memorized its training examples."
    },
    {
        title: "FIELD NORTH / FIELD SOUTH",
        modelA: { training: 84, testing: 81 },
        modelB: { training: 96, testing: 74 },
        answer: "modelA",
        explanation: "Model A has the smaller gap. It learned a useful pattern instead of relying on memorized details."
    },
    {
        title: "TRIAL PLOT / NEW PLOT",
        modelA: { training: 93, testing: 76 },
        modelB: { training: 86, testing: 84 },
        answer: "modelB",
        explanation: "Model B gives up a little training accuracy but performs much better on new crops."
    },
    {
        title: "HARVEST BLOCK A / HARVEST BLOCK B",
        modelA: { training: 90, testing: 82 },
        modelB: { training: 97, testing: 79 },
        answer: "modelA",
        explanation: "Model A has the smaller performance drop. A model should work beyond the examples it already saw."
    }
];

let modelBreakerRoundCases = [];

let modelBreakerRound = 1;
let modelBreakerScore = 0;
let modelBreakerCorrect = 0;
let modelBreakerLocked = false;

function startModelBreaker() {
    modelBreakerRound = 1;
    modelBreakerScore = 0;
    modelBreakerCorrect = 0;
    modelBreakerRoundCases = [...modelBreakerCases].sort(() => Math.random() - 0.5);
    startModelBreakerCase();
    showScreen("model-breaker");
}

function startModelBreakerCase() {
    const currentCase = modelBreakerRoundCases[modelBreakerRound - 1];
    const caseEl = document.getElementById("model-breaker-case");
    const choicesEl = document.getElementById("model-breaker-choices");
    const feedback = document.getElementById("model-breaker-feedback");
    const nextButton = document.getElementById("next-model-breaker-button");

    modelBreakerLocked = false;
    caseEl.innerHTML = `
        <strong>${currentCase.title}</strong>
        <div class="model-comparison-grid">
            ${buildModelComparison("A", currentCase.modelA)}
            ${buildModelComparison("B", currentCase.modelB)}
        </div>
    `;
    choicesEl.innerHTML = `
        <button class="main-button diagnosis-choice" data-model="modelA" onclick="diagnoseModel('modelA')">MODEL A</button>
        <button class="secondary-button diagnosis-choice" data-model="modelB" onclick="diagnoseModel('modelB')">MODEL B</button>
    `;
    feedback.textContent = "COMPARE THE TWO MODELS";
    feedback.className = "game-message";
    nextButton.classList.add("hidden");

    document.getElementById("model-breaker-round").textContent = `${modelBreakerRound} / ${MODEL_BREAKER_TOTAL_CASES}`;
    const progress = (modelBreakerRound / MODEL_BREAKER_TOTAL_CASES) * 100;
    document.getElementById("model-breaker-progress-text").textContent = `${Math.round(progress)}%`;
    document.getElementById("model-breaker-progress-fill").style.width = `${progress}%`;
    document.getElementById("model-breaker-score").textContent = modelBreakerScore;
}

function buildModelComparison(label, model) {
    const gap = model.training - model.testing;
    return `
        <div class="model-comparison-column">
            <strong>🌾 MODEL ${label}</strong>
            <span>TRAINING FIELD <b>${model.training}%</b></span>
            <div class="model-meter"><i style="width: ${model.training}%"></i></div>
            <span>NEW FIELD DATA <b>${model.testing}%</b></span>
            <div class="model-meter new-field-meter"><i style="width: ${model.testing}%"></i></div>
            <small>PERFORMANCE GAP: ${gap} POINTS</small>
        </div>
    `;
}

function diagnoseModel(diagnosis) {
    if (modelBreakerLocked) return;

    modelBreakerLocked = true;
    const currentCase = modelBreakerRoundCases[modelBreakerRound - 1];
    const correct = diagnosis === currentCase.answer;
    const feedback = document.getElementById("model-breaker-feedback");
    const nextButton = document.getElementById("next-model-breaker-button");

    document.querySelectorAll(".diagnosis-choice").forEach(button => {
        button.disabled = true;
        button.classList.toggle("selected", button.dataset.model === diagnosis);
    });

    if (correct) {
        modelBreakerCorrect++;
        modelBreakerScore += 100;
        playerScore += 100;
        addXP(100);
        feedback.textContent = `✓ ${diagnosis === "modelA" ? "MODEL A" : "MODEL B"} IS THE BETTER MODEL. ${currentCase.explanation}`;
        feedback.className = "game-message success model-breaker-feedback";
    } else {
        feedback.textContent = `✕ NOT QUITE. ${currentCase.explanation} A large training-to-new-field drop can mean overfitting.`;
        feedback.className = "game-message error model-breaker-feedback";
    }

    document.getElementById("model-breaker-score").textContent = modelBreakerScore;
    nextButton.textContent = modelBreakerRound >= MODEL_BREAKER_TOTAL_CASES ? "VIEW RESULTS →" : "NEXT CASE →";
    nextButton.classList.remove("hidden");
}

function nextModelBreakerCase() {
    if (modelBreakerRound >= MODEL_BREAKER_TOTAL_CASES) {
        completeModelBreaker();
        return;
    }

    modelBreakerRound++;
    startModelBreakerCase();
}

function completeModelBreaker() {
    const accuracy = Math.round((modelBreakerCorrect / MODEL_BREAKER_TOTAL_CASES) * 100);
    const bonusXP = accuracy === 100 ? 250 : accuracy >= 80 ? 150 : accuracy >= 60 ? 75 : 0;
    addXP(bonusXP);

    document.getElementById("model-breaker-completion-stars").textContent = accuracy === 100 ? "★ ★ ★" : accuracy >= 80 ? "★ ★" : "★";
    document.getElementById("model-breaker-completion-accuracy").textContent = `${modelBreakerCorrect} / ${MODEL_BREAKER_TOTAL_CASES}`;
    document.getElementById("model-breaker-completion-score").textContent = modelBreakerScore;
    document.getElementById("model-breaker-completion-xp").textContent = `+${bonusXP} XP`;
    document.getElementById("model-breaker-completion-message").textContent = accuracy === 100
        ? "Field test complete. A model that works on new crops learned a useful pattern."
        : "Remember: a model that only works on training data may have memorized instead of learned.";
    showScreen("model-breaker-complete");
}


/* =========================================================
   OPTIMIZER LEVEL
   ========================================================= */

const optimizerState = {
    round: 1,
    maxRounds: 3,
    speed: 50,
    quality: 50,
    score: 0,
    energy: 0,
    scoreTotal: 0,
    efficiencyTotal: 0,
    validRounds: 0,
    bestScore: 0,
    energyLimit: 100,
    targetScore: 240,
    currentConfig: null,
    autoTimer: null,
    targets: [
        {
            maxEnergy: 100,
            targetScore: 240,
            outputProduction: 3,
            outputInspection: 4,
            speedPower: 1.2,
            qualityPower: 1.2,
            qualityEnergyWeight: 0.8,
            targetDesc: "Standard shift: careful inspection is slightly more valuable than raw speed."
        },
        {
            maxEnergy: 80,
            targetScore: 210,
            outputProduction: 5,
            outputInspection: 2,
            speedPower: 1.3,
            qualityPower: 1.1,
            qualityEnergyWeight: 0.65,
            targetDesc: "Rush-order shift: production pays more, but fast machinery uses power quickly."
        },
        {
            maxEnergy: 120,
            targetScore: 285,
            outputProduction: 2,
            outputInspection: 5,
            speedPower: 1.1,
            qualityPower: 1.35,
            qualityEnergyWeight: 1.05,
            targetDesc: "Premium shift: quality earns the most, but strict inspection becomes expensive."
        }
    ]
};

function startOptimizer() {
    clearInterval(optimizerState.autoTimer);
    optimizerState.round = 1;
    optimizerState.scoreTotal = 0;
    optimizerState.efficiencyTotal = 0;
    optimizerState.validRounds = 0;
    optimizerState.bestScore = 0;
    showScreen("optimizer");
    loadOptimizerRound();
}

function loadOptimizerRound() {
    clearInterval(optimizerState.autoTimer);
    const config = optimizerState.targets[optimizerState.round - 1];
    optimizerState.currentConfig = config;
    optimizerState.energyLimit = config.maxEnergy;
    optimizerState.targetScore = config.targetScore;

    document.getElementById("opt-task-desc").textContent = config.targetDesc;
    document.getElementById("opt-energy-limit").textContent = config.maxEnergy;
    document.getElementById("opt-output-formula").textContent = `${config.outputProduction} * production + ${config.outputInspection} * inspection`;
    document.getElementById("opt-energy-formula").innerHTML = `production<sup>${config.speedPower}</sup> + ${config.qualityEnergyWeight} * inspection<sup>${config.qualityPower}</sup> &le; <span id="opt-energy-limit">${config.maxEnergy}</span>`;
    document.getElementById("slider-speed").value = 50;
    document.getElementById("slider-quality").value = 50;
    document.getElementById("btn-run-opt").disabled = false;
    document.getElementById("btn-auto-opt").disabled = false;
    document.getElementById("optimizer-comparison").classList.add("hidden");
    document.getElementById("optimizer-comparison").innerHTML = "";
    document.getElementById("optimizer-feedback").textContent = "FIND A VALID HIGH-SCORE CONFIGURATION";
    document.getElementById("optimizer-feedback").className = "game-message";

    document.getElementById("optimizer-round").textContent = `${optimizerState.round} / ${optimizerState.maxRounds}`;
    const progress = (optimizerState.round / optimizerState.maxRounds) * 100;
    document.getElementById("optimizer-progress-text").textContent = `${Math.round(progress)}%`;
    document.getElementById("optimizer-progress-fill").style.width = `${progress}%`;
    document.getElementById("optimizer-score").textContent = optimizerState.scoreTotal;
    updateOptimizerCalculations();
}

function calculateOptimizerValues(speed, quality) {
    const config = optimizerState.currentConfig;

    return {
        score: Math.floor(config.outputProduction * speed + config.outputInspection * quality),
        energy: Math.floor(Math.pow(speed, config.speedPower) + config.qualityEnergyWeight * Math.pow(quality, config.qualityPower))
    };
}

function findBestOptimizerPath() {
    let bestPath = { speed: 0, quality: 0, score: 0, energy: 0 };

    for (let speed = 0; speed <= 100; speed++) {
        for (let quality = 0; quality <= 100; quality++) {
            const values = calculateOptimizerValues(speed, quality);

            if (values.energy <= optimizerState.energyLimit && values.score > bestPath.score) {
                bestPath = { speed, quality, ...values };
            }
        }
    }

    return bestPath;
}

function showOptimizerComparison(bestPath) {
    const comparison = document.getElementById("optimizer-comparison");
    const playerPath = {
        speed: optimizerState.speed,
        quality: optimizerState.quality,
        score: optimizerState.score,
        energy: optimizerState.energy
    };
    const scoreGap = bestPath.score - playerPath.score;
    const pathMessage = scoreGap <= 0
        ? "Your settings reached the best valid output for this power limit."
        : `${scoreGap} output points separated your settings from the best valid path.`;

    comparison.innerHTML = `
        <div class="comparison-title">BEST VALID PATH FOUND</div>
        <div class="comparison-grid">
            <div class="comparison-column player-path">
                <strong>YOUR FACTORY</strong>
                <span>Production: ${playerPath.speed}</span>
                <span>Inspection: ${playerPath.quality}</span>
                <span>Output: ${playerPath.score}</span>
                <span>Power: ${playerPath.energy}</span>
            </div>
            <div class="comparison-column best-path">
                <strong>OPTIMIZED FACTORY</strong>
                <span>Production: ${bestPath.speed}</span>
                <span>Inspection: ${bestPath.quality}</span>
                <span>Output: ${bestPath.score}</span>
                <span>Power: ${bestPath.energy}</span>
            </div>
        </div>
        <div class="comparison-message">${pathMessage} Next shift begins in 10 seconds.</div>
    `;
    comparison.classList.remove("hidden");
}

function updateOptimizerCalculations() {
    const speed = Number(document.getElementById("slider-speed").value);
    const quality = Number(document.getElementById("slider-quality").value);
    const values = calculateOptimizerValues(speed, quality);
    const energyBar = document.getElementById("opt-energy-bar");
    const outputBar = document.getElementById("opt-output-bar");
    const warning = document.getElementById("opt-warning");
    const runButton = document.getElementById("btn-run-opt");

    optimizerState.speed = speed;
    optimizerState.quality = quality;
    optimizerState.score = values.score;
    optimizerState.energy = values.energy;

    document.getElementById("val-speed").textContent = speed;
    document.getElementById("val-quality").textContent = quality;
    document.getElementById("opt-energy-val").textContent = `${values.energy} / ${optimizerState.energyLimit}`;
    document.getElementById("opt-output-val").textContent = values.score;
    energyBar.style.width = `${Math.min(100, (values.energy / optimizerState.energyLimit) * 100)}%`;
    outputBar.style.width = `${Math.min(100, (values.score / 300) * 100)}%`;

    const overloaded = values.energy > optimizerState.energyLimit;
    energyBar.classList.toggle("overloaded", overloaded);
    runButton.disabled = overloaded;
    warning.textContent = overloaded ? "GRID OVERLOAD: reduce speed or quality before running." : "CONSTRAINT SATISFIED: model can run.";
    warning.className = overloaded ? "optimizer-warning warning" : "optimizer-warning safe";
}

function submitOptimization() {
    if (optimizerState.energy > optimizerState.energyLimit) return;

    clearInterval(optimizerState.autoTimer);
    document.getElementById("btn-run-opt").disabled = true;
    document.getElementById("btn-auto-opt").disabled = true;
    const bestPath = findBestOptimizerPath();
    optimizerState.validRounds++;
    optimizerState.scoreTotal += optimizerState.score;
    optimizerState.bestScore = Math.max(optimizerState.bestScore, optimizerState.score);
    document.getElementById("optimizer-score").textContent = optimizerState.scoreTotal;

    const efficiency = Math.min(100, Math.round((optimizerState.score / optimizerState.targetScore) * 100));
    optimizerState.efficiencyTotal += efficiency;
    const feedback = document.getElementById("optimizer-feedback");
    feedback.textContent = `MODEL VALIDATED: ${optimizerState.score} OUTPUT • ${efficiency}% OF TARGET`;
    feedback.className = "game-message success";
    showOptimizerComparison(bestPath);
    addXP(Math.max(25, Math.floor(efficiency * 1.5)));

    setTimeout(() => {
        if (optimizerState.round >= optimizerState.maxRounds) {
            completeOptimizer();
        } else {
            optimizerState.round++;
            loadOptimizerRound();
        }
    }, 10000);
}

function runAutoOptimize() {
    clearInterval(optimizerState.autoTimer);
    const autoButton = document.getElementById("btn-auto-opt");
    const runButton = document.getElementById("btn-run-opt");
    autoButton.disabled = true;
    runButton.disabled = true;
    document.getElementById("optimizer-feedback").textContent = "AUTO-OPTIMIZER: SEARCHING NEARBY VALID SOLUTIONS...";
    document.getElementById("optimizer-feedback").className = "game-message processing";

    optimizerState.autoTimer = setInterval(() => {
        const speed = optimizerState.speed;
        const quality = optimizerState.quality;
        const candidates = [
            { speed: speed + 1, quality },
            { speed, quality: quality + 1 },
            { speed: speed - 1, quality },
            { speed, quality: quality - 1 }
        ].filter(candidate => candidate.speed >= 0 && candidate.speed <= 100 && candidate.quality >= 0 && candidate.quality <= 100)
            .map(candidate => ({ ...candidate, ...calculateOptimizerValues(candidate.speed, candidate.quality) }))
            .filter(candidate => candidate.energy <= optimizerState.energyLimit)
            .sort((a, b) => b.score - a.score);

        const bestCandidate = candidates[0];
        const currentIsValid = optimizerState.energy <= optimizerState.energyLimit;
        if (!bestCandidate || (currentIsValid && bestCandidate.score <= optimizerState.score)) {
            clearInterval(optimizerState.autoTimer);
            autoButton.disabled = false;
            runButton.disabled = optimizerState.energy > optimizerState.energyLimit;
            document.getElementById("optimizer-feedback").textContent = "AUTO-OPTIMIZER: LOCAL PEAK FOUND. REVIEW AND RUN MODEL.";
            document.getElementById("optimizer-feedback").className = "game-message success";
            return;
        }

        document.getElementById("slider-speed").value = bestCandidate.speed;
        document.getElementById("slider-quality").value = bestCandidate.quality;
        updateOptimizerCalculations();
    }, 90);
}

function completeOptimizer() {
    const efficiency = Math.round(optimizerState.efficiencyTotal / optimizerState.maxRounds);
    const bonusXP = efficiency >= 95 ? 250 : efficiency >= 80 ? 150 : 75;
    addXP(bonusXP);

    document.getElementById("optimizer-completion-stars").textContent = efficiency >= 95 ? "★ ★ ★" : efficiency >= 80 ? "★ ★" : "★";
    document.getElementById("optimizer-valid-rounds").textContent = `${optimizerState.validRounds} / ${optimizerState.maxRounds}`;
    document.getElementById("optimizer-best-score").textContent = optimizerState.bestScore;
    document.getElementById("optimizer-completion-xp").textContent = `+${bonusXP} XP`;
    document.getElementById("optimizer-completion-message").textContent = efficiency >= 95
        ? "Excellent trade-offs. You found high output without breaking the constraint."
        : "Optimization complete. The best solution must balance the objective with its limits.";
    showScreen("optimizer-complete");
}

function handleOptimizerSliderWheel(event) {
    const slider = event.target;

    if (!slider.matches("#slider-speed, #slider-quality")) return;

    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 : -1;
    const currentValue = Number(slider.value);
    const nextValue = Math.max(Number(slider.min), Math.min(Number(slider.max), currentValue + direction));

    if (nextValue === currentValue) return;

    slider.value = nextValue;
    updateOptimizerCalculations();
}

document.addEventListener("wheel", handleOptimizerSliderWheel, { passive: false });


/* =========================================================
   PROBABILITY LEVEL
   ========================================================= */

const PROBABILITY_TOTAL_ROUNDS = 5;
let probabilityRound = 1;
let probabilityCorrectReads = 0;
let probabilityCurrentCase = null;
let probabilityBandCounts = { high: 0, medium: 0, low: 0 };
let probabilityRoundCases = [];

const probabilityCases = [
    { moistureRange: [63, 68], temperatureRange: [29, 31], leafSpots: "NO", healthyRange: [90, 96], confidence: "high" },
    { moistureRange: [64, 69], temperatureRange: [30, 32], leafSpots: "NO", healthyRange: [78, 86], confidence: "high" },
    { moistureRange: [60, 65], temperatureRange: [31, 33], leafSpots: "NO", healthyRange: [64, 70], confidence: "medium" },
    { moistureRange: [54, 59], temperatureRange: [33, 35], leafSpots: "YES", healthyRange: [53, 58], confidence: "low" },
    { moistureRange: [58, 63], temperatureRange: [32, 34], leafSpots: "YES", healthyRange: [48, 52], confidence: "low" }
];

function buildProbabilityRoundCases() {
    return [...probabilityCases]
        .sort(() => Math.random() - 0.5)
        .map(template => {
            const healthy = randomInteger(template.healthyRange[0], template.healthyRange[1]);
            return {
                id: String(randomInteger(1, 99)).padStart(2, "0"),
                moisture: `${randomInteger(template.moistureRange[0], template.moistureRange[1])}%`,
                temperature: `${randomInteger(template.temperatureRange[0], template.temperatureRange[1])}°C`,
                leafSpots: template.leafSpots,
                healthy,
                diseased: 100 - healthy,
                confidence: template.confidence
            };
        });
}

function startProbabilityLevel() {
    probabilityRound = 1;
    probabilityCorrectReads = 0;
    probabilityBandCounts = { high: 0, medium: 0, low: 0 };
    probabilityRoundCases = buildProbabilityRoundCases();

    showScreen("probability-level");
    startProbabilityRound();
}

function startProbabilityRound() {
    const currentCase = probabilityRoundCases[probabilityRound - 1];
    probabilityCurrentCase = currentCase;

    document.getElementById("probability-round").textContent = `${probabilityRound} / ${PROBABILITY_TOTAL_ROUNDS}`;
    document.getElementById("probability-scenario-text").textContent = `🌾 RICE SAMPLE #${currentCase.id}`;
    document.getElementById("probability-observation").innerHTML = `<span>SOIL MOISTURE <b>${currentCase.moisture}</b></span><span>TEMPERATURE <b>${currentCase.temperature}</b></span><span>LEAF SPOTS <b>${currentCase.leafSpots}</b></span>`;
    document.getElementById("probability-healthy-value").textContent = `${currentCase.healthy}%`;
    document.getElementById("probability-diseased-value").textContent = `${currentCase.diseased}%`;
    document.getElementById("probability-healthy-bar").style.width = `${currentCase.healthy}%`;
    document.getElementById("probability-diseased-bar").style.width = `${currentCase.diseased}%`;
    document.getElementById("probability-confidence-label").textContent = `${Math.max(currentCase.healthy, currentCase.diseased)}%`;
    document.getElementById("probability-confidence-bar").style.width = `${Math.max(currentCase.healthy, currentCase.diseased)}%`;

    document.getElementById("probability-feedback").textContent = "READ THE PROBABILITY GAP";
    document.getElementById("probability-feedback").className = "game-message";
    document.getElementById("next-probability-button").classList.add("hidden");

    const buttons = document.querySelectorAll(".probability-choice");
    buttons.forEach(button => {
        button.disabled = false;
        button.classList.remove("selected");
    });
}

function evaluateProbability(confidenceChoice) {
    const buttons = document.querySelectorAll(".probability-choice");
    buttons.forEach(button => {
        button.disabled = true;
        button.classList.toggle("selected", button.dataset.confidence === confidenceChoice);
    });

    const playerCorrect = confidenceChoice === probabilityCurrentCase.confidence;
    const feedback = document.getElementById("probability-feedback");
    const nextButton = document.getElementById("next-probability-button");
    if (playerCorrect) {
        probabilityCorrectReads++;
        playerScore += 100;
    } else {
        playerScore += 25;
    }
    probabilityBandCounts[confidenceChoice]++;
    document.getElementById("probability-accuracy").textContent = `${Math.round((probabilityCorrectReads / probabilityRound) * 100)}%`;

    feedback.textContent = playerCorrect
        ? "✓ CORRECT: A larger probability gap means the AI is more confident."
        : `✕ NOT QUITE: ${probabilityCurrentCase.healthy}% vs ${probabilityCurrentCase.diseased}% is ${probabilityCurrentCase.confidence.toUpperCase()} confidence.`;
    feedback.className = playerCorrect ? "game-message success probability-feedback" : "game-message error probability-feedback";
    nextButton.classList.remove("hidden");

    if (probabilityRound >= PROBABILITY_TOTAL_ROUNDS) {
        nextButton.textContent = "VIEW RESULTS →";
    }

}

function nextProbabilityRound() {
    if (probabilityRound >= PROBABILITY_TOTAL_ROUNDS) {
        completeProbabilityLevel();
        return;
    }

    probabilityRound++;
    startProbabilityRound();
}

function completeProbabilityLevel() {
    const accuracy = Math.round((probabilityCorrectReads / PROBABILITY_TOTAL_ROUNDS) * 100);
    const bonusXP = accuracy === 100 ? 250 : accuracy >= 80 ? 150 : accuracy >= 60 ? 75 : 0;
    addXP(bonusXP);

    let stars = "★";
    if (accuracy >= 80) stars = "★ ★";
    if (accuracy === 100) stars = "★ ★ ★";

    document.getElementById("probability-completion-stars").textContent = stars;
    document.getElementById("probability-expected-wins").textContent = `${PROBABILITY_TOTAL_ROUNDS} / ${PROBABILITY_TOTAL_ROUNDS}`;
    document.getElementById("probability-actual-wins").textContent = `${probabilityCorrectReads} / ${PROBABILITY_TOTAL_ROUNDS}`;
    document.getElementById("probability-calibration").textContent = `${probabilityBandCounts.high} / ${probabilityBandCounts.medium} / ${probabilityBandCounts.low}`;

    document.getElementById("probability-completion-message").textContent = accuracy >= 80
        ? "Confidence is not certainty. A wider probability gap means the model feels more sure."
        : "Keep reading the gap between the two probabilities. Close scores mean more uncertainty.";

    showScreen("probability-complete");
}


/* =========================================================
   FARM OPTIMIZER
   ========================================================= */

const FARM_OPTIMIZER_ROUNDS = [
    { title: "ROUND 1 // WATER THE RICE FIELD", target: 78, ideal: { water: 7, fertilizer: 1, workers: 1 } },
    { title: "ROUND 2 // FEED THE CROP", target: 82, ideal: { water: 6, fertilizer: 4, workers: 2 } },
    { title: "ROUND 3 // FULL FARM ALLOCATION", target: 80, ideal: { water: 7, fertilizer: 4, workers: 3 } }
];

let farmOptimizerRound = 1;
let farmOptimizerScore = 0;
let farmOptimizerSuccessful = 0;
let farmOptimizerLocked = false;

function startFarmOptimizer() {
    farmOptimizerRound = 1;
    farmOptimizerScore = 0;
    farmOptimizerSuccessful = 0;
    farmOptimizerLocked = false;
    showScreen("optimizer");
    loadFarmOptimizerRound();
}

function loadFarmOptimizerRound() {
    const currentRound = FARM_OPTIMIZER_ROUNDS[farmOptimizerRound - 1];
    farmOptimizerLocked = false;
    document.getElementById("opt-task-desc").textContent = currentRound.title;
    document.getElementById("optimizer-round").textContent = `${farmOptimizerRound} / ${FARM_OPTIMIZER_ROUNDS.length}`;
    document.getElementById("optimizer-score").textContent = farmOptimizerScore;
    const progress = (farmOptimizerRound / FARM_OPTIMIZER_ROUNDS.length) * 100;
    document.getElementById("optimizer-progress-text").textContent = `${Math.round(progress)}%`;
    document.getElementById("optimizer-progress-fill").style.width = `${progress}%`;
    document.getElementById("farm-water").value = 5;
    document.getElementById("farm-fertilizer").value = 3;
    document.getElementById("farm-workers").value = 2;
    const runButton = document.getElementById("btn-run-opt");
    runButton.disabled = false;
    runButton.textContent = "GROW CROP";
    runButton.onclick = submitFarmAllocation;
    document.getElementById("opt-warning").textContent = "ADJUST THE RESOURCES, THEN GROW THE CROP.";
    document.getElementById("opt-warning").className = "optimizer-warning";
    document.getElementById("optimizer-feedback").textContent = "FIND A STRONG YIELD WITHOUT WASTING RESOURCES";
    document.getElementById("optimizer-feedback").className = "game-message";
    updateFarmYield();
}

function calculateFarmYield() {
    const currentRound = FARM_OPTIMIZER_ROUNDS[farmOptimizerRound - 1];
    const water = Number(document.getElementById("farm-water").value);
    const fertilizer = Number(document.getElementById("farm-fertilizer").value);
    const workers = Number(document.getElementById("farm-workers").value);
    const distance = Math.abs(water - currentRound.ideal.water) * 3 + Math.abs(fertilizer - currentRound.ideal.fertilizer) * 4 + Math.abs(workers - currentRound.ideal.workers) * 5;
    return Math.max(0, Math.min(100, 100 - distance - Math.max(0, water + fertilizer + workers - 15) * 2));
}

function updateFarmYield() {
    const water = Number(document.getElementById("farm-water").value);
    const fertilizer = Number(document.getElementById("farm-fertilizer").value);
    const workers = Number(document.getElementById("farm-workers").value);
    const yieldValue = Math.round(calculateFarmYield());
    const totalUse = water + fertilizer + workers;
    document.getElementById("farm-water-value").textContent = water;
    document.getElementById("farm-fertilizer-value").textContent = fertilizer;
    document.getElementById("farm-workers-value").textContent = workers;
    document.getElementById("farm-yield-value").textContent = `${yieldValue}%`;
    document.getElementById("farm-use-value").textContent = `${totalUse} / 20`;
    document.getElementById("opt-energy-bar").style.width = `${yieldValue}%`;
    document.getElementById("opt-output-bar").style.width = `${Math.min(100, (totalUse / 20) * 100)}%`;
}

function submitFarmAllocation() {
    if (farmOptimizerLocked) return;
    farmOptimizerLocked = true;
    const yieldValue = Math.round(calculateFarmYield());
    const target = FARM_OPTIMIZER_ROUNDS[farmOptimizerRound - 1].target;
    const feedback = document.getElementById("optimizer-feedback");
    const nextButton = document.getElementById("btn-run-opt");
    const goodResult = yieldValue >= target;
    if (goodResult) {
        farmOptimizerSuccessful++;
        farmOptimizerScore += yieldValue;
        playerScore += yieldValue;
        addXP(100);
        feedback.textContent = `✓ TARGET REACHED: ${yieldValue}% CROP YIELD. SMART RESOURCE USE.`;
        feedback.className = "game-message success";
    } else {
        farmOptimizerScore += yieldValue;
        feedback.textContent = `✕ ${yieldValue}% YIELD. TRY A DIFFERENT BALANCE NEXT ROUND.`;
        feedback.className = "game-message error";
    }
    document.getElementById("optimizer-score").textContent = farmOptimizerScore;
    nextButton.textContent = farmOptimizerRound >= FARM_OPTIMIZER_ROUNDS.length ? "VIEW RESULTS →" : "NEXT ROUND →";
    nextButton.onclick = nextFarmOptimizerRound;
    nextButton.disabled = false;
}

function nextFarmOptimizerRound() {
    if (farmOptimizerRound >= FARM_OPTIMIZER_ROUNDS.length) {
        completeFarmOptimizer();
        return;
    }
    farmOptimizerRound++;
    loadFarmOptimizerRound();
}

function completeFarmOptimizer() {
    const averageScore = Math.round(farmOptimizerScore / FARM_OPTIMIZER_ROUNDS.length);
    const bonusXP = farmOptimizerSuccessful === 3 ? 250 : farmOptimizerSuccessful >= 2 ? 150 : 75;
    addXP(bonusXP);
    document.getElementById("optimizer-completion-stars").textContent = farmOptimizerSuccessful === 3 ? "★ ★ ★" : farmOptimizerSuccessful >= 2 ? "★ ★" : "★";
    document.getElementById("optimizer-valid-rounds").textContent = `${farmOptimizerSuccessful} / ${FARM_OPTIMIZER_ROUNDS.length}`;
    document.getElementById("optimizer-best-score").textContent = averageScore;
    document.getElementById("optimizer-completion-xp").textContent = `+${bonusXP} XP`;
    document.getElementById("optimizer-completion-message").textContent = farmOptimizerSuccessful >= 2
        ? "Strong allocation. Optimization means finding a good result within limits."
        : "Keep experimenting. Using more resources does not always create the best yield.";
    showScreen("optimizer-complete");
}


/* =========================================================
   BIAS LAB
   ========================================================= */

const biasCases = [
    { title: "☀️ SUNNY VS 🌧️ RAINY", majority: "SUNNY", minority: "RAINY", majorityCount: 16, minorityCount: 2, majorityPerformance: 90, minorityPerformance: 55 },
    { title: "🌱 YOUNG VS 🌾 MATURE CROPS", majority: "MATURE", minority: "YOUNG", majorityCount: 14, minorityCount: 3, majorityPerformance: 88, minorityPerformance: 58 },
    { title: "💧 DRY SOIL VS 💦 WET SOIL", majority: "WET SOIL", minority: "DRY SOIL", majorityCount: 15, minorityCount: 2, majorityPerformance: 91, minorityPerformance: 52 }
];

let biasRound = 1;
let biasScore = 0;
let biasCorrect = 0;
let biasLocked = false;
let biasBalanced = false;

function startBiasLab() {
    biasRound = 1;
    biasScore = 0;
    biasCorrect = 0;
    loadBiasRound();
    showScreen("bias-lab");
}

function loadBiasRound() {
    const currentCase = biasCases[biasRound - 1];
    biasLocked = false;
    biasBalanced = false;
    document.getElementById("bias-round").textContent = `${biasRound} / ${biasCases.length}`;
    const progress = (biasRound / biasCases.length) * 100;
    document.getElementById("bias-progress-text").textContent = `${Math.round(progress)}%`;
    document.getElementById("bias-progress-fill").style.width = `${progress}%`;
    document.getElementById("bias-score").textContent = biasScore;
    document.getElementById("bias-case").innerHTML = `
        <strong>${currentCase.title}</strong>
        <div class="bias-bars"><span>${currentCase.majority} <b>${currentCase.majorityCount}</b></span><i style="width: ${currentCase.majorityCount * 5}%"></i><span>${currentCase.minority} <b>${currentCase.minorityCount}</b></span><i class="minority-bar" style="width: ${currentCase.minorityCount * 5}%"></i></div>
        <div class="bias-performance"><span>${currentCase.majority} FIELD <b>${currentCase.majorityPerformance}% ✓</b></span><span>${currentCase.minority} FIELD <b>${currentCase.minorityPerformance}% ✕</b></span></div>
    `;
    document.getElementById("bias-question").textContent = "WHAT IS CAUSING THE UNEVEN PERFORMANCE?";
    document.getElementById("bias-question").className = "game-message";
    document.querySelectorAll(".bias-choice").forEach(button => { button.disabled = false; button.classList.remove("selected"); });
    document.getElementById("bias-balance-controls").classList.add("hidden");
    document.getElementById("bias-balance-feedback").textContent = "ADD THE MISSING GROUP";
    document.getElementById("bias-balance-feedback").className = "game-message";
    document.getElementById("next-bias-button").classList.add("hidden");
}

function diagnoseBias(diagnosis) {
    if (biasLocked) return;
    biasLocked = true;
    document.querySelectorAll(".bias-choice").forEach(button => { button.disabled = true; button.classList.toggle("selected", diagnosis === "unbalanced" && button.textContent.includes("UNBALANCED")); });
    if (diagnosis === "unbalanced") {
        biasCorrect++;
        biasScore += 100;
        playerScore += 100;
        addXP(100);
        document.getElementById("bias-question").textContent = "✓ CORRECT: The underrepresented condition has much lower performance. Add samples to balance the data.";
        document.getElementById("bias-question").className = "game-message success";
        document.getElementById("bias-balance-controls").classList.remove("hidden");
    } else {
        biasScore += 25;
        playerScore += 25;
        document.getElementById("bias-question").textContent = "✕ NOT QUITE: The performance gap follows the training-data imbalance. Look at which condition has fewer examples.";
        document.getElementById("bias-question").className = "game-message error";
        document.getElementById("bias-balance-controls").classList.remove("hidden");
    }
    document.getElementById("bias-score").textContent = biasScore;
}

function addBiasSamples() {
    if (biasBalanced) return;
    biasBalanced = true;
    document.getElementById("bias-balance-feedback").textContent = "✓ DATASET BALANCED. PERFORMANCE IS MORE CONSISTENT.";
    document.getElementById("bias-balance-feedback").className = "game-message success";
    document.getElementById("next-bias-button").textContent = biasRound >= biasCases.length ? "VIEW RESULTS →" : "NEXT ROUND →";
    document.getElementById("next-bias-button").classList.remove("hidden");
}

function nextBiasRound() {
    if (biasRound >= biasCases.length) {
        completeBiasLab();
        return;
    }
    biasRound++;
    loadBiasRound();
}

function completeBiasLab() {
    const bonusXP = biasCorrect === biasCases.length ? 250 : biasCorrect >= 2 ? 150 : 75;
    addXP(bonusXP);
    document.getElementById("bias-completion-stars").textContent = biasCorrect === biasCases.length ? "★ ★ ★" : biasCorrect >= 2 ? "★ ★" : "★";
    document.getElementById("bias-completion-correct").textContent = `${biasCorrect} / ${biasCases.length}`;
    document.getElementById("bias-completion-score").textContent = biasScore;
    document.getElementById("bias-completion-xp").textContent = `+${bonusXP} XP`;
    document.getElementById("bias-completion-message").textContent = "An AI can inherit patterns from the data it learns from. Checking representation helps reveal potential bias.";
    showScreen("bias-lab-complete");
}


/* =========================================================
   FINAL TEST
   ========================================================= */

const FINAL_TEST_TOTAL_STAGES = 8;
let finalStage = 1;
let finalScore = 0;
let finalCorrect = 0;
let finalLocked = false;

const finalStages = [
    {
        label: "STAGE 1 // CHECK THE DATA",
        content: `<strong>🌾 FIELD BATCH #21</strong><div class="final-sample-list"><div class="final-sample-row"><span>SAMPLE A</span><b>Moisture 67% · Temp 30°C · Leaf spots NO</b></div><div class="final-sample-row"><span>SAMPLE B</span><b>Moisture ??? · Temp 31°C · Leaf spots ???</b></div><div class="final-sample-row"><span>SAMPLE C</span><b>Moisture 64% · Temp 30°C · Leaf spots YES</b></div></div>`,
        prompt: "WHICH SAMPLE SHOULD NOT ENTER TRAINING?",
        options: [{ text: "SAMPLE A", value: "a" }, { text: "SAMPLE B", value: "b" }, { text: "SAMPLE C", value: "c" }], answer: "b",
        reason: "Missing information makes Sample B unreliable for training."
    },
    {
        label: "STAGE 2 // PREPARE THE LABEL",
        content: `<strong>🌾 SAMPLE #22</strong><div class="final-sample-list"><div class="final-sample-row"><span>OBSERVATIONS</span><b>Moisture 71% · Temp 29°C · Humidity 82% · Leaf spots YES</b></div><div class="final-sample-row"><span>CURRENT LABEL</span><b>HEALTHY</b></div></div>`,
        prompt: "WHAT SHOULD HAPPEN TO THIS SAMPLE?",
        options: [{ text: "KEEP", value: "keep" }, { text: "FIX LABEL", value: "fix" }, { text: "REMOVE", value: "remove" }], answer: "fix",
        reason: "The observation is useful, but its label is wrong."
    },
    {
        label: "STAGE 3 // CLASSIFY",
        content: `<strong>🌱 NEW FIELD SAMPLE</strong><div class="final-sample-list"><div class="final-sample-row"><span>FEATURES</span><b>Moisture 43% · Temp 34°C · Humidity 61% · Leaf spots YES</b></div><div class="final-sample-row"><span>🤖 AI PREDICTION</span><b>DISEASED · CONFIDENCE 82%</b></div></div>`,
        prompt: "WHAT IS THE AI PREDICTING?",
        options: [{ text: "HEALTHY", value: "healthy" }, { text: "DISEASED", value: "diseased" }], answer: "diseased",
        reason: "The classifier places this new crop observation in the DISEASED category."
    },
    {
        label: "STAGE 4 // CHECK CONFIDENCE",
        content: `<strong>🤖 AI PREDICTION</strong><div class="final-confidence-pair"><div class="final-confidence-row"><span>HEALTHY</span><b>54%</b></div><div class="final-confidence-row"><span>DISEASED</span><b>46%</b></div></div>`,
        prompt: "SHOULD THIS PREDICTION BE TREATED AS HIGHLY CERTAIN?",
        options: [{ text: "YES", value: "yes" }, { text: "NO", value: "no" }], answer: "no",
        reason: "The probabilities are close, so the model is uncertain."
    },
    {
        label: "STAGE 5 // COMPARE CONFIDENCE",
        content: `<strong>WHICH PREDICTION IS MORE CONFIDENT?</strong><div class="final-confidence-pair"><div class="final-confidence-row"><span>OPTION A</span><b>54% / 46%</b></div><div class="final-confidence-row"><span>OPTION B</span><b>94% / 6%</b></div></div>`,
        prompt: "CHOOSE THE MORE CONFIDENT PREDICTION",
        options: [{ text: "54% / 46%", value: "close" }, { text: "94% / 6%", value: "wide" }], answer: "wide",
        reason: "A wider probability gap means the model is more confident."
    },
    {
        label: "STAGE 6 // TEST THE MODEL",
        content: `<div class="final-model-pair"><div class="final-model-row"><span>MODEL A</span><b>TRAINING 96% · NEW FIELD 61%</b></div><div class="final-model-row"><span>MODEL B</span><b>TRAINING 89% · NEW FIELD 86%</b></div></div>`,
        prompt: "WHICH MODEL LEARNED A MORE USEFUL PATTERN?",
        options: [{ text: "MODEL A", value: "a" }, { text: "MODEL B", value: "b" }], answer: "b",
        reason: "Model B performs consistently on new field data. Model A may have overfit."
    },
    {
        label: "STAGE 7 // CHECK THE TRAINING DATA",
        content: `<strong>TRAINING DATA</strong><div class="final-sample-list"><div class="final-sample-row"><span>☀️ SUNNY FIELD</span><b>16 samples · performance 91%</b></div><div class="final-sample-row"><span>🌧️ RAINY FIELD</span><b>2 samples · performance 57%</b></div></div>`,
        prompt: "WHAT SHOULD THE TEAM INVESTIGATE FIRST?",
        options: [{ text: "ADD MORE RAINY-FIELD DATA", value: "add" }, { text: "REMOVE ALL SUNNY DATA", value: "remove" }, { text: "IGNORE THE DIFFERENCE", value: "ignore" }], answer: "add",
        reason: "Rainy-field data is underrepresented and may be contributing to uneven performance."
    },
    {
        label: "STAGE 8 // DEPLOY THE FIELD ALERT",
        content: `<div class="final-alert-summary"><span>🚨 FIELD ALERT // RICE-07</span><strong>🦠 DISEASED</strong><small>Moisture 58% · Temp 32°C · Humidity 76% · Leaf spots YES · Confidence 89%</small></div>`,
        prompt: "IS THIS HIGH-CONFIDENCE PREDICTION READY TO BECOME A FIELD ALERT?",
        options: [{ text: "YES, HIGH CONFIDENCE", value: "yes" }, { text: "NO, NEEDS REVIEW", value: "no" }], answer: "yes",
        reason: "The data was prepared, the model was tested, confidence is high, and data balance was investigated."
    }
];

function startFinalTest() {
    finalStage = 1;
    finalScore = 0;
    finalCorrect = 0;
    showScreen("final-test");
    loadFinalStage();
}

function loadFinalStage() {
    const stage = finalStages[finalStage - 1];
    finalLocked = false;
    document.getElementById("final-stage").textContent = `${finalStage} / ${FINAL_TEST_TOTAL_STAGES}`;
    const progress = (finalStage / FINAL_TEST_TOTAL_STAGES) * 100;
    document.getElementById("final-progress-text").textContent = `${Math.round(progress)}%`;
    document.getElementById("final-progress-fill").style.width = `${progress}%`;
    document.getElementById("final-score").textContent = finalScore;
    document.getElementById("final-stage-label").textContent = stage.label;
    document.getElementById("final-stage-content").innerHTML = stage.content;
    document.getElementById("final-stage-feedback").textContent = stage.prompt;
    document.getElementById("final-stage-feedback").className = "game-message";
    document.getElementById("final-stage-actions").innerHTML = stage.options.map(option => `<button class="secondary-button final-choice" data-value="${option.value}" onclick="answerFinalStage('${option.value}')">${option.text}</button>`).join("");
    document.getElementById("next-final-stage-button").classList.add("hidden");
}

function answerFinalStage(value) {
    if (finalLocked) return;
    finalLocked = true;
    const stage = finalStages[finalStage - 1];
    const correct = value === stage.answer;
    document.querySelectorAll(".final-choice").forEach(button => {
        button.disabled = true;
        button.classList.toggle("selected", button.dataset.value === value);
    });
    if (correct) {
        finalCorrect++;
        finalScore += 100;
        playerScore += 100;
        addXP(50);
        document.getElementById("final-stage-feedback").textContent = `✓ CORRECT: ${stage.reason}`;
        document.getElementById("final-stage-feedback").className = "game-message success final-feedback";
    } else {
        finalScore += 25;
        playerScore += 25;
        document.getElementById("final-stage-feedback").textContent = `✕ NOT QUITE: ${stage.reason}`;
        document.getElementById("final-stage-feedback").className = "game-message error final-feedback";
    }
    document.getElementById("final-score").textContent = finalScore;
    const nextButton = document.getElementById("next-final-stage-button");
    nextButton.textContent = finalStage >= FINAL_TEST_TOTAL_STAGES ? "VIEW FIELD ALERT →" : "NEXT STAGE →";
    nextButton.classList.remove("hidden");
}

function nextFinalStage() {
    if (finalStage >= FINAL_TEST_TOTAL_STAGES) {
        completeFinalTest();
        return;
    }
    finalStage++;
    loadFinalStage();
}

function completeFinalTest() {
    const percentage = Math.round((finalCorrect / FINAL_TEST_TOTAL_STAGES) * 100);
    const bonusXP = percentage >= 90 ? 500 : percentage >= 70 ? 350 : 200;
    addXP(bonusXP);
    document.getElementById("final-completion-stars").textContent = percentage >= 90 ? "★ ★ ★" : percentage >= 70 ? "★ ★" : "★";
    document.getElementById("final-completion-message").textContent = `${finalCorrect} / ${FINAL_TEST_TOTAL_STAGES} pipeline decisions correct. The farm alert is ready because the process was checked from data to deployment. +${bonusXP} XP earned.`;
    showScreen("final-test-complete");
}


/* =========================================================
   INITIALIZE
   ========================================================= */

updatePlayerDisplay();