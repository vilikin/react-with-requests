import Joi from 'joi-browser';
import hash from 'object-hash';
import _ from 'lodash';

const configSchema = Joi.object({
  request: Joi.func().required(),
  transformError: Joi.func(),
  defaultMapping: Joi.object({
    statusProp: Joi.string(),
    requestProp: Joi.string(),
    executeOnMount: Joi.boolean(),
  }),
});

export default class Request {
  constructor(config = {}, params = []) {
    const { error } = configSchema.validate(config);

    if (error) {
      throw new Error(`Couldn't instantiate Request object with invalid configuration object: ${error}`);
    }

    const requestHash = hash({
      config,
      params,
    });

    this.withParams = (...parameters) => new Request(config, parameters);
    this.execute = () => Promise.resolve(config.request(...params));
    this.equals = otherRequest => this.getHash() === otherRequest.getHash();
    this.getConfig = () => _.cloneDeep(config);
    this.getHash = () => _.clone(requestHash);
  }
}
