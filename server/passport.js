const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mysql = require('mysql2/promise');

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'secret',
};

module.exports = passport => {
    passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            const connection = await mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'web',
                port: 3306,
            });

            const [rows] = await connection.execute('SELECT * FROM account WHERE id = ?', [jwt_payload.id]);

            if (rows.length > 0) {
                const user = rows[0];
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (error) {
            console.error('MySQL 查詢錯誤：', error);
            return done(error, false);
        }
    }));
}
