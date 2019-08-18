import { observable, reaction } from 'mobx';
// import { autorun } from 'mobx';
import { observer } from 'mobx-react';
import { render } from 'react-dom';
import React, { useState, useEffect } from 'react';
import { useCallback, memo} from "react";

const album1 = observable({
    title: "OK Computer",
    year: 1997,
    playCount: 0
});

// const autorun = func => reaction(func, func);
// autorun(() => { console.log(`Album 1 PlayCount: ${album1.playCount}`)});

console.log('\n ------reactions-------- \n');

setTimeout(() => album1.playCount = 1, 1000);
setTimeout(() => album1.playCount = 2, 2000);
setTimeout(() => album1.playCount = 3, 3000);

//create your forceUpdate hook
function useForceUpdate(){
    const [value, set] = useState(true); //boolean state
    return () => set(!value); // toggle the state to force render
}

// function useForceUpdate() {
    // const [, setTick] = useState(0)

    // const update = useCallback(() => {
        // setTick(tick => tick + 1)
    // }, [])

    // return update
// }

function useObserver(functionComponent) {
    const forceUpdate = useForceUpdate();

    let rendering;
    const dispose = reaction(
        () => {
            rendering = functionComponent(); // this one cause a double render
            return rendering; // if I don't return,
        },
        () => {
            forceUpdate();
        },
    );
    // without this one, we're adding a reaction each time
    useEffect(() => () => dispose())

    return rendering;
}


function myObserver(baseComponent) {
    const wrappedComponent = (props, ref) => {
        return useObserver(() => baseComponent(props, ref));
    }
    return wrappedComponent;
    // const memoComponent = memo(wrappedComponent)
    // return memoComponent;
}


// @observer
// @myObserver
// class Album extends React.Component {
    // render() {
        // console.log('I am rendering...');
        // return (
            // <div>
                // <h1>{album1.title}</h1>
                // <h1>{album1.playCount}</h1>
            // </div>
        // )
    // }
// }

const Album = () => {
    console.log('render');
    return (
        <div>
            <h1>{album1.title}</h1>
            <h1>{album1.playCount}</h1>
        </div>
    )
}

// const ObserverAlbum = observer(Album);
const ObserverAlbum = myObserver(Album);

render(
    <ObserverAlbum />,
    document.getElementById('root')
);
