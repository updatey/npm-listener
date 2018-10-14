const PubSub = require('@google-cloud/pubsub');
const pubsub = new PubSub();
const topic = pubsub.topic('npm-events');
const ps = topic.publisher();

const nano = require('nano');
const db = nano('https://skimdb.npmjs.com/registry');
const feed = db.follow({since: 'now'});
feed.on('change', async change => {
  try {
    console.log(change);
    const d = await db.get(change.id);
    if (!d['dist-tags']) {
      return;
    }
    const {latest} = d['dist-tags'];
    if (!latest) {
      return;
    }
    const message = {
      name: d.name,
      latest
    };
    await ps.publish(
      Buffer.from(
        JSON.stringify(message)
      )
    );
  } catch (e) {
    console.error(e);
  }
});
feed.follow();

// export pubsub for testing purposes
exports.pubsub = pubsub;
