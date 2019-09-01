const { observer } = require('mobx-react');
// const { observable, autorun } = require('mobx')

let count;
const derivationGraph = {}
const accessedObservables = []

function observable(targetObject){
    const unique = `observable(${count++}).`
    function getObservableId(key) {
        unique + key;
    }

    const objWithProxy = new Proxy(targetObject, {
        get(obj, prop) {
            accessedObservables.push(getObservableId(prop))
            return obj[prop];
        },
        set(obj, prop, value) {
            obj[prop] = value
            derivationGraph[getObservableId(obj)].forEach(runner => runner())
        }
    });

    return objWithProxy;
}

function createReaction(onChange) {
    return {
        track: trackFunction => {
            accessedObservables.length = 0;
            trackFunction()
            accessedObservables.forEach(observableId => {
                derivationGraph[observableId] = derivationGraph[observableId] || new Set();
                derivationGraph[observableId].add(onChange);
            })
        }
    }
}

function autorun(runner){
    const reaction = createReaction(runner)
    reaction.track(runner);
}

const album1 = observable({
    title: "OK Computer",
    year: 1997,
    playCount: 0
});


autorun(() => { console.log(`** count: ${album1.playCount}`)});

console.log('\n---reactions---\n');

setTimeout(() => album1.playCount = 1, 1000);
setTimeout(() => album1.playCount = 2, 2000);
setTimeout(() => album1.playCount = 3, 3000);
