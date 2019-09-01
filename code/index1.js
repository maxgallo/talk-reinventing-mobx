const React = require('react');
const { useRef, useState } = require('react');
const { render } = require('react-dom');
// const { observer } = require('mobx-react');
// const { observable, autorun } = require('mobx');

const accessedObservables = [];
const derivationGraph = {};
let count = 0;

function observable(targetObject) {
    const observableObject = {}

    const unique = `observable(${count++})`
    function getObservableId(key) {
        unique + key;
    }

    Object.keys(targetObject).forEach(objectKey => {
        Object.defineProperty(
            observableObject,
            objectKey,
            {
                get() {
                    accessedObservables.push(getObservableId(objectKey))
                    return targetObject[objectKey];
                },
                set(value) {
                    targetObject[objectKey] = value;
                    derivationGraph[getObservableId(objectKey)].forEach(runner => runner());
                }
            }
        )
    })

    return observableObject;
}

function Reaction(onInvalidate){
    return {
        track: trackFunction => {
            accessedObservables.length = 0;
            trackFunction();
            accessedObservables.forEach(objectId => {
                derivationGraph[objectId] = derivationGraph[objectId] || new Set()
                derivationGraph[objectId].add(onInvalidate);
            })
        }
    }
}

function autorun(runner){
    const reaction = new Reaction(runner);
    reaction.track(runner);
}

function useForceUpdate() {
    const [,set] = useState(0)
    return () => set(x => !x)
}

function applyObserver(functionComponent) {
    const forceUpdate = useForceUpdate();

    const reaction = useRef(null);

    if(!reaction.current) {
        reaction.current = new Reaction(() => forceUpdate())
    }

    let rendering
    reaction.current.track(() => {
        return rendering = functionComponent();
    })

    return rendering;
}

function observer(component) {
    const wrappedComponent = (props, ref) => {
        return applyObserver(() => component(props, ref))
    }
    return wrappedComponent;
}

const album1 = observable({
    title: "OK Computer",
    year: 1997,
    playCount: 0
});

autorun(() => { console.log(`**** PlayCount: ${album1.playCount}`)});

console.log('\n------reactions-------- \n');

setTimeout(() => album1.playCount = 1, 1000);
setTimeout(() => album1.playCount = 2, 2000);
setTimeout(() => album1.playCount = 3, 3000);


const Album = () => (
    <div>
        <h2>{album1.title}</h2>
        <h2>{album1.playCount}</h2>
    </div>
)

const ObserverAlbum = observer(Album);

render(
    <ObserverAlbum />,
    document.getElementById('root')
);


