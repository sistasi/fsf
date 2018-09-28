//init
require('dotenv').config();
const express=require("express"),
mysql = require ("mysql"),
cors = require('cors'),
bodyParser = require ("body-parser");

const app = express();
app.use(cors());
const API_URI = "/api";
/************************ CONNECTION TO DB **************/
const queryFilm = "select * from film limit ? offset ?";
const queryFilmById = "select * from film where film_id=?";
const queryFilmByIdWithLimitOffset = "select * from film where film_id=? limit ? offset ?";
const queryFilmWithBothParam = "select * from film where (title like ?) || (description like ?) limit ? offset ?";
const queryFilmByIdCount = "select count(1) as count from film where film_id=?";
const queryFilmCount = "select count(1) as count from film";
const queryFilmWithBothParamCount = "select count(1) as count from film where (title like ?) || (description like ?) ";

var pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME,
    connectionLimit: process.env.DB_CONLIMIT

});

console.log("DB User:", process.env.DB_USER);
console.log("DB User:", process.env.DB_USER);

var makeQueryWithPromise = (sql,pool)=>{
    console.log("SQL is:", sql);
    return (args)=>{
        let queryPromise = new Promise((resolve, reject)=>{
            pool.getConnection((err, conn)=>{ 
                if(err){
                    reject(err);
                    return;
                }
                conn.query(sql, args||[], (err, results)=>{
                    conn.release();
                    if (err){
                        reject(err);
                        return;
                    }
                    resolve(results);
                    
                })
            });
        });
       
        return queryPromise;
    }
};

var findAllFilms = makeQueryWithPromise(queryFilm, pool);
var findFilmsByBothParam = makeQueryWithPromise(queryFilmWithBothParam, pool);
var findFilmById = makeQueryWithPromise(queryFilmById, pool);
var findFilmByIdWithLimitOffset = makeQueryWithPromise(queryFilmByIdWithLimitOffset, pool);
var findAllFilmsCount = makeQueryWithPromise(queryFilmCount, pool);
var findFilmsByBothParamCount = makeQueryWithPromise(queryFilmWithBothParamCount, pool);
var findFilmByIdCount = makeQueryWithPromise(queryFilmByIdCount, pool);
//router
app.use(express.static(__dirname+"/../dist/myproject"));
app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

app.get(API_URI + '/filmsCount', (req, res) => {
    console.log(">>Query param for Count: ", req.query);
    const filmId = req.query.filmId;
    const limit = parseInt(req.query.limit) || 1;
    const offset = typeof(req.query.offset) !== 'undefined' ? parseInt(req.query.offset): 0;
    const keyword = req.query.keyword;
    const selectionType = req.query.selectionType;
    if (typeof(filmId) !== 'undefined' && filmId != ''){
        findFilmByIdWithLimitOffsetCount([filmId]).then((results)=>{
            console.log("findFilmByIdWithLimitOffsetCount:", results);
            res.json(results);
        }).catch((error)=>{
            res.status(500).json(error);
        });
    }
    else if  (typeof(selectionType) !== 'undefined' && typeof(keyword) !== 'undefined' && keyword != ''){
        findFilmsByBothParamCount([selectionType=='title'||selectionType=='both'?'%'+keyword+'%':'', 
        selectionType=='description'||selectionType=='both'?'%'+keyword+'%':''])
        .then((results)=>{
            console.log("findFilmsByBothParamCount:", results);
            res.json(results);
        }).catch((error)=>{
            console.log("Error in finding films:",error);
            res.status(500).json(error);
        });
    }
    else {
        findAllFilmsCount().then((results)=>{
            console.log("findAllFilmsCount:", results);
            res.json(results);
        }).catch((error)=>{
            console.log("Error in finding films:",error);
            res.status(500).json(error);
        });
    }
    
});

app.get(API_URI + '/films', (req, res) => {
    console.log(">>Query param: ", req.query);
    const filmId = req.query.filmId;
    const limit = parseInt(req.query.limit) || 1;
    const offset = typeof(req.query.offset) !== 'undefined' ? parseInt(req.query.offset): 0;
    const keyword = req.query.keyword;
    const selectionType = req.query.selectionType;
    if (typeof(filmId) !== 'undefined' && filmId != ''){
        console.log("findFilmByIdWithLimitOffset");
        findFilmByIdWithLimitOffset([filmId, limit, offset]).then((results)=>{
            res.json(results);
        }).catch((error)=>{
            res.status(500).json(error);
        });
    }
    else if  (typeof(selectionType) !== 'undefined'){
        console.log("findFilmsByBothParam");
        findFilmsByBothParam([selectionType=='title'||selectionType=='both'?'%'+keyword+'%':'', 
        selectionType=='description'||selectionType=='both'?'%'+keyword+'%':'', limit, offset])
        .then((results)=>{
            res.json(results);
        }).catch((error)=>{
            console.log("Error in finding films:",error);
            res.status(500).json(error);
        });
    }
    else {
        console.log("findAllFilms");
        findAllFilms([limit, offset]).then((results)=>{
            res.json(results);
        }).catch((error)=>{
            console.log("Error in finding films:",error);
            res.status(500).json(error);
        });
    }
    
});

app.get(API_URI + '/films/:filmId', (req, res)=>{
    let filmId = req.params.filmId;
    console.log(filmId);
    findFilmById([filmId]).then((results)=>{
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