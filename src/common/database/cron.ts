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

export const saveMovie = async movie => {
    try {
        const connection = await connect();
        await connection.execute(
            'INSERT INTO `movies` (name, dvd_release, digital_release) VALUES(?, ?, ?)',
            [movie.name, movie.dvdRelease, movie.digitalRelease]
        );
        await close(connection);
    } catch(error){
        await logError(`DB::saveMovie ${error}`);
    }
}