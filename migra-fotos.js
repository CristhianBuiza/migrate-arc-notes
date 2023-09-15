import dotenv from "dotenv";
import fetch from "node-fetch";
import chalk from "chalk";
import clipboard from "clipboardy";
import readline from "readline";

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

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question("Ingresa el ID de la nota PROD: ", async (id) => {
    try {
        const response = await fetch(
            `${BASE_PROD}/draft/v1/story/${id}/revision/published`,
            {
                method: "GET",
                headers,
            }
        );
        const {ans} = await response.json();
        const nota = JSON.stringify(ans);
        const idPhoto = await ans?.promo_items?.basic?._id;
        const idGallery = await ans?.promo_items?.basic_gallery?._id;

        if (idGallery) {
            // console.log('idGallery', idGallery)

            const resGallery = await fetch(
                `${BASE_PROD}/photo/api/v2/galleries/${idGallery}`,
                {
                    method: "GET",
                    headers,
                }
            );
            const photos = await resGallery.json();

            photos.owner.id = `sandbox.${site}`

            if (photos.promo_items.basic) {
                try {
                    const sandboxResponsePortada = await fetch(
                        `${BASE_SANDBOX}/photo/api/v2/photos/${photos.promo_items.basic._id}?=`,
                        {
                            method: "POST",
                            body: JSON.stringify(photos.promo_items.basic),
                            headers: headersSandbox,
                        }
                    );
                    const resendResPortada = await sandboxResponsePortada.json();
                    console.log(chalk.green("STATUS DE LA FOTO PORTADA EN SANDBOX : ok"), resendResPortada);
                } catch (error) {
                    console.log("api photos", error);
                }

                if (photos?.content_elements?.length) {
                    photos?.content_elements?.map(async (item, key) => {
                        const {_id} = item;
                        try {
                            const resImage = await fetch(
                                `${BASE_SANDBOX}/photo/api/v2/photos/${_id}?=`,
                                {
                                    method: "POST",
                                    body: JSON.stringify(item),
                                    headers: headersSandbox,
                                }
                            );
                            const photo = await resImage.json();
                            console.log(chalk.green("STATUS DE LA FOTO EN SANDBOX : ok"), photo)
                        } catch (error) {
                            console.log("api photos", error);
                        }

                        /*try {
                            const sandboxResponse = await fetch(
                                `${BASE_SANDBOX}/photo/api/v2/photos/${photo?._id}?=`,
                                {
                                    method: "POST",
                                    body: JSON.stringify(photo),
                                    headers: headersSandbox,
                                }
                            );
                            const resendRes = await sandboxResponse.json();
                            console.log(chalk.green("STATUS DE LA FOTO EN SANDBOX : ok"), resendRes);
                        } catch (error) {
                            console.log("api photos", error);
                        }*/

                    })
                }
            }

            /*try {
                const sandboxResponse = await fetch(
                    `${BASE_SANDBOX}/photo/api/v2/galleries/${idGallery}?=`,
                    //https://api.sandbox.radioformula.arcpublishing.com/photo/api/v2/galleries/R3476YITTFHTFEIGONJLKBUJOM
                    {
                        method: "POST",
                        body: JSON.stringify(photos),
                        headers: headersSandbox,
                    }
                );
                const resendRes = await sandboxResponse.json();
                console.log(chalk.green("STATUS DE LA GALERIA EN SANDBOX : ok"), resendRes);
            } catch (error) {
                console.log("api photos", error);
            }*/

        }

        // IF YOU WANT TO COPY IN YOUR CLIPBOARD
        // clipboard.writeSync(nota);
        // console.log(chalk.green("NOTA COPIADA!"));

        // const sandboxResponseNota = await fetch(`${BASE_SANDBOX}/draft/v1/story/`, {
        //     method: "POST",
        //     body: nota,
        //     headers: headersSandbox,
        // });
        // const res = await sandboxResponseNota.json();
        // console.log(chalk.green("ID DE LA NOTA EN SANDBOX: "), res.id);

    } catch (err) {
        console.log("api nota", err);
    }

    rl.close();
});
