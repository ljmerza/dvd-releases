"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql = require("mysql2/promise");
const logging_1 = require("../logging");
const connect = () => __awaiter(this, void 0, void 0, function* () {
    try {
        return yield mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        });
    }
    catch (error) {
        yield logging_1.logError(`DB::connect ${error}`);
    }
});
const close = (connection) => __awaiter(this, void 0, void 0, function* () {
    try {
        yield connection.close();
    }
    catch (error) {
        yield logging_1.logError(`DB::close ${error}`);
    }
});
exports.saveMovieOrUpdateMovie = (movie) => __awaiter(this, void 0, void 0, function* () {
    try {
        const connection = yield connect();
        const [dbResult] = yield connection.execute('SELECT id FROM `movies` WHERE name = ?', [movie.name]);
        if (dbResult.length === 0) {
            logging_1.logInfo(`saving ${movie.name} ${movie.dvdRelease} ${movie.digitalRelease}`);
            yield exports.saveMovie(movie);
        }
        else {
            logging_1.logInfo(`updating ${movie.name} ${movie.dvdRelease} ${movie.digitalRelease}`);
            yield exports.updateMovie(movie);
        }
        yield close(connection);
    }
    catch (error) {
        yield logging_1.logError(`DB::saveMovie ${error}`);
    }
});
exports.saveMovie = (movie) => __awaiter(this, void 0, void 0, function* () {
    const connection = yield connect();
    yield connection.execute('INSERT INTO `movies` (name, dvd_release, digital_release) VALUES(?, ?, ?)', [movie.name, movie.dvdRelease, movie.digitalRelease]);
    yield close(connection);
});
exports.updateMovie = (movie) => __awaiter(this, void 0, void 0, function* () {
    const connection = yield connect();
    yield connection.execute('UPDATE `movies` SET dvd_release = ?, digital_release = ? WHERE name = ?', [movie.dvdRelease, movie.digitalRelease, movie.name]);
    yield close(connection);
});
