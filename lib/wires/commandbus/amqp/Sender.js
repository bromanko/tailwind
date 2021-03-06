'use strict';

const hase = require('hase');

class Sender {
  constructor ({ url, application }) {
    if (!url) {
      throw new Error('Url is missing.');
    }
    if (!application) {
      throw new Error('Application is missing.');
    }

    this.url = url;
    this.application = application;
  }

  async link (app, incoming, outgoing) {
    if (!app) {
      throw new Error('App is missing.');
    }
    if (!incoming) {
      throw new Error('Incoming is missing.');
    }
    if (!outgoing) {
      throw new Error('Outgoing is missing.');
    }

    const logger = app.services.getLogger();

    let mq;

    try {
      mq = await hase.connect(this.url);
    } catch (ex) {
      return outgoing.emit('error', ex);
    }

    mq.on('error', err => {
      outgoing.emit('error', err);
    });

    mq.on('disconnect', () => {
      outgoing.emit('disconnect');
    });

    let writeStream;

    try {
      writeStream = await mq.worker(`${this.application}::commands`).createWriteStream();
    } catch (ex) {
      return incoming.emit('error', ex);
    }

    logger.debug('Started commandbus (sender) endpoint.', {
      url: this.url, application: this.application
    });

    outgoing.on('data', command => {
      writeStream.write(command);
    });
  }
}

module.exports = Sender;
