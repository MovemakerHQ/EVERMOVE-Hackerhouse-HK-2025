import { Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/entities/user.entity';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private usersService;
    private readonly logger;
    constructor(usersService: UsersService);
    validate(payload: any): Promise<UserDocument>;
}
export {};
