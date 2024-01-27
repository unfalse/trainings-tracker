import { createInterface } from 'node:readline';
import { exit } from 'node:process';

import { connectToDatabase, registerNewUser } from './reg-db.js';

let login = '', password = '';

const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
});

main();

async function main () {
  console.log('Connecting to database...');
  const connected = await connectToDatabase();
  if (!connected) exit(1);

  console.log('Enter your login and password to create a new user.');

  readline.question(`login: `, input1 => {
    login = input1;

    readline.question(`password: `, async input2 => {
        password = input2;
        readline.close();

        console.log('Creating a new user...');

        const { error, message } = await registerNewUser(login, password);
        if (error !== 'ok') {
          console.error(message);
          console.info('Details:');
          console.error(error);
          exit(1);
        }

        console.info(message);
        exit();
    });
  });
};