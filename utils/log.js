const extend = require("node.extend");

const log = (request) => {
    var log = extend(true, {date: Date.now()}, request);
    console.log("## Login activity: " + JSON.stringify(log));
}

module.exports = { log };