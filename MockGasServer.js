const Koa = require('koa');
const app = new Koa();

const FIXTURE_SERVER_HOST = 'localhost';
const FIXTURE_SERVER_PORT = 9009;

class MockGasServer {
  constructor() {
    this._app = new Koa();

    this._app.use(async (ctx) => {
      // Firefox is _super_ strict about needing CORS headers
      ctx.set('Access-Control-Allow-Origin', '*');
      if (ctx.path === '/testGas') {
        ctx.body = {
            SafeGasPrice: '10',
            ProposeGasPrice: '50',
            FastGasPrice: '100',
        };
    }
    });
  }

  async start() {
    const options = {
      host: FIXTURE_SERVER_HOST,
      port: FIXTURE_SERVER_PORT,
      exclusive: true,
    };

    return new Promise((resolve, reject) => {
      this._server = this._app.listen(options);
      this._server.once('error', reject);
      this._server.once('listening', resolve);
    });
  }

  async stop() {
    if (!this._server) {
      return;
    }

    await new Promise((resolve, reject) => {
      this._server.close();
      this._server.once('error', reject);
      this._server.once('close', resolve);
    });
  }
}

app.listen(9009);
module.exports = MockGasServer;