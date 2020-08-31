import {Request, Response} from 'express'
import { Redis } from "ioredis";

//This context type must suit the orms.em type.
//This is why we are ensuring the type of 'em" is EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
//Also want to access request and response objects from Express
//Request will have reference to session variable as well.
export type MyContext = {
  req: Request & { session: Express.Session };
  redis: Redis;
  res: Response;
};