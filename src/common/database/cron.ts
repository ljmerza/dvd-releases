import * as mysql from 'mysql2/promise';
import { logError } from '../logging';


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

export const saveMovieIfUndef = async movie => {
    try {
        const connection = await connect();

        const [dbResult] = await connection.execute(
            'SELECT id FROM `movies` WHERE name = ? AND dvd_release = ? AND digital_release = ?',
            [movie.name, movie.dvdRelease, movie.digitalRelease]
        );
        if (dbResult.length !== 0) return;

        await connection.execute(
            'INSERT INTO `movies` (name, dvd_release, digital_release) VALUES(?, ?, ?)',
            [movie.name, movie.dvdRelease, movie.digitalRelease]
        );
        await close(connection);
    } catch(error){
        await logError(`DB::saveMovie ${error}`);
    }
}