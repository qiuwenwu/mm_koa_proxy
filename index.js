const { createProxyMiddleware } = require('http-proxy-middleware');
const k2c = require('koa2-connect');
const { pathToRegexp } = require('path-to-regexp');

/**
 * 代理到制定服务器
 * @param {String} route 路由正则
 * @param {String} path 当前请求的路由路径
 * @return {Boolean} 匹配成功返回true，失败返回false
 */
exports.isMatch = function(route, path){
	return pathToRegexp(route).test(path)
};

/**
 * 代理到制定服务器
 * @param {Object} option 配置参数，可以为字符串类型，输入主机地址host, 例如：http://localhost:3000
 */
exports.proxyTo = async function(option, ctx, next) {
	if (typeof(option) == 'string') {
		option = {
			// target host
			target: option,
			// needed for virtual hosted sites
			changeOrigin: true
		}
	}
	return await k2c(createProxyMiddleware(option))(ctx, next);
};

/**
 * 代理服务
 * @param {Object} option 配置参数
 * @param {Function} func 触发代理时的回调函数
 */
exports.proxy = (options, func) => {
	const {
		targets = {}
	} = options;
	return async function(ctx, next) {
		const {
			path
		} = ctx;
		
		for (const route of Object.keys(targets)) {
			if (pathToRegexp(route).test(path)) {
				var o = targets[route];
				var hd = o.header;
				if(hd){
					for(var k in hd){
						ctx.request.header[k] = hd[k];
					}
				}
				if (func) {
					await func(o, ctx, route);
				}
				await k2c(createProxyMiddleware(o))(ctx, next);
				break;
			}
		};
		await next();
	};
};
