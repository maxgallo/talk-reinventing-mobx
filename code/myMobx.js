const accessedObservables = [];
const derivationGraph = {};
let count = 0;

function observable(targetObject){
    const observableObject = {}

    const unique = `observable(${count++})`;
    function getObservableId(key){
        return unique + key;
    }

    Object.keys(targetObject).forEach(objectKey => {
        Object.defineProperty(
            observableObject,
            objectKey,
            {
                get(){
                    accessedObservables.push(getObservableId(objectKey))
                    return targetObject[objectKey];
                },
                set(value){
                    targetObject[objectKey] = value;
                    derivationGraph[getObservableId(objectKey)].forEach(runner => {
                        runner()
                    })
                }
            }
        )
    })
    return observableObject;
}

function Reaction(name, onInvalidate){
    return {
        track: trackFunction => {
            accessedObservables.length = 0;
            trackFunction();
            accessedObservables.forEach(objectId => {
                derivationGraph[objectId] = derivationGraph[objectId] || new Set();
                derivationGraph[objectId].add(onInvalidate);
            });
        }
    }
}

function autorun(runner) {
    const reaction = new Reaction(`Autorun(${runner.name})`, runner);
    reaction.track(runner);
}

export { Reaction, observable, autorun };
