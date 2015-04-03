#!/usr/bin/env node
'use strict';

var http = require('http');
var Q = require('q');
var cheerio = require('cheerio');
var request = require('superagent');
var config = require('config');
var _ = require('underscore');
var s = require('underscore.string')
var envConfig = config.get('environments');
var codeConfig = config.get('code');
var chalk = require('chalk');
var cli = require('cli').enable('version','help');
var domain = "";
var env = "release";
var credential = "";
var project = "";
var group = "";

process.env.INIT_CWD = process.cwd();
cli.parse({
    domain: ['a', 'Target web app','string'],
    env:  ['e', 'Environment, prelease or release','string'],
    credential: ['c', 'Private key of gitlab, check your gitlab account page', 'string'],
    project: ['p','Project name from gitlab','string'],
    group: ['g','Project group from gitlab','string','f2e']
})

cli.main(function(args, options) {

	var targetIp = [];
	domain = options.domain || domain;
	env = options.env || env;
	credential = options.credential || credential;
	project = options.project || project;
	group = options.group || group;
	var i = 0;
	var interval = 0;
	cli.info('Starting to clear cache of ' + domain + ' from project ' + project +' under environment '+ env+ '...');


	request.get(envConfig[env]+'/cat/r/p?domain='+domain).end(function (err, data) {

		if (err) {
			cli.error('Reading ip addresses error, check your web app option.');
			return;
		}


		var $ = cheerio.load(data.text);
		$('.machines tr a').each(function(){

			if($(this).text() === "All"){
				return;
			}
			var ip = $(this).text();
			
			targetIp.push(s(ip).trim().value());
		});


		

		var clearCacheList = [];

		if(targetIp.length <= 0){
			cli.error('NO IP address is detected from CAT, please confirm your app.');
			return;
		}

		interval = 100 / targetIp.length;

		targetIp.forEach(function(val){
			clearCacheList.push(clearCache(val));
		});


		Q.allSettled(clearCacheList).then(function(results){
			setTimeout(function(){
				results.forEach(function(re){
					var state = re.state;
					var reason = re.reason;
					var value = re.value
					
					if(value && value.result && value.result.success){
						//console.log(chalk.bgGreen('[SUCCESS]') + ' ' + chalk.green(reason.ip +' : ' + reason.result.msg));
						cli.ok(value.ip +' : ' + value.result.msg);
					}else{
						cli.error(reason.ip +' : ' + (reason.result.msg || 'unknow error'));
						//console.log(chalk.bgRed('[ERROR]') + ' ' + chalk.red(reason.ip +' : ' + (reason.result.msg || 'unknow error' )));
					}
					
				});
			},0);
			
		});


	});


	var clearCache = function(ip){
		var deferred = Q.defer();

		request.post(codeConfig+"/"+group+"/"+project+"/cache/clear?private_token="+credential)
			.send({ type: env, ip: ip})
			.set('Refer', codeConfig+'/'+group+'/'+project+'/cache?private_token='+credential)
			.set('Accept', 'application/json')
			.end(function(err, data){
				var resultObj = {};
				resultObj.ip = ip;
				i = i + interval;
				cli.progress( i / 100); 
				if(err){
					resultObj.result = {'success': false, 'msg':'Please check your project name and your private key.'};
					deferred.reject(resultObj);
					return;
				}


				if(data.statusCode === 200){
					var rtData = data.text && JSON.parse(data.text);
					resultObj.result = rtData;
					if(rtData.success){
						deferred.resolve(resultObj);				
					}else{
						deferred.reject(resultObj);
					}	
				}else{
					resultObj.result = {'success': false, 'msg':'Please check your project name and your private key.'};
					deferred.reject(resultObj);
				}
				

			});

		return deferred.promise;

	}

})








