import dotenv from "dotenv";
import fetch from "node-fetch";
import chalk from "chalk";
import clipboard from "clipboardy";

dotenv.config();

const site = process.env.SITE;

const TOKEN = process.env.ACCESS_TOKEN;
const TOKENSANDBOX = process.env.ACCESS_TOKEN_SANDBOX;

const BASE_PROD = `https://api.${site}.arcpublishing.com`;
const BASE_SANDBOX = `https://api.sandbox.${site}.arcpublishing.com`;

const headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
  Authorization: "Bearer " + TOKEN,
};
const headersSandbox = {
  Authorization: "Bearer " + TOKENSANDBOX,
  "Content-Type": "application/json",
};

(async () => {
  try {
    const response = await fetch(
      `${BASE_PROD}/draft/v1/story/AVJWV4LOTZF7PA72Y74AVKFHOI/revision/published`,
      {
        method: "GET",
        headers,
      }
    );
    const ans = await response.json();
    const nota = JSON.stringify(ans.ans);
    // IF YOU WANT TO COPY IN YOUR CLIPBOARD
    // clipboard.writeSync(nota);
    console.log(chalk.green("NOTA COPIADA!"));
    const sandboxResponse = await fetch(`${BASE_SANDBOX}/draft/v1/story/`, {
      method: "POST",
      body: nota,
      headers: headersSandbox,
    });
    const res = await sandboxResponse.json();
    console.log(chalk.green("ID DE LA NOTA: ") + res.id);
  } catch (err) {
    console.log(err);
  }
})();
