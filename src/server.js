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
        const user = JSON.parse(request.body);
        user.id = 1;
        fs.writeFileSync('base.txt', JSON.stringify([user]), function(error) {
            if(error) throw error;
        });
    } else {
        const user = JSON.parse(request.body);
        const oldArr = JSON.parse(fs.readFileSync('base.txt', 'utf8', function(error) {
            if(error) throw error;
        }));
        const id = oldArr[oldArr.length-1].id + 1;
        user.id = id;
        const newArr = [...oldArr, user];
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
                user: '',
                pass: ''
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

    //sendMail().catch(error => console.log(error));

});

//обработка запроса наличия логина

app.post('/check', function(request, response) {
    let check;
    const stats = fs.statSync('base.txt', function(error, stats) {
        if(error) throw error;
    });
    if(stats.size == 0) {
        check = false;
    } else {
        const arr = JSON.parse(fs.readFileSync('base.txt', 'utf8', function(error) {
            if(error) throw error;
        }));
        check = arr.some(function(elem) {
            const login = elem.login;
            return login == request.body;
        });
    }
    response.send(check);
});

//обработка запроса из формы авторизации

app.post('/login', function(request, response) {
    const checkUser = JSON.parse(request.body);
    const arr = JSON.parse(fs.readFileSync('base.txt', 'utf8', (error) => {
        console.log(error);
    }));
    const check = arr.some(elem => {
        return ((elem.login == checkUser.login)&&(elem.password == checkUser.password));
    });
    if(check) {
        let id;
        for(let i = 0; i < arr.length; i++) {
            if(arr[i].login === checkUser.login) {
                id = arr[i].id;
            }
        }
        return response.send(String(id));
        /* fs.writeFileSync(`temp${user.id}.txt`, JSON.stringify(user), error => {
            console.log(error);
        }); */
    }
    return response.send(check);
});

app.get('/account', function(request, response) {
    console.log('Запрос на странице личного кабинета.');
    response.sendFile(__dirname + "/account.html");

});

app.listen(port);