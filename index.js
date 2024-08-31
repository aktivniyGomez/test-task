import puppeteer from "puppeteer";
import { setTimeout } from "node:timers/promises";
import fs from 'fs'


// Переходжим на сайт 
async function main(url, region) {
    try {
        // Настройки puppeteer
        const browser = await puppeteer.launch({
            headless: false 
        })
        const page = await browser.newPage()
        await page.goto(url)
        await page.setViewport({ // Настройки вкладки
            width: 1200,
            height: 800
        })

        await setTimeout(5000);

        // Делаем скриншот экрана
        const fileName = url.split('/').pop().replace(/[^a-zA-Z0-9]/g, '_');
        await page.screenshot({
            path: `${'screenshots'}/${fileName}.png`,
            fullPage: true
        });

        // ====================== Выбор региона ===================================
        const button = await page.$('.Region_region__6OUBn')
        button.click()

        // Поиск региона
        await page.waitForSelector('.UiRegionListBase_item____ly_A.UiRegionListBase_bold__ezwq4');
        const regionElementHandle = await page.evaluateHandle(() => {
            const elements = Array.from(document.querySelectorAll('.UiRegionListBase_item____ly_A.UiRegionListBase_bold__ezwq4'));
            return elements.find(el => el.textContent.includes(region));
        });

        regionElementHandle.click();


        // ======================= Работа с product.txt ============================== 
        // Поиск старой цены
        const oldPriceElement = await page.$('.Price_price__QzA8L.Price_size_XS__ESEhJ.Price_role_old__r1uT1');
        let oldPriceData = 0;
        if (oldPriceElement) {
            oldPriceData = await oldPriceElement.evaluate(el => el.textContent.trim());
        }
        console.log(oldPriceData)

        // Поиск новой цены
        const newPriceElement = await page.$('.Price_price__QzA8L.Price_size_XL__MHvC1.Price_role_discount__l_tpE')
        let newPriceData = 0
        if (newPriceElement) {
            newPriceData = await newPriceElement.evaluate(el => el.textContent.trim())
        }
        console.log(newPriceData)

        // Поиск конкретной цены
        const currPriceElement = await page.$('.Price_price__QzA8L.Price_size_XL__MHvC1.Price_role_regular__X6X4D')
        let currPriceData = 0
        if (currPriceElement) {
            currPriceData = await currPriceElement.evaluate(el => el.textContent.trim())
        }
        console.log(currPriceData)

        // Поиск колличества оценок
        const reviewsElement = await page.$('.ActionsRow_reviews__AfSj_');
        const reviewsData = await reviewsElement.evaluate(el => el.textContent);
        const [count, _] = reviewsData.split(' ');
        const reviewsCount = parseInt(count);
        console.log(reviewsCount);

        // Поиск рейтинга
        const ratingElement = await page.$('.ActionsRow_stars__EKt42');
        const ratingData = await ratingElement.evaluate(el => el.textContent);
        const rating = parseFloat(ratingData);
        console.log(rating);




        // Сохраняем данные в файл
        if (newPriceData.length > 1 && oldPriceData.length > 1) {
            const data = `\nprice=${newPriceData}\npriceOld=${oldPriceData}\nrating=${rating}\nreviewCount=${reviewsCount}\n`;
            fs.appendFileSync('product.txt', data);
        }
        if (currPriceData > 1) {
            const data = `\nprice=${currPriceData}\nrating=${rating}\nreviewCount=${reviewsCount}\n`;
            fs.appendFileSync('product.txt', data);
        }
    } catch (error) {
        console.log(error)
    }
}


main(process.argv[2], process.argv[3])

// node index https://www.vprok.ru/product/domik-v-derevne-dom-v-der-moloko-ster-3-2-950g--309202