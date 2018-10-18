const aws = require('aws-sdk');
const lambda = new aws.Lambda({
    region: 'us-east-1'
});

exports.handler = (event, context, callback) => new Promise((resolve, reject) => {
    lambda.invoke({
        FunctionName: 'anotherlambda',
        Payload: JSON.stringify({
            something: "here"
        })
    }, (error, data) => error ? reject(error) : resolve(data.Payload));
});

/*

exports.handler = (event, context) => {
	context.succeed(`Hello world!`);
};

const aws = require('aws-sdk');
const lambda = new aws.Lambda({
    region: 'us-east-1'
});

exports.handler = (event, context, callback) => new Promise((resolve, reject) => {
    lambda.invoke({
        FunctionName: 'anotherlambda',
        Payload: JSON.stringify({
            something: "here"
        })
    }, (error, data) => error ? reject(error) : resolve(data.Payload));
});

 */