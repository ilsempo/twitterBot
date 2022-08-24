import {
    firefox
} from 'playwright';

import Twit from 'twit';

let T = new Twit({
    consumer_key: '********',
    consumer_secret: '********',
    access_token: '********',
    access_token_secret: '********',
});

const traerResultados = async () => {
    const buscador = await firefox.launch();
    const pagina = await buscador.newPage();
    await pagina.goto('https://store.steampowered.com/search/?filter=topsellers&specials=1');

    const href = await pagina.evaluate(() => {
        let resultados = [];
        let juegos = document.querySelectorAll('[class="title"]');
        let descuentos = document.querySelectorAll('[class="col search_discount responsive_secondrow"] span');
        let precioViejo = document.querySelectorAll('[class="col search_price discounted responsive_secondrow"] span');
        let precioNuevo = document.querySelectorAll('[class="col search_price discounted responsive_secondrow"]');
        let hiperVinculo = document.querySelectorAll('[class="search_results"] a');
        let i = 0;
        juegos.forEach((juego) => {

            resultados.push({
                nombre: juego.textContent,
                rebaja: descuentos[i].textContent,
                precio_viejo: parseInt(precioViejo[i].textContent.substring(5).replace(/[.]/i, "")) * 1.75,
                precio_nuevo: parseInt(precioNuevo[i].lastChild.textContent.substring(5).replace(/[.]/i, "")) * 1.75,
                link: hiperVinculo[i].getAttribute('href')
            });
            i++;
        });

        return resultados;
    });

    // console.log(href);
    await buscador.close();
    return href;
}


const twitear = (juegos) => {
   juegos.forEach((juego, i) => {
    setTimeout(() => {
        T.post('statuses/update', {
            status: `PRECIOS + IMPUESTOS\nJUEGO: ${juego.nombre}\nDESCUENTO: ${juego.rebaja}\nPRECIO VIEJO: $ARS ${juego.precio_viejo}\nPRECIO NUEVO: $ARS ${juego.precio_nuevo}\nLINK: ${juego.link}`
        }, function (err, data, response) {
            console.log(data);
        });
    }, i * 25 * 60 * 1000);
   })  

}



const refreshear = () => {
    traerResultados()
        .then(resultado => {
            twitear(resultado);
        });
}



setInterval(() => refreshear() , 25 * 60 * 60 * 1000);

