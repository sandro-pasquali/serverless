const ApiBuilder = require('claudia-api-builder');
const fs = require('fs');
const api = new ApiBuilder();

module.exports = api;

api.get('/hello', () => {
  return fs.readFileSync(`./views/ui.html`, {encoding: 'utf8'});
}, { success: { contentType: 'text/html' }});

api.post(`/rbo`, (req) => {
    return new Promise((resolve, reject) => {
        lambda.invoke({
            FunctionName: 'rbo',
            Payload: JSON.stringify(req.body)
        }, (error, data) => error ? reject(error) : resolve(data.Payload));
    })
})