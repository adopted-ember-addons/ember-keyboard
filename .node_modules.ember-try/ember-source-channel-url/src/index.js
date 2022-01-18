'use strict';
const fetch = require('node-fetch');

module.exports = async function (channelType) {
  let HOST = process.env.EMBER_SOURCE_CHANNEL_URL_HOST || 'https://s3.amazonaws.com';
  let PATH = 'builds.emberjs.com';

  const response = await fetch(`${HOST}/${PATH}/${channelType}.json`);
  const result = await response.json();

  return `${HOST}/${PATH}${result.assetPath}`;
};
