
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const calculation = async (i = 0) => {
    await sleep(700);
    if (i === 26) {
        process.send({
            message: 'done'
        });
        process.exit(0);
    }
    else {
        process.send({
            message: 'result',
            data: {
                num: (i+1),
                data: Math.round(Math.random()*1000)
            }
        });
        calculation(i+1).then();
    }
}

process.on('message', message => {
    if (message["message"] === 'start')
        calculation().then();
});
