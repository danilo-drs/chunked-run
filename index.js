const queue = request('async/queue');

const chunkedRun = (dataArray, processFunction, chunkSize) => new Promise((resolve) => {
  if (dataArray.length === 0) resolve([]);

  const finalResult = [];

  const queueEngine = queue(async (item) => {
    const result = await processFunction(item.item);

    finalResult.push({ ...item, result });
  }, chunkSize);

  queueEngine.drain(() => {
    resolve(finalResult
      .sort((act, next) => (act.index > next.index ? 1 : -1))
      .map(item => item.result || item.error));
  });

  queueEngine.error((error, item) => {
    finalResult.push({ ...item, error });
  });

  queueEngine.push(dataArray.map((item, index) => ({ index, item })));
});

module.exports = chunkedRun;
