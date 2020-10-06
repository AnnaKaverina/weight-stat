process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
//const Mail = require('nodemailer/lib/mailer');
const express = require('express'),
    bodyParser = require('body-parser'),
    nodemailer = require('nodemailer'),
    fs = require('fs'),
    port = 5000;
  
const app = express();

app.use(express.static(__dirname));
app.use(bodyParser.text());

app.get("/", function(request, response) {
    response.sendFile(__dirname + "/index.html");
});

//обработка запроса из формы регистрации

app.post("/", function(request, response) {
    if(!request.body) return response.sendStatus(400);
    const stats = fs.statSync('base.txt', function(error, stats) {
        if(error) throw error;
    });

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

    //отправка письма новому пользователю

    const user = JSON.parse(request.body);
    const output = `
    <h1>Добро пожаловать на сайт WeightStat!</h1>
    <div>Ваш логин - ${user.login}, <br>ваш пароль - ${user.password}.<br> Доступ к вашему личному кабинету открыт.</div>
    `;
        
    async function sendMail () {
        const transporter = nodemailer.createTransport({
            host: 'smtp.mail.ru',
            port: 465,
            secure: true,
            auth: {
                user: 'user',
                pass: 'pass'
            }
        });
    
        await transporter.sendMail({
            from: 'weight-stat@mail.ru',
            to: `${user.email}`,
            subject: 'Подтверждение регистрации на сайте WeightStat',
            text: `Добро пожаловать на сайт WeightStat! `,
            html: output
        });
    }

    sendMail().catch(error => console.log(error));

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