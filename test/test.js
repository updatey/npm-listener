const proxyquire = require('proxyquire');
const assert = require('assert');
const {EventEmitter} = require('events');
const fakeChange = require('./fixtures/change.json');
const fakeGet = require('./fixtures/get.json');

class PubSubMock extends EventEmitter {
  topic (name) {
    const self = this;
    return {
      publisher: () => {
        return {
          publish: buffer => {
            self.emit('publish', {
              name,
              buffer
            });
          }
        };
      }
    };
  }
}

class FeedMock extends EventEmitter {
  follow () {
    this.emit('follow');
  }
}

class FakeDB extends EventEmitter {
  follow (opts) {
    return fakeFeed;
  }
  get (id) {
    return Promise.resolve(fakeGet);
  }
}

const fakeFeed = new FeedMock();
const fakeDB = new FakeDB();
const nanoMock = url => fakeDB;

const listener = proxyquire('../src/index.js', {
  '@google-cloud/pubsub': PubSubMock,
  'nano': nanoMock
});

it('should publish the right message', done => {
  const expectedResponse = JSON.stringify({
    name: 'runitwhenimdead',
    latest: '1.0.1'
  });
  listener.pubsub.on('publish', data => {
    assert.equal(data.name, 'npm-events');
    assert.equal(data.buffer, expectedResponse);
    done();
  });
  fakeFeed.emit('change', fakeChange);
});
