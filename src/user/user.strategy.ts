import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../user/user.model';

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'access-secret',
};

const jwtStrategy = new JwtStrategy(opts, async (jwtPayload, done) => {
    try {
        const user = await User.findById(jwtPayload.sub);

        if (user) {
            return done(null, user);
        }

        return done(null, false);
    } catch (err) {
        console.error(err);
    }
});

export default passport.use(jwtStrategy);
