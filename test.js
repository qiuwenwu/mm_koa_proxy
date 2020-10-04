const Koa = require('koa');
const {
	proxy, proxyTo, isMatch
} = require('./index.js');
const bodyparser = require('koa-bodyparser');

const app = new Koa();

const options = {
	targets: {
		'/user': {
			// this is option of http-proxy-middleware
			target: 'http://localhost:5000', // target host
			changeOrigin: true, // needed for virtual hosted sites
		},
		'/demo/(.*)': {
			// this is option of http-proxy-middleware
			target: 'http://localhost:5000', // target host
			changeOrigin: true, // needed for virtual hosted sites
			header: {
				"apikey": "123456"
			}
		},
		'/user/:id': {
			target: 'http://localhost:3001',
			changeOrigin: true,
		},
		// (.*) means anything
		'/api/(.*)': {
			target: 'http://10.94.123.123:1234',
			changeOrigin: true,
			pathRewrite: {
				'/passager/xx': '/mPassenger/ee', // rewrite path
			}
		}
	}
}

// app.use(proxy(options));

app.use(proxy(options,function(op, ctx, next){
	console.log(op)
	if(op.target == 'http://localhost:5000'){
		console.log('添加oauth权限验证');
		ctx.request.header['token'] = "123456";
	}
}));

app.use(bodyparser({
	enableTypes: ['json', 'form', 'text'],
}));

// app.use(async(ctx, next) => {
// 	if(ctx.path.indexOf('/demo') !== -1){
// 		ctx.body = proxyTo('http://localhost:5000', ctx);
// 	}
// 	await next();
// });


// app.use(async(ctx, next) => {
// 	if(isMatch("/demo/(.*)", ctx.path)){
// 		ctx.body = proxyTo({
// 			target: 'http://localhost:5000',
// 			// needed for virtual hosted sites
// 			changeOrigin: true
// 		}, ctx);
// 	}
// 	await next();
// });

app.listen('3000', '0.0.0.0', () => {
	console.log('启动完成');
});