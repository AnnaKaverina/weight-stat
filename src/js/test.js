const { get } = require("browser-sync");

function getNewDate() {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
}

console.log(getNewDate());