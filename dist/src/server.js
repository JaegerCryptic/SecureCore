"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const app_1 = __importDefault(require("./app"));
const getSigningKeys_1 = require("./utils/getSigningKeys");
const server = app_1.default;
const run = async () => {
    server.log.info('Initialising signing keys');
    await (0, getSigningKeys_1.getSigningKeys)();
    server.log.info('Initialising rate limiting');
    // Add rate limiting to all routes, 100 requests per minute - We can increase this easily if not sufficient
    // It probably won't work if we have multiple instances of the service running, because they don't share the same memory
    // The work around is to use a redis instance to store the rate limit data, we can use aws elasticache for this purpose if needed
    await app_1.default.register(rate_limit_1.default, {
        max: 100,
        timeWindow: '1 minute',
        keyGenerator: function (request) {
            return ((typeof request.headers['x-forwarded-for'] === 'string'
                ? request.headers['x-forwarded-for'].split(',').pop()
                : request.headers['x-forwarded-for']?.pop()) || request.ip); // fallback to default
        },
    });
    // Add rate limiting to 404s, 4 requests per minute - We can increase this easily if not sufficient
    // This is to prevent brute force attacks on our API
    app_1.default.setNotFoundHandler({
        preHandler: app_1.default.rateLimit({
            max: 4,
            timeWindow: '1 minute',
            keyGenerator: function (request) {
                return ((typeof request.headers['x-forwarded-for'] === 'string'
                    ? request.headers['x-forwarded-for'].split(',').pop()
                    : request.headers['x-forwarded-for']?.pop()) || request.ip); // fallback to default
            },
        }),
    }, function (request, reply) {
        reply.code(404).send();
    });
    server.listen({ port: 8080, host: '0.0.0.0' }, (err) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
    });
};
exports.run = run;
(0, exports.run)();
