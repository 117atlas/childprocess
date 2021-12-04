const {spawn} = require('child_process');

let child = spawn('DIR', ['D:\\'], {shell: true});

child.stdout.on('data', data => {
    console.log(`stdout:\n${data}`);
});

child.stderr.on('data', data => {
    console.log(`stderr:\n${data}`);
});

child.on('error', (error) => {
    console.error(`error: ${error.message}`);
});

child.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
});
