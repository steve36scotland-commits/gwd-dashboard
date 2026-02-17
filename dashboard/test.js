const assert = require('assert');
const http = require('http');

describe('Dashboard Tests', () => {
    it('should respond with 200 status for the root endpoint', (done) => {
        http.get('http://localhost:3000', (res) => {
            assert.strictEqual(res.statusCode, 200);
            done();
        });
    });
});