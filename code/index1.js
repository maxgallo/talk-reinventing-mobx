// const { observable, autorun } = require('mobx')
const React = require('react')
const { render } = require('react-dom')
// const { observer } = require('mobx-react')
const { useRef, useState } = require('react')

let accessedObservables = []
const derivationGraph = {}

function observable(targetObject){
    return new Proxy(targetObject, {
        get(obj, key) {
            accessedObservables.push(key);
            return obj[key];
        },
        set(obj, key, value){
            obj[key] = value
            derivationGraph[key].forEach(runner => runner())
        }
    });
}

function createReaction(onChange) {
    return {
        track: trackFunction => {
            accessedObservables = [];
            trackFunction()
            console.log(accessedObservables)
            accessedObservables.forEach(key => {
                derivationGraph[key] = derivationGraph[key] || []
                derivationGraph[key].push(onChange);
            })
        }
    }
}

function autorun(runner){
    const reaction = createReaction(runner)
    reaction.track(runner);
}

function useForceUpdate(){
    const [,set] = useState(0)
    return () => set(x => !x)
}

function observer(baseComponent){
    const wrappedComponent = () => {
        const forceUpdate = useForceUpdate();
        const reaction = useRef(null)

        if(!reaction.current) {
            reaction.current = createReaction(forceUpdate)
        }

        let output
        reaction.current.track(() => {
            output = baseComponent();
        })
        return output;
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
);

const ObserverAlbum = observer(Album);

render(
    <ObserverAlbum />,
    document.getElementById('root'),
)
