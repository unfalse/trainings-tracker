import http from 'http';
import {v4} from 'uuid';
import fs from 'fs';

const host = 'localhost';
const port = 8000;
const TRAIN_REPORTS_DIR = process.cwd() + '/train-reports/';

const requestListener = function (request, response) {
    const headers = {
        'Access-Control-Allow-Origin': '*', /* @dev First, read about security */
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
        'Access-Control-Max-Age': 2592000, // 30 days
        'Access-Control-Request-Headers': '*',
        'Access-Control-Allow-Headers': '*',
        /** add other headers as per requirement */
    };
    
    if (request.method === 'OPTIONS') {
        response.writeHead(204, headers);
        response.end();
        return;
    }

    if (request.method == 'POST') {
        console.log('POST')        
        var body = ''
        
        request.on('data', function(data) {
            body += data;
        });
        
        request.on('end', function() {
            const filename = new Intl.DateTimeFormat('ru-RU', {
                dateStyle: 'short',
                timeStyle: 'short',
            }).format(new Date())
            .replaceAll('.','-')
            .replaceAll(', ', '_')
            .replaceAll(':', '-') + '_' + v4() + '.json';

            fs.writeFileSync(
                TRAIN_REPORTS_DIR + filename,
                body,
            );

          response.writeHead(200, { ...headers, 'Content-Type': 'text/html' });
          response.end('post received');
        });
    }
      
    if (request.method === 'GET') {
        console.log('GET');

        const obj = JSON.parse(fs.readFileSync(TRAIN_REPORTS_DIR + '26-11-2023_21-00_9626bc05-5b4a-4a33-9404-c8c6f28519e3.json', 'utf8'));
        console.log(obj.startDate);
        console.log(new Date(obj.startDate).toLocaleString('ru-RU'));

        response.writeHead(200, headers);
        response.end("My first server!");
    }

    if (['GET', 'POST'].indexOf(request.method) === -1) {
        response.writeHead(405, headers);
        response.end(`${request.method} is not allowed for the request.`);
    }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
    console.log(process.cwd());
});