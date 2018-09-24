//init
require('dotenv').config();
const express=require("express"),
mysql = require ("mysql"),
bodyParser = require ("body-parser"),
q = require("q");

const app = express();

const queryFilm = "select * from film limit ? offset ?";
const queryFilmById = "select * from film where film_id=?";
const queryBookById = "select * from books where id=?";

//DB_HOST ="localhost"
//DB_PORT = 3306
//DB_USER = root
//DB_PWD = "123456"
//DB_NAME = "sakilla"
//DB_CONLIMIT = 4
var pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME,
    connectionLimit: process.env.DB_CONLIMIT

});

console.log("DB User:", process.env.DB_USER);

var makeQuery = (sql,pool)=>{
    console.log("SQL is:", sql);
    return (args)=>{
        var defer = q.defer();
        pool.getConnection((err, conn)=>{
            if(err){
                defer.reject(err);
                return;
            }
            conn.query(sql, args||[], (err, results)=>{
                conn.release();
                if (err){
                    defer.reject(err);
                    return;
                }
                defer.resolve(results);
                
            })
        });
        return defer.promise;
    }
};

var findAllFilms = makeQuery(queryFilm, pool);
var findFilmById = makeQuery(queryFilmById, pool);
var findBookById = makeQuery(queryBookById, pool);
//router
app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

app.get('/films', (req, res) => {
    const limit = parseInt(req.query.limit) || 1;
    const offset = parseInt(req.query.offset) || 1;
    findAllFilms([limit, offset]).then((results)=>{
        res.json(results);
    }).catch((error)=>{
        console.log("Error in finding films:",error);
        res.status(500).json(error);
    });
    
});

app.get('/films/:filmId', (req, res)=>{
    var filmId = req.params.filmId;
    console.log(filmId);
    findFilmById([filmId]).then((results)=>{
        res.json(results);
    }).catch((error)=>{
        res.status(500).json(error);
    });
});

app.get('/books/:bookId', (req, res)=>{
    var bookId = req.params.bookId;
    console.log(bookId);
    findBookById([bookId]).then((results)=>{
        res.json(results);
    }).catch((error)=>{
        res.status(500).json(error);
    });
});

app.get('/books', (req, res)=>{
    var bookId = req.query.bookId;
    console.log(bookId);
    findBookById([bookId]).then((results)=>{
        res.json(results);
    }).catch((error)=>{
        res.status(500).json(error);
    });
});

//startup
const PORT = parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000;

app.listen(PORT, ()=> {
    console.log(`Listening to port ${PORT}`)
})