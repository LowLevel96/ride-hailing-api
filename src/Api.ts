import { createServer, Server, plugins, Request, Response, Next, RequestHandler, RequestHandlerType } from 'restify';
import corsMiddleware = require('restify-cors-middleware');
import StatsController from './controllers/StatsController';
import RegistrationController from './controllers/RegistrationController';
import PersonalDetailsController from './controllers/PersonalDetailsController';
import { isAuthenticated, IRequestWithAuthentication, generateSignedToken } from './lib/auth';
import * as passport from 'passport';
import AccountController from './controllers/AccountController';

export default class Api {

  public server: Server;
  constructor() {
    this.server = createServer();
    this.config();
  }

  private config(): void {

    const statsController = new StatsController();
    const registrationController = new RegistrationController();
    const personalDetailsController = new PersonalDetailsController();
    const accountController = new AccountController();

    const cors = corsMiddleware({
      origins: ['*'],
      allowHeaders: ['Content-Type'],
      exposeHeaders: ['Content-Type'],
    });

    this.server.pre(cors.preflight);
    this.server.use(cors.actual);

    // const passportInit: RequestHandlerType = passport.initialize() as any;
    this.server.use(passport.initialize() as any);

    this.server.use(plugins.queryParser());
    this.server.use(plugins.bodyParser());
    this.server.get('/', statsController.getInfo);
    this.server.get('/health', statsController.getInfo);
    this.server.post('/sms', registrationController.sendSMS.bind(registrationController));
    this.server.get('/verify-code', registrationController.verifyCode.bind(registrationController));
    this.server.put('/update-personal-details', isAuthenticated, personalDetailsController.update);
    this.server.post('/driver-details', registrationController.insertDriverDetails.bind(registrationController));
    this.server.post('/driver-sign-in', accountController.authenticateDriver.bind(accountController));
  }
}
