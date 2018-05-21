import Joi from 'joi';
import hash from 'object-hash';

const configSchema = Joi.object({
  request: Joi.func().required(),
});

export default class Request {
  constructor(config = {}, params = []) {
    Joi.assert(config, configSchema, 'Invalid config');

    this._requestHash = hash({
      config,
      params,
    });

    this.withParams = (...parameters) => new Request(config, parameters);
    this.execute = () => Promise.resolve(config.request(...params));
    this.equals = otherRequest => this._requestHash === otherRequest._requestHash;
  }
}
