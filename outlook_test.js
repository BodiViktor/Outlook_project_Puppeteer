const puppeteer = require('puppeteer');

function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

(async () => {
  /** login.json - email,jelszó */
  const json = require("./login.json");
  const email = json.email;
  const password = json.password 

  /** Elindítjuk puppeteer-el a testet*/
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--incognito',
    ],
  });

  /** Új oldal */
  const page = await browser.newPage();

  /** Viewport átállítása */
  await page.setViewport({
    width: 1600,
    height: 640,
    deviceScaleFactor: 1,
  })
    ;
  const navigationPromise = page.waitForNavigation({
    waitUntil: 'domcontentloaded'
  })

  /** Elérési útvonal az Outlook bejelentkezési felületére */
  await page.goto('https://outlook.live.com/owa/?nlp=1/');

  await Promise.all([
    await navigationPromise,
  ])

  /** Email cím megadása majd Enter */
  await page.type('#i0116', email);
  await new Promise(r => setTimeout(r, 1000));
  await page.click('#idSIButton9');

  /** Jelszó megadása majd Enter */
  await page.waitForSelector("#loginHeader");
  await page.type('#i0118', password);
  await new Promise(r => setTimeout(r, 1000));
  await page.click('#idSIButton9');

  /** Elfogadjuk, hogy megjegyezze a login sessiont */
  await page.waitForSelector("#idSIButton9");
  await new Promise(r => setTimeout(r, 1000));
  await page.click('#idSIButton9');

  await navigationPromise;
  await page.waitForSelector(".n7wcs");


  /** Új üzenet hotkey */
  await page.keyboard.press('KeyN');

  //await new Promise(r => setTimeout(r, 10000));

  /** Címzett beírása */
  await page.waitForSelector(".ms-FocusZone.css-158.v76Pp");
  await new Promise(r => setTimeout(r, 100));
  await page.type('.ms-BasePicker-input.pickerInput_9f838726', "bodiviktor1998@gmail.com"); // cimzett
  await new Promise(r => setTimeout(r, 500));
  /** Címzett elfogadása */
  await page.keyboard.press('Enter'); // approved cimzett
  await new Promise(r => setTimeout(r, 500));

  /** Áttabulálunk a következő input mezőre */
  await page.keyboard.press('Tab'); //tab subjectre

  /** Random String generátor - Random Subject 10 karakter hosszú */

  /** Random String */
  const subj = makeid(10);

  /** Random tárgy beírása */
  await page.keyboard.type(subj); // subject
  await new Promise(r => setTimeout(r, 500));

  /** Üzenet elküldés*/
  await page.keyboard.down('Alt');
  await page.keyboard.press('KeyS');
  await page.keyboard.up('Alt');
  await new Promise(r => setTimeout(r, 4000));
  await page.waitForSelector(".uqAVK");

  /** Átnavigálunk a Kiküldött üzenetekhez */
  await page.click('[title="Sent Items"]');
  await new Promise(r => setTimeout(r, 100));

  /** Kiválasztjuk az első üzenetet */
  await page.keyboard.down('ControlLeft');
  await page.keyboard.press('Comma');
  await page.keyboard.up('ControlLeft');

  /** Class alapján kiválasztjuk a classhoz tartozó szöveget */
  const element = await page.waitForSelector('._5FqYX.HnNdo'); // select the element
  const value = await element.evaluate(el => el.textContent); // read value

  /** A random String */
  const e2 = subj; //true value

  /** */
  let j;
  for (j = 1; j < 6; j++) { //végig megy az utolsó X elküldött üzeneten
    if (value == e2) {
      console.log("Elküldve ♥");
      break;
    } else {
      /*következő üzenetre lépünk*/
      await page.keyboard.down('ControlLeft');
      await page.keyboard.press('Period');
      await page.keyboard.up('ControlLeft');
      await new Promise(r => setTimeout(r, 100));
      /*kiválasztjuk az elemet class segítségével*/
      const element = await page.waitForSelector('._5FqYX.HnNdo');
      /*read value*/
      const value = await element.evaluate(el => el.textContent);
      console.log("nope" + j);
    };
  };
  await new Promise(r => setTimeout(r, 100));

  /** Confirm üzenet ha törölni akarunk*/
  const confirm = await page.evaluate(() => confirm('Törölhetek mindent a Küldött emailekből?'));

  /** Törlés */
  if (confirm) {
    await page.keyboard.down('ControlLeft');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('ControlLeft');
    await page.keyboard.press('Delete');
    await new Promise(r => setTimeout(r, 1000));
    await page.click('#ok-1');
    console.log("OK cs")
  } else {
    console.log("Nem törölt semmit!")
  }

  /** Töröljük a Sütiket (amire nem is lenne szükség mert incognito módban vagyunk, majd bezárjuk a Böngészőt) */
  await new Promise(r => setTimeout(r, 2000));

  await page.deleteCookie();
  await browser.close();

})();

