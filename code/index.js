import { observable, reaction, Reaction } from 'mobx';
import { autorun } from 'mobx';
// import { observer } from 'mobx-react'; // if I comment this one out, it doesn't work anymore :(
import { render } from 'react-dom';
import React, { useState, useEffect } from 'react';
import { useCallback, memo, useRef} from "react";

const album1 = observable({
    title: "OK Computer",
    year: 1997,
    playCount: 0
});

// const autorun = func => reaction(func, func);
autorun(() => { console.log(`******** PlayCount: ${album1.playCount}`)});

console.log('\n ------reactions-------- \n');

setTimeout(() => album1.playCount = 1, 1000);
setTimeout(() => album1.playCount = 2, 2000);
setTimeout(() => album1.playCount = 3, 3000);

// function useForceUpdate(){
    // const [value, set] = useState(true); //boolean state
    // return () => set(!value); // toggle the state to force render
// }

function useForceUpdate() {
    const [, setTick] = useState(0)

    const update = useCallback(() => {
        setTick(tick => tick + 1)
    }, [])

    return update
}

function useObserver(functionComponent) {
    console.log('USE OBSERVER');
    const forceUpdate = useForceUpdate();

    const reaction = useRef(null);

    if (!reaction.current) {
        reaction.current = new Reaction(`observer(pippo)`, () => {
            forceUpdate()
        })
    }

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
// const ObserverAlbum = myObserver(Album);

render(
    <ObserverAlbum />,
    document.getElementById('root')
);
