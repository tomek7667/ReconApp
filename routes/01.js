const express = require('express');
const fs = require('fs');
const rot13Cipher = require('rot13-cipher');
let router = express.Router();
let defaultResult = {msg: false, success: true};

router.get('/', function(req, res, next) {
  res.render('01', {result: defaultResult});
});


// Challenge handling
router.get('/notepad', function (req, res) {
  let notes = fs.readFileSync("./data/01/notes.txt").toString().replaceAll("\r", "").split("\n");
  let flag = false;
  for (let note of notes) {
    if (note.includes("<script>") && note.includes("</script>") && !JSON.parse(fs.readFileSync("./data/01/tasks.json").toString())[1].finished) {
      flag = rot13Cipher(JSON.parse(fs.readFileSync("./data/01/tasks.json").toString())[1].flag);
    }
  }

  if (notes.length > 1 && !JSON.parse(fs.readFileSync("./data/01/tasks.json").toString())[0].finished) {
    flag = rot13Cipher(JSON.parse(fs.readFileSync("./data/01/tasks.json").toString())[0].flag);
  }
  if (req.cookies && !req.cookies.pageSeen) {
    res.cookie("pageSeen", true);
    res.render('01/notepad.ejs', {result: {msg: "Witaj w moim prywatnym notatniku!", success: true, notes: notes, flag: flag}});
  } else {
    res.render('01/notepad.ejs', {result: {msg: false, success: true, notes: notes, flag: flag}});
  }
});

router.post('/addNote', function (req, res) {
  if (req.body && req.body.note) {
    let escaped = req.body.note.replaceAll("<script>", "").replaceAll("</script>", "");
    fs.appendFileSync("./data/01/notes.txt", escaped+"\n");
    res.send({result: {msg: false, success: true, reload: true}});
  }
})


// Files handling
router.post('/clearTask', function (req, res) {
    try {
      let progressData = JSON.parse(fs.readFileSync('./data/progressData').toString());
      progressData[0].progress = 0;
      // Clear challenge files
      fs.writeFile('./data/01/notes.txt', '', ()=>{});
      // Clear progress of a topic
      fs.writeFileSync('./data/progressData', JSON.stringify(progressData));
      // Clear submitted flags
      clearTasks();
      res.send({result: {msg: "Pomyślnie wyczyszczono postęp modułu 01!", success: true}})
    } catch (e) {
      res.send({result: {msg: "Wystąpił problem z czyszczeniem postępu modułu 01!", success: false}})
    }
})

router.post('/submitTask', function (req, res) {
  if (req.body && req.body.flag) {
    let tasks = JSON.parse(fs.readFileSync('./data/01/tasks.json').toString());
    let result = submitFlag(req.body.flag, tasks);
    res.send({result: result});
  } else {
    res.send({result: {msg: "Wystąpił problem z przetworzeniem twojego zapytania!", success: false}})
  }
})

let clearTasks = () => {
  let tasks = JSON.parse(fs.readFileSync('./data/01/tasks.json').toString());
  for (let task of tasks) {
    task.finished = false;
  }
  fs.writeFileSync('./data/01/tasks.json', JSON.stringify(tasks));
}

let submitFlag = (flag, tasks) => {
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
    fs.writeFileSync('./data/01/tasks.json', JSON.stringify(tasks));
    let progressData = JSON.parse(fs.readFileSync('./data/progressData').toString());
    progressData[0].progress = progress;
    fs.writeFileSync('./data/progressData', JSON.stringify(progressData));
  }
  return result;
}

module.exports = router;
