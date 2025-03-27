import Cache from 'node-cache';

export const cache = new Cache({ stdTTL: 300, checkperiod: 180 });
export const cacheKey = 'failover-data';
