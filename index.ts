import * as http from "http";
import {IncomingMessage, ServerResponse} from "http";
import * as fs from "fs";
import * as p from 'path';
import * as url from 'url';

const server = http.createServer();
const publicDir = p.resolve(__dirname, 'public')
const {URL} = url

server.on('request', (request: IncomingMessage, response: ServerResponse) => {
    const {method, url: path, headers} = request
    const {pathname, search} = new URL(path, `http://${headers.host}`)
    const fileType = {
        'html': 'html',
        'css': 'css',
        'js': 'javascript'
    }
    const exactFileType = fileType[pathname.split('.')[1]]
    response.setHeader('Content-Type', `text/${exactFileType || 'html'}; charset=utf-8`);
        if (method !== 'GET') {
        response.statusCode = 200
        response.end('这是一个假响应')
        return
    }
    let fileName = pathname.substr(1)
    if (fileName === '') {
        fileName = 'index.html'
    }
    fs.readFile(p.resolve(publicDir, fileName), (err, data) => {
        if (err) {
            console.log(err)
            if (err.errno === -2) {
                response.statusCode = 404
                fs.readFile(p.resolve(publicDir, '404.html'), (error, data) => {
                    response.end(data)
                })
            } else {
                response.statusCode = 500
                response.end('服务器繁忙，请稍后再试')
            }
        } else {
            response.setHeader('Cache-Control', 'public, max-age=31536000')
            response.end(data);
        }
    });

    /*switch (pathname) {
        case '/index.html':
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            fs.readFile(p.resolve(publicDir, 'index.html'), (err, data) => {
                if (err) throw err;
                response.end(data.toString());
            });
            break;
        case '/style.css':
            response.setHeader('Content-Type', 'text/css; charset=utf-8');
            fs.readFile(p.resolve(publicDir, 'style.css'), (err, data) => {
                if (err) throw err;
                response.end(data.toString());
            });
            break;
        case '/main.js':
            response.setHeader('Content-Type', 'text/javascript; charset=utf-8');
            fs.readFile(p.resolve(publicDir, 'main.js'), (err, data) => {
                if (err) throw err;
                response.end(data.toString());
            });
            break;
        default:
            response.statusCode = 404;
            response.end();
    }*/
});

server.listen(8888);