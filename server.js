var chokidar = require('chokidar');
var nodeCmd = require('node-cmd');
var beeper = require('beeper');

var busy = false;
var reRun = false;
var watcher;
var handleTimeout;
var clock_time;

var clean = false;
var deleteWar = false;
var extWatch = "**/*.java";
var warName = "superar-server-rest.war";
var dirWatch = "C:/Users/luis.alves/projetos/sicoob/superar/superar-backend/";
var projectDir = "C:/Users/luis.alves/projetos/sicoob/superar/superar-backend/";
var targetDir = "superar-server-app/target/" + warName;
var tomcatDir = 'C:/apache-tomcat-8.5.12/';


var arrCmds = [
    'echo "------------------------------------------------------"',
    'echo "Mvn Clean..."',
    'mvn -f ' + projectDir + (clean ? ' clean ' : '') + ' install -DskipTests',
    'echo "------------------------------------------------------"',
    'echo "Delete war..." ' + (deleteWar ? ' && rm -f ' + tomcatDir + "webapps/" + warName : 'echo "Not deleted" '),
    'echo "Copy war..."',
    'cp ' + projectDir + targetDir + ' ' + tomcatDir + "webapps",
    'echo "------------------------------------------------------"',
    'echo ".::DONE::."'
];

function initWatch() {
    watcher = chokidar.watch(dirWatch + extWatch, { ignored: /^\./, persistent: true });
    watcher
        .on('add', function (path) { change(path);})
        .on('change', function (path) { change(path); console.log('File', path, 'has been changed'); })
        .on('unlink', function (path) { change(path); console.log('File', path, 'has been removed'); })
        .on('error', function (error) { })
}

function loop(index) {
    nodeCmd.get(arrCmds[index], (err, data, stderr) => {
        // console.log(arrCmds[index]);
        console.log(data);
        time = 500;
        if ((index + 1) < arrCmds.length) {
            // if (arrCmds[index].indexOf('startup.bat') !== -1) {time = 1000;}
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
    if(reRun && !busy){
        reRun = false;    
        initCmd();    
    }
}, 4000);

function change(path) {
    if (!busy) {
        clearTimeout(handleTimeout);
        handleTimeout = setTimeout(initCmd, 4000);
    }else{
        beeper();
        beeper();
        reRun = true;
    }
}
function initCmd(){
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

    var arrTomct = [
        'echo "------------------------------------------------------"',
        'echo "Init server" ',
        tomcatDir + 'bin/startup.bat jpda start',
    ];
    runCmf(arrTomct);
}
function killTomcat() {
    var arrKillTomcat = [
        'echo "------------------------------------------------------"',
        'echo "Kill 8080"',
        'FOR /F "tokens=5 delims= " %P IN (' + "'" + 'netstat -a -n -o ^| findstr : 8080' + "'" + ') DO TaskKill.exe /PID %P /T /F',
    ];
    runCmf(arrKillTomcat);
}

initTomcat();
initWatch();
