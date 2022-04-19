const rot13Cipher = require("rot13-cipher");
const fs = require("fs");

let submitFlag = (flag, tasks, moduleNumber) => {
    let result = {msg: "Flaga nieprawidłowa!", success: false};
    let finishedTasks = 0;
    for (let task of tasks) {
        if (task.flag === rot13Cipher(flag)) {
            if (task.finished) {
                result.msg = "Już zdobyłeś tą flagę!";
            } else {
                result.msg = `Gratulujemy! Rozwiązałeś zadanie ${task.taskName}`;
                result.success = true;
                task.finished = true;
            }
        }
        if (task.finished) finishedTasks++;
    }
    let progress = Math.floor(100*finishedTasks / tasks.length);
    if (result.success) {
        fs.writeFileSync(`./data/${moduleNumber}/tasks.json`, JSON.stringify(tasks));
        let progressData = JSON.parse(fs.readFileSync('./data/progressData').toString());
        progressData[parseInt(moduleNumber)-1].progress = progress;
        fs.writeFileSync('./data/progressData', JSON.stringify(progressData));
    }
    return result;
}

let clearTasks = (moduleNumber) => {
    let tasks = JSON.parse(fs.readFileSync(`./data/${moduleNumber}/tasks.json`).toString());
    for (let task of tasks) {
        task.finished = false;
    }
    fs.writeFileSync(`./data/${moduleNumber}/tasks.json`, JSON.stringify(tasks));
}

let taskHandlerRouter = (router, moduleNumber) => {
    // Files handling
    router.post('/clearTask', function (req, res) {
        try {
            let progressData = JSON.parse(fs.readFileSync('./data/progressData').toString());
            progressData[parseInt(moduleNumber)-1].progress = 0;
            // Clear progress of a topic
            fs.writeFileSync('./data/progressData', JSON.stringify(progressData));
            // Clear submitted flags
            clearTasks(moduleNumber)
            res.send({result: {msg: `Pomyślnie wyczyszczono postęp modułu ${moduleNumber}!`, success: true}})
        } catch (e) {
            res.send({result: {msg: `Wystąpił problem z czyszczeniem postępu modułu ${moduleNumber}!`, success: false}})
        }
    })
    router.post('/submitTask', function (req, res) {
        if (req.body && req.body.flag) {
            try {
                let tasks = JSON.parse(fs.readFileSync(`./data/${moduleNumber}/tasks.json`).toString());
                let result = submitFlag(req.body.flag, tasks, moduleNumber);
                res.send({result: result});
            } catch (e) {
                res.send({result: {msg: `Wystąpił problem z wysyłaniem flagi modułu ${moduleNumber}!`, success: false}})
            }
        } else {
            res.send({result: {msg: "Wystąpił problem z przetworzeniem twojego zapytania!", success: false}})
        }
    })
}


module.exports = { taskHandlerRouter, submitFlag, clearTasks }