const redis = require("redis");
const client = redis.createClient();

client.on("error", function (error) {
  console.error(chalk.red(error));
});
async function set(key, value, concat = false) {
  await client.connect();
  if (typeof value === "object" && !concat) {
    value = JSON.stringify(value);
  } else if (value === undefined) {
    console.log("value undefined");
    return;
  }
  if (concat) {
    let list = (JSON.parse(await client.get(key))) || [];
    list.push(value);
    await client.set(key, JSON.stringify(list));
  } else {
    await client.set(key, value);
  }
  await client.disconnect();
}

async function get(key) {
  await client.connect();
  let value = await client.get(key);
  if (typeof value === "string") {
    value = JSON.parse(value);
  }
  await client.disconnect();
  return value;
}

module.exports = {
  get,
  set,
};
