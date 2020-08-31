import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import {Request, Response} from 'express'

//This context type must suit the orms.em type.
//This is why we are ensuring the type of 'em" is EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
//Also want to access request and response objects from Express
//Request will have reference to session variable as well.
export type MyContext = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
  req: Request & { session: Express.Session };
  res: Response;
};