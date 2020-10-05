const express = require("express"),
    bodyParser = require("body-parser"),
    fs = require('fs'),
    port = 5000;
  
const app = express();

app.use(express.static(__dirname));
//app.use(bodyParser.urlencoded({extended: false}));
//app.use(bodyParser.json());
app.use(bodyParser.text());

app.get("/", function(request, response) {
    response.sendFile(__dirname + "/index.html");
});

app.post("/", function(request, response) {
    if(!request.body) return response.sendStatus(400);
    console.log('Сейчас начнется запись в файл');

    const stats = fs.statSync('base.txt', function(error, stats) {
        if(error) throw error;
    });

    console.log(stats.size);

    if(stats.size === 0) {
        const newArr = [request.body];
        fs.writeFile('base.txt', JSON.stringify(newArr), function(error) {
            if(error) throw error;
        });
    } else {
        const oldArr = fs.readFileSync('base.txt', 'utf8', function(error) {
            if(error) throw error;
        });
    
        const newArr = [...JSON.parse(oldArr), request.body];
    
        fs.writeFileSync('base.txt', JSON.stringify(newArr), function(error) {
            if(error) {
                throw error;
            }
        });
    }
    console.log('Запись завершена');
});

//обработка запроса наличия логина
app.post('/check', function(request, response) {
    const arr = JSON.parse(fs.readFileSync('base.txt', 'utf8', function(error) {
        if(error) throw error;
    }));
    const check = arr.some(function(elem) {
        const login = JSON.parse(elem).login;
        return login == request.body;
    });
    console.log('Сейчас будет отправлен ответ от сервера по проверке логина');
    response.send(check);
});

app.listen(port);