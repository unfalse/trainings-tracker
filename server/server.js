import http from 'http';
import { v4 } from 'uuid';
import fs from 'fs';

const host = '127.0.0.1';
const port = 8000;
const TRAIN_REPORTS_DIR = process.cwd() + '/train-reports/';

const requestListener = function (request, response) {
    const headers = {
        'Access-Control-Allow-Origin': '*', /* @dev First, read about security */
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
        'Access-Control-Max-Age': 2592000, // 30 days
        'Access-Control-Request-Headers': '*',
        'Access-Control-Allow-Headers': '*',
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
        const parsedURL = new URL(request.url, `http://${request.headers.host}`);
        let output = '';
        console.log(parsedURL);
        console.log('GET');

        if (parsedURL.pathname === '/latest') {
            output = getLatestTrain();
        }

        response.writeHead(200, headers);
        response.end(output);
    }

    if (['GET', 'POST'].indexOf(request.method) === -1) {
        response.writeHead(405, headers);
        response.end(`${request.method} is not allowed for the request.`);
    }
};

const getLatestTrain = () => {
    const trainFilesList = fs.readdirSync(TRAIN_REPORTS_DIR);
    const trainFilesInfoList = trainFilesList.map(trainFile => {
        const trainJSON = JSON.parse(fs.readFileSync(TRAIN_REPORTS_DIR + trainFile, 'utf8'));
        return ({
            fileName: trainFile,
            endDate: new Date(trainJSON.endDate),
        });
    });
    let latestTrain = trainFilesInfoList[0];
    trainFilesInfoList.forEach(trainFileInfo => {
        if (trainFileInfo.endDate > latestTrain.endDate) {
            latestTrain = trainFileInfo;
        }
    });
    return fs.readFileSync(TRAIN_REPORTS_DIR + latestTrain.fileName, 'utf8');
}

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
    console.log(process.cwd());
});
