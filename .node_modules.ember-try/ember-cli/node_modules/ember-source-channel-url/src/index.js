'use strict';
const got = require('got');

module.exports = async function(channelType) {
  let HOST = process.env.EMBER_SOURCE_CHANNEL_URL_HOST || 'https://s3.amazonaws.com';
  let PATH = 'builds.emberjs.com';

  const result = await got(`${HOST}/${PATH}/${channelType}.json`, { json: true });

  return `${HOST}/${PATH}${result.body.assetPath}`;
};
