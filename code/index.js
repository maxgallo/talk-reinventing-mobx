const { observable, autorun } = require('mobx')

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
