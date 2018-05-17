let chokidar = require('chokidar');
let nodeCmd = require('node-cmd');
let beeper = require('beeper');

let busy = false;
let reRun = false;
let watcher;
let handleTimeout;
let clock_time;

let clean = true;
let deleteWar = true;
let skipTests = false;
let extWatch = "**/*.java";
let warName = "avserviceJson.war";
let dirWatch = "C:/Users/luis.alves/Documents/projetos/brk/BRKSite/";
let projectDir = "C:/Users/luis.alves/Documents/projetos/brk/BRKSite/";
let targetDir = "target/" + warName;
let tomcatDir = 'C:/apache-tomcat-8.5.12/';
tomcatDir = 'C:/DB1/SERVERS/jboss-eap-6.4/oambiental/';
let targetWarFolder = tomcatDir + "deployments/";

let arrCmds = [
    'echo "------------------------------------------------------"',
    'echo "Mvn Clean..."',
    'mvn -f ' + projectDir + (clean ? ' clean ' : '') + ' install ' + (skipTests ? ' -DskipTests ' : ''),
    'echo "------------------------------------------------------"',
    'echo "Delete war folder..." ' + (deleteWar ? ' && rm -rf ' + targetWarFolder +"*"  : 'echo "Not deleted" '),
    'echo "Copy war..."',
    'cp ' + projectDir + targetDir + ' ' + targetWarFolder,
    'echo "------------------------------------------------------"',
    'echo ".::DONE::."'
];

function initWatch() {
    watcher = chokidar.watch(dirWatch + extWatch, { ignored: /^\./, persistent: true });
    
    watcher
        .on('add', (path) => { change(path); })
        .on('change', (path) => { change(path); console.log('File', path, 'has been changed'); })
        .on('unlink', (path) => { change(path); console.log('File', path, 'has been removed'); })
        .on('error', (error) => { console.log("Error", error) })
}

function loop(index) {
    nodeCmd.get(arrCmds[index], (err, data, stderr) => {
        console.log(arrCmds[index]);
        console.log(data);
        time = 500;
        if ((index + 1) < arrCmds.length) {
            setTimeout(() => {
                loop(index + 1);
            }, time);
        } else {
            setTimeout(() => {
                beeper();
            }, 4000);
            console.log("Executado em " + ((new Date().getTime() - clock_time.getTime()) / 1000).toFixed(2) + "s");
            busy = false;
        }
    });

}
setInterval(() => {
    if (reRun && !busy) {
        reRun = false;
        initCmd();
    }
}, 4000);

function change(path) {
    if (!busy) {
        clearTimeout(handleTimeout);
        handleTimeout = setTimeout(initCmd, 4000);
    } else {
        beeper();
        beeper();
        reRun = true;
    }
}
function initCmd() {
    console.log('run loop()');
    busy = true;
    clock_time = new Date();
    loop(0);
}
function runCmf(arrCmd) {
    arrCmd.forEach(element => {
        nodeCmd.get(element, (err, data, stderr) => { });
    });
}
function initTomcat() {

    let arrTomct = [
        'echo "------------------------------------------------------"',
        'echo "Init server" ',
        tomcatDir + 'bin/startup.bat jpda start',
    ];
    runCmf(arrTomct);
}
function killTomcat() {
    let arrKillTomcat = [
        'echo "------------------------------------------------------"',
        'echo "Kill 8080"',
        'FOR /F "tokens=5 delims= " %P IN (' + "'" + 'netstat -a -n -o ^| findstr : 8080' + "'" + ') DO TaskKill.exe /PID %P /T /F',
    ];
    runCmf(arrKillTomcat);
}

initTomcat();
initWatch();
