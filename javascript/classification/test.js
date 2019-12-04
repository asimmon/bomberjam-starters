const tf = require("@tensorflow/tfjs");
require("@tensorflow/tfjs-node");

const data = require("./src/data");
const { ALL_ACTIONS } = require("./src/game-constants");
const actionStrings = Object.keys(ALL_ACTIONS);

const GAMES_TO_LOAD = 25;

const models = {
    "cnn-p4-450": {
        modelName: "cnn-p4-450-games",
        playerIds: ["p4"]
    },
    "cnn-p4-900-equalized": {
        modelName: "cnn-p4-900-games-equalized",
        playerIds: ["p4"]
    },
    "cnn-all-350": {
        modelName: "cnn-all-players-350-games",
        playerIds: undefined
    },
    "cnn-3x3-2d-all-1000": {
        modelName: "cnn-3x3-2d-all-1000",
        playerIds: undefined
    },
}

const modelToTest = models["cnn-3x3-2d-all-1000"];

async function main() {
    const classifier = await tf.loadLayersModel(`file://./trained-models/${modelToTest.modelName}/model.json`);

    console.group("\nEvaluating model", modelToTest.modelName);
    const test = await data.get(0, GAMES_TO_LOAD, modelToTest.playerIds);

    console.log("Making predictions");
    const predictionsTensor = classifier.predict(test.inputs);

    console.log("Extracting results");
    const expected = test.outputs.argMax(1).dataSync();
    const predicted = predictionsTensor.argMax(1).dataSync();

    console.log("Results:");
    const answers = answerStruct();

    for (let i = 0; i < expected.length; i++) {
        const expectedAction = actionStrings[expected[i]];
        const predictedAction = actionStrings[predicted[i]];
        answers[expectedAction].expected++;
        answers[predictedAction].predicted++;
        if (expected[i] === predicted[i]) {
            answers[expectedAction].good++;
        }
    }

    crunchAnswersData(answers);

    console.table(answers);
    console.groupEnd();
}

function answerStruct() {
    return actionStrings.reduce((acc, action) => {
        acc[action] = {
            expected: 0,
            predicted: 0,
            good: 0
        };

        return acc;
    }, {});
}

function crunchAnswersData(answers) {
    const totals = { expected: 0, predicted: 0, good: 0 };
    for (const action in answers) {
        totals.expected += answers[action].expected;
        totals.predicted += answers[action].predicted;
        totals.good += answers[action].good;
    }

    answers.total = { ...totals };

    const totalActions = answers.total.expected;
    for (const action in answers) {
        answers[action]["expected %"] = Math.round(answers[action].expected / totalActions * 100);
        answers[action]["predicted %"] = Math.round(answers[action].predicted / totalActions * 100);
        answers[action]["accuracy"] = Math.round(answers[action].good / answers[action].expected * 100);
    }
}

main();