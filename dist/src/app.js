"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const compress_1 = __importDefault(require("@fastify/compress"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const fastify_1 = __importDefault(require("fastify"));
const fastify_type_provider_zod_1 = require("fastify-type-provider-zod");
const jwtCheck_1 = __importDefault(require("./hooks/jwtCheck"));
const routes_1 = __importDefault(require("./routes"));
exports.app = (0, fastify_1.default)({
    logger: {
        serializers: {
            req(req) {
                return {
                    method: req.method,
                    url: req.url,
                    headers: req.headers['x-forwarded-for'],
                    remoteAddress: req.ip,
                };
            },
        },
    },
});
// override console.log to use the configured fastify pino logger
console.log = exports.app.log.info.bind(exports.app.log);
console.error = exports.app.log.error.bind(exports.app.log);
console.warn = exports.app.log.warn.bind(exports.app.log);
console.debug = exports.app.log.debug.bind(exports.app.log);
// TODO: We probably need to restrict origin to front-end and other services?
exports.app.register(cors_1.default, {
    origin: '*',
});
// Add compression to all routes - browsers should be able to handle this fine
exports.app.register(compress_1.default);
// Add helmet to all routes - security headers
exports.app.register(helmet_1.default, 
// Example disables the `contentSecurityPolicy` middleware but keeps the rest.
{ contentSecurityPolicy: false });
// Add schema validator and serializer
exports.app.setValidatorCompiler(fastify_type_provider_zod_1.validatorCompiler);
exports.app.setSerializerCompiler(fastify_type_provider_zod_1.serializerCompiler);
// Optionally pass through raw body for stripe webhook signature validation
exports.app.register(Promise.resolve().then(() => __importStar(require('fastify-raw-body'))), {
    field: 'rawBody',
    global: false,
    encoding: 'utf8',
    runFirst: true,
    routes: [], // array of routes, **`global`** will be ignored, wildcard routes not supported
});
// Authenticated routes
exports.app.register((instance, opts, done) => {
    routes_1.default.authenticated(instance);
    instance.addHook('onRequest', jwtCheck_1.default);
    done();
});
// Unauthenticated routes
exports.app.register((instance, opts, done) => {
    routes_1.default.unauthenticated(instance);
    done();
});
// health check route
exports.app.get('/health', async (req) => {
    req.log.info('Health check');
    return { status: 'ok' };
});
exports.default = exports.app;
