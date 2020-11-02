process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
const express = require('express'),
    bodyParser = require('body-parser'),
    nodemailer = require('nodemailer'),
    fs = require('fs'),
    path = require('path'),
    port = 8000;

console.log(`listening port ${port}...`);

const app = express();

app.use(express.static(path.join(__dirname, '../../')));
app.use(bodyParser.text());

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, '../pages/index.html'));
});

const baseFile = path.join(__dirname, '../stat/base.txt');

//отправка письма новому пользователю
    
async function sendMail (user) {
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
        html: `
            <h1>Добро пожаловать на сайт WeightStat!</h1>
            <br>
            <div>Ваш логин - ${user.login}, <br>ваш пароль - ${user.password}.<br><br> Доступ к вашему личному кабинету открыт.</div>
            <br>
            <div>По вопросам техподдержки пишите нам на почту.</div>
            `
    });
}

//обработка запроса из формы регистрации

app.post('/reg', function(request, response) {
    const user = JSON.parse(request.body);
    if(!fs.existsSync(path.dirname(baseFile))) {
        fs.mkdirSync(path.dirname(baseFile));
    }
    if(!fs.existsSync(baseFile)){
        user.id = 1;
        try {
            fs.writeFileSync(baseFile, JSON.stringify([user]));
        } catch(error) {
            console.log(error);
        }
        sendMail(user).catch(error => console.log(error));
        response.sendStatus(200);
        return;
    }
    const stats = fs.statSync(baseFile, function(error) {
        if(error) {
            console.log(error);
        }
    });
    if(stats.size) {
        let oldArr;
        try {
            oldArr = JSON.parse(fs.readFileSync(baseFile, 'utf8'));
        } catch(error) {
            console.log(error);
        }
        
        const id = oldArr[oldArr.length-1].id + 1;
        user.id = id;
        const newArr = [...oldArr, user];
        try {
            fs.writeFileSync(baseFile, JSON.stringify(newArr));
        } catch(error) {
            console.log(error);
        }
    } else {
        user.id = 1;
        try {
            fs.writeFileSync(baseFile, JSON.stringify([user]));
        } catch(error) {
            console.log(error);
        }
    }

    sendMail(user).catch(error => console.log(error));
    response.sendStatus(200);
});

//обработка запроса наличия логина

app.post('/check', function(request, response) {
    let check;
    if(!fs.existsSync(baseFile)) {
        check = false;
        response.send(check);
        return;
    }
    const stats = fs.statSync(baseFile, function(error) {
        if(error) {
            console.log(error);
        }
    });
    if(stats.size) {
        let arr;
        try {
            arr = JSON.parse(fs.readFileSync(baseFile, 'utf8'));
        } catch(error) {
            console.log(error);
        }
        
        check = arr.some(function(elem) {
            const login = elem.login;
            return login == request.body;
        });
    } else {
        check = false;
    }
    response.send(check);
});

//обработка запроса из формы авторизации

app.post('/login', function(request, response) {

    if(!fs.existsSync(baseFile)) {
        return response.send('error');
    }

    const checkUser = JSON.parse(request.body);
    
    const stats = fs.statSync(baseFile, function(error) {
        if(error) {
            console.log(error);
        }
    });

    if(stats.size == 0) {
        return response.send('error');
    }

    let arr;
    try {
        arr = JSON.parse(fs.readFileSync(baseFile, 'utf8'));
    } catch(error) {
        console.log(error);
    }
    
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
    }
    return response.send(check);
});

app.get('/account', function(request, response) {
    response.sendFile(path.join(__dirname, '../pages/account.html'));

});

//функция поиска пользователя по id

function searchId(userId, arr) {
    let user;
    for(let i = 0; i < arr.length; i++) {
        if(arr[i].id == userId) {
            user = arr[i];
        }
    }
    return user;
}

//функция добавления информации о пользователе

function addInfo(arr, userId, key, value, file) {
    for(let i = 0; i < arr.length; i++) {
        if(arr[i].id == userId) {
            arr[i][key] = value;
        }
    }
    try {
        fs.writeFileSync(file, JSON.stringify(arr));
    } catch(error) {
        console.log(error);
    }
}

//обработка запроса информации о пользователе по id

app.post('/account', function(request, response) {
    const id = request.body;

    const statFile = path.join(__dirname, `../stat/stat${id}.txt`);

    if(!fs.existsSync(baseFile)) {
        return;
    }

    let arrBase;
    try {
        arrBase = JSON.parse(fs.readFileSync(baseFile, 'utf8'));
    } catch(error) {
        console.log(error);
    }
    
    const user = searchId(id, arrBase);

    if(!fs.existsSync(statFile)) {
        response.send(user);
        return;
    }

    let arrWeight,
        userWeight,
        userDate,
        weightDifference,
        dateDifference;
    
    const stats = fs.statSync(statFile, function(error) {
        if(error) {
            console.log(error);
        }
    });
    if(stats.size) {
        try {
            arrWeight = JSON.parse(fs.readFileSync(statFile, 'utf8'));
        } catch(error) {
            console.log(error);
        }
        
        userWeight = arrWeight[arrWeight.length-1].weight;
        userDate = arrWeight[arrWeight.length-1].date;

        for (let i = 0; i < arrWeight.length; i++) {
            if((arrWeight[arrWeight.length-2-i])&&((userWeight - arrWeight[arrWeight.length-2].weight) != 0)) {
                weightDifference = userWeight - arrWeight[arrWeight.length-2-i].weight;
                const dateDifferenceMilliseconds = Date.parse(userDate) - Date.parse(arrWeight[arrWeight.length-2-i].date);
                dateDifference = Math.round(dateDifferenceMilliseconds/(1000*60*60*24));
            }
        }
    }
    
    user.weight = userWeight;
    user.date = userDate;
    user.weightDifference = weightDifference;
    user.dateDifference = dateDifference;

    response.send(user);
});

//функция получения сегодняшней даты

function getNewDate() {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
}

//функция записи объекта в массив

function writeToArr(file, obj) {
    if(!fs.existsSync(path.dirname(file))) {
        fs.mkdirSync(path.dirname(file));
    }
    if(!fs.existsSync(file)) {
        const arr = [obj];
        try {
            fs.writeFileSync(file, JSON.stringify(arr));
        } catch(error) {
            console.log(error);
        }
        return;
    }
    const stats = fs.statSync(file, function(error) {
        if(error) {
            console.log(error);
        }
    });
    if(stats.size == 0) {
        const arr = [obj];
        try {
            fs.writeFileSync(file, JSON.stringify(arr));
        } catch(error) {
            console.log(error);
        }
        return;
    } else {
        let arr;
        try {
            arr = JSON.parse(fs.readFileSync(file, 'utf8'));
        } catch(error) {
            console.log(error);
        }
        
        arr.push(obj);
        try {
            fs.writeFileSync(file, JSON.stringify(arr));
        } catch(error) {
            console.log(error);
        }
    }
}

//функция чтения массива из файла

function readArr(file) {
    let arr;
    if(!fs.existsSync(file)) {
        return false;
    }
    const stats = fs.statSync(file, function(error) {
        if(error) {
            console.log(error);
        }
    });
    if(stats.size == 0) {
        return false;
    } else {
        try {
            arr = JSON.parse(fs.readFileSync(file, 'utf8'));
        } catch (error) {
            console.log(error);
        }
        return arr;
    }
}

//обработка данных из стартовой формы

app.post('/start', function(request) {
    const userData = JSON.parse(request.body),
        id = userData.id,
        height = userData.height;
        let arr;
        try {
            arr = JSON.parse(fs.readFileSync(baseFile, 'utf8'));
        } catch (error) {
            console.log(error);
        }
    
    //добавление значения роста в информацию о пользователе
    addInfo(arr, id, 'height', height, baseFile);

    //создание объекта со статистикой изменения веса пользователя
    const weightData = {};
    weightData.weight = userData.weight;
    weightData.date = getNewDate();
    
    //запись объекта в массив
    writeToArr(path.join(__dirname, `../stat/stat${id}.txt`), weightData);
});

//обработка данных из ежедневной формы

app.post('/update', function(request, response) {
    const formData = JSON.parse(request.body);
    const weightUpdate = {};
    const id = formData.id;
    weightUpdate.weight = formData.weight;
    weightUpdate.date = getNewDate();
    writeToArr(path.join(__dirname, `../stat/stat${id}.txt`), weightUpdate);
});

//обработка запроса данных для графика

app.post('/chart', function(request, response) {
    const id = request.body;
    const statArr = readArr(path.join(__dirname, `../stat/stat${id}.txt`));
    if(!statArr) {
        response.send('false');
        return;
    }
    const arrDate = [];
    const arrWeight = [];
    statArr.forEach((item) => {
        arrDate.push(item.date);
        arrWeight.push(parseFloat(item.weight));
    });
    const arr = [arrDate, arrWeight];
    response.send(arr);
});

app.listen(port);