import { render } from 'react-dom';
import React from 'react';

// import { observer } from 'mobx-react';
// import { observable, autorun } from 'mobx';
import { useState, useRef, useEffect } from 'react';

const album1 = observable({
    title: "OK Computer",
    year: 1997,
    playCount: 0
});

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

function useForceUpdate(){
    const [,set] = useState(0);
    return () => set(x => !x);
}

function useObserver(functionComponent) {
    const forceUpdate = useForceUpdate();

    const reaction = useRef(null);

    if (!reaction.current) {
        reaction.current = new Reaction(
            'observer(pippo)',
            () => forceUpdate()
        )
    }

    // const dispose = () => reaction.current && reaction.current.dispose();
    // useEffect(() => () => dispose());

    let rendering;
    reaction.current.track(() => {
        rendering = functionComponent()
    })
    return rendering;
}

function observer(baseComponent) {
    const wrappedComponent = (props, ref) => {
        return useObserver(() => baseComponent(props, ref));
    }
    return wrappedComponent;
}

autorun(() => { console.log(`******** PlayCount: ${album1.playCount}`)});

console.log('\n ------reactions-------- \n');

setTimeout(() => album1.playCount = 1, 1000);
setTimeout(() => album1.playCount = 2, 2000);
setTimeout(() => album1.playCount = 3, 3000);

const Album = () => {
    console.log('render');
    return (
        <div>
            <h1>{album1.title}</h1>
            <h1>{album1.playCount}</h1>
        </div>
    )
}

const ObserverAlbum = observer(Album);

render(
    <ObserverAlbum />,
    document.getElementById('root')
);
