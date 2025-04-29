import { Client, Account, ID } from 'appwrite';

console.log('ENDPOINT:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
console.log('PROJECT :', process.env.NEXT_PUBLIC_APPWRITE_PROJECT);

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const project  = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

if (!endpoint) {
  throw new Error(
    'Missing NEXT_PUBLIC_APPWRITE_ENDPOINT in .env.local (or didn’t restart the server)'
  );
}
if (!project) {
  throw new Error(
    'Missing NEXT_PUBLIC_APPWRITE_PROJECT in .env.local (or didn’t restart the server)'
  );
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(project);

export const account    = new Account(client);
export const generateId = ID.unique;
