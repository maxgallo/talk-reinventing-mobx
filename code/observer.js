// import { Reaction } from 'mobx';
import { Reaction } from './myMobx.js';
import { useState, useRef, useEffect } from 'react';

function useForceUpdate(){
    const [,set] = useState(0);
    return () => set(x => !x);
}

function useObserver(functionComponent) {
    console.log('use observer')
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

export { observer }
