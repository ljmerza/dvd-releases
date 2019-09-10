import * as mysql from 'mysql2/promise';
import { logError, logInfo } from '../logging';

const connect = async () => {
    try {
        return await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        });
    } catch (error) {
        await logError(`DB::connect ${error}`);
    }
}

const close = async connection => {
    try {
        await connection.close();
    } catch (error) {
        await logError(`DB::close ${error}`);
    }
}

export const saveMovieOrUpdateMovie = async movie => {
    try {
        const connection = await connect();
        const [dbResult] = await connection.execute('SELECT id FROM `movies` WHERE name = ?', [movie.name]);

        if (dbResult.length === 0){
            logInfo(`saving ${movie.name} ${movie.dvdRelease} ${movie.digitalRelease}`);
            await saveMovie(movie);
        } else {
            logInfo(`updating ${movie.name} ${movie.dvdRelease} ${movie.digitalRelease}`);
            await updateMovie(movie);
        }
        
        await close(connection);

    } catch(error){
        await logError(`DB::saveMovie ${error}`);
    }
}

export const saveMovie = async movie => {
    const connection = await connect();
    await connection.execute(
        'INSERT INTO `movies` (name, dvd_release, digital_release) VALUES(?, ?, ?)',
        [movie.name, movie.dvdRelease, movie.digitalRelease]
    );
    await close(connection);
}

export const updateMovie = async movie => {
    const connection = await connect();
    await connection.execute(
        'UPDATE `movies` SET dvd_release = ?, digital_release = ? WHERE name = ?',
        [movie.dvdRelease, movie.digitalRelease, movie.name]
    );
    await close(connection);
}