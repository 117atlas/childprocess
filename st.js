const {fork} = require('child_process');

let precise = require('precise');

let SchedulerId = null;

function Scheduler() {
    SchedulerId = setTimeout(()=>{
        console.log("Calculator launched");
        Main();
    }, 100);
    console.log("Calculator scheduled after ", 100, " ms");
}

const Main = function () {
    let strategyVars = require('./data/strategyVars.json');
    let tripletsData = require('./data/tripletsData.json');
    let bookTicker = require('./data/socketresponse4.json').bookTicker;
    let updatedMdpIds = require('./data/socketresponse4.json').updatedMdpIds
    let initialAmount = 100;

    const Calculator = fork(__dirname + "/profit.js");
    Calculator.on('error', (err) => {
        console.error(err);
    });

    let i = 0;
    let results = [];
    let timer = precise();
    Calculator.on('message', message => {
        if (message["message"] === 'result') {
            let p = message["result"];
            p["trades"] = p["trades"].sort((a, b)=>{
                if (a["profit"] > b["profit"]) return -1;
                else if (a["profit"] < b["profit"]) return 1;
                return 0;
            })
            if (p["trades"].length > 20) {
                p["trades"] = p["trades"].slice(0, 20);
            }
            results.push({num: i+1, result: p});
            console.log("Result " + (i+1) + " arrived");
            i++;
        }
        else if (message["message"] === 'done') {
            timer.stop();
            let diff = timer.diff();
            let result = {time_precise: diff/1000000, results: results};
            require('fs').writeFileSync('./results/result_' + Date.now() + ".json", JSON.stringify(result, null, 4));
            console.log("Whole strategy ended ", (diff/1000000), " ms");
            Scheduler();
            Calculator.kill('SIGINT');
        }
        else if (message["message"] === 'error') {
            timer.stop();
            let diff = timer.diff();
            let result = {time_precise: diff/1000000, results: results, error_stack: message["error_stack"]};
            require('fs').writeFileSync('./results/result_' + Date.now() + "_ERROR.json", JSON.stringify(result, null, 4));
            console.log("Calculate profit error");
            console.error(message["error_stack"]);
            Scheduler();
            Calculator.kill('SIGINT');
        }
    })
    timer.start();
    Calculator.send({
        message: 'start',
        params: {strategyVars, tripletsData: tripletsData, bookTicker: bookTicker,
            updatedMdpIds: updatedMdpIds, varInitAmt: initialAmount}
    });
}

Scheduler();
