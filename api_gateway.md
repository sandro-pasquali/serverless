![InRhythm](./images/inrhythm_logo_big.png)

# Adding APIGateway

We're going to create a lambda function that looks and works much like an `Express` application, the famous `Node` server/middleware construction kit. We'll use this to create an RBO (Rank-Biased-Overlap) tool to demonstrate a little mobile app build using lambdas.


Create a new folder `selector`, `npm init` as usual, and then install a new dependency: `npm install claudia-api-builder`. 

`claudia-api-builder` is the magic wand that makes creating an API easy. Just watch: create a `lambda.js` file with the following code:

```
const ApiBuilder = require('claudia-api-builder');
const api = new ApiBuilder();

module.exports = api;

api.get('/hello', function () {
  return 'Under Construction';
});
```

Now run the following:

```
claudia create --profile claudia --region us-east-1 --api-module lambda
```

To enable `APIGateway` support we've added the `--api-module` argument. Additionally, instead of setting a `--handler` we simply identify the file containing our function, minus the `.js` -- `lambda`

You'll get back something like this:

```
{
  "lambda": {
    "role": "selector-executor",
    "name": "selector",
    "region": "us-east-1"
  },
  "api": {
    "id": "y5l82ppmq2",
    "module": "lambda",
    "url": "https://y5l82ppmq2.execute-api.us-east-1.amazonaws.com/latest"
  }
}
```

The `url` is what we need. Go ahead and copy that into a browser. Didn't work right? Good! Remember that, a la `Express` we created a `/hello` route -- so add that to the end of the `url` and try again. Boom. Your API is live, autoscaled, and as easy to update as any other lambda function.

Of course, just like with `Express` you can build this API out with as many `POST`, `GET` and so forth routes as you'd like. Serverless blog. Serverless landing page. Serverless Stripe transactions. Let your mind wander.

Now let's make a real interface. 

# The Select(e)r

Since we want a more advanced UI here, it's probably not a good idea to hard code an HTML page in a `GET` handler. So we'll create a folder `/views` and store "pages" in there. Go ahead and do that, and change `lambda.js` to the following:

```
const ApiBuilder = require('claudia-api-builder');
const fs = require('fs');
const api = new ApiBuilder();

module.exports = api;

api.get('/hello', function () {
  return fs.readFileSync(`./views/ui.html`, {encoding: 'utf8'});
}, { success: { contentType: 'text/html' }});
```

It should be pretty clear what is going on here. We need to fetch a view to return, and set its content type such that this view will render correctly.

Within `/views/ui.html` add your full HTML page(s), rebuild, and boom, you're serving your "site".

