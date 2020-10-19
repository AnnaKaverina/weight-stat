process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
//const Mail = require('nodemailer/lib/mailer');
const express = require('express'),
    bodyParser = require('body-parser'),
    nodemailer = require('nodemailer'),
    fs = require('fs'),
    port = 4000;

const app = express();

app.use(express.static(__dirname));
app.use(bodyParser.text());

app.get("/", function(request, response) {
    response.sendFile(__dirname + "/index.html");
});

//обработка запроса из формы регистрации

app.post("/", function(request, response) {
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
    response.sendFile(__dirname + "/account.html");

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
    fs.writeFileSync(file, JSON.stringify(arr), function(error) {
        if(error) {
            throw error;
        }
    });
}

//обработка запроса информации о пользователе по id

app.post('/account', function(request, response) {
    const id = request.body;
    const arrBase = JSON.parse(fs.readFileSync('base.txt', 'utf8', (error) => {
        console.log(error);
    }));
    const user = searchId(id, arrBase);
    let arrWeight,
        userWeight,
        userDate,
        weightDifference,
        dateDifference;
    const stats = fs.statSync(`stat/stat${id}.txt`, function(error) {
        if(error) {
            console.log(error);
            userWeight = null;
            userDate = null;
        }
    });
    if(stats.size == 0) {
        userWeight = null;
        userDate = null;
    } else {
        arrWeight = JSON.parse(fs.readFileSync(`stat/stat${id}.txt`, 'utf8', function(error) {
            if(error) {
                console.log(error);
            }
        }));
        userWeight = arrWeight[arrWeight.length-1].weight;
        userDate = arrWeight[arrWeight.length-1].date;

        if(arrWeight[arrWeight.length-2]) {
            weightDifference = userWeight - arrWeight[arrWeight.length-2].weight;
            const dateDifferenceMilliseconds = Date.parse(userDate) - Date.parse(arrWeight[arrWeight.length-2].date);
            dateDifference = dateDifferenceMilliseconds/(1000*60*60*24);
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
    const stats = fs.statSync(file, function(error) {
        if(error) {
            console.log(error);
            const arr = [obj];
            fs.writeFileSync(file, JSON.stringify(arr), function(error) {
                if(error) {
                    throw error;
                }
            });
            return;
        }
    });
    if(stats.size == 0) {
        const arr = [obj];
        fs.writeFileSync(file, JSON.stringify(arr), function(error) {
            if(error) {
                throw error;
            }
        });
        return;
    } else {
        const arr = JSON.parse(fs.readFileSync(file, 'utf8', function(error) {
            if(error) throw error;
        }));
        arr.push(obj);
        fs.writeFileSync(file, JSON.stringify(arr), function(error) {
            if(error) {
                throw error;
            }
        });
    }
    
}

//функция чтения массива из файла

function readArr(file) {
    let arr;
    const stats = fs.statSync(file, function(error) {
        if(error) {
            console.log(error);
        }
    });
    if(stats.size == 0) {
        throw new Error('Файл пустой.');
    } else {
        arr = JSON.parse(fs.readFileSync(file, 'utf8', function(error) {
            if(error) {
                console.log(error);
            }
        }));
        return arr;
    }
}

//обработка данных из стартовой формы

app.post('/start', function(request, response) {
    const userData = JSON.parse(request.body),
        id = userData.id,
        height = userData.height;
    const arr = JSON.parse(fs.readFileSync('base.txt', 'utf8', (error) => {
        console.log(error);
    }));
    //добавление значения роста в информацию о пользователе
    addInfo(arr, id, 'height', height, 'base.txt');

    //создание объекта со статистикой изменения веса пользователя
    const weightData = {};
    weightData.weight = userData.weight;
    weightData.date = getNewDate();
    
    //запись объекта в массив
    writeToArr(`stat/stat${id}.txt`, weightData);
});

//обработка данных из ежедневной формы

app.post('/update', function(request, response) {
    const formData = JSON.parse(request.body);
    const weightUpdate = {};
    const id = formData.id;
    weightUpdate.weight = formData.weight;
    weightUpdate.date = getNewDate();
    writeToArr(`stat/stat${id}.txt`, weightUpdate);
});

//обработка запроса данных для графика

app.post('/chart', function(request, response) {
    const id = request.body;
    const statArr = readArr(`stat/stat${id}.txt`);
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