import { render } from 'react-dom';
import React from 'react';

import { observer } from 'mobx-react';
import { observable, autorun } from 'mobx';

const album1 = observable({
    title: "OK Computer",
    year: 1997,
    playCount: 0
});

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
