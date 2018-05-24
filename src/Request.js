import Joi from 'joi';
import hash from 'object-hash';
import _ from 'lodash';

const configSchema = Joi.object({
  request: Joi.func().required(),
  cache: Joi.boolean(),
});

export default class Request {
  constructor(config = {}, params = []) {
    Joi.assert(config, configSchema, 'Invalid config');

    const requestHash = hash({
      config,
      params,
    });

    this.withParams = (...parameters) => new Request(config, parameters);
    this.execute = () => Promise.resolve(config.request(...params));
    this.equals = otherRequest => this.getHash() === otherRequest.getHash();
    this.getConfig = () => _.deepClone(config);
    this.getHash = () => _.clone(requestHash);
  }
}
