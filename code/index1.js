// const { observable, autorun } = require('mobx')
const React = require('react');
const { render } = require('react-dom');
// const { observer } = require('mobx-react');
const { useRef, useState } = require('react')

const accessedObservables = []
const derivationGraph = {}
let count = 0;

function observable(targetObject){
    const unique = `obser(${count}).`;
    function getObservableId(key){
        return unique + key;
    }
    return new Proxy(targetObject, {
        get(obj, key){
            accessedObservables.push(getObservableId(key))
            return obj[key];
        },
        set(obj, key, value){
            obj[key] = value;
            derivationGraph[getObservableId(key)].forEach(runner => {
                runner();
            })
        }
    })
}

function createReaction(onChange) {
    return {
        track: trackFunction => {
            accessedObservables.length = 0;
            trackFunction();
            console.log(accessedObservables);
            accessedObservables.forEach(observableId => {
                derivationGraph[observableId] = new Set()
                derivationGraph[observableId].add(onChange)
            })
        }
    }
}

function autorun(runner){
    const reaction = createReaction(runner)
    reaction.track(runner)
}

function useForceUpdate() {
    const [,set] = useState(0);
    return () => set(x => !x);
}

function applyObserver(renderComponent) {
    const reaction = useRef(null);
    const forceUpdate = useForceUpdate();

    if(!reaction.current) {
        reaction.current = createReaction(forceUpdate);
    }

    let output
    reaction.current.track(() => {
        output = renderComponent()
    })
    return output;
}

function observer(baseComponent) {
    const wrappedComponent = (props, refs) => {
        return applyObserver(() => baseComponent(props, refs))
    }
    return wrappedComponent;
}

const album = observable({
    title: "OK Computer",
    year: 1997,
    playCount: 0
});

autorun(() => { console.log(`** count: ${album.playCount}`)});

console.log('\n---reactions---\n');

setTimeout(() => album.playCount = 1, 1000);
setTimeout(() => album.playCount = 2, 2000);
setTimeout(() => album.playCount = 3, 3000);

const Album = () => (
    <div>
        <h2>{album.title}</h2>
        <h2>{album.playCount}</h2>
    </div>
)

const ObserverAlbum = observer(Album)

render(
    <ObserverAlbum />,
    document.getElementById('root')
)
